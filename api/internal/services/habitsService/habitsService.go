package habitsService

import (
	"context"
	"log/slog"
	"sort"
	"time"

	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/services/models"
	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/database/sqlite3"
)

type HabitStorage interface {
	GetHabits(ctx context.Context, userID int64) ([]sqlite3Storage.Habit, error)
	UpdateHabit(ctx context.Context, arg sqlite3Storage.UpdateHabitParams) (sqlite3Storage.Habit, error)
	CreateHabit(ctx context.Context, arg sqlite3Storage.CreateHabitParams) (sqlite3Storage.Habit, error)
	DeleteHabit(ctx context.Context, id int64) (sqlite3Storage.Habit, error)
}

type HabitEntryStore interface {
	GetHabitEntries(id int64) ([]models.HabitEntry, error)
}

type HabitService struct {
	storage         HabitStorage
	logger          logger.Logger
	habitEntryStore HabitEntryStore
}

func NewHabitService(storage HabitStorage, logger logger.Logger, habitEntryStore HabitEntryStore) *HabitService {
	return &HabitService{
		storage:         storage,
		logger:          logger,
		habitEntryStore: habitEntryStore,
	}
}

func (s HabitService) GetActiveHabits(userId int64) ([]Habit, error) {
	habits, err := s.GetHabits(userId)
	if err != nil {
		return nil, err
	}

	activeHabits := make([]Habit, 0)
	for _, habit := range habits {
		if habit.Active {
			activeHabits = append(activeHabits, habit)
		}
	}

	return activeHabits, nil
}

func (s HabitService) GetHabits(userId int64) ([]Habit, error) {
	ctx := context.Background()
	rawHabits, err := s.storage.GetHabits(ctx, userId)
	if err != nil {
		return nil, err
	}

	habits := make([]Habit, len(rawHabits))

	for i, habit := range rawHabits {
		entries, err := s.habitEntryStore.GetHabitEntries(habit.ID)
		if err != nil {
			return nil, err
		}

		habits[i] = NewHabit(habit.ID, habit.Name, habit.Colour, habit.Index, entries, habit.Active)
	}

	sort.Slice(habits, func(i, j int) bool {
		return habits[i].Index < habits[j].Index
	})

	return habits, nil
}

func (s HabitService) UpdateHabits(habits []Habit) ([]Habit, error) {
	ctx := context.Background()
	updatedHabits := make([]Habit, len(habits))
	for _, habit := range habits {
		updatedHabit, err := s.storage.UpdateHabit(ctx, sqlite3Storage.UpdateHabitParams{
			Name:      habit.Name,
			Colour:    habit.Colour,
			Index:     habit.Index,
			Active:    habit.Active,
			UpdatedAt: time.Now().Format(time.RFC3339),
			ID:        habit.Id,
		})
		if err != nil {
			return updatedHabits, err
		}

		updatedHabits = append(updatedHabits, NewHabit(
			updatedHabit.ID, updatedHabit.Name, updatedHabit.Colour, updatedHabit.Index, nil, updatedHabit.Active))
	}

	return updatedHabits, nil
}

func (s HabitService) CreateHabit(userId int64, name string, colour string) (Habit, error) {
	ctx := context.Background()
	habits, err := s.GetHabits(userId)
	if err != nil {
		s.logger.Error("Failed to get habits", slog.Any("error", err))
		return Habit{}, err
	}

	var highestIndex int64 = 0
	for _, h := range habits {
		if h.Index > highestIndex {
			highestIndex = h.Index
		}
	}

	createdHabit, err := s.storage.CreateHabit(ctx, sqlite3Storage.CreateHabitParams{
		UserID: userId,
		Name:   name,
		Colour: colour,
		Index:  highestIndex + 1,
	})

	if err != nil {
		return Habit{}, err
	}

	return NewHabit(createdHabit.ID, createdHabit.Name, createdHabit.Colour, createdHabit.Index, nil, createdHabit.Active), nil
}

func (s HabitService) DeleteHabit(habitId int64) (Habit, error) {
	ctx := context.Background()

	deletedHabit, err := s.storage.DeleteHabit(ctx, habitId)
	if err != nil {
		return Habit{}, err
	}

	return NewHabit(deletedHabit.ID, deletedHabit.Name, deletedHabit.Colour, deletedHabit.Index, nil, deletedHabit.Active), nil
}
