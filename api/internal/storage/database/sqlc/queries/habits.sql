-- name: GetHabits :many
-- Retrieve all habits for a user
SELECT * FROM habits WHERE user_id = ?;

-- name: CreateHabit :one
-- Create a new habit
INSERT INTO habits (user_id, name, description, colour, `index`) VALUES (?, ?, ?, ?, ?) RETURNING *;

-- name: GetHabit :one
-- Retrieve a habit by ID
SELECT * FROM habits WHERE id = ?;

-- name: DeleteHabit :one
-- Delete a habit by ID
DELETE FROM habits WHERE id = ? RETURNING *;

-- name: UpdateHabit :one
-- Update a habit by ID
UPDATE habits SET name = ?, description = ?, colour = ?, `index` = ?, active = ?, updated_at = ? WHERE id = ? RETURNING *;
