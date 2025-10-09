<div align="center">

# ⏰ LUMORA Timer

<img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
<img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS"/>
<img src="https://img.shields.io/badge/Go-1.21-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go"/>

**Современный и элегантный таймер Pomodoro с минималистичным дизайном**

---

## ✨ Возможности

- 🎯 **Техника Pomodoro** — чередование рабочих сессий и перерывов
- ⚙️ **Гибкая настройка времени** — установите любой интервал (часы, минуты, секунды)
- 🎨 **Современный UI** — красивый градиентный дизайн с glassmorphism эффектами
- 🌓 **Темная тема** — поддержка светлой и темной темы
- ⚡ **Быстрые пресеты** — 1 час, 30, 15 и 5 минут одним кликом
- 🔄 **Синхронизация в реальном времени** — состояние таймера обновляется автоматически
- 📱 **Адаптивный дизайн** — отлично работает на всех устройствах
- 🚀 **Backend на Go** — быстрый и надежный REST API

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** >= 16.x
- **npm** или **yarn**
- **Go** >= 1.24.5 (для backend)

### Установка

#### 1. Клонируйте репозиторий

```bash
git clone https://github.com/THENEAL24/lumora-timer.git
cd lumora-timer
```

#### 2. Установите зависимости Frontend

```bash
cd frontend
npm install
# или
yarn install
```

#### 3. Установите зависимости Backend

```bash
cd backend
go mod download
```

### 🏃 Запуск

#### Запуск Backend (порт 8080)

```bash
cd backend
go run main.go
```

#### Запуск Frontend (порт 3000)

```bash
cd frontend
npm run dev
# или
yarn dev
```

Откройте браузер и перейдите по адресу: **http://localhost:3000**

## 🎮 Использование

### Основные функции

#### ▶️ Запуск таймера
Нажмите кнопку **Старт**, чтобы начать отсчет времени.

#### ⏸️ Пауза
Нажмите **Пауза**, чтобы приостановить таймер.

#### 🔄 Сброс
Нажмите **Сброс**, чтобы вернуть таймер к начальному значению.

#### 🔀 Переключение режима
Переключайтесь между режимами **Работа** 🔥 и **Перерыв** ☕.

#### ⚙️ Настройка времени
1. Нажмите на иконку настроек (шестеренка) в правом верхнем углу
2. Выберите время с помощью кнопок +/- или введите вручную
3. Используйте быстрые пресеты: **1ч**, **30м**, **15м**, **5м**
4. Нажмите **Применить**

## 🔌 API Reference

### Base URL
```
http://localhost:8080/api
```

### Endpoints

#### Получить состояние таймера
```http
GET /timer/state
```

**Response:**
```json
{
  "seconds": 1500,
  "running": false,
  "work": true
}
```

#### Запустить таймер
```http
POST /timer/start
```

#### Остановить таймер
```http
POST /timer/pause
```

#### Сбросить таймер
```http
POST /timer/reset
```

#### Переключить режим
```http
POST /timer/switch
```

## 🎨 Технологии

### Frontend
- **React 18** — UI библиотека
- **Tailwind CSS** — утилитарный CSS фреймворк
- **Vite** — быстрый сборщик
- **Axios** — HTTP клиент

### Backend
- **Go (Golang)** — язык программирования
- **net/http** — стандартная библиотека для HTTP
- **CORS** — поддержка кросс-доменных запросов

## 🛠️ Конфигурация

### Изменение портов

#### Frontend (vite.config.js)
```javascript
export default {
  server: {
    port: 5173  // Измените порт здесь
  }
}
```

#### Backend (main.go)
```go
http.ListenAndServe(":8080", nil)  // Измените порт здесь
```

### Настройка таймера по умолчанию

В `App.jsx`:
```javascript
const [time, setTime] = useState(1500);  // 1500 секунд = 25 минут
const [isWorkTime, setIsWorkTime] = useState(true);  // Режим работы
```

## 👤 Автор

**THENEAL24**

- GitHub: [@THENEAL24](https://github.com/THENEAL24)

## 🌟 Поддержите проект

Если вам понравился этот проект, поставьте ⭐ на GitHub!

---

<div align="center">

Сделано с ❤️ и ⏰

[⬆ Наверх](#-lumora-timer)

</div>
