# 🔨 Фаза 1: Реинжениринг - Детальный план

## Обзор
Эта фаза решает критические архитектурные проблемы и закладывает фундамент для дальнейших улучшений.

**Длительность:** 1-2 недели  
**Приоритет:** КРИТИЧЕСКИЙ  
**Зависимости:** Нет

---

## 1️⃣ Внедрение Zustand для управления состоянием

### 1.1 Установка зависимостей
```bash
cd frontend
npm install zustand immer
```

### 1.2 Создание store/gameStore.js

```javascript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useGameStore = create(
  immer((set, get) => ({
    // State
    coins: 1000,
    packagesDelivered: 0,
    planetLevel: 1,
    multiplier: 1,
    darkMatter: 0,
    totalCoins: 0,
    cps: 0,
    experience: 0,
    playerLevel: 1,
    reputation: 0,
    unlockedPlanets: [0],
    currentPlanetIndex: 0,

    // Actions
    addCoins: (amount) => set((state) => {
      state.coins += amount;
      state.totalCoins += amount;
    }),

    collectPackage: (value, isRare = false) => set((state) => {
      state.coins += value;
      state.totalCoins += value;
      state.packagesDelivered += 1;
      state.reputation += 1;
      // XP будет добавлен через отдельный action
    }),

    setCurrentPlanet: (index) => set((state) => {
      if (state.unlockedPlanets.includes(index)) {
        state.currentPlanetIndex = index;
      }
    }),

    unlockPlanet: (index, cost) => set((state) => {
      if (state.coins >= cost) {
        state.coins -= cost;
        if (!state.unlockedPlanets.includes(index)) {
          state.unlockedPlanets.push(index);
        }
      }
    }),

    addExperience: (amount) => set((state) => {
      let xp = state.experience + amount;
      let level = state.playerLevel;
      let xpToNext = Math.floor(100 * Math.pow(1.5, level - 1));

      while (xp >= xpToNext) {
        xp -= xpToNext;
        level++;
        xpToNext = Math.floor(100 * Math.pow(1.5, level - 1));
        state.coins += level * 100;
      }

      state.experience = xp;
      state.playerLevel = level;
    }),

    prestige: (pendingDarkMatter) => set((state) => {
      if (pendingDarkMatter > 0) {
        state.coins = 1000;
        state.packagesDelivered = 0;
        state.planetLevel = 1;
        state.multiplier = 1;
        state.darkMatter += pendingDarkMatter;
        state.totalCoins = 0;
        state.cps = 0;
        // Сохраняем unlockedPlanets, experience, playerLevel, reputation
      }
    }),

    // Computed values (selectors)
    getPendingDarkMatter: () => {
      return Math.floor(get().totalCoins / 1000000);
    },

    getEffectiveCps: () => {
      const state = get();
      return state.cps * (1 + state.darkMatter * 0.1);
    },
  }))
);
```

### 1.3 Создание store/upgradesStore.js

```javascript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { initialUpgrades } from '../gameData';

export const useUpgradesStore = create(
  immer((set, get) => ({
    upgrades: initialUpgrades,

    upgrade: (key, currentCoins) => {
      const upgrade = get().upgrades[key];
      
      if (currentCoins >= upgrade.cost) {
        set((state) => {
          state.upgrades[key].level += 1;
          state.upgrades[key].cost = Math.floor(upgrade.cost * 1.8);
        });
        return { success: true, cost: upgrade.cost };
      }
      return { success: false, cost: upgrade.cost };
    },

    getCps: () => {
      const { upgrades } = get();
      return (
        upgrades.robot.level * 5 +
        upgrades.hangar.level * 10 +
        upgrades.quantum.level * 50
      );
    },

    reset: () => set({ upgrades: initialUpgrades }),

    getTotalUpgradeCount: () => {
      const { upgrades } = get();
      return Object.values(upgrades).reduce((acc, u) => acc + u.level, 0);
    },
  }))
);
```

### 1.4 Создание store/uiStore.js

