-- name: CreateUser :one
INSERT INTO users (email, password)
VALUES ($1, $2)
RETURNING id, email, password, created_at;

-- name: GetUserByID :one
SELECT id, email, password, created_at
FROM users
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT id, email, password, created_at
FROM users
WHERE email = $1;

-- name: ListUsers :many
SELECT id, email, password, created_at
FROM users
ORDER BY id
LIMIT $1 OFFSET $2;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

