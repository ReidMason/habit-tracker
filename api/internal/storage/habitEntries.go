package storage

import (
	"context"
	"time"

	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/sqlite3"
)

type HabitEntry struct {
	Date    time.Time `json:"date"`
	Id      int64     `json:"id"`
	HabitId int64     `json:"habitId"`
}

func (s Sqlite) CreateHabitEntry(habitId int64, date time.Time) (HabitEntry, error) {
	ctx := context.Background()
	habitEntry, err := s.queries.CreateHabitEntry(ctx, sqlite3Storage.CreateHabitEntryParams{
		HabitID: habitId,
		Date:    date.Format(time.DateOnly),
	})

	if err != nil {
		return HabitEntry{}, err
	}

	date, err = time.Parse(time.DateOnly, habitEntry.Date)
	if err != nil {
		return HabitEntry{}, err
	}

	return HabitEntry{
		Id:      habitEntry.ID,
		Date:    date,
		HabitId: habitEntry.HabitID,
	}, nil
}

func (s Sqlite) DeleteHabitEntry(id int64) (HabitEntry, error) {
	ctx := context.Background()
	habitEntry, err := s.queries.DeleteHabitEntry(ctx, id)
	if err != nil {
		return HabitEntry{}, err
	}

	date, err := time.Parse(time.DateOnly, habitEntry.Date)
	if err != nil {
		return HabitEntry{}, err
	}

	return HabitEntry{
		Id:      habitEntry.ID,
		Date:    date,
		HabitId: habitEntry.HabitID,
	}, nil
}

func (s Sqlite) GetHabitEntries(habitId int64) ([]HabitEntry, error) {
	ctx := context.Background()
	habitEntries, err := s.queries.GetHabitEntries(ctx, habitId)
	if err != nil {
		return nil, err
	}

	entries := make([]HabitEntry, len(habitEntries))
	for i, entry := range habitEntries {
		date, err := time.Parse(time.DateOnly, entry.Date)
		if err != nil {
			return nil, err
		}

		entries[i] = HabitEntry{
			Id:      entry.ID,
			Date:    date,
			HabitId: entry.HabitID,
		}
	}

	return entries, nil
}
