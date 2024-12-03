package storage

import (
	"context"
	"time"

	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/database/sqlite3"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type Habit struct {
	Name    string            `json:"name"`
	Colour  string            `json:"colour"`
	Entries []BasicHabitEntry `json:"entries"`
	Id      int64             `json:"id"`
	Index   int64             `json:"index"`
	Active  bool              `json:"active"`
}

func NewHabit(id int64, name string, colour string, index int64, entries []BasicHabitEntry, active bool) Habit {
	return Habit{
		Id:      id,
		Name:    name,
		Colour:  colour,
		Index:   index,
		Entries: entries,
		Active:  active,
	}
}

type BasicHabitEntry struct {
	Date  time.Time `json:"date"`
	Combo int       `json:"combo"`
	Id    int64     `json:"id"`
}

func NewBasicHabitEntry(date time.Time, combo int, id int64) BasicHabitEntry {
	return BasicHabitEntry{
		Date:  date,
		Combo: combo,
		Id:    id,
	}
}

func (s Sqlite) GetHabit(id int64) (Habit, error) {
	ctx := context.Background()
	habit, err := s.Queries.GetHabit(ctx, id)
	if err != nil {
		return Habit{}, err
	}

	entries, err := s.GetHabitEntries(habit.ID)
	if err != nil {
		return Habit{}, err
	}

	basicEntries := make([]BasicHabitEntry, len(entries))
	for j, entry := range entries {
		basicEntries[j] = NewBasicHabitEntry(entry.Date, 0, entry.Id)
	}

	return NewHabit(habit.ID, habit.Name, habit.Colour, habit.Index, basicEntries, habit.Active), nil
}

func (s Sqlite) DeleteHabit(id int64) error {
	ctx := context.Background()
	_, err := s.Queries.DeleteHabit(ctx, id)
	return err
}

func (s Sqlite) UpdateHabit(id int64, name string, colour string, index int64, active bool) error {
	ctx := context.Background()
	caser := cases.Title(language.English)
	_, err := s.Queries.UpdateHabit(ctx, sqlite3Storage.UpdateHabitParams{
		ID:        id,
		Name:      caser.String(name),
		Colour:    colour,
		Index:     index,
		Active:    active,
		UpdatedAt: time.Now().Format(time.DateTime),
	})
	return err
}

func (s Sqlite) CreateHabit(userId int64, name string, colour string, index int64) (Habit, error) {
	ctx := context.Background()
	caser := cases.Title(language.English)
	habit, err := s.Queries.CreateHabit(ctx, sqlite3Storage.CreateHabitParams{
		UserID: userId,
		Name:   caser.String(name),
		Colour: colour,
		Index:  index,
	})

	if err != nil {
		return Habit{}, err
	}

	return NewHabit(habit.ID, habit.Name, habit.Colour, habit.Index, make([]BasicHabitEntry, 0), habit.Active), nil
}
