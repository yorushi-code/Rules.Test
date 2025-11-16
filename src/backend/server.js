const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const app = express();
const PORT = config.server.port;

// ========================================
// БЕЗОПАСНОСТЬ
// ========================================

// 1. Helmet - защита от основных уязвимостей
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. CORS - из конфига
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.cors.allowed_origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

//app.use(cors());

// 3. Rate Limiting - защита от DDoS
const limiter = rateLimit({
  windowMs: config.rate_limit.window_minutes * 60 * 1000,
  max: config.rate_limit.max_requests,
  message: 'Слишком много запросов, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: config.rate_limit.window_minutes * 60 * 1000,
  max: config.rate_limit.login_max_attempts,
  message: 'Слишком много попыток входа, попробуйте через 15 минут'
});

app.use('/api/', limiter);
app.use('/api/auth/login', strictLimiter);

// 4. Body parsing с лимитами
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ========================================
// БАЗА ДАННЫХ (Supabase PostgreSQL)
// ========================================

const supabase = createClient(
  config.database.supabase_url,
  config.database.supabase_key
);

// ========================================
// MIDDLEWARE
// ========================================

// Проверка JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  jwt.verify(token, config.security.jwt_secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Проверка роли Admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};

// ========================================
// API ENDPOINTS
// ========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================================
// АВТОРИЗАЦИЯ
// ========================================

// Вход
app.post('/api/auth/login',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).escape(),
    body('password').isLength({ min: 6, max: 100 })
  ],
  async (req, res) => {
    try {
      // Валидация
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Получить пользователя из БД
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !users) {
        return res.status(401).json({ error: 'Неверные учётные данные' });
      }

      // Проверка пароля
      const validPassword = await bcrypt.compare(password, users.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Неверные учётные данные' });
      }

      // Генерация JWT токена
      const token = jwt.sign(
        { 
          id: users.id, 
          username: users.username, 
          role: users.role 
        },
        config.security.jwt_secret,
        { expiresIn: '24h' }
      );

      // Возврат без пароля
      const { password: _, ...userWithoutPassword } = users;

      res.json({
        success: true,
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

// Проверка токена
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, username, role, name, created_at')
      .eq('id', req.user.id)
      .single();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========================================
// МОДЕРАТОРЫ (только для админов)
// ========================================

// Получить список модераторов
app.get('/api/moderators', authenticateToken, async (req, res) => {
  try {
    const { data: moderators, error } = await supabase
      .from('users')
      .select('id, username, name, role, created_at')
      .eq('role', 'moderator')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, moderators });
  } catch (error) {
    console.error('Get moderators error:', error);
    res.status(500).json({ error: 'Ошибка получения модераторов' });
  }
});

// Добавить модератора (только админ)
app.post('/api/moderators',
  authenticateToken,
  requireAdmin,
  [
    body('username').trim().isLength({ min: 3, max: 50 }).escape(),
    body('password').isLength({ min: 6, max: 100 }),
    body('name').trim().isLength({ min: 3, max: 100 }).escape()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password, name } = req.body;

      // Проверка существования
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Пользователь уже существует' });
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создание модератора
      const { data: newModerator, error } = await supabase
        .from('users')
        .insert([
          {
            username,
            password: hashedPassword,
            name,
            role: 'moderator'
          }
        ])
        .select('id, username, name, role, created_at')
        .single();

      if (error) throw error;

      res.json({ success: true, moderator: newModerator });

    } catch (error) {
      console.error('Add moderator error:', error);
      res.status(500).json({ error: 'Ошибка добавления модератора' });
    }
  }
);

// Удалить модератора (только админ)
app.delete('/api/moderators/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Нельзя удалить себя
      if (req.user.id === id) {
        return res.status(400).json({ error: 'Нельзя удалить себя' });
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .eq('role', 'moderator'); // Только модераторов можно удалять

      if (error) throw error;

      res.json({ success: true });

    } catch (error) {
      console.error('Delete moderator error:', error);
      res.status(500).json({ error: 'Ошибка удаления модератора' });
    }
  }
);

// ========================================
// ЛОГИ НАКАЗАНИЙ
// ========================================

// Получить логи (с пагинацией и фильтрами)
app.get('/api/punishments', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const type = req.query.type || '';

    let query = supabase
      .from('punishments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Фильтр по типу
    if (type && ['ban', 'mute'].includes(type)) {
      query = query.eq('type', type);
    }

    // Поиск по игроку
    if (search) {
      query = query.ilike('player', `%${search}%`);
    }

    const { data: punishments, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      punishments,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get punishments error:', error);
    res.status(500).json({ error: 'Ошибка получения логов' });
  }
});

// Добавить наказание
app.post('/api/punishments',
  authenticateToken,
  [
    body('player').trim().isLength({ min: 1, max: 100 }).escape(),
    body('type').isIn(['ban', 'mute']),
    body('reason').trim().isLength({ min: 1, max: 500 }).escape(),
    body('duration').isNumeric(),
    body('ipPort').optional().trim().matches(/^[\d.:]+$/)
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { player, type, reason, duration, ipPort } = req.body;

      const { data: punishment, error } = await supabase
        .from('punishments')
        .insert([
          {
            player,
            type,
            reason,
            duration: parseInt(duration),
            ip_port: ipPort || null,
            moderator_id: req.user.id,
            moderator_name: req.user.username
          }
        ])
        .select('*')
        .single();

      if (error) throw error;

      res.json({ success: true, punishment });

    } catch (error) {
      console.error('Add punishment error:', error);
      res.status(500).json({ error: 'Ошибка добавления наказания' });
    }
  }
);

// Удалить наказание (только админ)
app.delete('/api/punishments/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('punishments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true });

    } catch (error) {
      console.error('Delete punishment error:', error);
      res.status(500).json({ error: 'Ошибка удаления наказания' });
    }
  }
);

// ========================================
// СТАТИСТИКА
// ========================================

// Получить статистику
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    // Общее количество наказаний
    const { count: totalPunishments } = await supabase
      .from('punishments')
      .select('*', { count: 'exact', head: true });

    // Количество банов
    const { count: totalBans } = await supabase
      .from('punishments')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'ban');

    // Количество мутов
    const { count: totalMutes } = await supabase
      .from('punishments')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'mute');

    // Количество модераторов
    const { count: totalModerators } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'moderator');

    // Топ модераторов по количеству наказаний
    const { data: topModerators } = await supabase
      .from('punishments')
      .select('moderator_name')
      .limit(1000);

    const moderatorStats = topModerators?.reduce((acc, curr) => {
      acc[curr.moderator_name] = (acc[curr.moderator_name] || 0) + 1;
      return acc;
    }, {});

    const topModeratorsList = Object.entries(moderatorStats || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      stats: {
        totalPunishments: totalPunishments || 0,
        totalBans: totalBans || 0,
        totalMutes: totalMutes || 0,
        totalModerators: totalModerators || 0,
        topModerators: topModeratorsList
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// ========================================
// ERROR HANDLING
// ========================================

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint не найден' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
  console.log(`📊 Database: Supabase PostgreSQL`);
  console.log(`⚙️  Config loaded from config.yaml`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
});