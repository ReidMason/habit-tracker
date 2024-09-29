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

func AddHabitEntryRoutes(mux *http.ServeMux, db *storage.Sqlite, logger logger.Logger) {
	mux.HandleFunc("POST /api/habitEntry", func(w http.ResponseWriter, r *http.Request) {
		var habitEntry storage.HabitEntry
		err := json.NewDecoder(r.Body).Decode(&habitEntry)
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
}
