-- name: CreateArtifactPart :one
INSERT INTO artifact_parts (artifact_id, session_id, part_index, part_type, rarity, metadata)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, artifact_id, session_id, part_index, part_type, rarity, metadata, created_at;

-- name: ListArtifactParts :many
SELECT id, artifact_id, session_id, part_index, part_type, rarity, metadata, created_at
FROM artifact_parts
WHERE artifact_id = $1
ORDER BY part_index ASC;

