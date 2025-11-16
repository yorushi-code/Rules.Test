// ============================================================================
// TELEGRAM INTEGRATION SERVICE - Enhanced Version
// ============================================================================

// Конфигурация
const CONFIG = {
  BOT_TOKEN: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8003357769:AAHlawnb9LJ5ffq5W1fwZrumm6Txdbqk6zQ',
  CHAT_ID: import.meta.env.VITE_TELEGRAM_CHAT_ID || '-1003498244260',
  THREAD_ID: import.meta.env.VITE_TELEGRAM_THREAD_ID || '2',
  API_BASE: 'https://api.telegram.org/bot',
  
  // Настройки производительности
  MAX_CACHE_SIZE: 1000,
  BATCH_SIZE: 100,
  LONG_POLLING_TIMEOUT: 30, // Telegram рекомендует 20-30 секунд [web:171]
  REQUEST_TIMEOUT: 35000, // Чуть больше чем long polling timeout
  
  // Retry стратегия [web:176][web:179]
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 секунда базовая задержка
  BACKOFF_MULTIPLIER: 2, // Экспоненциальная задержка
  
  // IndexedDB настройки [web:175][web:178]
  DB_NAME: 'teefusion_db',
  DB_VERSION: 2,
  STORE_NAME: 'punishments',
  INDEX_NAMES: {
    timestamp: 'timestamp',
    player: 'player',
    type: 'type',
    moderator: 'moderator'
  }
};

// ============================================================================
// INDEXEDDB MANAGER - Замена localStorage на IndexedDB [web:175][web:178]
// ============================================================================

class PunishmentDB {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Удаляем старое хранилище если существует
        if (db.objectStoreNames.contains(CONFIG.STORE_NAME)) {
          db.deleteObjectStore(CONFIG.STORE_NAME);
        }

        // Создаем новое с индексами для быстрых запросов
        const store = db.createObjectStore(CONFIG.STORE_NAME, { keyPath: 'id' });
        store.createIndex(CONFIG.INDEX_NAMES.timestamp, 'timestamp', { unique: false });
        store.createIndex(CONFIG.INDEX_NAMES.player, 'player', { unique: false });
        store.createIndex(CONFIG.INDEX_NAMES.type, 'type', { unique: false });
        store.createIndex(CONFIG.INDEX_NAMES.moderator, 'moderator', { unique: false });
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  // Получить все наказания (с сортировкой и лимитом)
  async getAll(limit = CONFIG.MAX_CACHE_SIZE) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readonly');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const index = store.index(CONFIG.INDEX_NAMES.timestamp);
      const request = index.openCursor(null, 'prev'); // От новых к старым

      const results = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Добавить наказание (или обновить если существует)
  async put(punishment) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const request = store.put(punishment);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Массовое добавление (оптимизировано для больших объемов)
  async bulkPut(punishments) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      
      let completed = 0;
      punishments.forEach(punishment => {
        const request = store.put(punishment);
        request.onsuccess = () => {
          completed++;
          if (completed === punishments.length) {
            resolve(completed);
          }
        };
      });

      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Поиск по игроку (быстрый поиск через индекс)
  async findByPlayer(playerName) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readonly');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const index = store.index(CONFIG.INDEX_NAMES.player);
      const request = index.getAll(playerName);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Получить статистику
  async getStats() {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readonly');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const count = countRequest.result;
        if (count === 0) {
          resolve({ total: 0, oldest: null, newest: null });
          return;
        }

        const index = store.index(CONFIG.INDEX_NAMES.timestamp);
        const oldestRequest = index.openCursor(null, 'next');
        const newestRequest = index.openCursor(null, 'prev');

        let oldest = null, newest = null, resolved = 0;

        const checkResolve = () => {
          if (++resolved === 2) {
            resolve({
              total: count,
              oldest: oldest ? new Date(oldest.timestamp) : null,
              newest: newest ? new Date(newest.timestamp) : null
            });
          }
        };

        oldestRequest.onsuccess = (e) => {
          if (e.target.result) oldest = e.target.result.value;
          checkResolve();
        };

        newestRequest.onsuccess = (e) => {
          if (e.target.result) newest = e.target.result.value;
          checkResolve();
        };
      };

