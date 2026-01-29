package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/sblackwood23/fantasy-draft-app/internal/models"
	"github.com/sblackwood23/fantasy-draft-app/internal/repository"
)

type PlayerHandler struct {
	repo *repository.PlayerRepository
}

func NewPlayerHandler(repo *repository.PlayerRepository) *PlayerHandler {
	return &PlayerHandler{repo: repo}
}

func (h *PlayerHandler) GetPlayer(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "invalid player ID"}`, http.StatusBadRequest)
		return
	}

	player, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, `{"error": "player not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "internal server error"}`, http.StatusInternalServerError)
		return
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(player)
}

// ListPlayers handles GET /players
func (h *PlayerHandler) ListPlayers(w http.ResponseWriter, r *http.Request) {
	players, err := h.repo.GetAll(r.Context())
	if err != nil {
		http.Error(w, `{"error": "internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(players)
}

// CreatePlayer handles POST /players
func (h *PlayerHandler) CreatePlayer(w http.ResponseWriter, r *http.Request) {
	var player models.Player

	if err := json.NewDecoder(r.Body).Decode(&player); err != nil {
		http.Error(w, `{"error": "invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(r.Context(), &player); err != nil {
		http.Error(w, `{"error": "failed to create player"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(player)
}

// UpdatePlayer handles PUT /players/{id}
func (h *PlayerHandler) UpdatePlayer(w http.ResponseWriter, r *http.Request) {
	var player models.Player

	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "invalid player ID"}`, http.StatusBadRequest)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&player); err != nil {
		http.Error(w, `{"error": "invalid JSON"}`, http.StatusBadRequest)
		return
	}

	player.ID = id
	if err := h.repo.Update(r.Context(), &player); err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, `{"error": "failed to find player to update"}`, http.StatusNotFound)
			return
		}

		http.Error(w, `{"error": "failed to update player"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(player)
}

// DeletePlayer handles DELETE /players/{id}
func (h *PlayerHandler) DeletePlayer(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "invalid player ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.repo.Delete(r.Context(), id); err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, `{"error": "failed to find player to delete"}`, http.StatusNotFound)
			return
		}

		http.Error(w, `{"error": "failed to delete player"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
