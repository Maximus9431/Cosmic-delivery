import React from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';

const Missions = ({ missions, onClose }) => {
    return (
        <div className="side-panel left">
            <div className="panel-header">
                <h3><Trophy /> КОСМИЧЕСКИЕ МИССИИ</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="panel-content">
                <div className="missions-list">
                    {missions.map(mission => (
                        <div key={mission.id} className={`mission-item ${mission.completed ? 'completed' : ''}`}>
                            <div className="mission-status">
                                {mission.completed ? <CheckCircle2 color="var(--star-gold)" size={24} /> : <Trophy size={20} color="var(--comet-silver)" />}
                            </div>
                            <div className="mission-details">
                                <h4>{mission.title}</h4>
                                <p>{mission.description}</p>
                                {!mission.completed && (
                                    <div className="mission-progress-bar">
                                        <div className="fill" style={{ width: `${Math.min((mission.progress / mission.target) * 100, 100)}%` }} />
                                    </div>
                                )}
                                <span className="price-tag">Награда: 💰 {mission.reward.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Missions;
