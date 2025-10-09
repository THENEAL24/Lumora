import React, { useState, useEffect } from 'react';
import { timerAPI } from './api/timerApi';

function App() {
  const [time, setTime] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Состояния для модального окна выбора времени
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const formatTimeDisplay = (value) => {
    return String(value).padStart(2, '0');
  }

  const fetchTimerState = async () => {
    try {
      console.log('Request timer state');
      const state = await timerAPI.getTimerState();

      setTime(state.seconds);
      setIsRunning(state.running);
      setIsWorkTime(state.work);

      console.log('Data received:', state);
    } catch (error) {
      console.error('Error while loading state:', error);
      alert('Failed to connect to the server. Check that the backend is running on port 8080.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimerState();
  }, []);

  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(fetchTimerState, 1000);
      console.log('Timer started');
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        console.log('Stop polling the timer');
      }
    }
  }, [isRunning]);

  const handleStart = async () => {
    try {
      await timerAPI.startTimer();
      setIsRunning(true);
      console.log('Timer started');
    } catch (error) {
      console.error('Error while start:', error);
    }
  };

  const handlePause = async () => {
    try {
      await timerAPI.pauseTimer();
      setIsRunning(false);
      console.log('Timer paused');
    } catch (error) {
      console.error('Error while pause:', error);
    }
  };

  const handleReset = async () => {
    try {
      await timerAPI.resetTimer();
      await timerAPI.pauseTimer();
      fetchTimerState();
      console.log('Timer reset');
    } catch (error) {
      console.error('Error while reset:', error);
    }
  };

  const handleSwitchMode = async () => {
    try {
      await timerAPI.switchModeTimer();
      const newState = await timerAPI.getTimerState();
      setTime(newState.seconds);
      setIsWorkTime(newState.work);
      console.log('Mode switched');
    } catch (error) {
      console.error('Error while switch mode:', error);
    }
  };

  // Функции для модального окна
  const adjustTime = (unit, delta) => {
    if (unit === 'hours') {
      const newValue = hours + delta;
      setHours(newValue < 0 ? 23 : newValue > 23 ? 0 : newValue);
    } else if (unit === 'minutes') {
      const newValue = minutes + delta;
      setMinutes(newValue < 0 ? 59 : newValue > 59 ? 0 : newValue);
    } else if (unit === 'seconds') {
      const newValue = seconds + delta;
      setSeconds(newValue < 0 ? 59 : newValue > 59 ? 0 : newValue);
    }
  };

  const setQuickTime = (h, m, s) => {
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    // Синхронизируем значения в модальном окне с текущим временем таймера
    const currentHours = Math.floor(time / 3600);
    const currentMinutes = Math.floor((time % 3600) / 60);
    const currentSeconds = time % 60;
    
    setHours(currentHours);
    setMinutes(currentMinutes);
    setSeconds(currentSeconds);
    
    setIsModalOpen(true);
  };

  const applyCustomTime = async () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (totalSeconds === 0) {
      alert('Пожалуйста, установите время таймера');
      return;
    }

    try {
      await timerAPI.setCustomTime(totalSeconds);
      
      // Обновляем локальное состояние
      setTime(totalSeconds);
      setIsRunning(false); // Таймер останавливается при установке нового времени
      
      console.log('Установлено время:', totalSeconds, 'секунд');
      closeModal();
    } catch (error) {
      console.error('Ошибка при установке времени:', error);
      alert('Ошибка при установке времени. Проверьте подключение к серверу.');
    }
  };

  const gradient = isWorkTime
    ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
    : 'bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500';

  return (
    <div className={`min-h-screen ${gradient} flex items-center justify-center p-4 transition-all duration-500`}>
      {/* Декоративные элементы фона */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Основная карточка */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-lg relative z-10 border border-white/20">
        
        {/* Кнопка настроек */}
        <button 
          onClick={openModal}
          className="absolute right-6 top-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 cursor-pointer hover:scale-110 transition-all shadow-lg hover:shadow-xl flex items-center justify-center group"
        >
          <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
          </svg>
        </button>
        
        {/* Заголовок */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            LUMORA
          </h1>
          <div className="flex justify-center items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-gray-400'}`}></div>
            <span className="text-gray-600 font-medium">
              {isRunning ? 'Запущен' : 'Остановлен'}
            </span>
          </div>
        </div>

        {/* Таймер */}
        <div className="text-center mb-10">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 mb-4 shadow-inner">
            <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-mono">
              {formatTime(time)}
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg">
            <div className={`w-2 h-2 rounded-full ${isWorkTime ? 'bg-white' : 'bg-white/50'}`}></div>
            <span className="font-semibold">
              {isWorkTime ? '🔥 Режим работы' : '☕ Перерыв'}
            </span>
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span className="text-sm">Старт</span>
          </button>
          <button
            onClick={handlePause}
            disabled={!isRunning}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
            <span className="text-sm">Пауза</span>
          </button>
          <button
            onClick={handleReset}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
            <span className="text-sm">Сброс</span>
          </button>
        </div>

        {/* Переключение режима */}
        <button
          onClick={handleSwitchMode}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
        >
          Переключить на {isWorkTime ? '☕ Перерыв' : '🔥 Работу'}
        </button>
        
        <div className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          Бэкенд: {isLoading ? 'Подключение...' : 'Подключен ✓'}
        </div>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
            >
              <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            
            <div className="mt-4">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Установить таймер</h2>
                <p className="text-gray-500 dark:text-gray-400">Выберите время для отсчета</p>
              </div>

              {/* Time Picker */}
              <div className="mb-8">
                {/* Display Selected Time */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-center gap-2 text-5xl font-bold text-gray-900 dark:text-white font-mono">
                    <span>{formatTimeDisplay(hours)}</span>
                    <span className="text-blue-500">:</span>
                    <span>{formatTimeDisplay(minutes)}</span>
                    <span className="text-blue-500">:</span>
                    <span>{formatTimeDisplay(seconds)}</span>
                  </div>
                </div>

                {/* Time Controls */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Hours */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block text-center">Часы</label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => adjustTime('hours', 1)}
                        className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={hours}
                        onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                        className="w-full px-4 py-3 text-center text-xl font-semibold bg-gray-100 dark:bg-gray-800 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => adjustTime('hours', -1)}
                        className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block text-center">Минуты</label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => adjustTime('minutes', 1)}
                        className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-full px-4 py-3 text-center text-xl font-semibold bg-gray-100 dark:bg-gray-800 dark:text-white border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => adjustTime('minutes', -1)}
                        className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Seconds */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block text-center">Секунды</label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => adjustTime('seconds', 1)}
                        className="w-full p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-full px-4 py-3 text-center text-xl font-semibold bg-gray-100 dark:bg-gray-800 dark:text-white border-2 border-transparent focus:border-pink-500 rounded-xl outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => adjustTime('seconds', -1)}
                        className="w-full p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Time Presets */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setQuickTime(1, 0, 0)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all hover:scale-105"
                  >
                    1ч
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTime(0, 30, 0)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all hover:scale-105"
                  >
                    30м
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTime(0, 15, 0)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all hover:scale-105"
                  >
                    15м
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTime(0, 5, 0)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all hover:scale-105"
                  >
                    5м
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={applyCustomTime}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/50"
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;