-- name: CreateFocusSession :one
INSERT INTO focus_sessions (user_id, task_id, started_at, ended_at, duration_minutes, completed)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, user_id, task_id, started_at, ended_at, duration_minutes, completed, created_at;

-- name: ListSessionsByUser :many
SELECT id, user_id, task_id, started_at, ended_at, duration_minutes, completed, created_at
FROM focus_sessions
WHERE user_id = $1
ORDER BY started_at DESC
LIMIT $2 OFFSET $3;

