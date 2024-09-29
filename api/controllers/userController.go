package controllers

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/storage"
)

func AddUserRoutes(mux *http.ServeMux, db *storage.Sqlite, logger logger.Logger) {
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
}
