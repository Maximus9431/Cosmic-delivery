import React from 'react';
import { Globe, Lock } from 'lucide-react';
import { solarSystemPlanets } from '../gameData';

const Research = ({ currentPlanetIndex, onTravel, funds, unlockedPlanets, onClose }) => {
    return (
        <div className="side-panel right">
            <div className="panel-header">
                <h3><Globe /> ИССЛЕДОВАНИЯ</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="panel-content">
                <div className="planet-list">
                    {solarSystemPlanets.map((planet, index) => {
                        const isUnlocked = unlockedPlanets.includes(index);
                        const isCurrent = index === currentPlanetIndex;

                        return (
                            <div key={planet.id} className={`planet-card ${isCurrent ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                                onClick={() => {
                                    if (isUnlocked) onTravel(index);
                                    else if (funds >= planet.cost) onTravel(index, true);
                                }}>
                                <div className="planet-icon" style={{ backgroundColor: `#${planet.color.toString(16).padStart(6, '0')}` }}>
                                    {isUnlocked ? <Globe size={24} /> : <Lock size={24} />}
                                </div>
                                <div className="planet-info">
                                    <h4>{planet.name}</h4>
                                    <p>{planet.description}</p>
                                    <div className="planet-stats-mini">
                                        <span>🌡️ {planet.temperature}</span>
                                        <span>⚖️ {planet.gravity}g</span>
                                    </div>
                                    {isUnlocked ? (
                                        <div className="unlocked-badge">ДОСТУПНО ДЛЯ ПОЛЕТОВ</div>
                                    ) : (
                                        <div className="unlock-cost">
                                            🔒 Разблокировать: 💰 {planet.cost.toLocaleString()}
                                        </div>
                                    )}
                                    {isCurrent && <div className="current-badge">ТЕКУЩАЯ БАЗА</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Research;
