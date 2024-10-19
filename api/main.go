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
	"github.com/rs/cors"
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

	mux.Handle("/", http.FileServer(http.Dir("./static")))

	habitController := controllers.NewHabitController(db, logger)
	mux.HandleFunc("GET /api/user/{userId}/habit", habitController.GetHabits)
	mux.HandleFunc("POST /api/user/{userId}/habit", habitController.CreateHabit)
	mux.HandleFunc("PUT /api/user/{userId}/habit", habitController.EditHabits)
	mux.HandleFunc("DELETE /api/habit/{habitId}", habitController.DeleteHabit)
	mux.HandleFunc("PUT /api/habit/{habitId}", habitController.EditHabit)

	habitEntryController := controllers.NewHabitEntryController(db, logger)
	mux.HandleFunc("POST /api/habitEntry", habitEntryController.CreateHabitEntry)
	mux.HandleFunc("DELETE /api/habitEntry/{entryId}", habitEntryController.DeleteHabitEntry)

	controllers.AddUserRoutes(mux, db, logger)

	app := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:4321"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	}).Handler(mux)
	if err := http.ListenAndServe(args.listenAddr, app); err != nil {
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
