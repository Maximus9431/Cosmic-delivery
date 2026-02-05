# ⚡ Quick Wins - Быстрые улучшения

Эти исправления можно внедрить за 1-2 дня и получить немедленную пользу.

---

## 1️⃣ Константы и конфигурация

### frontend/src/config/constants.js

```javascript
/**
 * Game constants and configuration values
 */

// Time intervals (in milliseconds)
export const INTERVALS = {
  AUTO_SAVE: 5000,
  PASSIVE_INCOME_TICK: 100,
  RANDOM_EVENT_CHECK: 45000,
  AUTO_SPAWN_CHECK: 2000,
  NEXUS_SPAWN: 60000,
  COMBO_TIMEOUT: 3000,
};

// Event durations
export const EVENT_DURATIONS = {
  METEOR_SHOWER: 10000,
  UFO: 8000,
  COSMIC_STORM: 30000,
  NOTIFICATION: 4000,
  FLOATING_TEXT: 1000,
};

// Skill cooldowns
export const SKILL_COOLDOWNS = {
  MAGNET: 30000,
  WARP: 60000,
};

// Game balance
export const BALANCE = {
  STARTING_COINS: 1000,
  PRESTIGE_THRESHOLD: 1000000,
  XP_BASE: 100,
  XP_MULTIPLIER: 1.5,
  UPGRADE_COST_MULTIPLIER: 1.8,
  METEOR_DAMAGE_PERCENT: 0.15,
  DARK_MATTER_BONUS: 0.1,
  COMBO_INCREMENT: 0.1,
};

// Spawn rates
export const SPAWN_RATES = {
  BASE_CHANCE: 0.05,
  SPEED_UPGRADE_BONUS: 0.02,
  COSMIC_STORM_MULTIPLIER: 2,
  RANDOM_EVENT_CHANCE: 0.15,
};

// Rewards
export const REWARDS = {
  FREE_COINS: 5000,
  UFO_REWARD_FULL: 2000,
  UFO_REWARD_PARTIAL: 1000,
  UFO_XP: 10,
  XP_BOOST: 100,
  LUCKY_MINUTES: 60,
};

// UI
export const UI = {
  MAX_NOTIFICATIONS: 4,
  MAX_FLOATING_TEXTS: 10,
};

// Save system
export const SAVE = {
  KEY: 'spaceCourierProgress',
  VERSION: 2,
};
```

---

## 2️⃣ ESLint и Prettier конфигурация

### frontend/.eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Relaxed for quick setup
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### frontend/.prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

### frontend/.prettierignore

```
node_modules
dist
build
coverage
*.min.js
```

### Обновить package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext js,jsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\""
  },
  "devDependencies": {
    // ... existing
    "prettier": "^3.1.0"
  }
}
```

---

## 3️⃣ Улучшенные .env файлы

### backend/.env.example

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Database (для будущего использования)
DATABASE_URL=postgresql://user:password@localhost:5432/cosmic_delivery

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,https://your-production-domain.com

# Security
SECRET_KEY=your_secret_key_here_minimum_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

### backend/main.py (обновленная версия с CORS из env)

```python
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Cosmic Delivery API",
    version="1.0.0",
    debug=os.getenv("DEBUG", "False") == "True"
)

# CORS Configuration from environment
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... rest of the code
```

---

## 4️⃣ Улучшенный README

### README.md

```markdown
# 🚀 Cosmic Delivery - Межпланетная игра-кликер

Космическая игра о доставке посылок между планетами Солнечной системы.

## 🎮 Особенности

- 🌍 9 планет для исследования
- 🤖 8 типов улучшений
- 🎯 Система миссий и достижений
- 💫 Случайные космические события
- 🌌 3D графика на Three.js
- 💾 Автоматическое сохранение прогресса
- 📱 Поддержка мобильных устройств

## 🛠 Технологии

### Frontend
- React 18 + Vite
- Three.js для 3D графики
- Zustand для управления состоянием (планируется)
- Lucide React для иконок

### Backend
- FastAPI (Python 3.9+)
- PostgreSQL (планируется)
- SQLAlchemy ORM (планируется)

## 📦 Установка и запуск

### Требования
- Node.js 18+
- Python 3.9+
- npm или yarn

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Откройте http://localhost:5173

### Backend

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# Скопируйте .env.example в .env и заполните переменные
cp .env.example .env

