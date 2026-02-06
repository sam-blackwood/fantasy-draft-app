package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sblackwood23/fantasy-draft-app/internal/models"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) GetByID(ctx context.Context, id int) (*models.User, error) {
	query := `
		SELECT id, event_id, username, created_at
		FROM users
		WHERE id = $1
	`

	var user models.User
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.EventID,
		&user.Username,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Retrieves all users
func (r *UserRepository) GetAll(ctx context.Context) ([]models.User, error) {
	query := `
		SELECT id, event_id, username, created_at
		FROM users
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var user models.User
		err := rows.Scan(
			&user.ID,
			&user.EventID,
			&user.Username,
			&user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

// Create new record in users table
func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (event_id, username)
		VALUES ($1, $2)
		RETURNING id, created_at
	`
	err := r.pool.QueryRow(ctx, query,
		user.EventID,
		user.Username,
	).Scan(&user.ID, &user.CreatedAt)

	return err
}

// Update record in users table
func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users SET username=$1
		WHERE id=$2
	`

	commandTag, err := r.pool.Exec(ctx, query,
		user.Username,
		user.ID,
	)

	if err != nil {
		return err
	}

	if commandTag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}

	return nil
}

// Delete record from users table
func (r *UserRepository) Delete(ctx context.Context, id int) error {
	query := `
		DELETE FROM users
		WHERE id=$1
	`

	commandTag, err := r.pool.Exec(ctx, query, id)

	if err != nil {
		return err
	}

	if commandTag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}

	return nil
}

// GetByEventAndUsername finds a user by event ID and username
func (r *UserRepository) GetByEventAndUsername(ctx context.Context, eventID int, username string) (*models.User, error) {
	query := `
		SELECT id, event_id, username, created_at
		FROM users
		WHERE event_id = $1 AND username = $2
	`

	var user models.User
	err := r.pool.QueryRow(ctx, query, eventID, username).Scan(
		&user.ID,
		&user.EventID,
		&user.Username,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

// CountByEvent returns the number of users registered for an event
func (r *UserRepository) CountByEvent(ctx context.Context, eventID int) (int, error) {
	query := `SELECT COUNT(*) FROM users WHERE event_id = $1`

	var count int
	err := r.pool.QueryRow(ctx, query, eventID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}