      countRequest.onerror = () => reject(countRequest.error);
    });
  }

  // Очистить всё
  async clear() {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Ограничить размер кэша (удалить старые записи)
  async limitSize(maxSize = CONFIG.MAX_CACHE_SIZE) {
    const all = await this.getAll(Infinity);
    if (all.length <= maxSize) return;

    const toDelete = all.slice(maxSize);
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      
      toDelete.forEach(item => store.delete(item.id));
      transaction.oncomplete = () => resolve(toDelete.length);
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Глобальный экземпляр DB
const punishmentDB = new PunishmentDB();

// ============================================================================
// OFFSET MANAGER - Управление offset для long polling
// ============================================================================

class OffsetManager {
  constructor() {
    this.key = 'teefusion_telegram_offset';
  }

  get() {
    try {
      const saved = localStorage.getItem(this.key);
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  }

  set(offset) {
    try {
      localStorage.setItem(this.key, offset.toString());
    } catch (error) {
      console.error('Error saving offset:', error);
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error('Error clearing offset:', error);
    }
  }
}

const offsetManager = new OffsetManager();

// ============================================================================
// RETRY UTILITY - Экспоненциальная retry стратегия [web:176][web:179]
// ============================================================================

class RetryHandler {
  static async execute(fn, context = 'request') {
    let lastError;
    
    for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Проверяем код ошибки Telegram
        if (error.response) {
          const data = await error.response.json().catch(() => ({}));
          
          // 429 Too Many Requests - Flood control [web:179]
          if (error.response.status === 429) {
            const retryAfter = data.parameters?.retry_after || CONFIG.RETRY_DELAY / 1000;
            console.warn(`[${context}] Rate limited. Retry after ${retryAfter}s`);
            await this.sleep(retryAfter * 1000);
            continue;
          }
          
          // 5xx - Internal server errors (Telegram проблемы) [web:176]
          if (error.response.status >= 500 && error.response.status < 600) {
            const delay = CONFIG.RETRY_DELAY * Math.pow(CONFIG.BACKOFF_MULTIPLIER, attempt);
            console.warn(`[${context}] Server error ${error.response.status}. Retry in ${delay}ms`);
            await this.sleep(delay);
            continue;
          }
          
          // 4xx - Client errors (не ретраим кроме 429)
          if (error.response.status >= 400 && error.response.status < 500) {
            console.error(`[${context}] Client error ${error.response.status}:`, data.description);
            throw error;
          }
        }
        
        // Network errors - ретраим с экспоненциальной задержкой
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
          const delay = CONFIG.RETRY_DELAY * Math.pow(CONFIG.BACKOFF_MULTIPLIER, attempt);
          console.warn(`[${context}] Network error. Retry ${attempt + 1}/${CONFIG.MAX_RETRIES} in ${delay}ms`);
          await this.sleep(delay);
          continue;
        }
        
        // Неизвестная ошибка
        throw error;
      }
    }
    
    throw new Error(`${context} failed after ${CONFIG.MAX_RETRIES} attempts: ${lastError.message}`);
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// API CLIENT - Telegram API обёртка с retry и timeout
// ============================================================================

class TelegramAPI {
  constructor() {
    this.baseUrl = `${CONFIG.API_BASE}${CONFIG.BOT_TOKEN}`;
  }

  async request(method, params = {}, timeout = CONFIG.REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      return await RetryHandler.execute(async () => {
        const response = await fetch(`${this.baseUrl}/${method}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: controller.signal
        });

        if (!response.ok) {
          const error = new Error(`Telegram API error: ${response.status}`);
          error.response = response;
          throw error;
        }

        const data = await response.json();
        
        if (!data.ok) {
          throw new Error(data.description || 'Unknown Telegram API error');
        }

        return data.result;
      }, `${method}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Long polling с правильным timeout [web:171][web:172]
  async getUpdates(offset = 0) {
    return this.request('getUpdates', {
      offset,
      limit: CONFIG.BATCH_SIZE,
      timeout: CONFIG.LONG_POLLING_TIMEOUT
    }, CONFIG.REQUEST_TIMEOUT);
  }

  async sendMessage(chatId, text, threadId = null) {
    const params = { chat_id: chatId, text };
    if (threadId) params.message_thread_id = parseInt(threadId);
    return this.request('sendMessage', params);
  }

  async getMe() {
    return this.request('getMe');
  }
}

const telegramAPI = new TelegramAPI();

// ============================================================================
// MESSAGE PARSER - Парсинг сообщений с валидацией
// ============================================================================

class MessageParser {
  static parse(message) {
    try {
      const text = message.text?.trim() || '';
      
      // Формат: (ban|mute) <ip:port> <time> "<player>/<reason>/<moderator>"
      const regex = /^(ban|mute)\s+(\S+)\s+(\d+)\s+"([^"]+)"$/i;
      const match = text.match(regex);

      if (!match) return null;

      const [, type, ipPort, duration, reasonStr] = match;
      const parts = reasonStr.split(/[\/|\\]/);

      // Валидация данных
      if (parts.length < 3) {
        console.warn('Invalid format: missing player/reason/moderator parts');
        return null;
      }

      const player = parts[0]?.trim() || 'Unknown';
      const reason = parts[1]?.trim() || 'Не указана';
      const moderator = parts[2]?.trim() || 'Unknown';

      // Валидация IP (базовая)
      if (!this.isValidIPPort(ipPort)) {
        console.warn(`Invalid IP:Port format: ${ipPort}`);
      }

      return {
        id: `tg_${message.message_id}_${message.date}`,
        player,
        type: type.toLowerCase(),
        reason,
        duration: parseInt(duration),
        moderator,
        ipPort,
        timestamp: message.date * 1000,
        time: this.formatTime(message.date),
        source: 'telegram'
      };
    } catch (error) {
      console.error('Error parsing message:', error);
      return null;
    }
  }

  static isValidIPPort(ipPort) {
    // Базовая валидация формата ip:port
    const regex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
    return regex.test(ipPort);
  }

  static formatTime(timestamp) {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// ============================================================================
// UPDATE MANAGER - Управление обновлениями с фоновой синхронизацией
// ============================================================================

class UpdateManager {
  constructor() {
    this.isPolling = false;
    this.pollingInterval = null;
  }

  // Получить наказания (сначала кэш, потом обновление)
  async getPunishments(forceRefresh = false) {
    try {
      // Быстрый возврат кэша
      const cached = await punishmentDB.getAll();
      
      if (!forceRefresh && cached.length > 0) {
        // Фоновое обновление без ожидания
        this.fetchUpdates().catch(err => 
          console.error('Background update failed:', err)
        );
        return cached;
      }

      // Принудительное обновление
      await this.fetchUpdates();
      return await punishmentDB.getAll();
    } catch (error) {
      console.error('Get punishments error:', error);
      // Возвращаем кэш в случае ошибки
      return await punishmentDB.getAll();
    }
  }

  // Получить обновления из Telegram
  async fetchUpdates() {
    if (!CONFIG.BOT_TOKEN) {
      console.warn('Telegram bot token not configured');
      return [];
    }

    try {
      const offset = offsetManager.get();
      const updates = await telegramAPI.getUpdates(offset);

      if (!updates || updates.length === 0) {
        return [];
      }

      // Обновляем offset
      const lastUpdate = updates[updates.length - 1];
      offsetManager.set(lastUpdate.update_id + 1);

      // Парсим новые сообщения
      const newPunishments = updates
        .filter(update => this.isValidUpdate(update))
        .map(update => MessageParser.parse(update.message))
        .filter(Boolean);

      if (newPunishments.length > 0) {
        // Массовое добавление в IndexedDB
        await punishmentDB.bulkPut(newPunishments);
        
        // Ограничиваем размер кэша
        await punishmentDB.limitSize(CONFIG.MAX_CACHE_SIZE);
        
        console.log(`Loaded ${newPunishments.length} new punishments`);
      }

      return newPunishments;
    } catch (error) {
      console.error('Fetch updates error:', error);
      throw error;
    }
  }

  isValidUpdate(update) {
    const message = update.message;
    if (!message) return false;
    
    const chatMatch = message.chat.id.toString() === CONFIG.CHAT_ID;
    const threadMatch = !CONFIG.THREAD_ID || 
      message.message_thread_id?.toString() === CONFIG.THREAD_ID;
    
    return chatMatch && threadMatch;
  }

  // Запустить фоновый polling (для реалтайм обновлений)
  startPolling(intervalMs = 10000) {
    if (this.isPolling) {
      console.warn('Polling already started');
      return;
    }

    this.isPolling = true;
    console.log('Starting background polling...');

    // Первое обновление сразу
    this.fetchUpdates().catch(err => 
      console.error('Initial polling failed:', err)
    );

    // Периодические обновления
    this.pollingInterval = setInterval(() => {
      this.fetchUpdates().catch(err => 
        console.error('Polling failed:', err)
      );
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;
      console.log('Polling stopped');
    }
  }
}

const updateManager = new UpdateManager();

// ============================================================================
// PUBLIC API - Экспортируемые функции
// ============================================================================

// Получить наказания
export const getRecentPunishments = async (forceRefresh = false) => {
  return await updateManager.getPunishments(forceRefresh);
};

// Отправить наказание
export const sendPunishmentToTelegram = async (punishment, moderatorName) => {
  if (!CONFIG.BOT_TOKEN || !CONFIG.CHAT_ID) {
    return { success: false, error: 'Telegram не настроен' };
  }

  try {
    const ipAddress = punishment.ip || '0.0.0.0:0';
    const message = `${punishment.type} ${ipAddress} ${punishment.duration} "${punishment.player}/${punishment.reason}/${moderatorName}"`;

    const result = await telegramAPI.sendMessage(
      CONFIG.CHAT_ID,
      message,
      CONFIG.THREAD_ID
    );

    // Добавляем в локальный кэш
    const newPunishment = {
      id: `tg_${result.message_id}_${result.date}`,
      player: punishment.player,
      type: punishment.type,
      reason: punishment.reason,
      duration: parseInt(punishment.duration),
      moderator: moderatorName,
      ipPort: ipAddress,
      timestamp: result.date * 1000,
      time: MessageParser.formatTime(result.date),
      source: 'telegram'
    };

    await punishmentDB.put(newPunishment);
    await punishmentDB.limitSize(CONFIG.MAX_CACHE_SIZE);

    return { success: true, data: newPunishment };
  } catch (error) {
    console.error('Send punishment error:', error);
    return { success: false, error: error.message };
  }
};

// Проверка подключения
export const testTelegramConnection = async () => {
  if (!CONFIG.BOT_TOKEN) {
    return { success: false, error: 'Токен не настроен' };
  }

  try {
    const botInfo = await telegramAPI.getMe();
    return { 
      success: true, 
      botName: botInfo.username,
      botId: botInfo.id,
      firstName: botInfo.first_name
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Поиск наказаний игрока
export const searchPunishmentsByPlayer = async (playerName) => {
  try {
    return await punishmentDB.findByPlayer(playerName);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// Получить статистику
export const getCacheStats = async () => {
  try {
    return await punishmentDB.getStats();
  } catch (error) {
    console.error('Stats error:', error);
    return { total: 0, oldest: null, newest: null };
  }
};

// Очистить кэш
export const clearPunishmentsCache = async () => {
  try {
    await punishmentDB.clear();
    offsetManager.clear();
    return { success: true };
  } catch (error) {
    console.error('Clear cache error:', error);
    return { success: false, error: error.message };
  }
};

// Запустить фоновую синхронизацию
export const startBackgroundSync = (intervalMs = 10000) => {
  updateManager.startPolling(intervalMs);
};

// Остановить фоновую синхронизацию
export const stopBackgroundSync = () => {
  updateManager.stopPolling();
};

// Экспорт конфигурации (для отладки)
export const getConfig = () => ({ ...CONFIG, BOT_TOKEN: '***hidden***' });
