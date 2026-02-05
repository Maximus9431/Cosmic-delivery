import React, { useState } from 'react';
import { X, Trash2, Plus, Save, RefreshCw, Zap, Package, Globe, Award, Coins, Bot, Infinity, FlaskConical } from 'lucide-react';

const AdminPanel = ({ gameState, setGameState, upgrades, setUpgrades, onClose, triggerEvent }) => {
    const [coins, setCoins] = useState(gameState.coins);
    const [darkMatter, setDarkMatter] = useState(gameState.darkMatter);
    const [level, setLevel] = useState(gameState.playerLevel);
    const [experience, setExperience] = useState(gameState.experience);
    const [reputation, setReputation] = useState(gameState.reputation);
    const [packagesDelivered, setPackagesDelivered] = useState(gameState.packagesDelivered);

    const handleApply = () => {
        setGameState(prev => ({
            ...prev,
            coins: parseInt(coins) || 0,
            darkMatter: parseInt(darkMatter) || 0,
            playerLevel: parseInt(level) || 1,
            experience: parseInt(experience) || 0,
            reputation: parseInt(reputation) || 0,
            packagesDelivered: parseInt(packagesDelivered) || 0
        }));
        alert('✅ Изменения применены!');
    };

    const handleReset = () => {
        if (window.confirm('⚠️ Вы уверены? Это сбросит весь прогресс!')) {
            localStorage.removeItem('spaceCourierProgress');
            window.location.reload();
        }
    };

    const handleAddCoins = (amount) => {
        const newValue = parseInt(coins) + amount;
        setCoins(newValue);
    };

    const handleMaxUpgrades = () => {
        if (window.confirm('Прокачать все улучшения до максимума?')) {
            const maxedUpgrades = {};
            Object.keys(upgrades).forEach(key => {
                maxedUpgrades[key] = {
                    ...upgrades[key],
                    level: 100
                };
            });
            setUpgrades(maxedUpgrades);
            alert('✅ Все улучшения прокачаны до 100 уровня!');
        }
    };

    const handleUnlockAllPlanets = () => {
        setGameState(prev => ({
            ...prev,
            unlockedPlanets: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        }));
        alert('✅ Все планеты разблокированы!');
    };

    const handleSpawnRare = () => {
        if (window.spawnPackage) {
            window.spawnPackage(true);
            alert('✨ Редкая посылка создана!');
        }
    };

    const handleSpawnMultiple = () => {
        if (window.spawnPackage) {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => window.spawnPackage(), i * 100);
            }
            alert('📦 Создано 10 посылок!');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel admin-panel" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚙️ Админ Панель</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    {/* Управление ресурсами */}
                    <div className="admin-section">
                        <h3>💰 Ресурсы</h3>
                        <div className="admin-grid">
                            <div className="admin-input-group">
                                <label>Кредиты:</label>
                                <input
                                    type="number"
                                    value={coins}
                                    onChange={(e) => setCoins(e.target.value)}
                                    className="admin-input"
                                />
                                <div className="quick-add-buttons">
                                    <button onClick={() => handleAddCoins(1000)} className="quick-btn">+1K</button>
                                    <button onClick={() => handleAddCoins(10000)} className="quick-btn">+10K</button>
                                    <button onClick={() => handleAddCoins(100000)} className="quick-btn">+100K</button>
                                    <button onClick={() => handleAddCoins(1000000)} className="quick-btn">+1M</button>
                                </div>
                            </div>

                            <div className="admin-input-group">
                                <label>Темная Материя:</label>
                                <input
                                    type="number"
                                    value={darkMatter}
                                    onChange={(e) => setDarkMatter(e.target.value)}
                                    className="admin-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Настройка прогресса */}
                    <div className="admin-section">
                        <h3>📊 Прогресс игрока</h3>
                        <div className="admin-grid">
                            <div className="admin-input-group">
                                <label>Уровень:</label>
                                <input
                                    type="number"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="admin-input"
                                />
                            </div>

                            <div className="admin-input-group">
                                <label>Опыт:</label>
                                <input
                                    type="number"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="admin-input"
                                />
                            </div>

                            <div className="admin-input-group">
                                <label>Репутация:</label>
                                <input
                                    type="number"
                                    value={reputation}
                                    onChange={(e) => setReputation(e.target.value)}
                                    className="admin-input"
                                />
                            </div>

                            <div className="admin-input-group">
                                <label>Доставлено посылок:</label>
                                <input
                                    type="number"
                                    value={packagesDelivered}
                                    onChange={(e) => setPackagesDelivered(e.target.value)}
                                    className="admin-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Текущие данные */}
                    <div className="admin-section">
                        <h3>📈 Текущие Данные</h3>
                        <div className="admin-stats">
                            <p>💰 Кредиты: <strong>{Math.floor(gameState.coins).toLocaleString()}</strong></p>
                            <p>🌌 Темная Материя: <strong>{gameState.darkMatter}</strong></p>
                            <p>⭐ Уровень: <strong>{gameState.playerLevel}</strong></p>
                            <p>📦 Посылок доставлено: <strong>{gameState.packagesDelivered}</strong></p>
                            <p>💎 Всего заработано: <strong>{Math.floor(gameState.totalCoins).toLocaleString()}</strong></p>
                            <p>🏆 Репутация: <strong>{gameState.reputation}</strong></p>
                        </div>
                    </div>

                    {/* Быстрые действия */}
                    <div className="admin-section">
                        <h3>⚡ Быстрые Действия</h3>
                        <div className="admin-actions">
                            <button className="admin-action-btn unlock" onClick={handleUnlockAllPlanets}>
                                <Globe size={18} />
                                Разблокировать Все Планеты
                            </button>
                            <button className="admin-action-btn upgrade" onClick={handleMaxUpgrades}>
                                <Zap size={18} />
                                Максимальные Улучшения
                            </button>
                            <button className="admin-action-btn spawn" onClick={handleSpawnRare}>
                                <Award size={18} />
                                Создать Редкую Посылку
                            </button>
                            <button className="admin-action-btn spawn-multi" onClick={handleSpawnMultiple}>
                                <Package size={18} />
                                Создать 10 Посылок
                            </button>
                        </div>
                    </div>

                    {/* Запуск событий */}
                    <div className="admin-section">
                        <h3>🌌 Запуск событий</h3>
                        <div className="admin-actions">
                            <button className="admin-action-btn spawn" onClick={() => triggerEvent('extra_packages')}>
                                <Package size={18} />
                                Кометный Дождь
                            </button>
                            <button className="admin-action-btn upgrade" onClick={() => triggerEvent('free_coins')}>
                                <Coins size={18} />
                                Космическая Аномалия
                            </button>
                            <button className="admin-action-btn spawn-multi" onClick={() => triggerEvent('ufo')}>
                                <Bot size={18} />
                                НЛО
                            </button>
                            <button className="admin-action-btn unlock" onClick={() => triggerEvent('luck')}>
                                <Infinity size={18} />
                                Космическая Удача
                            </button>
                            <button className="admin-action-btn apply" onClick={() => triggerEvent('xp_boost')}>
                                <Zap size={18} />
                                Энергетический Всплеск
                            </button>
                            <button className="admin-action-btn reset" onClick={() => triggerEvent('meteor_shower')}>
                                <FlaskConical size={18} />
                                Метеоритный Дождь
                            </button>
                            <button className="admin-action-btn upgrade" onClick={() => triggerEvent('cosmic_storm')}>
                                <Zap size={18} />
                                Космический Шторм
                            </button>
                        </div>
                    </div>

                    {/* Основные действия */}
                    <div className="admin-section">
                        <h3>🛠️ Управление</h3>
                        <div className="admin-actions">
                            <button className="admin-action-btn apply" onClick={handleApply}>
                                <Save size={18} />
                                Применить Изменения
                            </button>
                            <button className="admin-action-btn reset" onClick={handleReset}>
                                <Trash2 size={18} />
                                Сбросить Прогресс
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
