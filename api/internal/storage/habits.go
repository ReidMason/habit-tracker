package storage

import (
	"context"
	"time"

	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/sqlite3"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type Habit struct {
	Colour string `json:"colour"`
	Name   string `json:"name"`
	Id     int64  `json:"id"`
}

type DetailedHabit struct {
	Name    string            `json:"name"`
	Colour  string            `json:"colour"`
	Entries []BasicHabitEntry `json:"entries"`
	Id      int64             `json:"id"`
}

type BasicHabitEntry struct {
	Date time.Time `json:"date"`
	Id   int64     `json:"id"`
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
			Id:     u.ID,
			Name:   u.Name,
			Colour: u.Colour,
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

	basicEntries := make([]BasicHabitEntry, len(entries))
	for j, entry := range entries {
		basicEntries[j] = BasicHabitEntry{
			Date: entry.Date,
			Id:   entry.Id,
		}
	}

	return DetailedHabit{
		Id:      habit.ID,
		Name:    habit.Name,
		Entries: basicEntries,
		Colour:  habit.Colour,
	}, nil
}

func (s Sqlite) DeleteHabit(id int64) (Habit, error) {
	ctx := context.Background()
	habit, err := s.queries.DeleteHabit(ctx, id)
	if err != nil {
		return Habit{}, err
	}

	return Habit{
		Id:     habit.ID,
		Name:   habit.Name,
		Colour: habit.Colour,
	}, nil
}

func (s Sqlite) CreateHabit(userId int64, name string, colour string) (DetailedHabit, error) {
	ctx := context.Background()
	caser := cases.Title(language.English)
	habit, err := s.queries.CreateHabit(ctx, sqlite3Storage.CreateHabitParams{
		UserID: userId,
		Name:   caser.String(name),
		Colour: colour,
	})

	if err != nil {
		return DetailedHabit{}, err
	}

	return DetailedHabit{
		Id:      habit.ID,
		Name:    habit.Name,
		Entries: make([]BasicHabitEntry, 0),
		Colour:  habit.Colour,
	}, nil
}
