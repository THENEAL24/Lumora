-- +goose Up

-- +goose StatementBegin
CREATE TABLE artifacts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    total_parts SMALLINT NOT NULL,
    completed_parts SMALLINT NOT NULL DEFAULT 0,
    metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_artifacts_user ON artifacts(user_id);
-- +goose StatementEnd

-- +goose Down

-- +goose StatementBegin
DROP TABLE IF EXISTS artifacts;
-- +goose StatementEnd

