import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './GameCanvas';
import Upgrades from './Upgrades';
import Missions from './Missions';
import Research from './Research';
import Prestige from './Prestige';
import AdminPanel from './AdminPanel';
import axios from 'axios';
import { Coins, Package, Globe, Zap, Settings, Trophy, Rocket, FlaskConical, Infinity, Magnet, Bot } from 'lucide-react';
import { solarSystemPlanets, initialUpgrades, initialMissions } from '../gameData';

const API_URL = import.meta.env.VITE_API_URL || 'https://cosmic-delivery-backend.onrender.com';

// Helper function to calculate temperature progress for gauge
const getTempProgress = (tempStr) => {
    const temp = parseInt(tempStr.replace('°C', ''));
    // Normalize from -200 to 500 (covering all planet temps)
    const minTemp = -200;
    const maxTemp = 500;
    const progress = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
    return Math.max(0, Math.min(100, progress));
};

const Game = ({ user, initData }) => {
    /* Core Gameplay State */
    const [gameState, setGameState] = useState({
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
        unlockedPlanets: [0]
    });

    const [upgrades, setUpgrades] = useState(initialUpgrades);
    const [missions, setMissions] = useState(initialMissions);
    const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0); // 0 = Mercury
    const [activePanel, setActivePanel] = useState(null); // 'upgrades', 'missions', 'research', 'prestige'
    const [notifications, setNotifications] = useState([]);

    const [skillCooldowns, setSkillCooldowns] = useState({ magnet: 0, warp: 0 });
    const [isInitialized, setIsInitialized] = useState(false);

    // Meteor Shower
    const [meteorShower, setMeteorShower] = useState({ active: false, endTime: 0 });

    // UFO Event
    const [ufoEvent, setUfoEvent] = useState({ active: false, endTime: 0 });

    // Cosmic Storm
    const [cosmicStorm, setCosmicStorm] = useState({ active: false, endTime: 0 });

    const lastRareNotify = useRef(0);

    // Cosmic Storm Effect
    useEffect(() => {
        if (cosmicStorm.active && Date.now() > cosmicStorm.endTime) {
            setCosmicStorm({ active: false, endTime: 0 });
            // Chance to lose packages
            if (Math.random() < 0.2) {
                // Note: Can't access packagesRef here, need to pass callback or something
                showNotification('Шторм утих, но уничтожил все посылки!', 'error');
            } else {
                showNotification('Шторм утих! Вы пережили бурю.', 'success');
            }
        }
    }, [cosmicStorm]);

    // UFO Event Effect
    useEffect(() => {
        if (ufoEvent.active && Date.now() > ufoEvent.endTime) {
            setUfoEvent({ active: false, endTime: 0 });
            // Reward based on whether packages were stolen
            if (ufoEvent.stolePackages) {
                setGameState(p => ({ ...p, coins: p.coins + 1000 })); // Less reward if stole
                showNotification(`НЛО украло все посылки, но оставило ${1000} кредитов.`, 'warning');
            } else {
                setGameState(p => ({ ...p, coins: p.coins + 2000 })); // Full reward if no packages
                showNotification(`НЛО пролетело мимо и оставило ${2000} кредитов!`, 'success');
            }
            addExperience(10);
        }
    }, [ufoEvent]);

    // Meteor Shower Effect
    useEffect(() => {
        if (meteorShower.active && Date.now() > meteorShower.endTime) {
            setMeteorShower({ active: false, endTime: 0 });
            // Chance to lose coins
            if (Math.random() < 1.0) { // 100% chance
                const loss = Math.floor(gameState.coins * 0.15); // 15% of current coins
                setGameState(prev => ({ ...prev, coins: Math.max(0, prev.coins - loss) }));
                showNotification(`Метеорит повредил склад! Потеряно ${loss} кредитов.`, 'error');
            }
        }
    }, [meteorShower, gameState.coins]);

    // Load Game Progress
    useEffect(() => {
        const saved = localStorage.getItem('spaceCourierProgress');
        console.log("Loading progress...", saved ? "Found save" : "No save");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                console.log("Parsed data:", data);

                setGameState(prev => ({
                    ...prev,
                    coins: typeof data.coins === 'number' ? data.coins : 1000,
                    packagesDelivered: data.packagesDelivered || 0,
                    totalCoins: data.totalCoins || 0,
                    darkMatter: data.darkMatter || 0,
                    experience: data.experience || 0,
                    playerLevel: data.playerLevel || 1,
                    reputation: data.reputation || 0,
                    unlockedPlanets: Array.isArray(data.unlockedPlanets) ? data.unlockedPlanets : [0]
                }));

                if (data.upgrades) setUpgrades(data.upgrades);
                if (data.missions) setMissions(data.missions);

                if (typeof data.currentPlanetIndex === 'number' && data.currentPlanetIndex < solarSystemPlanets.length) {
                    const loadedIndex = data.currentPlanetIndex;
                    const loadedUnlocked = Array.isArray(data.unlockedPlanets) ? data.unlockedPlanets : [0];

                    if (loadedUnlocked.includes(loadedIndex)) {
                        console.log("Setting current planet to:", loadedIndex);
                        setCurrentPlanetIndex(loadedIndex);
                    } else {
                        console.log(`Planet ${loadedIndex} not unlocked, resetting to Mercury`);
                        setCurrentPlanetIndex(0);
                    }
                } else {
                    console.log("Defaulting to Mercury (0)");
                    setCurrentPlanetIndex(0);
                }
            } catch (e) {
                console.error("Load fail", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Manual Save Function
    const saveGame = useCallback((forceState = null) => {
        if (!isInitialized) return;

        const stateToSave = forceState || {
            coins: gameState.coins,
            packagesDelivered: gameState.packagesDelivered,
            totalCoins: gameState.totalCoins,
            darkMatter: gameState.darkMatter,
            experience: gameState.experience,
            playerLevel: gameState.playerLevel,
            reputation: gameState.reputation,
            unlockedPlanets: gameState.unlockedPlanets,
            upgrades,
            missions,
            currentPlanetIndex
        };

        localStorage.setItem('spaceCourierProgress', JSON.stringify(stateToSave));
    }, [gameState, upgrades, missions, currentPlanetIndex, isInitialized]);

    // Throttled Auto-Save Effect (instead of debounce to avoid ticker block)
    useEffect(() => {
        if (!isInitialized) return;

        const saveInterval = setInterval(() => {
            saveGame();
        }, 5000); // Save every 5 seconds to be safe

        return () => clearInterval(saveInterval);
    }, [saveGame, isInitialized]);

    /* Synchronization with Cloud/Backend persistence */
    useEffect(() => {
        if (initData && !localStorage.getItem('spaceCourierProgress')) {
            axios.get(`${API_URL}/user/me?init_data=${encodeURIComponent(initData)}`)
                .then(res => {
                    const data = res.data;
                    setGameState(prev => ({
                        ...prev,
                        coins: data.coins,
                        packagesDelivered: data.packages_delivered,
                        darkMatter: data.dark_matter || 0,
                        unlockedPlanets: data.unlocked_planets || [0]
                    }));
                })
                .catch(err => console.error(err));
        }
    }, [initData]);

    // Calculate CPS
    useEffect(() => {
        const cps = (upgrades.robot.level * 5) + (upgrades.hangar.level * 10) + (upgrades.quantum.level * 50);
        setGameState(prev => ({ ...prev, cps }));
    }, [upgrades]);

    // Combo State
    const [combo, setCombo] = useState({ count: 0, multiplier: 1, lastTime: 0 });

    // Passive income tick
    useEffect(() => {
        const interval = setInterval(() => {
            if (gameState.cps > 0) {
                const effectiveCps = gameState.cps * (1 + gameState.darkMatter * 0.1);
                setGameState(prev => ({ ...prev, coins: prev.coins + (effectiveCps / 10), totalCoins: prev.totalCoins + (effectiveCps / 10) }));
            }
        }, 100);
        return () => clearInterval(interval);
    }, [gameState.cps, gameState.darkMatter]);

    // Random Events
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.15) {
                const events = [
                    { name: 'Кометный дождь', effect: 'extra_packages', type: 'info' },
                    { name: 'Солнечная буря', effect: 'double_value', type: 'warning' },
                    { name: 'Космическая аномалия', effect: 'free_coins', type: 'success' },
                    { name: 'НЛО', effect: 'ufo', type: 'success' },
                    { name: 'Космическая удача', effect: 'luck', type: 'success' },
                    { name: 'Энергетический всплеск', effect: 'xp_boost', type: 'success' },
                    { name: 'Метеоритный дождь', effect: 'meteor_shower', type: 'warning' },
                    { name: 'Космический шторм', effect: 'cosmic_storm', type: 'warning' }
                ];
                const event = events[Math.floor(Math.random() * events.length)];
                showNotification(`Событие: ${event.name}!`, event.type);

                if (event.effect === 'extra_packages') {
                    for (let i = 0; i < 10; i++) setTimeout(() => window.spawnPackage && window.spawnPackage(), i * 300);
                } else if (event.effect === 'free_coins') {
                    setGameState(p => ({ ...p, coins: p.coins + 5000 }));
                } else if (event.effect === 'ufo') {
                    setGameState(p => ({ ...p, coins: p.coins + 2000 }));
                    addExperience(10);
                } else if (event.effect === 'luck') {
                    // Logic handled in handlePackageCollect via a temporary state if needed, 
                    // or just give instant reward for simplicity
                    setGameState(p => ({ ...p, coins: p.coins + (p.cps * 60) }));
                } else if (event.effect === 'xp_boost') {
                    addExperience(100);
                } else if (event.effect === 'meteor_shower') {
                    setMeteorShower({ active: true, endTime: Date.now() + 10000 }); // 10 seconds
                } else if (event.effect === 'cosmic_storm') {
                    setCosmicStorm({ active: true, endTime: Date.now() + 30000 });
                }
            }
        }, 45000); // Every 45s try to trigger
        return () => clearInterval(interval);
    }, []);

    // Auto-spawn packages
    useEffect(() => {
        const interval = setInterval(() => {
            let chance = 0.05 + (upgrades.speed.level * 0.02);
            if (cosmicStorm.active) chance *= 2; // Double spawn during storm
            if (Math.random() < chance && window.spawnPackage) {
                window.spawnPackage();
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [upgrades.speed.level, cosmicStorm.active]);

    // Nexus Station rare spawns
    useEffect(() => {
        if (upgrades.nexus.level > 0) {
            const interval = setInterval(() => {
                for (let i = 0; i < upgrades.nexus.level; i++) {
                    setTimeout(() => window.spawnPackage && window.spawnPackage(true), i * 1000);
                }
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [upgrades.nexus.level]);

    // Combo Timer Config
    useEffect(() => {
        if (combo.count > 0) {
            const timer = setTimeout(() => {
                if (combo.count > 5) showNotification(`Комбо завершено: x${combo.multiplier.toFixed(1)}`, 'info');
                setCombo({ count: 0, multiplier: 1, lastTime: 0 });
            }, 3000); // 3s timeout
            return () => clearTimeout(timer);
        }
    }, [combo]);

    // Helpers
    const showNotification = (msg, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => {
            const next = [...prev, { id, msg, type }];
            return next.slice(-4); // Keep only last 4
        });
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
    };

    const addExperience = (amount) => {
        setGameState(prev => {
            let xp = prev.experience + amount;
            let level = prev.playerLevel;
            let xpToNext = Math.floor(100 * Math.pow(1.5, level - 1));
            let newCoins = prev.coins;

            while (xp >= xpToNext) {
                xp -= xpToNext;
                level++;
                xpToNext = Math.floor(100 * Math.pow(1.5, level - 1));
                newCoins += level * 100;
                showNotification(`🎉 Уровень ${level}! Новые возможности открыты!`, "success");
            }
            return { ...prev, experience: xp, playerLevel: level, coins: newCoins };
        });
    };

    const handleUpgrade = (key) => {
        const upgrade = upgrades[key];
        if (gameState.coins >= upgrade.cost) {
            setGameState(prev => ({ ...prev, coins: prev.coins - upgrade.cost, reputation: prev.reputation + 2 }));
            setUpgrades(prev => ({
                ...prev,
                [key]: {
                    ...upgrade,
                    level: upgrade.level + 1,
                    cost: Math.floor(upgrade.cost * 1.8)
                }
            }));
            addExperience(10 * (upgrade.level + 1));
            showNotification(`${upgrade.name} улучшен до уровня ${upgrade.level + 1}!`, 'success');
        }
    };

    const handleTravel = (index, purchase = false) => {
        const planet = solarSystemPlanets[index];
        if (purchase) {
            if (gameState.coins >= planet.cost) {
                setGameState(prev => ({
                    ...prev,
                    coins: prev.coins - planet.cost,
                    unlockedPlanets: [...new Set([...prev.unlockedPlanets, index])]
                }));
                setCurrentPlanetIndex(index);
                showNotification(`Открыта планета: ${planet.name}`, 'success');
            }
        } else {
            setCurrentPlanetIndex(index);
        }
    };

    const [floatingTexts, setFloatingTexts] = useState([]);

    const handlePackageCollect = (data) => {
        let value = data.value;
        const planet = solarSystemPlanets[currentPlanetIndex];
        value *= planet.bonus;

        // Multipliers
        const dmBonus = 1 + (gameState.darkMatter * 0.1);
        value *= dmBonus;

        // Combo Logic
        const newCount = combo.count + 1;
        const newMult = 1 + (newCount * 0.1) + (upgrades.scanner.level * 0.05);
        setCombo({ count: newCount, multiplier: newMult, lastTime: Date.now() });
        value *= newMult;

        setGameState(prev => ({
            ...prev,
            coins: prev.coins + value,
            totalCoins: prev.totalCoins + value,
            packagesDelivered: prev.packagesDelivered + 1,
            reputation: prev.reputation + 1
        }));

        // Experience
        addExperience(data.isRare ? 20 : 5);

        // Floating Text
        const id = Date.now();
        const text = `+${Math.floor(value)}`;
        const x = 50 + (Math.random() - 0.5) * 20;
        const y = 50 + (Math.random() - 0.5) * 20;
        setFloatingTexts(prev => [...prev, { id, text, x, y }]);
        setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1000);

        if (data.isRare) {
            const now = Date.now();
            if (now - lastRareNotify.current > 1500) { // Limit rare notifications
                showNotification(`Собрано редкое: ${Math.floor(value)}`, 'warning');
                lastRareNotify.current = now;
            }
        }
    };

    const handlePrestige = () => {
        const pending = Math.floor(gameState.totalCoins / 1000000);
        if (pending > 0) {
            setGameState(prev => ({
                ...prev,
                coins: 1000,
                packagesDelivered: 0,
                planetLevel: 1,
                multiplier: 1,
                darkMatter: prev.darkMatter + pending,
                totalCoins: 0,
                cps: 0,
                // Preserving unlockedPlanets, experience, playerLevel, reputation
            }));
            // Reset upgrades
            setUpgrades(initialUpgrades);
            setCurrentPlanetIndex(0);
            showNotification(`ПРЕСТИЖ! Получено ${pending} Темной материи`, 'success');
            setActivePanel(null);
        }
    };

    const useSkill = (skill) => {
        if (Date.now() < skillCooldowns[skill]) {
            showNotification("Навык перезаряжается", "error");
            return;
        }

        if (skill === 'magnet') {
            const count = window.collectAllPackages ? window.collectAllPackages() : 0;
            if (count > 0) {
                showNotification(`Магнит активирован! Собрано посылок: ${count}`, "success");
                addExperience(count * 2);
            } else {
                showNotification("Нет посылок для сбора", "warning");
                return; // Don't trigger cooldown if nothing was collected
            }
            setSkillCooldowns(prev => ({ ...prev, magnet: Date.now() + 30000 }));
        } else if (skill === 'warp') {
            showNotification("Варп-двигатель! x5 скорость", "success");
            setSkillCooldowns(prev => ({ ...prev, warp: Date.now() + 60000 }));
        }
    };

    // Event Triggers for Admin
    const triggerEvent = (effect) => {
        const eventMap = {
            extra_packages: { name: 'Кометный дождь', type: 'info' },
            double_value: { name: 'Солнечная буря', type: 'warning' },
            free_coins: { name: 'Космическая аномалия', type: 'success' },
            ufo: { name: 'НЛО', type: 'success' },
            luck: { name: 'Космическая удача', type: 'success' },
            xp_boost: { name: 'Энергетический всплеск', type: 'success' },
            meteor_shower: { name: 'Метеоритный дождь', type: 'warning' }
        };

        const event = eventMap[effect];
        if (!event) return;

        showNotification(`Админ: ${event.name}!`, event.type);

        if (effect === 'extra_packages') {
            for (let i = 0; i < 10; i++) setTimeout(() => window.spawnPackage && window.spawnPackage(), i * 300);
        } else if (effect === 'free_coins') {
            setGameState(p => ({ ...p, coins: p.coins + 5000 }));
        } else if (effect === 'ufo') {
            setUfoEvent({ active: true, endTime: Date.now() + 8000, stolePackages: false }); // 8 seconds
        } else if (effect === 'luck') {
            setGameState(p => ({ ...p, coins: p.coins + (p.cps * 60) }));
        } else if (effect === 'xp_boost') {
            addExperience(100);
        } else if (effect === 'meteor_shower') {
            setMeteorShower({ active: true, endTime: Date.now() + 10000 });
        }
    };

    // Handle touch-friendly interactions
    useEffect(() => {
        const handleTouchStart = (e) => {
            // Prevent double-tap zoom on mobile
            if (e.touches.length === 2) {
                e.preventDefault();
            }
        };

        const handleOrientationChange = () => {
            // Adjust layout on orientation change
            window.dispatchEvent(new Event('orientationchange'));
        };

        document.addEventListener('touchstart', handleTouchStart, false);
        window.addEventListener('orientationchange', handleOrientationChange);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart, false);
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, []);

    // Mission tracking
    useEffect(() => {
        setMissions(prev => prev.map(m => {
            if (m.completed) return m;
            let progress = m.progress;
            if (m.id === 1 || m.id === 4) progress = gameState.packagesDelivered;
            if (m.id === 2 || m.id === 5) progress = gameState.totalCoins;
            if (m.id === 3 || m.id === 7) progress = gameState.unlockedPlanets.length;
            if (m.id === 6) progress = Object.values(upgrades).reduce((acc, u) => acc + u.level, 0);

            const completed = progress >= m.target;
            if (completed && !m.completed) {
                setGameState(s => ({ ...s, coins: s.coins + m.reward }));
                showNotification(`Миссия выполнена: ${m.title}`, 'success');
            }
            return { ...m, progress, completed };
        }));
    }, [gameState.packagesDelivered, gameState.totalCoins, upgrades]);

    const expProgress = (gameState.coins % 1000) / 10; // Mock progress

    return (
        <div className="game-container">
            <GameCanvas
                gameState={gameState}
                setGameState={setGameState}
                currentPlanetIndex={currentPlanetIndex}
                onPackageCollect={handlePackageCollect}
                robotLevel={upgrades.robot.level}
                meteorShower={meteorShower}
                ufoEvent={ufoEvent}
                setUfoEvent={setUfoEvent}
                cosmicStorm={cosmicStorm}
            />

            {/* Notifications */}
            <div className="notifications-container">
                {notifications.map(n => (
                    <div key={n.id} className={`notification ${n.type}`}>
                        {n.msg}
                    </div>
                ))}
            </div>

            {/* Floating Reward Indicators */}
            {floatingTexts.map(ft => (
                <div key={ft.id} className="floating-text" style={{
                    left: `${ft.x}%`,
                    top: `${ft.y}%`
                }}>
                    {ft.text}
                </div>
            ))}

            {/* Active Combo Multiplier */}
            {combo.count > 1 && (
                <div className="combo-display-abs">
                    <h2 className="combo-title">🔥 COMBO x{combo.multiplier.toFixed(1)}</h2>
                    <p className="combo-subtitle">{combo.count} packages in a row!</p>
                </div>
            )}

            {/* Combined Top HUD: Level - Resources - Sector */}
            <div className="top-hud">
                <div className="hud-part-left">
                    <div className="player-stats-hud-mini">
                        <span className="stat-label">УРОВЕНЬ</span>
                        <h2 className="stat-value">{gameState.playerLevel}</h2>
                    </div>
                </div>

                <div className="hud-part-center">
                    <div className="resource-card" onClick={() => setActivePanel('upgrades')}>
                        <div className="resource-icon"><Coins size={20} /></div>
                        <div className="resource-info">
                            <h3>{Math.floor(gameState.coins).toLocaleString()}</h3>
                            <p>Кредиты</p>
                        </div>
                    </div>
                    <div className="resource-card" onClick={() => setActivePanel('missions')}>
                        <div className="resource-icon"><Package size={20} /></div>
                        <div className="resource-info">
                            <h3>{gameState.packagesDelivered}</h3>
                            <p>Посылки</p>
                        </div>
                    </div>
                    <div className="resource-card" onClick={() => setActivePanel('prestige')}>
                        <div className="resource-icon"><Infinity size={20} /></div>
                        <div className="resource-info">
                            <h3>{gameState.darkMatter}</h3>
                            <p>Материя</p>
                        </div>
                    </div>
                </div>

                <div className="hud-part-right">
                    <div className="sector-hud-mini">
                        <span className="stat-label">СЕКТОР</span>
                        <h2 className="stat-value">{currentPlanetIndex + 1}</h2>
                    </div>
                </div>
            </div>

            {/* Planet Information Overlay (Top Center) */}
            <div className="planet-hud-top">
                <div className="planet-info-main">
                    <h1 className="planet-name">{solarSystemPlanets[currentPlanetIndex].name}</h1>
                    <div className="planet-stats-row">
                        <div className="planet-stat-item">
                            <Globe size={14} />
                            <span>{solarSystemPlanets[currentPlanetIndex].gravity}g</span>
                        </div>
                        <div className="stat-separator"></div>
                        <div className="planet-stat-item">
                            <FlaskConical size={14} />
                            <span>{solarSystemPlanets[currentPlanetIndex].temperature}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="skills-bar">
                <button className="skill-btn" onClick={() => useSkill('magnet')} disabled={Date.now() < skillCooldowns.magnet}>
                    <Magnet />
                </button>
                <button className="skill-btn" onClick={() => useSkill('warp')} disabled={Date.now() < skillCooldowns.warp}>
                    <Zap />
                </button>
            </div>

            <div className="action-bar">
                <button
                    className="action-btn primary"
                    onClick={() => window.spawnPackage && window.spawnPackage()}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <Package size={20} />
                    Запросить посылку
                </button>
                <button
                    className="action-btn secondary"
                    onClick={() => setActivePanel('upgrades')}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <Bot size={20} />
                </button>
                <button
                    className="action-btn secondary"
                    onClick={() => setActivePanel('research')}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <Globe size={20} />
                </button>
                {(user?.id === 1699512102 || user?.id === 641407863) && (
                    <button className="action-btn secondary" onClick={() => setActivePanel('admin')}>
                        <Settings size={20} />
                    </button>
                )}
            </div>

            {activePanel === 'upgrades' && (
                <Upgrades
                    upgrades={upgrades}
                    coins={gameState.coins}
                    onUpgrade={handleUpgrade}
                    onClose={() => setActivePanel(null)}
                />
            )}

            {activePanel === 'missions' && (
                <Missions
                    missions={missions}
                    onClose={() => setActivePanel(null)}
                />
            )}

            {activePanel === 'research' && (
                <Research
                    currentPlanetIndex={currentPlanetIndex}
                    funds={gameState.coins}
                    onTravel={handleTravel}
                    unlockedPlanets={gameState.unlockedPlanets}
                    onClose={() => setActivePanel(null)}
                />
            )}

            {activePanel === 'prestige' && (
                <Prestige
                    darkMatter={gameState.darkMatter}
                    pendingDarkMatter={Math.floor(gameState.totalCoins / 1000000)}
                    onPrestige={handlePrestige}
                    onClose={() => setActivePanel(null)}
                />
            )}

            {activePanel === 'admin' && (
                <AdminPanel
                    gameState={gameState}
                    setGameState={setGameState}
                    upgrades={upgrades}
                    setUpgrades={setUpgrades}
                    onClose={() => setActivePanel(null)}
                    triggerEvent={triggerEvent}
                />
            )}
        </div>
    );
};

export default Game;
