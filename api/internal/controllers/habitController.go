package controllers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/services/models"
)

type HabitStore interface {
	GetActiveHabits(userId int64) ([]models.Habit, error)
	GetHabits(userId int64) ([]models.Habit, error)
	UpdateHabits(habits []models.Habit) ([]models.Habit, error)
	DeleteHabit(habitId int64) (models.Habit, error)
	CreateHabit(userId int64, name string, colour string) (models.Habit, error)
}

type HabitController struct {
	habitsStore HabitStore
	logger      logger.Logger
}

func NewHabitController(logger logger.Logger, habitStore HabitStore) *HabitController {
	return &HabitController{
		logger:      logger,
		habitsStore: habitStore,
	}
}

func (h *HabitController) GetHabits(w http.ResponseWriter, r *http.Request) {
	userId, err := strconv.ParseInt(r.PathValue("userId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse userId", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	activeHabits, err := h.habitsStore.GetActiveHabits(userId)
	if err != nil {
		h.logger.Error("Failed to get habits", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Debug("Got habits", slog.Any("habits", activeHabits))
	successWithBody(w, activeHabits)
}

func (h *HabitController) EditHabits(w http.ResponseWriter, r *http.Request) {
	var habits []models.Habit
	err := json.NewDecoder(r.Body).Decode(&habits)
	if err != nil {
		h.logger.Error("Failed to decode habits", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	updatedHabits, err := h.habitsStore.UpdateHabits(habits)
	if err != nil {
		h.logger.Error("Failed to edit habit", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Info("Edited habits", slog.Any("habits", habits))
	successWithBody(w, updatedHabits)
}

func (h *HabitController) EditHabit(w http.ResponseWriter, r *http.Request) {
	habitId, err := strconv.ParseInt(r.PathValue("habitId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse habitId", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var habit models.Habit
	err = json.NewDecoder(r.Body).Decode(&habit)
	if err != nil {
		h.logger.Error("Failed to decode habit", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	updatedHabits, err := h.habitsStore.UpdateHabits([]models.Habit{habit})
	if err != nil {
		h.logger.Error("Failed to edit habit", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Info("Edited habit", slog.Int64("habitId", habitId))
	successWithBody(w, updatedHabits)
}

func (h *HabitController) CreateHabit(w http.ResponseWriter, r *http.Request) {
	userId, err := strconv.ParseInt(r.PathValue("userId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse userId", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var habit models.Habit
	err = json.NewDecoder(r.Body).Decode(&habit)
	if err != nil {
		h.logger.Error("Failed to decode habit", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	createdHabit, err := h.habitsStore.CreateHabit(userId, habit.Name, habit.Colour)
	if err != nil {
		h.logger.Error("Failed to create habit", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Info("Created habit", slog.Any("habit", createdHabit))
	successWithBody(w, createdHabit)
}

func (h *HabitController) DeleteHabit(w http.ResponseWriter, r *http.Request) {
	habitId, err := strconv.ParseInt(r.PathValue("habitId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse habitId", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	deletedHabit, err := h.habitsStore.DeleteHabit(habitId)
	if err != nil {
		h.logger.Error("Failed to delete habit", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Info("Deleted habit", slog.Int64("habitId", habitId))
	successWithBody(w, deletedHabit)
}
