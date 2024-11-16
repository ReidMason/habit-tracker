package habitEntriesService

import (
	"context"
	"time"

	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/services/models"
	sqlite3Storage "github.com/ReidMason/habit-tracker/internal/storage/sqlite3"
)

type HabitEntryStorage interface {
	GetHabitEntries(ctx context.Context, habitID int64) ([]sqlite3Storage.HabitEntry, error)
}

type HabitEntryService struct {
	storage HabitEntryStorage
	logger  logger.Logger
}

func NewHabitEntriesService(storage HabitEntryStorage, logger logger.Logger) *HabitEntryService {
	return &HabitEntryService{
		storage: storage,
		logger:  logger,
	}
}

func (s *HabitEntryService) GetHabitEntries(habitId int64) ([]models.HabitEntry, error) {
	ctx := context.Background()
	entries, err := s.storage.GetHabitEntries(ctx, habitId)
	if err != nil {
		s.logger.Error("Failed to get habit entries", err)
		return nil, err
	}

	habitEntries := make([]models.HabitEntry, len(entries))
	combo := 0
	var tomorrow time.Time
	for i, entry := range entries {
		entryDate, err := time.Parse(time.DateOnly, entry.Date)
		if err != nil {
			return nil, err
		}

		if combo > 0 && entryDate == tomorrow {
			combo++
		} else {
			combo = 1
		}

		tomorrow = entryDate.AddDate(0, 0, 1)

		habitEntries[i] = models.NewHabitEntry(entryDate, entry.ID, combo)
	}

	return habitEntries, nil
}
