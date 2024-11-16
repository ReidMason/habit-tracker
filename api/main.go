package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/ReidMason/habit-tracker/internal/config"
	"github.com/ReidMason/habit-tracker/internal/server"
	"github.com/charmbracelet/log"
)

type cmdArgs struct {
	listenAddr string
}

func main() {
	args := cmdArgs{listenAddr: *flag.String("listen-addr", ":8000", "server listen address")}
	flag.Parse()

	handler := log.New(os.Stdout)
	handler.SetLevel(log.DebugLevel)
	logger := slog.New(handler)
	slog.SetLogLoggerLevel(slog.LevelDebug)
	slog.SetDefault(logger)

	cfg, err := config.Load(args.listenAddr)
	if err != nil {
		logger.Error("Failed to load config", slog.Any("error", err))
		os.Exit(1)
	}

	srv, err := server.New(cfg, logger)
	if err != nil {
		logger.Error("Failed to create server", slog.Any("error", err))
		os.Exit(1)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if err := srv.Start(ctx); err != nil {
		logger.Error("Failed to start server", slog.Any("error", err))
		os.Exit(1)
	}
}