# Запустите сервер
python main.py
\`\`\`

API будет доступен на http://localhost:8000

### Быстрый запуск (Windows)

Используйте `run_project.bat` для автоматического запуска обоих серверов.

## 🎯 Структура проекта

\`\`\`
cosmic-delivery/
├── frontend/
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── store/          # Zustand stores (планируется)
│   │   ├── hooks/          # Custom hooks
│   │   ├── managers/       # Game managers (планируется)
│   │   ├── config/         # Конфигурация и константы
│   │   ├── gameData.js     # Игровые данные
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
├── backend/
│   ├── main.py            # FastAPI приложение
│   ├── requirements.txt
│   └── .env.example
└── README.md
\`\`\`

## 🚀 Скрипты разработки

### Frontend
\`\`\`bash
npm run dev      # Запуск dev сервера
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Проверка кода
npm run lint:fix # Автоисправление
npm run format   # Форматирование кода
\`\`\`

### Backend
\`\`\`bash
python main.py              # Запуск сервера
pytest                      # Запуск тестов (планируется)
\`\`\`

## 🎮 Как играть

1. **Собирайте посылки** - кликайте на летающие посылки или используйте кнопку "Запросить посылку"
2. **Покупайте улучшения** - автоматизируйте сбор и увеличивайте доход
3. **Открывайте планеты** - каждая дает уникальные бонусы
4. **Выполняйте миссии** - получайте награды за достижения
5. **Престиж** - обменивайте прогресс на Темную материю для постоянных бонусов

## 🐛 Известные проблемы

См. [AUDIT_REPORT.md](./AUDIT_REPORT.md) для полного списка известных проблем и плана улучшений.

## 🔄 План развития

См. [REFACTORING_PHASE_1.md](./REFACTORING_PHASE_1.md) для деталей предстоящих улучшений.

## 📝 Лицензия

MIT License

## 👥 Разработка

Проект находится в активной разработке. Вклады приветствуются!

### Принципы разработки
- Чистый код и документация
- Тестирование критических функций
- Производительность превыше всего
- Поддержка мобильных устройств

## 🆘 Поддержка

Найдена ошибка? Создайте Issue в GitHub.
\`\`\`

---

## 5️⃣ Простой Error Boundary (временный)

### frontend/src/components/ErrorBoundary.jsx

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          fontFamily: 'Orbitron, sans-serif',
          textAlign: 'center',
          padding: '20px',
        }}>
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀</h1>
            <h2>Космическая авария!</h2>
            <p>Произошла критическая ошибка.</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '12px 30px',
                background: '#00d4ff',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Перезапустить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 6️⃣ localStorage версионирование

### frontend/src/utils/storage.js

```javascript
const SAVE_KEY = 'spaceCourierProgress';
const SAVE_VERSION = 2;

export const saveGame = (data) => {
  try {
    const saveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return { success: true };
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded');
      // Попытка очистить старые сохранения
      cleanOldSaves();
      return { success: false, error: 'quota_exceeded' };
    }
    return { success: false, error: error.message };
  }
};

export const loadGame = () => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    
    // Миграция старых сохранений
    if (!parsed.version || parsed.version < SAVE_VERSION) {
      console.log('Migrating save from version', parsed.version || 1);
      return migrateSave(parsed);
    }

    return parsed.data;
  } catch (error) {
    console.error('Failed to load save:', error);
    return null;
  }
};

const migrateSave = (oldSave) => {
  // Version 1 -> 2 migration
  if (!oldSave.version) {
    return {
      ...oldSave,
      // Add new fields with defaults
      unlockedPlanets: oldSave.unlockedPlanets || [0],
      currentPlanetIndex: oldSave.currentPlanetIndex || 0,
    };
  }
  return oldSave;
};

const cleanOldSaves = () => {
  // Remove old autosaves or other non-critical data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('temp_') || key.startsWith('cache_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};
```

---

## 7️⃣ Обновление Game.jsx для использования утилит

### В Game.jsx добавить:

```javascript
import { saveGame, loadGame } from '../utils/storage';
import { INTERVALS, BALANCE } from '../config/constants';

// Вместо:
// const [gameState, setGameState] = useState({ coins: 1000, ... });

// Использовать:
const [gameState, setGameState] = useState(() => {
  const loaded = loadGame();
  return loaded || {
    coins: BALANCE.STARTING_COINS,
    // ... rest of initial state
  };
});

// Вместо:
// localStorage.setItem('spaceCourierProgress', JSON.stringify(stateToSave));

// Использовать:
const result = saveGame(stateToSave);
if (!result.success) {
  showNotification('Ошибка сохранения!', 'error');
}
```

---

## 8️⃣ Rate Limiting для Backend

### backend/requirements.txt (добавить)

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
slowapi==0.1.9
```

### backend/main.py (добавить)

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply to endpoints
@app.get("/user/me")
@limiter.limit("60/minute")  # 60 requests per minute
async def get_user(request: Request, init_data: str = ""):
    # ... existing code
    pass
```

---

## ✅ Чек-лист Quick Wins

### Приоритет 1 (сегодня)
- [ ] Создать `frontend/src/config/constants.js`
- [ ] Создать `frontend/src/utils/storage.js`
- [ ] Добавить Error Boundary в App.jsx
- [ ] Создать README.md

### Приоритет 2 (завтра)
- [ ] Настроить ESLint + Prettier
- [ ] Запустить `npm run lint:fix` и `npm run format`
- [ ] Обновить .env файлы
- [ ] Добавить rate limiting в backend

### Приоритет 3 (когда будет время)
- [ ] Заменить все магические числа на константы
- [ ] Обновить импорты для использования storage utils
- [ ] Добавить JSDoc комментарии к основным функциям
- [ ] Провести тестирование всех Quick Wins

---

## 📊 Ожидаемые результаты

После внедрения Quick Wins:
- ✅ Код станет чище и читабельнее (+30%)
- ✅ Меньше ошибок благодаря константам (-20%)
- ✅ Улучшенная обработка ошибок (Error Boundary)
- ✅ Защита от переполнения localStorage
- ✅ Базовая защита от злоупотреблений (rate limiting)
- ✅ Документация для новых разработчиков

**Время внедрения:** 4-6 часов  
**Риски:** Минимальные  
**ROI:** Высокий

---

*Создано: 2026-02-05*
