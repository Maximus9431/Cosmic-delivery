import React, { useEffect, useState } from 'react';
import './App.css';
import Game from './components/Game';
import LoadingScreen from './components/LoadingScreen';
import useTelegram from './hooks/useTelegram';

function App() {
    const { user, initData } = useTelegram();
    const [loading, setLoading] = useState(true);
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    if (loading) {
        return <LoadingScreen onFinished={() => setLoading(false)} />;
    }

    /* Primary entry point for both Telegram and Browser sessions */
    const currentUser = user || { id: 1, username: 'BrowserCommander', first_name: 'Commander' };
    const currentInitData = initData || "query_id=mock&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Commander%22%2C%22username%22%3A%22BrowserCommander%22%7D&auth_date=1&hash=mock";

    return (
        <div className="App">
            <Game user={currentUser} initData={currentInitData} />
        </div>
    );
}

export default App;
