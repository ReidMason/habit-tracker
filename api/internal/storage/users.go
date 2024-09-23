package storage

import (
	"context"
)

type User struct {
	Name string `json:"name"`
	Id   int64  `json:"id"`
}

func (s Sqlite) CreateUser(name string) (User, error) {
	ctx := context.Background()
	user, err := s.queries.CreateUser(ctx, name)
	if err != nil {
		return User{}, err
	}

	return User{
		Id:   user.ID,
		Name: user.Name,
	}, nil
}

func (s Sqlite) GetUsers() ([]User, error) {
	ctx := context.Background()
	user, err := s.queries.GetUsers(ctx)
	if err != nil {
		return nil, err
	}

	users := make([]User, len(user))

	for i, u := range user {
		users[i] = User{
			Id:   u.ID,
			Name: u.Name,
		}
	}

	return users, nil
}
