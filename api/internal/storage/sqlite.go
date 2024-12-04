package storage

import (
	"database/sql"
	"embed"

	"github.com/ReidMason/habit-tracker/internal/logger"
	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/database/sqlite3"
	_ "github.com/mattn/go-sqlite3"
	"github.com/pressly/goose/v3"
)

//go:embed database/migrations/*.sql
var embedMigrations embed.FS

type Sqlite struct {
	db      *sql.DB
	Queries *sqlite3Storage.Queries
	log     logger.Logger
}

func NewSqliteStorage(databasePath string, logger logger.Logger) (*Sqlite, error) {
	db, err := sql.Open("sqlite3", databasePath+"?_foreign_keys=on")
	if err != nil {
		return nil, err
	}

	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("sqlite3"); err != nil {
		return nil, err
	}

	return &Sqlite{
		db:      db,
		Queries: sqlite3Storage.New(db),
		log:     logger,
	}, nil
}

func (s Sqlite) Reset() error {
	s.log.Warn("Resetting database")
	return goose.Down(s.db, "migrations")
}

func (s Sqlite) ApplyMigrations() error {
	s.log.Info("Applying migrations")
	return goose.Up(s.db, "database/migrations")
}
