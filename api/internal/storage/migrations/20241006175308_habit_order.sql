-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
ALTER TABLE habits ADD COLUMN 'index' INTEGER NOT NULL DEFAULT 1;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
ALTER TABLE habits DROP COLUMN 'index';
-- +goose StatementEnd
