package models

import (
	"time"

	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/database/sqlite3"
)

type HabitEntry struct {
	Date  time.Time `json:"date"`
	Id    int64     `json:"id"`
	Combo int       `json:"combo"`
}

func NewHabitEntryFromStorage(storageHabitEntry sqlite3Storage.HabitEntry) (HabitEntry, error) {
	entryDate, err := time.Parse(time.DateOnly, storageHabitEntry.Date)
	if err != nil {
		return HabitEntry{}, err
	}

	return NewHabitEntry(entryDate, storageHabitEntry.ID, 0), nil
}

func NewHabitEntry(date time.Time, id int64, combo int) HabitEntry {
	return HabitEntry{
		Date:  date,
		Id:    id,
		Combo: combo,
	}
}