```javascript
import { create } from 'zustand';

export const useUIStore = create((set) => ({
  activePanel: null,
  notifications: [],
  floatingTexts: [],

  setActivePanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),

  showNotification: (msg, type = 'info') => set((state) => {
    const id = Date.now();
    const newNotif = { id, msg, type };
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 4000);

    return {
      notifications: [...state.notifications, newNotif].slice(-4),
    };
  }),

  addFloatingText: (text, x, y) => set((state) => {
    const id = Date.now();
    const newText = { id, text, x, y };

    setTimeout(() => {
      set((state) => ({
        floatingTexts: state.floatingTexts.filter((t) => t.id !== id),
      }));
    }, 1000);

    return {
      floatingTexts: [...state.floatingTexts, newText],
    };
  }),
}));
```

### 1.5 Создание store/eventsStore.js

```javascript
import { create } from 'zustand';

export const useEventsStore = create((set) => ({
  meteorShower: { active: false, endTime: 0 },
  ufoEvent: { active: false, endTime: 0, stolePackages: false },
  cosmicStorm: { active: false, endTime: 0 },
  combo: { count: 0, multiplier: 1, lastTime: 0 },

  setMeteorShower: (data) => set({ meteorShower: data }),
  setUfoEvent: (data) => set({ ufoEvent: data }),
  setCosmicStorm: (data) => set({ cosmicStorm: data }),

  incrementCombo: (scannerLevel) => set((state) => {
    const newCount = state.combo.count + 1;
    const newMult = 1 + newCount * 0.1 + scannerLevel * 0.05;
    return {
      combo: {
        count: newCount,
        multiplier: newMult,
        lastTime: Date.now(),
      },
    };
  }),

  resetCombo: () => set({
    combo: { count: 0, multiplier: 1, lastTime: 0 },
  }),
}));
```

---

## 2️⃣ Разделение Game.jsx на модули

### 2.1 Создание managers/GameLoopManager.js

```javascript
/**
 * Manages all game loops and intervals
 * Provides single source of truth for ticking mechanics
 */
export class GameLoopManager {
  constructor() {
    this.intervals = new Map();
    this.animationFrameId = null;
  }

  // Main game tick (replaces passive income interval)
  startMainLoop(callback, fps = 10) {
    let lastTime = 0;
    const interval = 1000 / fps;

    const tick = (currentTime) => {
      if (currentTime - lastTime >= interval) {
        callback();
        lastTime = currentTime;
      }
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  // Add named interval
  addInterval(name, callback, ms) {
    if (this.intervals.has(name)) {
      this.removeInterval(name);
    }
    const id = setInterval(callback, ms);
    this.intervals.set(name, id);
  }

  // Remove specific interval
  removeInterval(name) {
    if (this.intervals.has(name)) {
      clearInterval(this.intervals.get(name));
      this.intervals.delete(name);
    }
  }

  // Cleanup all
  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.intervals.forEach((id) => clearInterval(id));
    this.intervals.clear();
  }
}
```

### 2.2 Создание managers/SaveManager.js

```javascript
/**
 * Manages game save/load with versioning and error handling
 */
const SAVE_KEY = 'spaceCourierProgress';
const SAVE_VERSION = 2;

export class SaveManager {
  static save(gameState, upgrades, missions, currentPlanetIndex) {
    try {
      const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        gameState,
        upgrades,
        missions,
        currentPlanetIndex,
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      return { success: true };
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        return { success: false, error: 'quota_exceeded' };
      }
      console.error('Save error:', error);
      return { success: false, error: 'unknown' };
    }
  }

  static load() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved);

      // Migration logic
      if (!data.version || data.version < SAVE_VERSION) {
        return this.migrate(data);
      }

      return data;
    } catch (error) {
      console.error('Load error:', error);
      return null;
    }
  }

  static migrate(oldData) {
    // Handle migration from older save versions
    console.log('Migrating save data from version', oldData.version || 1);
    
    // Example migration
    if (!oldData.version) {
      // Version 1 -> Version 2
      return {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        gameState: oldData,
        upgrades: oldData.upgrades || {},
        missions: oldData.missions || [],
        currentPlanetIndex: oldData.currentPlanetIndex || 0,
      };
    }

    return oldData;
  }

  static clear() {
    localStorage.removeItem(SAVE_KEY);
  }
}
```

### 2.3 Создание managers/EventManager.js

