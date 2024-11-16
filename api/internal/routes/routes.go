package routes

import (
	"net/http"

	"github.com/ReidMason/habit-tracker/internal/controllers"
	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/storage"
)

func Setup(db *storage.Sqlite, logger logger.Logger) *http.ServeMux {
	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("./static")))

	habitController := controllers.NewHabitController(db, logger)
	habitEntryController := controllers.NewHabitEntryController(db, logger)

	setupHabitRoutes(mux, habitController)
	setupHabitEntryRoutes(mux, habitEntryController)
	controllers.AddUserRoutes(mux, db, logger)

	return mux
}

func setupHabitRoutes(mux *http.ServeMux, habitController *controllers.HabitController) {
	mux.HandleFunc("GET /api/users/{userId}/habits", habitController.GetHabits)
	mux.HandleFunc("POST /api/users/{userId}/habits", habitController.CreateHabit)
	mux.HandleFunc("PUT /api/users/{userId}/habits", habitController.EditHabits)
	mux.HandleFunc("DELETE /api/habits/{habitId}", habitController.DeleteHabit)
	mux.HandleFunc("PUT /api/habits/{habitId}", habitController.EditHabit)
}

func setupHabitEntryRoutes(mux *http.ServeMux, habitEntryController *controllers.HabitEntryController) {
	mux.HandleFunc("POST /api/habitEntries", habitEntryController.CreateHabitEntry)
	mux.HandleFunc("DELETE /api/habitEntries/{entryId}", habitEntryController.DeleteHabitEntry)
}
