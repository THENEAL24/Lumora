-- name: CreateTask :one
INSERT INTO tasks (user_id, title, description, category, priority, due_date)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, user_id, title, description, category, priority, is_completed, due_date, created_at, updated_at;

-- name: GetTaskByID :one
SELECT id, user_id, title, description, category, priority, is_completed, due_date, created_at, updated_at
FROM tasks
WHERE id = $1;

-- name: ListTasksByUser :many
SELECT id, user_id, title, description, category, priority, is_completed, due_date, created_at, updated_at
FROM tasks
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: UpdateTaskStatus :one
UPDATE tasks
SET is_completed = $2, updated_at = NOW()
WHERE id = $1
RETURNING id, user_id, title, description, category, priority, is_completed, due_date, created_at, updated_at;

-- name: DeleteTask :exec
DELETE FROM tasks
WHERE id = $1;

