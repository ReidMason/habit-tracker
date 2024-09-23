-- name: GetUsers :many
-- Retrieve all habits
SELECT * FROM users;

-- name: CreateUser :one
-- Create a new user
INSERT INTO users (name) VALUES (?) RETURNING *;

-- name: GetUserByID :one
-- Retrieve a user by ID
SELECT * FROM users WHERE id = ?;
