const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('teefusion_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }
  return data;
};

export const api = {
  // ========================================
  // АВТОРИЗАЦИЯ
  // ========================================
  
  login: async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return handleResponse(res);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  verifyToken: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        headers: getAuthHeader()
      });
      return handleResponse(res);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // МОДЕРАТОРЫ
  // ========================================

  getModerators: async () => {
    try {
      const res = await fetch(`${API_URL}/moderators`, {
        headers: getAuthHeader()
      });
      return handleResponse(res);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addModerator: async (data) => {
    try {
      const res = await fetch(`${API_URL}/moderators`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteModerator: async (id) => {
    try {
      const res = await fetch(`${API_URL}/moderators/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      return handleResponse(res);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // НАКАЗАНИЯ
  // ========================================

  getPunishments: async (page = 1, limit = 50, search = '', type = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) params.append('search', search);
      if (type) params.append('type', type);

      const res = await fetch(`${API_URL}/punishments?${params}`, {
        headers: getAuthHeader()
      });
      return handleResponse(res);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addPunishment: async (data) => {
    try {
      const res = await fetch(`${API_URL}/punishments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deletePunishment: async (id) => {
    try {
      const res = await fetch(`${API_URL}/punishments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      return handleResponse(res);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // СТАТИСТИКА
  // ========================================

  getStats: async () => {
    try {
      const res = await fetch(`${API_URL}/stats`, {
        headers: getAuthHeader()
      });
      return handleResponse(res);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};