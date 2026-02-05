import React from 'react';
import { Rocket, Zap, Search, Satellite, Bot, Atom, Shield, Radar } from 'lucide-react';

const iconMap = {
    robot: <Bot size={24} />,
    zap: <Zap size={24} />,
    search: <Search size={24} />,
    satellite: <Satellite size={24} />,
    atom: <Atom size={24} />,
    shield: <Shield size={24} />,
    rocket: <Rocket size={24} />,
    spaceStation: <Radar size={24} />,
};

const Upgrades = ({ upgrades, coins, onUpgrade, onClose }) => {
    return (
        <div className="side-panel right">
            <div className="panel-header">
                <h3><Rocket /> КОСМОПОРТ</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="panel-content">
                <div className="upgrade-grid">
                    {Object.entries(upgrades).map(([key, upgrade]) => (
                        <div key={key} className={`upgrade-item ${coins < upgrade.cost ? 'disabled' : ''}`} onClick={() => coins >= upgrade.cost && onUpgrade(key)}>
                            <div className="upgrade-icon-box">
                                {iconMap[upgrade.icon] || <Rocket size={24} />}
                            </div>
                            <div className="upgrade-details">
                                <h4>{upgrade.name} (Ур. {upgrade.level})</h4>
                                <p>{upgrade.description}</p>
                                <div className="effect-badge">{upgrade.effectText}</div>
                                <div className="upgrade-footer">
                                    <span className="price-tag">💰 {Math.floor(upgrade.cost).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Upgrades;