```javascript
import { solarSystemPlanets } from '../gameData';

/**
 * Centralized event handling
 */
export class EventManager {
  static eventTypes = [
    { 
      name: 'Кометный дождь', 
      effect: 'extra_packages', 
      type: 'info',
      weight: 20 
    },
    { 
      name: 'Солнечная буря', 
      effect: 'double_value', 
      type: 'warning',
      weight: 15 
    },
    { 
      name: 'Космическая аномалия', 
      effect: 'free_coins', 
      type: 'success',
      weight: 20 
    },
    { 
      name: 'НЛО', 
      effect: 'ufo', 
      type: 'success',
      weight: 10 
    },
    { 
      name: 'Космическая удача', 
      effect: 'luck', 
      type: 'success',
      weight: 15 
    },
    { 
      name: 'Энергетический всплеск', 
      effect: 'xp_boost', 
      type: 'success',
      weight: 15 
    },
    { 
      name: 'Метеоритный дождь', 
      effect: 'meteor_shower', 
      type: 'warning',
      weight: 3 
    },
    { 
      name: 'Космический шторм', 
      effect: 'cosmic_storm', 
      type: 'warning',
      weight: 2 
    },
  ];

  static getRandomEvent() {
    const totalWeight = this.eventTypes.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;

    for (const event of this.eventTypes) {
      random -= event.weight;
      if (random <= 0) {
        return event;
      }
    }

    return this.eventTypes[0]; // Fallback
  }

  static handleEvent(effect, context) {
    const handlers = {
      extra_packages: () => {
        for (let i = 0; i < 10; i++) {
          setTimeout(() => context.spawnPackage?.(), i * 300);
        }
      },
      
      free_coins: () => {
        context.addCoins(5000);
      },
      
      ufo: () => {
        context.addCoins(2000);
        context.addExperience(10);
        context.setUfoEvent({ 
          active: true, 
          endTime: Date.now() + 8000, 
          stolePackages: false 
        });
      },
      
      luck: () => {
        const bonus = context.cps * 60;
        context.addCoins(bonus);
      },
      
      xp_boost: () => {
        context.addExperience(100);
      },
      
      meteor_shower: () => {
        context.setMeteorShower({ 
          active: true, 
          endTime: Date.now() + 10000 
        });
      },
      
      cosmic_storm: () => {
        context.setCosmicStorm({ 
          active: true, 
          endTime: Date.now() + 30000 
        });
      },
    };

    const handler = handlers[effect];
    if (handler) {
      handler();
    }
  }
}
```

---

## 3️⃣ Создание кастомных хуков

### 3.1 hooks/useGameSave.js

```javascript
import { useEffect, useRef } from 'react';
import { SaveManager } from '../managers/SaveManager';
import { useGameStore } from '../store/gameStore';
import { useUpgradesStore } from '../store/upgradesStore';
import { useMissionsStore } from '../store/missionsStore';

export const useGameSave = () => {
  const isInitialized = useRef(false);
  
  const gameState = useGameStore();
  const { upgrades } = useUpgradesStore();
  const { missions } = useMissionsStore();

  // Load on mount
  useEffect(() => {
    const savedData = SaveManager.load();
    
    if (savedData) {
      // Загрузить в stores
      useGameStore.setState(savedData.gameState);
      useUpgradesStore.setState({ upgrades: savedData.upgrades });
      useMissionsStore.setState({ missions: savedData.missions });
    }
    
    isInitialized.current = true;
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!isInitialized.current) return;

    const interval = setInterval(() => {
      SaveManager.save(
        gameState,
        upgrades,
        missions,
        gameState.currentPlanetIndex
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [gameState, upgrades, missions]);

  return {
    saveNow: () => SaveManager.save(
      gameState,
      upgrades,
      missions,
      gameState.currentPlanetIndex
    ),
    clearSave: SaveManager.clear,
  };
};
```

### 3.2 hooks/useGameLoop.js

