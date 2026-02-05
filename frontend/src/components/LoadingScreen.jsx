import React, { useState, useEffect } from 'react';
import LoaderCanvas from './LoaderCanvas';

const LoadingScreen = ({ onFinished }) => {
    const [progress, setProgress] = useState(0);
    const [statusLog, setStatusLog] = useState("ИНИЦИАЛИЗАЦИЯ...");
    const [opacity, setOpacity] = useState(1);

    const logs = [
        "Установка соединения...",
        "Проверка систем корабля...",
        "Синхронизация двигателей...",
        "Загрузка карт сектора...",
        "Прогрев реактора...",
        "ГОТОВО К ЗАПУСКУ"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 15;
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setOpacity(0);
                        setTimeout(onFinished, 600);
                    }, 500);
                    return 100;
                }
                return next;
            });
        }, 300);

        return () => clearInterval(interval);
    }, [onFinished]);

    useEffect(() => {
        const logIndex = Math.min(Math.floor((progress / 100) * logs.length), logs.length - 1);
        setStatusLog(logs[logIndex]);
    }, [progress]);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const dataStreamText = "LOG_INIT: SECTOR_READY\nWARP_DRIVE: STABLE\nCARGO_STATE: LOCKED\nUSER_ID: " + (Math.random() * 1000000).toFixed(0);

    return (
        <div className="loading-screen" style={{ opacity }}>
            <div className="loading-content">
                <div className="loader-wrapper">
                    <LoaderCanvas />
                </div>

                <div className="loading-title">COSMIC DELIVERY</div>

                <div className="loading-bar-wrapper">
                    <div className="loading-bar-container">
                        <div className="loading-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="loading-percentage">{Math.floor(progress)}%</div>
                </div>

                <div className="status-log">{statusLog}</div>
            </div>
        </div>
    );
};

export default LoadingScreen;
