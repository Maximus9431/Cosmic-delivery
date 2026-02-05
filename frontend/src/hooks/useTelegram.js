import { useEffect, useState } from 'react';

const useTelegram = () => {
    const [user, setUser] = useState(null);
    const [initData, setInitData] = useState(null);
    const [tg, setTg] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;
            
            // Инициализация
            webApp.ready();
            
            // Получаем данные пользователя
            const userData = webApp.initDataUnsafe?.user;
            const authData = webApp.initData;
            
            setUser(userData);
            setInitData(authData);
            setTg(webApp);
            setIsReady(true);

            // Расширяем на полный экран
            webApp.expand();
            
            // Убираем кнопку "back"
            webApp.BackButton.hide();
            
            // Устанавливаем цвет фона
            webApp.setHeaderColor('#000000');
            webApp.setBackgroundColor('#1a1a2e');
            
            // Обработка закрытия
            return () => {
                webApp.onEvent('viewportChanged', () => {
                    // Реагируем на изменение размера
                });
            };
        }
    }, []);

    const sendData = (data) => {
        if (tg) {
            tg.sendData(JSON.stringify(data));
        }
    };

    const closeApp = () => {
        if (tg) {
            tg.close();
        }
    };

    const showPopup = (params) => {
        if (tg) {
            tg.showPopup(params);
        }
    };

    return { 
        user, 
        initData, 
        tg, 
        isReady,
        sendData,
        closeApp,
        showPopup
    };
};

export default useTelegram;