```javascript
import { useEffect, useRef } from 'react';
import { GameLoopManager } from '../managers/GameLoopManager';
import { useGameStore } from '../store/gameStore';
import { useUpgradesStore } from '../store/upgradesStore';

export const useGameLoop = () => {
  const loopManager = useRef(new GameLoopManager());
  const addCoins = useGameStore((state) => state.addCoins);
  const getEffectiveCps = useGameStore((state) => state.getEffectiveCps);

  useEffect(() => {
    const manager = loopManager.current;

    // Main passive income loop (10 FPS = every 100ms)
    manager.startMainLoop(() => {
      const effectiveCps = getEffectiveCps();
      if (effectiveCps > 0) {
        addCoins(effectiveCps / 10);
      }
    }, 10);

    return () => {
      manager.cleanup();
    };
  }, [addCoins, getEffectiveCps]);

  return loopManager.current;
};
```

### 3.3 hooks/useRandomEvents.js

```javascript
import { useEffect } from 'react';
import { EventManager } from '../managers/EventManager';
import { useUIStore } from '../store/uiStore';
import { useGameStore } from '../store/gameStore';
import { useEventsStore } from '../store/eventsStore';

export const useRandomEvents = (gameLoopManager) => {
  const showNotification = useUIStore((state) => state.showNotification);
  const addCoins = useGameStore((state) => state.addCoins);
  const addExperience = useGameStore((state) => state.addExperience);
  const cps = useGameStore((state) => state.cps);
  const setMeteorShower = useEventsStore((state) => state.setMeteorShower);
  const setUfoEvent = useEventsStore((state) => state.setUfoEvent);
  const setCosmicStorm = useEventsStore((state) => state.setCosmicStorm);

  useEffect(() => {
    if (!gameLoopManager) return;

    gameLoopManager.addInterval('random_events', () => {
      if (Math.random() < 0.15) {
        const event = EventManager.getRandomEvent();
        showNotification(`Событие: ${event.name}!`, event.type);

        // Context for event handler
        const context = {
          addCoins,
          addExperience,
          cps,
          setMeteorShower,
          setUfoEvent,
          setCosmicStorm,
          spawnPackage: window.spawnPackage,
        };

        EventManager.handleEvent(event.effect, context);
      }
    }, 45000);

    return () => {
      gameLoopManager.removeInterval('random_events');
    };
  }, [gameLoopManager, showNotification, addCoins, addExperience, cps]);
};
```

---

## 4️⃣ Добавление Error Boundary

### 4.1 components/ErrorBoundary.jsx

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // TODO: Send to error tracking service (Sentry)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>🚀 Космическая авария!</h1>
            <p>Произошла критическая ошибка в системе доставки.</p>
            <details>
              <summary>Технические детали</summary>
              <pre>{this.state.error?.toString()}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
            <button onClick={this.handleReset}>
              Перезапустить систему
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

### 4.2 Стили для ErrorBoundary в App.css

```css
.error-boundary {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #1a0033 0%, #330066 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.error-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 600px;
  text-align: center;
}

.error-content h1 {
  font-family: var(--font-premium);
  color: #ff3366;
  margin-bottom: 20px;
}

.error-content button {
  margin-top: 20px;
  padding: 12px 30px;
  background: var(--plasma-blue);
  border: none;
  border-radius: 10px;
  color: black;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.error-content button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px var(--plasma-glow);
}

.error-content details {
  margin-top: 20px;
  text-align: left;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
}

.error-content pre {
  font-size: 0.8rem;
  overflow-x: auto;
  color: #ff6b6b;
}
```

---

## 5️⃣ Обновленный Game.jsx

