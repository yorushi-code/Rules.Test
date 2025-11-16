const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

function loadConfig() {
  try {
    const configPath = path.join(__dirname, 'config.yaml');
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents);
    
    // Валидация обязательных полей
    if (!config.security?.jwt_secret) {
      throw new Error('JWT_SECRET не указан в config.yaml');
    }
    if (!config.database?.supabase_url) {
      throw new Error('SUPABASE_URL не указан в config.yaml');
    }
    if (!config.database?.supabase_key) {
      throw new Error('SUPABASE_KEY не указан в config.yaml');
    }
    
    return config;
  } catch (error) {
    console.error('❌ Ошибка загрузки config.yaml:', error.message);
    process.exit(1);
  }
}

module.exports = loadConfig();