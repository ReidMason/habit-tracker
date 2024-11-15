-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
ALTER TABLE habits ADD COLUMN active BOOLEAN NOT NULL DEFAULT 1;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
ALTER TABLE habits DROP COLUMN active;
-- +goose StatementEnd
