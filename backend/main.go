package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/ReidMason/habit-tracker/internal/storage"
	"github.com/charmbracelet/log"
)

type cmdArgs struct {
	listenAddr string
}

const dbLocation = "data/data.db"

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
	mux.HandleFunc("GET /api/user", func(w http.ResponseWriter, r *http.Request) {
		users, err := db.GetUsers()
		if err != nil {
			logger.Error("Failed to get users", slog.Any("error", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		logger.Debug("Got users", slog.Any("users", users))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(users)
	})

	mux.HandleFunc("POST /api/user", func(w http.ResponseWriter, r *http.Request) {
		var user storage.User
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			logger.Error("Failed to decode user", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		createdUser, err := db.CreateUser(user.Name)
		if err != nil {
			logger.Error("Failed to create user", slog.Any("error", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		logger.Info("Created user", slog.Any("user", createdUser))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(createdUser)
	})

	mux.HandleFunc("GET /api/user/{userId}/habit", func(w http.ResponseWriter, r *http.Request) {
		userId, err := strconv.ParseInt(r.PathValue("userId"), 10, 64)
		if err != nil {
			logger.Error("Failed to parse userId", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		habits, err := db.GetHabits(userId)
		if err != nil {
			logger.Error("Failed to get habits", slog.Any("error", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		logger.Debug("Got habits", slog.Any("habits", habits))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(habits)
	})

	mux.HandleFunc("POST /api/user/{userId}/habit", func(w http.ResponseWriter, r *http.Request) {
		userId, err := strconv.ParseInt(r.PathValue("userId"), 10, 64)
		if err != nil {
			logger.Error("Failed to parse userId", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		var habit storage.Habit
		err = json.NewDecoder(r.Body).Decode(&habit)
		if err != nil {
			logger.Error("Failed to decode habit", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		createdHabit, err := db.CreateHabit(userId, habit.Name)
		if err != nil {
			logger.Error("Failed to create habit", slog.Any("error", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		logger.Info("Created habit", slog.Any("habit", createdHabit))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(createdHabit)
	})

	mux.HandleFunc("GET /api/habit/{habitId}", func(w http.ResponseWriter, r *http.Request) {
		habitId, err := strconv.ParseInt(r.PathValue("habitId"), 10, 64)
		if err != nil {
			logger.Error("Failed to parse habitId", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		habit, err := db.GetHabit(habitId)
		if err != nil {
			logger.Error("Failed to get habit", slog.Any("error", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		logger.Debug("Got habit", slog.Any("habit", habit))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(habit)
	})

	mux.HandleFunc("POST /api/habitEntry", func(w http.ResponseWriter, r *http.Request) {
		var habitEntry storage.HabitEntry
		err = json.NewDecoder(r.Body).Decode(&habitEntry)
		if err != nil {
			logger.Error("Failed to decode habit entry", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, "Failed to decode habit entry: %v", err)
			return
		}
		if habitEntry.Date.IsZero() {
			logger.Error("Date is required", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, "Date is required")
			return
		}
		if habitEntry.Date.After(time.Now()) {
			logger.Error("Date cannot be in the future", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, "Date cannot be in the future")
			return
		}
		if habitEntry.HabitId == 0 {
			logger.Error("HabitId is required", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, "HabitId is required")
			return
		}

		habitEntry, err = db.CreateHabitEntry(habitEntry.HabitId, habitEntry.Date)
		if err != nil {
			logger.Error("Failed to check habit", slog.Any("error", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		logger.Info("Checked habit", slog.Int64("habitId", habitEntry.HabitId))
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(habitEntry)
	})

	mux.HandleFunc("DELETE /api/habitEntry/{entryId}", func(w http.ResponseWriter, r *http.Request) {
		entryId, err := strconv.ParseInt(r.PathValue("entryId"), 10, 64)
		if err != nil {
			logger.Error("Failed to parse entryId", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		habitEntry, err := db.DeleteHabitEntry(entryId)
		if err != nil {
			logger.Error("Failed to uncheck habit", slog.Any("error", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		logger.Info("Checked habit", slog.Int64("habitEntry", entryId))
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(habitEntry)
	})

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
