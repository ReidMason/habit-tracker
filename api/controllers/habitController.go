package controllers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/storage"
)

type HabitController struct {
	db     *storage.Sqlite
	logger logger.Logger
}

func NewHabitController(db *storage.Sqlite, logger logger.Logger) *HabitController {
	return &HabitController{
		db:     db,
		logger: logger,
	}
}

func (h *HabitController) GetHabits(w http.ResponseWriter, r *http.Request) {
	userId, err := strconv.ParseInt(r.PathValue("userId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse userId", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	habits, err := h.db.GetHabits(userId)
	if err != nil {
		h.logger.Error("Failed to get habits", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	detailedHabits := make([]storage.Habit, len(habits))
	for i, habit := range habits {
		entries, err := h.db.GetHabitEntries(habit.Id)
		if err != nil {
			h.logger.Error("Failed to get habit entries", slog.Any("error", err))
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

		detailedHabits[i] = storage.Habit{
			Id:      habit.Id,
			Name:    habit.Name,
			Entries: basicEntries,
			Colour:  habit.Colour,
		}
	}

	h.logger.Debug("Got habits", slog.Any("habits", habits))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(detailedHabits)
}

func (h *HabitController) CreateHabit(w http.ResponseWriter, r *http.Request) {
	userId, err := strconv.ParseInt(r.PathValue("userId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse userId", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var habit storage.Habit
	err = json.NewDecoder(r.Body).Decode(&habit)
	if err != nil {
		h.logger.Error("Failed to decode habit", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	createdHabit, err := h.db.CreateHabit(userId, habit.Name, habit.Colour)
	if err != nil {
		h.logger.Error("Failed to create habit", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Info("Created habit", slog.Any("habit", createdHabit))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdHabit)
}

func (h *HabitController) DeleteHabit(w http.ResponseWriter, r *http.Request) {
	habitId, err := strconv.ParseInt(r.PathValue("habitId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse habitId", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = h.db.DeleteHabit(habitId)
	if err != nil {
		h.logger.Error("Failed to delete habit", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Info("Deleted habit", slog.Int64("habitId", habitId))
	w.WriteHeader(http.StatusOK)
}
