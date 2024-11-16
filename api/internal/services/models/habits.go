package models

import "time"

type Habit struct {
	Name    string       `json:"name"`
	Colour  string       `json:"colour"`
	Entries []HabitEntry `json:"entries"`
	Id      int64        `json:"id"`
	Index   int64        `json:"index"`
	Active  bool         `json:"active"`
}

func NewHabit(id int64, name string, colour string, index int64, entries []HabitEntry, active bool) Habit {
	return Habit{
		Id:      id,
		Name:    name,
		Colour:  colour,
		Index:   index,
		Entries: entries,
		Active:  active,
	}
}

type HabitEntry struct {
	Date  time.Time `json:"date"`
	Id    int64     `json:"id"`
	Combo int       `json:"combo"`
}

func NewHabitEntry(date time.Time, id int64, combo int) HabitEntry {
	return HabitEntry{
		Date:  date,
		Id:    id,
		Combo: combo,
	}
}
