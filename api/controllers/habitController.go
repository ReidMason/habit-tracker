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

	h.logger.Debug("Got habits", slog.Any("habits", habits))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(habits)
}

func (h *HabitController) EditHabits(w http.ResponseWriter, r *http.Request) {
	var habits []storage.Habit
	err := json.NewDecoder(r.Body).Decode(&habits)
	if err != nil {
		h.logger.Error("Failed to decode habits", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	for _, habit := range habits {
		err = h.db.UpdateHabit(habit.Id, habit.Name, habit.Colour)
		if err != nil {
			h.logger.Error("Failed to edit habit", slog.Any("error", err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	h.logger.Info("Edited habits", slog.Any("habits", habits))
	w.WriteHeader(http.StatusOK)
}

func (h *HabitController) EditHabit(w http.ResponseWriter, r *http.Request) {
	habitId, err := strconv.ParseInt(r.PathValue("habitId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse habitId", slog.Any("error", err))
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

	err = h.db.UpdateHabit(habitId, habit.Name, habit.Colour)
	if err != nil {
		h.logger.Error("Failed to edit habit", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Info("Edited habit", slog.Int64("habitId", habitId))
	w.WriteHeader(http.StatusOK)
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
