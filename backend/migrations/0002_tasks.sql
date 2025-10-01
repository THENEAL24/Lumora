-- +goose Up

-- +goose StatementBegin
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority SMALLINT NOT NULL DEFAULT 1,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_tasks_user_created_at ON tasks(user_id, created_at DESC);
-- +goose StatementEnd

-- +goose Down

-- +goose StatementBegin
DROP TABLE IF EXISTS tasks;
-- +goose StatementEnd