```javascript
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useUpgradesStore } from '../store/upgradesStore';
import { useUIStore } from '../store/uiStore';
import { useEventsStore } from '../store/eventsStore';
import { useGameSave } from '../hooks/useGameSave';
import { useGameLoop } from '../hooks/useGameLoop';
import { useRandomEvents } from '../hooks/useRandomEvents';
import GameCanvas from './GameCanvas';
import Upgrades from './Upgrades';
import Missions from './Missions';
import Research from './Research';
import Prestige from './Prestige';
import AdminPanel from './AdminPanel';

const Game = ({ user }) => {
  // Stores (shallow selectors for performance)
  const gameState = useGameStore();
  const { upgrades, upgrade: upgradeAction } = useUpgradesStore();
  const { activePanel, setActivePanel, notifications, floatingTexts } = useUIStore();
  const { combo } = useEventsStore();

  // Custom hooks
  const { saveNow } = useGameSave();
  const gameLoopManager = useGameLoop();
  useRandomEvents(gameLoopManager);

  // Handlers
  const handleUpgrade = (key) => {
    const result = upgradeAction(key, gameState.coins);
    if (result.success) {
      useGameStore.getState().addCoins(-result.cost);
      useGameStore.getState().addExperience(10 * (upgrades[key].level + 1));
      useUIStore.getState().showNotification(
        `${upgrades[key].name} улучшен!`,
        'success'
      );
    }
  };

  const handleTravel = (index, purchase = false) => {
    if (purchase) {
      // Logic через store action
      useGameStore.getState().unlockPlanet(index, planet.cost);
      useUIStore.getState().showNotification(
        `Открыта планета: ${planet.name}`,
        'success'
      );
    } else {
      useGameStore.getState().setCurrentPlanet(index);
    }
  };

  const handlePackageCollect = (data) => {
    // Вся логика перенесена в store actions и хуки
    // ... simplified collect logic
  };

  return (
    <div className="game-container">
      <GameCanvas
        gameState={gameState}
        currentPlanetIndex={gameState.currentPlanetIndex}
        onPackageCollect={handlePackageCollect}
        robotLevel={upgrades.robot.level}
      />

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map((n) => (
          <div key={n.id} className={`notification ${n.type}`}>
            {n.msg}
          </div>
        ))}
      </div>

      {/* Floating texts */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className="floating-text"
          style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
        >
          {ft.text}
        </div>
      ))}

      {/* Combo display */}
      {combo.count > 1 && (
        <div className="combo-display-abs">
          <h2>🔥 COMBO x{combo.multiplier.toFixed(1)}</h2>
          <p>{combo.count} packages in a row!</p>
        </div>
      )}

      {/* HUD, panels, etc. - simplified */}
      {/* ... rest of JSX */}
    </div>
  );
};

export default Game;
```

---

## 6️⃣ Обновление App.jsx с ErrorBoundary

```javascript
import React, { useEffect, useState } from 'react';
import './App.css';
import Game from './components/Game';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import useTelegram from './hooks/useTelegram';

function App() {
  const { user, initData } = useTelegram();
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onFinished={() => setLoading(false)} />;
  }

  const currentUser = user || { 
    id: 1, 
    username: 'BrowserCommander', 
    first_name: 'Commander' 
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <Game user={currentUser} initData={initData} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
```

---

## 📋 Чек-лист выполнения

### Week 1
- [ ] Установить Zustand и Immer
- [ ] Создать все stores (game, upgrades, ui, events, missions)
- [ ] Создать GameLoopManager
- [ ] Создать SaveManager с версионированием
- [ ] Создать EventManager
- [ ] Создать хуки (useGameSave, useGameLoop, useRandomEvents)
- [ ] Тестирование stores в изоляции

### Week 2
- [ ] Создать ErrorBoundary компонент
- [ ] Рефакторинг Game.jsx (удалить useState, использовать stores)
- [ ] Обновить все дочерние компоненты для работы с Zustand
- [ ] Тестирование интеграции
- [ ] Проверка производительности (React DevTools Profiler)
- [ ] Убрать глобальные переменные window.*
- [ ] Документация изменений

---

## 🧪 Критерии успеха

1. ✅ Game.jsx уменьшен с 710 до ~250 строк
2. ✅ Нет утечек памяти (проверить DevTools Memory)
3. ✅ Все функционал работает как раньше
4. ✅ Сохранения работают корректно с версионированием
5. ✅ ErrorBoundary ловит ошибки
6. ✅ Производительность не ухудшилась (FPS остался прежним)
7. ✅ Код покрыт JSDoc комментариями

---

## 🚀 Следующие шаги после Фазы 1

После успешного завершения Фазы 1:
1. Начать Фазу 2: Оптимизация производительности
2. Добавить React.memo, useCallback, useMemo
3. Code splitting и lazy loading
4. Lighthouse аудит

**Оценка времени:** 1-2 недели  
**Риски:** Средние - нужно тщательное тестирование

---

*План создан: 2026-02-05*
