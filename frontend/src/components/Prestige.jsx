import React from 'react';
import { Infinity } from 'lucide-react';

const Prestige = ({ darkMatter, pendingDarkMatter, onPrestige, onClose }) => {
    return (
        <div className="side-panel left">
            <div className="panel-header">
                <h3><Infinity /> ПРЕСТИЖ</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="panel-content">
                <div className="prestige-info">
                    <p>Сбросьте текущий прогресс, чтобы получить <b>Темную материю</b>.</p>
                    <div className="resource-card prestige-card">
                        <div className="resource-info">
                            <h3>{darkMatter}</h3>
                            <p>Темная материя (+{pendingDarkMatter})</p>
                        </div>
                    </div>
                    <p className="description-text">
                        Каждая единица дает +10% к общему доходу навсегда.
                    </p>
                    <button className="action-btn primary" onClick={onPrestige} disabled={pendingDarkMatter < 1}>
                        СОВЕРШИТЬ СКАЧОК
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Prestige;
