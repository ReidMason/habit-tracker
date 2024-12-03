package habitService

import (
	"context"
	"sort"

	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/services/models"
	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/database/sqlite3"
)

type HabitStorage interface {
	GetHabits(ctx context.Context, userID int64) ([]sqlite3Storage.Habit, error)
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

func (s HabitService) GetActiveHabits(userId int64) ([]models.Habit, error) {
	habits, err := s.GetHabits(userId)
	if err != nil {
		return nil, err
	}

	activeHabits := make([]models.Habit, 0)
	for _, habit := range habits {
		if habit.Active {
			activeHabits = append(activeHabits, habit)
		}
	}

	return activeHabits, nil
}

func (s HabitService) GetHabits(userId int64) ([]models.Habit, error) {
	ctx := context.Background()
	rawHabits, err := s.storage.GetHabits(ctx, userId)
	if err != nil {
		return nil, err
	}

	habits := make([]models.Habit, len(rawHabits))

	for i, habit := range rawHabits {
		entries, err := s.habitEntryStore.GetHabitEntries(habit.ID)
		if err != nil {
			return nil, err
		}

		habits[i] = models.NewHabit(habit.ID, habit.Name, habit.Colour, habit.Index, entries, habit.Active)
	}

	sort.Slice(habits, func(i, j int) bool {
		return habits[i].Index < habits[j].Index
	})

	return habits, nil
}
