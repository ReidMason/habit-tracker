-- name: CreateHabitEntry :one
-- Create a new habit entry
INSERT INTO habit_entries (habit_id, date) VALUES (?, ?) RETURNING *;

-- name: GetHabitEntries :many
-- Retrieve all habit entries for a habit
SELECT * FROM habit_entries WHERE habit_id = ?;

-- name: DeleteHabitEntry :one
-- Delete a habit entry
DELETE FROM habit_entries WHERE id = ? RETURNING *;
