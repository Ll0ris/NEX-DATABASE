<?php
// backend/works.php
declare(strict_types=1);

function send_json(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Use shared mysqli connection  
require_once 'db.php'; // provides $conn (mysqli)

// Session for user auth
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function current_session_email(): ?string {
    $email = $_SESSION['email'] ?? null;
    if (is_string($email) && $email !== '') {
        return $email;
    }
    return null;
}

function getCurrentUserId(mysqli $conn): ?int {
    $email = current_session_email();
    if (!$email) return null;
    
    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
    if (!$stmt) return null;
    
    $stmt->bind_param('s', $email);
    if (!$stmt->execute()) {
        $stmt->close();
        return null;
    }
    $res = $stmt->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmt->close();
    return $row ? (int)$row['id'] : null;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = $_GET['action'] ?? $_POST['action'] ?? 'list';

    // Parse JSON input for POST requests
    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw ?: '[]', true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
            $_POST = array_merge($_POST, $json);
            if (isset($json['action'])) {
                $action = $json['action'];
            }
        }
    }

    if ($method === 'GET') {
        if ($action === 'list') {
            // Get all works with optional search and pagination
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = min(100, max(1, intval($_GET['limit'] ?? 50)));
            $search = trim($_GET['search'] ?? '');
            $offset = ($page - 1) * $limit;
            
            $whereClause = '';
            $searchParam = null;
            if ($search !== '') {
                $whereClause = 'WHERE w.name LIKE ? OR w.subject LIKE ? OR w.authors LIKE ?';
                $searchParam = "%{$search}%";
            }
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM works w $whereClause";
            if ($searchParam) {
                $countStmt = $conn->prepare($countSql);
                $countStmt->bind_param('sss', $searchParam, $searchParam, $searchParam);
            } else {
                $countStmt = $conn->prepare($countSql);
            }
            if (!$countStmt) {
                send_json(['success' => false, 'error' => $conn->error], 500);
            }
            $countStmt->execute();
            $countRes = $countStmt->get_result();
            $total = $countRes->fetch_assoc()['total'];
            $countStmt->close();
            
            // Get works with user information
            $sql = "SELECT w.*, u.fullName as user_name, u.institution 
                    FROM works w 
                    LEFT JOIN users u ON w.user_id = u.id 
                    $whereClause 
                    ORDER BY w.year DESC, w.created_at DESC 
                    LIMIT ? OFFSET ?";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                send_json(['success' => false, 'error' => $conn->error], 500);
            }
            
            if ($searchParam) {
                $stmt->bind_param('sssii', $searchParam, $searchParam, $searchParam, $limit, $offset);
            } else {
                $stmt->bind_param('ii', $limit, $offset);
            }
            $stmt->execute();
            $res = $stmt->get_result();
            
            $works = [];
            while ($row = $res->fetch_assoc()) {
                $works[] = $row;
            }
            $stmt->close();
            
            send_json([
                'success' => true,
                'items' => $works,
                'count' => count($works),
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        }

        if ($action === 'get') {
            $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
            if (!$userId) {
                send_json(['success' => false, 'error' => 'user_id required'], 400);
            }
            
            $sql = "SELECT * FROM works WHERE user_id = ? ORDER BY year DESC, created_at DESC";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                send_json(['success' => false, 'error' => $conn->error], 500);
            }
            
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $res = $stmt->get_result();
            
            $works = [];
            while ($row = $res->fetch_assoc()) {
                $works[] = $row;
            }
            $stmt->close();
            
            send_json([
                'success' => true,
                'items' => $works,
                'count' => count($works)
            ]);
        }

        send_json(['success' => false, 'error' => 'Unknown action'], 400);
    }

    if ($method === 'POST') {
        if ($action === 'create') {
            $currentUserId = getCurrentUserId($conn);
            if (!$currentUserId) {
                send_json(['success' => false, 'error' => 'Authentication required'], 401);
            }
            
            // Validate required fields
            $name = trim($_POST['name'] ?? '');
            $subject = trim($_POST['subject'] ?? '');
            $year = intval($_POST['year'] ?? 0);
            
            if ($name === '' || $subject === '' || $year <= 0) {
                send_json(['success' => false, 'error' => 'name, subject, and year are required'], 400);
            }
            
            if ($year < 1950 || $year > 2030) {
                send_json(['success' => false, 'error' => 'Year must be between 1950 and 2030'], 400);
            }
            
            // Optional fields
            $authors = trim($_POST['authors'] ?? '');
            $link = trim($_POST['link'] ?? '');
            
            // Validate link if provided
            if ($link !== '' && !filter_var($link, FILTER_VALIDATE_URL)) {
                send_json(['success' => false, 'error' => 'Invalid URL format for link'], 400);
            }
            
            // Insert into database
            $sql = "INSERT INTO works (name, subject, year, authors, link, user_id, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                send_json(['success' => false, 'error' => $conn->error], 500);
            }
            
            $stmt->bind_param('ssissi', $name, $subject, $year, $authors, $link, $currentUserId);
            if (!$stmt->execute()) {
                $err = $stmt->error;
                $stmt->close();
                send_json(['success' => false, 'error' => $err], 500);
            }
            
            $workId = $conn->insert_id;
            $stmt->close();
            
            send_json([
                'success' => true,
                'message' => 'Work created successfully',
                'id' => $workId
            ], 201);
        }

        if ($action === 'update') {
            $currentUserId = getCurrentUserId($conn);
            if (!$currentUserId) {
                send_json(['success' => false, 'error' => 'Authentication required'], 401);
            }
            
            $workId = intval($_POST['id'] ?? 0);
            if (!$workId) {
                send_json(['success' => false, 'error' => 'Work ID required'], 400);
            }
            
            // Check if work exists and belongs to user
            $checkSql = "SELECT id FROM works WHERE id = ? AND user_id = ?";
            $checkStmt = $conn->prepare($checkSql);
            if (!$checkStmt) {
                send_json(['success' => false, 'error' => $conn->error], 500);
            }
            
            $checkStmt->bind_param('ii', $workId, $currentUserId);
            $checkStmt->execute();
            $checkRes = $checkStmt->get_result();
            
            if (!$checkRes->fetch_assoc()) {
                $checkStmt->close();
                send_json(['success' => false, 'error' => 'Work not found or access denied'], 403);
            }
            $checkStmt->close();
            
            // Validate fields
            $name = trim($_POST['name'] ?? '');
            $subject = trim($_POST['subject'] ?? '');
            $year = intval($_POST['year'] ?? 0);
            
            if ($name === '' || $subject === '' || $year <= 0) {
                send_json(['success' => false, 'error' => 'name, subject, and year are required'], 400);
            }
            
            if ($year < 1950 || $year > 2030) {
                send_json(['success' => false, 'error' => 'Year must be between 1950 and 2030'], 400);
            }
            
            $authors = trim($_POST['authors'] ?? '');
            $link = trim($_POST['link'] ?? '');
            
            if ($link !== '' && !filter_var($link, FILTER_VALIDATE_URL)) {
                send_json(['success' => false, 'error' => 'Invalid URL format for link'], 400);
            }
            
            // Update work
            $sql = "UPDATE works SET 
                    name = ?,
                    subject = ?,
                    year = ?,
                    authors = ?,
                    link = ?,
                    updated_at = NOW()
                    WHERE id = ? AND user_id = ?";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                send_json(['success' => false, 'error' => $conn->error], 500);
            }
            
            $stmt->bind_param('ssissii', $name, $subject, $year, $authors, $link, $workId, $currentUserId);
            if (!$stmt->execute()) {
                $err = $stmt->error;
                $stmt->close();
                send_json(['success' => false, 'error' => $err], 500);
            }
            $stmt->close();
            
            send_json([
                'success' => true,
                'message' => 'Work updated successfully'
            ]);
        }

        if ($action === 'delete') {
            $currentUserId = getCurrentUserId($conn);
            if (!$currentUserId) {
                send_json(['success' => false, 'error' => 'Authentication required'], 401);
            }
            
            $workId = intval($_POST['id'] ?? 0);
            if (!$workId) {
                send_json(['success' => false, 'error' => 'Work ID required'], 400);
            }
            
            $sql = "DELETE FROM works WHERE id = ? AND user_id = ?";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                send_json(['success' => false, 'error' => $conn->error], 500);
            }
            
            $stmt->bind_param('ii', $workId, $currentUserId);
            if (!$stmt->execute()) {
                $err = $stmt->error;
                $stmt->close();
                send_json(['success' => false, 'error' => $err], 500);
            }
            
            $affected = $stmt->affected_rows;
            $stmt->close();
            
            if ($affected > 0) {
                send_json([
                    'success' => true,
                    'message' => 'Work deleted successfully'
                ]);
            } else {
                send_json(['success' => false, 'error' => 'Work not found or access denied'], 404);
            }
        }

        send_json(['success' => false, 'error' => 'Unknown action'], 400);
    }

    send_json(['success' => false, 'error' => 'Method not allowed'], 405);

} catch (Throwable $e) {
    send_json([
        'success' => false,
        'error' => 'Server error',
        'message' => $e->getMessage()
    ], 500);
}
?>
