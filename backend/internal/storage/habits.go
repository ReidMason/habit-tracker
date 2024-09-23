package storage

import (
	"context"

	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/sqlite3"
)

type Habit struct {
	Name string `json:"name"`
	Id   int64  `json:"id"`
}

type DetailedHabit struct {
	Name    string       `json:"name"`
	Entries []HabitEntry `json:"entries"`
	Id      int64        `json:"id"`
}

func (s Sqlite) GetHabits(userId int64) ([]Habit, error) {
	ctx := context.Background()
	user, err := s.queries.GetHabits(ctx, userId)
	if err != nil {
		return nil, err
	}

	habits := make([]Habit, len(user))

	for i, u := range user {
		habits[i] = Habit{
			Id:   u.ID,
			Name: u.Name,
		}
	}

	return habits, nil
}

func (s Sqlite) GetHabit(id int64) (DetailedHabit, error) {
	ctx := context.Background()
	habit, err := s.queries.GetHabit(ctx, id)
	if err != nil {
		return DetailedHabit{}, err
	}

	entries, err := s.GetHabitEntries(habit.ID)
	if err != nil {
		return DetailedHabit{}, err
	}

	return DetailedHabit{
		Id:      habit.ID,
		Name:    habit.Name,
		Entries: entries,
	}, nil
}

func (s Sqlite) CreateHabit(userId int64, name string) (Habit, error) {
	ctx := context.Background()
	habit, err := s.queries.CreateHabit(ctx, sqlite3Storage.CreateHabitParams{
		UserID: userId,
		Name:   name,
	})

	if err != nil {
		return Habit{}, err
	}

	return Habit{
		Id:   habit.ID,
		Name: habit.Name,
	}, nil
}
