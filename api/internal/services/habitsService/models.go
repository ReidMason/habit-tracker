package habitsService

import "github.com/ReidMason/habit-tracker/internal/services/models"

type Habit struct {
	Name    string              `json:"name"`
	Colour  string              `json:"colour"`
	Entries []models.HabitEntry `json:"entries"`
	Id      int64               `json:"id"`
	Index   int64               `json:"index"`
	Active  bool                `json:"active"`
}

func NewHabit(id int64, name string, colour string, index int64, entries []models.HabitEntry, active bool) Habit {
	return Habit{
		Id:      id,
		Name:    name,
		Colour:  colour,
		Index:   index,
		Entries: entries,
		Active:  active,
	}
}
