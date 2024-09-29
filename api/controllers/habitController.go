package controllers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/storage"
)

func AddHabitRoutes(mux *http.ServeMux, db *storage.Sqlite, logger logger.Logger) {
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

		detailedHabits := make([]storage.DetailedHabit, len(habits))
		for i, habit := range habits {
			entries, err := db.GetHabitEntries(habit.Id)
			if err != nil {
				logger.Error("Failed to get habit entries", slog.Any("error", err))
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			basicEntries := make([]storage.BasicHabitEntry, len(entries))
			for j, entry := range entries {
				basicEntries[j] = storage.BasicHabitEntry{
					Date: entry.Date,
					Id:   entry.Id,
				}
			}

			detailedHabits[i] = storage.DetailedHabit{
				Id:      habit.Id,
				Name:    habit.Name,
				Entries: basicEntries,
				Colour:  habit.Colour,
			}
		}

		logger.Debug("Got habits", slog.Any("habits", habits))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(detailedHabits)
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

		createdHabit, err := db.CreateHabit(userId, habit.Name, habit.Colour)
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

	mux.HandleFunc("DELETE /api/habit/{habitId}", func(w http.ResponseWriter, r *http.Request) {
		habitId, err := strconv.ParseInt(r.PathValue("habitId"), 10, 64)
		if err != nil {
			logger.Error("Failed to parse habitId", slog.Any("error", err))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		habit, err := db.DeleteHabit(habitId)
		if err != nil {
			logger.Error("Failed to delete habit", slog.Any("error", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		logger.Info("Deleted habit", slog.Int64("habitId", habitId))
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(habit)
	})

	// mux.HandleFunc("GET /api/habit/{habitId}", func(w http.ResponseWriter, r *http.Request) {
	// 	habitId, err := strconv.ParseInt(r.PathValue("habitId"), 10, 64)
	// 	if err != nil {
	// 		logger.Error("Failed to parse habitId", slog.Any("error", err))
	// 		w.WriteHeader(http.StatusBadRequest)
	// 		return
	// 	}
	//
	// 	habit, err := db.GetHabit(habitId)
	// 	if err != nil {
	// 		logger.Error("Failed to get habit", slog.Any("error", err))
	// 		w.WriteHeader(http.StatusInternalServerError)
	// 		return
	// 	}
	//
	// 	logger.Debug("Got habit", slog.Any("habit", habit))
	// 	w.Header().Set("Content-Type", "application/json")
	// 	w.WriteHeader(http.StatusOK)
	// 	json.NewEncoder(w).Encode(habit)
	// })
}
