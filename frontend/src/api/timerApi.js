const API_BASE = 'http://localhost:8080/api';

export const timerAPI = {
    
    getTimerState: async () => {
        const response = await fetch(`${API_BASE}/timer`);
        const data = await response.json();
        return data;
    },

    startTimer: async () => {
        const response = await fetch(`${API_BASE}/timer/start`, {
            method: 'POST'
        });
        return await response.text();
    },

    pauseTimer: async () => {
        const response = await fetch(`${API_BASE}/timer/pause`, {
            method: 'POST'
        });
        return await response.text();
    },

    resetTimer: async () => {
        const response = await fetch(`${API_BASE}/timer/reset`, {
            method: 'POST'
        });
        return await response.text();
    },

    switchModeTimer: async () => {
        const response = await fetch(`${API_BASE}/timer/switch-mode`, {
            method: 'POST'
        });
        return await response.text();
    },

    setCustomTime: async (seconds) => {
        const response = await fetch(`${API_BASE}/timer/set-time`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ seconds })
        });
        return await response.text();
    }
}