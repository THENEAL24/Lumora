-- name: CreateArtifact :one
INSERT INTO artifacts (user_id, name, total_parts, completed_parts, metadata)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, user_id, name, total_parts, completed_parts, metadata, created_at;

-- name: GetArtifact :one
SELECT id, user_id, name, total_parts, completed_parts, metadata, created_at
FROM artifacts
WHERE id = $1;

-- name: ListArtifactsByUser :many
SELECT id, user_id, name, total_parts, completed_parts, metadata, created_at
FROM artifacts
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: UpdateArtifactProgress :one
UPDATE artifacts
SET completed_parts = $2
WHERE id = $1
RETURNING id, user_id, name, total_parts, completed_parts, metadata, created_at;

