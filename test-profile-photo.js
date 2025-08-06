// Test script for profile photo functionality

// Test 1: Set a test photo URL for current user
async function testProfilePhoto() {
    console.log('=== PROFILE PHOTO TEST ===');
    
    // Test photo URL (example image)
    const testPhotoUrl = 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Test+User';
    
    // Set current user email
    localStorage.setItem('currentUserEmail', 'dedeogluoguzhan1603@gmail.com');
    console.log('Test user email set');
    
    // Update Firebase with test photo
    if (typeof updateFirebaseUserPhoto === 'function') {
        console.log('Updating Firebase with test photo...');
        await updateFirebaseUserPhoto(testPhotoUrl);
        console.log('Firebase photo updated');
    } else {
        console.log('updateFirebaseUserPhoto function not found');
    }
    
    // Update global profile display
    if (typeof updateUserNameDisplay === 'function') {
        console.log('Updating global profile display...');
        await updateUserNameDisplay();
        console.log('Global profile display updated');
    } else {
        console.log('updateUserNameDisplay function not found');
    }
    
    console.log('Test completed! Check profile buttons and member list.');
}

// Test 2: Remove photo
async function testRemovePhoto() {
    console.log('=== REMOVE PHOTO TEST ===');
    
    // Remove photo from Firebase
    if (typeof updateFirebaseUserPhoto === 'function') {
        console.log('Removing photo from Firebase...');
        await updateFirebaseUserPhoto(null);
        console.log('Photo removed from Firebase');
    }
    
    // Update global profile display
    if (typeof updateUserNameDisplay === 'function') {
        console.log('Updating global profile display...');
        await updateUserNameDisplay();
        console.log('Global profile display updated');
    }
    
    console.log('Photo removal test completed!');
}

// Test 3: Check current user photo in members list
function testMembersListPhoto() {
    console.log('=== MEMBERS LIST PHOTO TEST ===');
    
    // Navigate to members page
    window.location.href = 'members.html';
}

console.log('Profile photo test functions loaded!');
console.log('Available test functions:');
console.log('- testProfilePhoto() - Sets a test photo');
console.log('- testRemovePhoto() - Removes the photo');
console.log('- testMembersListPhoto() - Navigate to members page to check');
