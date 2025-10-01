-- +goose Up

-- +goose StatementBegin
CREATE TABLE artifact_parts (
    id SERIAL PRIMARY KEY,
    artifact_id INT NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    session_id INT REFERENCES focus_sessions(id) ON DELETE SET NULL,
    part_index SMALLINT NOT NULL,
    part_type TEXT,
    rarity TEXT,
    metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT artifact_unique_part UNIQUE (artifact_id, part_index)
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_artifact_parts_artifact ON artifact_parts(artifact_id);
-- +goose StatementEnd

-- +goose Down

-- +goose StatementBegin
DROP TABLE IF EXISTS artifact_parts;
-- +goose StatementEnd

