package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

var (
	timerSeconds   int
	isTimerRunning bool
	isWorkTime     bool
	// Дефолтное время для каждого режима
	defaultWorkTime  int // дефолтное время работы
	defaultBreakTime int // дефолтное время перерыва
)

func switchMode() {
	if isWorkTime {
		isWorkTime = false
	} else {
		isWorkTime = true
	}
}

func selectTime(newTime int) {
	timerSeconds = newTime
}

func startTimer() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		if !isTimerRunning {
			return
		} else if timerSeconds > 0 {
			timerSeconds--
		} else {
			isTimerRunning = false
			switchMode()
			return
		}
	}
}

func getTimerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	type timerResponse struct {
		Seconds int    `json:"seconds"`
		Running bool   `json:"running"`
		Work    bool   `json:"work"`
		Display string `json:"display"`
	}

	minutes := timerSeconds / 60
	seconds := timerSeconds % 60
	display := fmt.Sprintf("%02d:%02d", minutes, seconds)

	response := timerResponse{
		Seconds: timerSeconds,
		Running: isTimerRunning,
		Work:    isWorkTime,
		Display: display,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func timerStartHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if !isTimerRunning {
		isTimerRunning = true
		go startTimer()
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Timer started"))
}

func timerPauseHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if isTimerRunning {
		isTimerRunning = false
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Timer paused"))
}

func timerResetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if isWorkTime {
		timerSeconds = defaultWorkTime
	} else {
		timerSeconds = defaultBreakTime
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Timer reset successfully"))
}

func timerSwitchModeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	isWorkTime = !isWorkTime

	if isWorkTime {
		timerSeconds = defaultWorkTime
	} else {
		timerSeconds = defaultBreakTime
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Timer mode switched successfully"))
}

func timeSetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	type timeSetRequest struct {
		Seconds int `json:"seconds"`
	}

	var request timeSetRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if request.Seconds < 0 {
		http.Error(w, "Time cannot be negative", http.StatusBadRequest)
		return
	}

	// Останавливаем таймер, если он запущен
	if isTimerRunning {
		isTimerRunning = false
	}

	// Устанавливаем новое время
	timerSeconds = request.Seconds

	// Сохраняем новое время как дефолтное для текущего режима
	if isWorkTime {
		defaultWorkTime = request.Seconds
	} else {
		defaultBreakTime = request.Seconds
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Timer time set successfully"))
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func main() {
	isWorkTime = true
	defaultWorkTime = 25 * 60   // 25 минут для работы
	defaultBreakTime = 5 * 60   // 5 минут для перерыва
	timerSeconds = defaultWorkTime

	http.HandleFunc("/api/timer", enableCORS(getTimerHandler))
	http.HandleFunc("/api/timer/start", enableCORS(timerStartHandler))
	http.HandleFunc("/api/timer/pause", enableCORS(timerPauseHandler))
	http.HandleFunc("/api/timer/reset", enableCORS(timerResetHandler))
	http.HandleFunc("/api/timer/switch-mode", enableCORS(timerSwitchModeHandler))
	http.HandleFunc("/api/timer/set-time", enableCORS(timeSetHandler))

	fmt.Println("Server starts on 8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error with starting server:", err)
	}
}
