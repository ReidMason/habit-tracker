package habitsService

import (
	"context"
	"testing"

	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/services/models"
	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/database/sqlite3"
	"github.com/stretchr/testify/assert"
)

type mockHabitStorage struct {
	err    error
	habits []sqlite3Storage.Habit
}

func (m mockHabitStorage) GetHabits(_ context.Context, _ int64) ([]sqlite3Storage.Habit, error) {
	return m.habits, m.err
}

func (m mockHabitStorage) UpdateHabit(_ context.Context, _ sqlite3Storage.UpdateHabitParams) (sqlite3Storage.Habit, error) {
	return sqlite3Storage.Habit{}, nil
}

func (m mockHabitStorage) CreateHabit(_ context.Context, habit sqlite3Storage.CreateHabitParams) (sqlite3Storage.Habit, error) {
	return sqlite3Storage.Habit{
		ID:     2,
		Name:   habit.Name,
		Colour: habit.Colour,
		Active: true,
		Index:  habit.Index,
	}, nil
}

func (m mockHabitStorage) DeleteHabit(_ context.Context, _ int64) (sqlite3Storage.Habit, error) {
	return sqlite3Storage.Habit{}, nil
}

type mockHabitEntryStore struct{}

type mockHabitEntryStorage struct{}

func (m mockHabitEntryStorage) GetHabitEntries(id int64) ([]models.HabitEntry, error) {
	return nil, nil
}

func TestGetActiveHabits(t *testing.T) {
	tests := []struct {
		name           string
		habits         []sqlite3Storage.Habit
		expectedHabits []Habit
	}{
		{
			name: "returns only active habits",
			habits: []sqlite3Storage.Habit{
				{ID: 1, Name: "Habit 1", Active: true},
				{ID: 2, Name: "Habit 2", Active: false},
				{ID: 3, Name: "Habit 3", Active: true},
			},
			expectedHabits: []Habit{
				{Id: 1, Name: "Habit 1", Active: true},
				{Id: 3, Name: "Habit 3", Active: true},
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Arrange
			storage := mockHabitStorage{
				habits: tc.habits,
			}
			service := NewHabitService(storage, &logger.MockLogger{}, &mockHabitEntryStorage{})

			// Act
			habits, err := service.GetActiveHabits(1)

			// Assert
			if err != nil {
				t.Errorf("expected no error but got: %v", err)
			}

			if len(habits) != len(tc.expectedHabits) {
				t.Errorf("expected %d habits but got %d", len(tc.expectedHabits), len(habits))
			}

			for i, habit := range habits {
				expectedHabit := tc.expectedHabits[i]
				assert.Equal(t, habit, expectedHabit, "expected habit %v but got %v", expectedHabit, habit)
			}
		})
	}
}

func TestCreateHabit(t *testing.T) {
	tests := []struct {
		newHabitName   string
		newHabitColour string
		newHabitId     int64
		name           string
		habits         []sqlite3Storage.Habit
		expectedHabit  Habit
	}{
		{
			name:           "creates a habit",
			newHabitName:   " Habit 2 ",
			newHabitColour: " #ffffff ",
			newHabitId:     1,
			expectedHabit: Habit{
				Id:     2,
				Name:   "Habit 2",
				Colour: "#ffffff",
				Active: true,
				Index:  2,
			},
			habits: []sqlite3Storage.Habit{
				{
					ID:     1,
					Name:   "Habit 1",
					Colour: "#000000",
					Active: true,
					Index:  1,
				},
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Arrange
			storage := mockHabitStorage{
				habits: tc.habits,
			}
			service := NewHabitService(storage, &logger.MockLogger{}, &mockHabitEntryStorage{})

			// Act
			habit, err := service.CreateHabit(tc.newHabitId, tc.newHabitName, tc.newHabitColour)

			// Assert
			if err != nil {
				t.Errorf("expected no error but got: %v", err)
			}

			assert.Equal(t, habit, tc.expectedHabit, "expected habit %v but got %v", tc.expectedHabit, habit)
		})
	}
}
