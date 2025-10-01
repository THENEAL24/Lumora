package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	appcfg "lumora/internal/config"
)

func main() {
	// Load .env if present
	_ = godotenv.Load()

	cfg, err := appcfg.Load(os.Getenv("CONFIG_PATH"))
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	dbpool, err := pgxpool.New(context.Background(), cfg.Database.ConnString())
	if err != nil {
		log.Fatalf("db pool error: %v", err)
	}
	dbpool.Config().MaxConns = int32(cfg.Database.MaxOpenConns)
	dbpool.Config().MinConns = int32(cfg.Database.MaxIdleConns)
	dbpool.Config().MaxConnLifetime = time.Duration(cfg.Database.ConnMaxLifetimeSec) * time.Second
	defer dbpool.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	server := &http.Server{
		Addr:         cfg.Server.Address,
		Handler:      mux,
		ReadTimeout:  cfg.Server.ReadTimeout(),
		WriteTimeout: cfg.Server.WriteTimeout(),
	}

	log.Printf("starting server on %s", cfg.Server.Address)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}

func envOr(key, def string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return def
}
