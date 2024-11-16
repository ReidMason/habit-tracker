package controllers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/storage"
)

type HabitEntryController struct {
	db     *storage.Sqlite
	logger logger.Logger
}

func NewHabitEntryController(db *storage.Sqlite, logger logger.Logger) *HabitEntryController {
	return &HabitEntryController{
		db:     db,
		logger: logger,
	}
}

func (h *HabitEntryController) CreateHabitEntry(w http.ResponseWriter, r *http.Request) {
	var habitEntry storage.HabitEntry
	err := json.NewDecoder(r.Body).Decode(&habitEntry)
	if err != nil {
		h.logger.Error("Failed to decode habit entry", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Failed to decode habit entry: %v", err)
		return
	}
	if habitEntry.Date.IsZero() {
		h.logger.Error("Date is required", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Date is required")
		return
	}
	if habitEntry.HabitId == 0 {
		h.logger.Error("HabitId is required", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "HabitId is required")
		return
	}

	habitEntry, err = h.db.CreateHabitEntry(habitEntry.HabitId, habitEntry.Date)
	if err != nil {
		h.logger.Error("Failed to check habit", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Info("Checked habit", slog.Int64("habitId", habitEntry.HabitId))
	successWithBody(w, habitEntry)
}

func (h *HabitEntryController) DeleteHabitEntry(w http.ResponseWriter, r *http.Request) {
	entryId, err := strconv.ParseInt(r.PathValue("entryId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse entryId", slog.Any("error", err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	habitEntry, err := h.db.DeleteHabitEntry(entryId)
	if err != nil {
		h.logger.Error("Failed to uncheck habit", slog.Any("error", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	h.logger.Info("Checked habit", slog.Int64("habitEntry", entryId))
	successWithBody(w, habitEntry)
}
