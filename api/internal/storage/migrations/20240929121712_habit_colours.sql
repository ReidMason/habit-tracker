-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
ALTER TABLE habits ADD COLUMN colour VARCHAR(255) NOT NULL DEFAULT '#0284c7';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
ALTER TABLE habits DROP COLUMN colour;
-- +goose StatementEnd
