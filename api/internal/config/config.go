package config

type Config struct {
	ListenAddr     string
	DBPath         string
	AllowedOrigins []string
}

func Load(listenAddr string) (*Config, error) {
	return &Config{
		ListenAddr:     listenAddr,
		DBPath:         "./data/data.db",
		AllowedOrigins: []string{"http://localhost:4321"},
	}, nil
}
