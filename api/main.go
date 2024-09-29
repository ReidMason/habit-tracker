package main

import (
	"flag"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"

	"github.com/ReidMason/habit-tracker/controllers"
	"github.com/ReidMason/habit-tracker/internal/storage"
	"github.com/charmbracelet/log"
)

type cmdArgs struct {
	listenAddr string
}

const dbLocation = "./data/data.db"

func run(w io.Writer, args cmdArgs) error {
	handler := log.New(w)
	handler.SetLevel(log.DebugLevel)
	logger := slog.New(handler)
	slog.SetLogLoggerLevel(slog.LevelDebug)
	slog.SetDefault(logger)

	logger.Debug("Starting up", slog.String("listenAddr", args.listenAddr))

	logger.Info("Initialising storage")
	db, err := storage.NewSqliteStorage(dbLocation, logger)
	if err != nil {
		logger.Error("Failed to initialise storage", slog.Any("error", err))
		return err
	}

	// db.Reset()

	err = db.ApplyMigrations()
	if err != nil {
		logger.Error("Failed to apply migrations", slog.Any("error", err))
		return err
	}

	mux := http.NewServeMux()

	controllers.AddUserRoutes(mux, db, logger)
	controllers.AddHabitRoutes(mux, db, logger)
	controllers.AddHabitEntryRoutes(mux, db, logger)

	if err := http.ListenAndServe(args.listenAddr, mux); err != nil {
		fmt.Println(err)
	}

	return nil
}

func main() {
	args := cmdArgs{listenAddr: *flag.String("listen-addr", ":8000", "server listen address")}
	flag.Parse()

	if err := run(os.Stdout, args); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
