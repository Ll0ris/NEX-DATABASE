// Backend API helper modülü
class BackendAPI {
    constructor() {
        // XAMPP localhost URL'i
        this.baseURL = 'http://localhost/nex-backend';
    }

    // GET isteği helper
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}/${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        const response = await fetch(url, { credentials: 'include' });
        const responseText = await response.text();
        
        // Debug için yanıtı konsola yazdır
        console.log('Backend GET status:', response.status, response.ok);
        console.log('Backend GET url:', url.toString());
        console.log('Backend GET response:', responseText);
        
        if (responseText.trim() === '') {
            throw new Error('Empty response from backend');
        }
        
        try {
            return JSON.parse(responseText);
        } catch (error) {
            console.error('JSON parse error:', error);
            console.error('Response text was:', responseText);
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
        }
    }

    // POST isteği helper
    async post(endpoint, data = {}) {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const responseText = await response.text();
        
        // Debug için yanıtı konsola yazdır
        console.log('Backend POST status:', response.status, response.ok);
        console.log('Backend POST endpoint:', `${this.baseURL}/${endpoint}`);
        console.log('Backend POST response:', responseText);
        
        if (responseText.trim() === '') {
            throw new Error('Empty response from backend');
        }
        
        try {
            return JSON.parse(responseText);
        } catch (error) {
            console.error('JSON parse error:', error);
            console.error('Response text was:', responseText);
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
        }
    }

    // Tüm üyeleri getir
    async getAllMembers() {
        return await this.get('list_members.php');
    }

    // Test için üye listesi (Firebase bağımlılığı yok)
    async getAllMembersTest() {
        return await this.get('list_members_test.php');
    }

    // Tek üye getir
    async getMember(id) {
        return await this.get('get_member.php', { id });
    }

    // Üye ekle
    async addMember(memberData) {
        return await this.post('add_member.php', memberData);
    }

    // Üye güncelle
    async updateMember(id, updateData) {
        return await this.post('update_member.php', { id, ...updateData });
    }

    // Üye sil
    async deleteMember(id) {
        return await this.post('delete_member.php', { id });
    }

    // Üye ara
    async searchMembers(searchTerm = '', status = '', rank = '') {
        return await this.get('search_members.php', {
            search: searchTerm,
            status: status,
            rank: rank
        });
    }

    // Test bağlantısı
    async testConnection() {
        return await this.get('test_connection.php');
    }

    // CORS test
    async corsTest() {
        return await this.get('cors_test.php');
    }
}

// Global instance oluştur
window.backendAPI = new BackendAPI();

// Test fonksiyonu
window.testBackendConnection = async function() {
    try {
        console.log('Backend test bağlantısı deneniyor...');
        const result = await window.backendAPI.testConnection();
        console.log('Backend bağlantısı başarılı:', result);
        return result;
    } catch (error) {
        console.error('Backend bağlantısı başarısız:', error);
        return { error: error.message };
    }
};

// CORS test fonksiyonu
window.testCORS = async function() {
    try {
        console.log('CORS test başlatılıyor...');
        const result = await window.backendAPI.corsTest();
        console.log('CORS test başarılı:', result);
        return result;
    } catch (error) {
        console.error('CORS test başarısız:', error);
        return { error: error.message };
    }
};

// Üye listesi test fonksiyonu
window.testGetMembers = async function() {
    try {
        console.log('Üye listesi çekiliyor...');
        const result = await window.backendAPI.getAllMembers();
        console.log('Üye listesi başarıyla alındı:', result);
        return result;
    } catch (error) {
        console.error('Üye listesi hatası:', error);
        return { error: error.message };
    }
};

// Backend durumunu kontrol et
window.checkBackendStatus = async function() {
    console.log('🔍 Backend durumu kontrol ediliyor...');
    
    console.log('1. CORS Test:');
    await testCORS();
    
    console.log('2. Backend Connection Test:');
    await testBackendConnection();
    
    console.log('3. Members Test:');
    await testGetMembers();
    
    console.log('✅ Tüm testler tamamlandı!');
};
