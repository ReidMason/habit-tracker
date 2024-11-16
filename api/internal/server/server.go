package server

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/ReidMason/habit-tracker/internal/config"
	"github.com/ReidMason/habit-tracker/internal/logger"
	"github.com/ReidMason/habit-tracker/internal/routes"
	"github.com/ReidMason/habit-tracker/internal/storage"
	"github.com/rs/cors"
)

type Server struct {
	cfg    *config.Config
	logger logger.Logger
	db     *storage.Sqlite
	srv    *http.Server
}

func New(cfg *config.Config, logger logger.Logger) (*Server, error) {
	db, err := storage.NewSqliteStorage(cfg.DBPath, logger)
	if err != nil {
		return nil, err
	}

	if err := db.ApplyMigrations(); err != nil {
		return nil, err
	}

	return &Server{
		cfg:    cfg,
		logger: logger,
		db:     db,
	}, nil
}

func (s *Server) Start(ctx context.Context) error {
	router := routes.Setup(s.db, s.logger)

	corsHandler := cors.New(cors.Options{
		AllowedOrigins: s.cfg.AllowedOrigins,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	}).Handler(router)

	s.srv = &http.Server{
		Addr:    s.cfg.ListenAddr,
		Handler: corsHandler,
	}

	go func() {
		s.logger.Info("server started", slog.String("addr", s.cfg.ListenAddr))
		if err := s.srv.ListenAndServe(); err != nil {
			s.logger.Error("server error", slog.Any("error", err))
		}
	}()

	<-ctx.Done()

	return s.srv.Shutdown(context.Background())
}
