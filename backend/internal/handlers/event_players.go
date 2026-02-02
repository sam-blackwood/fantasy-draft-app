package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/sblackwood23/fantasy-draft-app/internal/repository"
)

type EventPlayerHandler struct {
	repo *repository.EventPlayerRepository
}

func NewEventPlayerHandler(repo *repository.EventPlayerRepository) *EventPlayerHandler {
	return &EventPlayerHandler{repo: repo}
}

// GetEventPlayers handles GET /events/{id}/players
func (h *EventPlayerHandler) GetEventPlayers(w http.ResponseWriter, r *http.Request) {
	eventID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, `{"error": "invalid event ID"}`, http.StatusBadRequest)
		return
	}

	players, err := h.repo.GetPlayersByEvent(r.Context(), eventID)
	if err != nil {
		http.Error(w, `{"error": "failed to get players"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(players)
}

// AddEventPlayers handles POST /events/{id}/players
// Accepts: {"playerIDs": [1, 2, 3]}
func (h *EventPlayerHandler) AddEventPlayers(w http.ResponseWriter, r *http.Request) {
	eventID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, `{"error": "invalid event ID"}`, http.StatusBadRequest)
		return
	}

	var body struct {
		PlayerIDs []int `json:"playerIDs"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error": "invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if err := h.repo.AddPlayersToEvent(r.Context(), eventID, body.PlayerIDs); err != nil {
		http.Error(w, `{"error": "failed to add players"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "players added"})
}

// RemoveEventPlayer handles DELETE /events/{id}/players/{playerID}
func (h *EventPlayerHandler) RemoveEventPlayer(w http.ResponseWriter, r *http.Request) {
	eventID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, `{"error": "invalid event ID"}`, http.StatusBadRequest)
		return
	}

	playerID, err := strconv.Atoi(chi.URLParam(r, "playerID"))
	if err != nil {
		http.Error(w, `{"error": "invalid player ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.repo.RemovePlayerFromEvent(r.Context(), eventID, playerID); err != nil {
		http.Error(w, `{"error": "failed to remove player"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
