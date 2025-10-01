package config

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

type ServerConfig struct {
	Address             string `yaml:"address"`
	ReadTimeoutSeconds  int    `yaml:"read_timeout_seconds"`
	WriteTimeoutSeconds int    `yaml:"write_timeout_seconds"`
}

type DatabaseConfig struct {
	Host               string `yaml:"host"`
	Port               int    `yaml:"port"`
	User               string `yaml:"user"`
	Password           string `yaml:"password"`
	Name               string `yaml:"name"`
	SSLMode            string `yaml:"sslmode"`
	MaxOpenConns       int    `yaml:"max_open_conns"`
	MaxIdleConns       int    `yaml:"max_idle_conns"`
	ConnMaxLifetimeSec int    `yaml:"conn_max_lifetime_seconds"`
}

type AuthConfig struct {
	JWTSecret          string `yaml:"jwt_secret"`
	AccessTokenTTLMins int    `yaml:"access_token_ttl_minutes"`
}

type LogConfig struct {
	Level  string `yaml:"level"`
	Format string `yaml:"format"`
}

type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
	Auth     AuthConfig     `yaml:"auth"`
	Log      LogConfig      `yaml:"log"`
}

// Load loads configuration from YAML file with environment variable overrides.
// For env overrides, we support keys like LUMORA_SERVER_ADDRESS, LUMORA_DATABASE_HOST, etc.
func Load(path string) (*Config, error) {
	var cfg Config
	// defaults
	cfg.Server.Address = ":8080"
	cfg.Server.ReadTimeoutSeconds = 15
	cfg.Server.WriteTimeoutSeconds = 15
	cfg.Database.SSLMode = "disable"
	cfg.Database.MaxOpenConns = 10
	cfg.Database.MaxIdleConns = 5
	cfg.Database.ConnMaxLifetimeSec = 300
	cfg.Auth.AccessTokenTTLMins = 60
	cfg.Log.Level = "info"
	cfg.Log.Format = "text"

	// Try YAML if provided and exists
	if path != "" {
		if content, err := os.ReadFile(path); err == nil {
			_ = yaml.Unmarshal(content, &cfg)
		}
	}

	applyEnvOverrides(&cfg)
	if err := validate(&cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

func validate(cfg *Config) error {
	if cfg.Server.Address == "" {
		return errors.New("server.address is required")
	}
	if cfg.Database.Host == "" || cfg.Database.Port == 0 || cfg.Database.User == "" || cfg.Database.Name == "" {
		return errors.New("database host/port/user/name are required")
	}
	if strings.TrimSpace(cfg.Auth.JWTSecret) == "" {
		return errors.New("auth.jwt_secret is required")
	}
	return nil
}

func (c DatabaseConfig) ConnString() string {
	// If DATABASE_URL provided, prefer it
	if v, ok := os.LookupEnv("DATABASE_URL"); ok && strings.TrimSpace(v) != "" {
		return v
	}
	// DSN for pgx
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.Name, c.SSLMode,
	)
}

func (c ServerConfig) ReadTimeout() time.Duration {
	return time.Duration(c.ReadTimeoutSeconds) * time.Second
}
func (c ServerConfig) WriteTimeout() time.Duration {
	return time.Duration(c.WriteTimeoutSeconds) * time.Second
}

func applyEnvOverrides(cfg *Config) {
	// Map of env var -> setter
	set := func(env string, apply func(string)) {
		if v, ok := os.LookupEnv(env); ok {
			apply(v)
		}
	}

	set("LUMORA_SERVER_ADDRESS", func(v string) { cfg.Server.Address = v })
	set("LUMORA_SERVER_READ_TIMEOUT_SECONDS", func(v string) { cfg.Server.ReadTimeoutSeconds = atoiSafe(v, cfg.Server.ReadTimeoutSeconds) })
	set("LUMORA_SERVER_WRITE_TIMEOUT_SECONDS", func(v string) { cfg.Server.WriteTimeoutSeconds = atoiSafe(v, cfg.Server.WriteTimeoutSeconds) })

	set("LUMORA_DATABASE_HOST", func(v string) { cfg.Database.Host = v })
	set("LUMORA_DATABASE_PORT", func(v string) { cfg.Database.Port = atoiSafe(v, cfg.Database.Port) })
	set("LUMORA_DATABASE_USER", func(v string) { cfg.Database.User = v })
	set("LUMORA_DATABASE_PASSWORD", func(v string) { cfg.Database.Password = v })
	set("LUMORA_DATABASE_NAME", func(v string) { cfg.Database.Name = v })
	set("LUMORA_DATABASE_SSLMODE", func(v string) { cfg.Database.SSLMode = v })
	set("LUMORA_DATABASE_MAX_OPEN_CONNS", func(v string) { cfg.Database.MaxOpenConns = atoiSafe(v, cfg.Database.MaxOpenConns) })
	set("LUMORA_DATABASE_MAX_IDLE_CONNS", func(v string) { cfg.Database.MaxIdleConns = atoiSafe(v, cfg.Database.MaxIdleConns) })
	set("LUMORA_DATABASE_CONN_MAX_LIFETIME_SECONDS", func(v string) { cfg.Database.ConnMaxLifetimeSec = atoiSafe(v, cfg.Database.ConnMaxLifetimeSec) })

	// Common aliases from typical .envs
	set("DB_HOST", func(v string) { cfg.Database.Host = v })
	set("DB_PORT", func(v string) { cfg.Database.Port = atoiSafe(v, cfg.Database.Port) })
	set("DB_USER", func(v string) { cfg.Database.User = v })
	set("DB_PASSWORD", func(v string) { cfg.Database.Password = v })
	set("DB_NAME", func(v string) { cfg.Database.Name = v })
	set("DB_SSLMODE", func(v string) { cfg.Database.SSLMode = v })

	set("POSTGRES_HOST", func(v string) { cfg.Database.Host = v })
	set("POSTGRES_PORT", func(v string) { cfg.Database.Port = atoiSafe(v, cfg.Database.Port) })
	set("POSTGRES_USER", func(v string) { cfg.Database.User = v })
	set("POSTGRES_PASSWORD", func(v string) { cfg.Database.Password = v })
	set("POSTGRES_DB", func(v string) { cfg.Database.Name = v })

	set("PGHOST", func(v string) { cfg.Database.Host = v })
	set("PGPORT", func(v string) { cfg.Database.Port = atoiSafe(v, cfg.Database.Port) })
	set("PGUSER", func(v string) { cfg.Database.User = v })
	set("PGPASSWORD", func(v string) { cfg.Database.Password = v })
	set("PGDATABASE", func(v string) { cfg.Database.Name = v })

	set("LUMORA_AUTH_JWT_SECRET", func(v string) { cfg.Auth.JWTSecret = v })
	set("LUMORA_AUTH_ACCESS_TOKEN_TTL_MINUTES", func(v string) { cfg.Auth.AccessTokenTTLMins = atoiSafe(v, cfg.Auth.AccessTokenTTLMins) })

	set("LUMORA_LOG_LEVEL", func(v string) { cfg.Log.Level = v })
	set("LUMORA_LOG_FORMAT", func(v string) { cfg.Log.Format = v })
}

func atoiSafe(s string, fallback int) int {
	var n int
	_, err := fmt.Sscanf(s, "%d", &n)
	if err != nil {
		return fallback
	}
	return n
}
