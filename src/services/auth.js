import { api } from './api';

const AUTH_STORAGE_KEY = 'teefusion_auth';
const TOKEN_STORAGE_KEY = 'teefusion_token';

// Инициализация больше не нужна - пользователи в БД
export const initializeUsers = () => {
  // Оставляем пустую функцию для обратной совместимости
  console.log('Users are now stored in database');
};

// Логин через API
export const login = async (username, password) => {
  try {
    const result = await api.login(username, password);
    
    if (result.success) {
      // Сохраняем токен и данные пользователя
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
      return { success: true, user: result.user };
    }
    
    return { success: false, error: result.error || 'Ошибка входа' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Ошибка соединения с сервером' };
  }
};

// Выход
export const logout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

// Получить текущего пользователя
export const getCurrentUser = () => {
  const user = localStorage.getItem(AUTH_STORAGE_KEY);
  return user ? JSON.parse(user) : null;
};

// Проверить токен (при загрузке приложения)
export const verifyToken = async () => {
  try {
    const result = await api.verifyToken();
    if (result.success) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
      return { success: true, user: result.user };
    }
    logout();
    return { success: false };
  } catch (error) {
    logout();
    return { success: false };
  }
};

// Получить токен
export const getToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

// Добавить модератора (только админ)
export const addModerator = async (username, password, name) => {
  try {
    const result = await api.addModerator({ username, password, name });
    return result;
  } catch (error) {
    console.error('Add moderator error:', error);
    return { success: false, error: 'Ошибка добавления модератора' };
  }
};

// Получить список модераторов
export const getModerators = async () => {
  try {
    const result = await api.getModerators();
    return result.success ? result.moderators : [];
  } catch (error) {
    console.error('Get moderators error:', error);
    return [];
  }
};

// Удалить модератора
export const deleteModerator = async (id) => {
  try {
    return await api.deleteModerator(id);
  } catch (error) {
    console.error('Delete moderator error:', error);
    return { success: false, error: 'Ошибка удаления модератора' };
  }
};