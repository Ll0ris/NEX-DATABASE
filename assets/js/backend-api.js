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

}

// Global instance oluştur
window.backendAPI = new BackendAPI();

