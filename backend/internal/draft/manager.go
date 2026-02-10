package draft

import (
	"encoding/json"
	"log"
	"sync"
)

type Manager struct {
	// clients is keyed by *Client (pointer), so each connection gets its own
	// entry even if multiple connections share the same UserID (e.g. multi-tab).
	// Map lookups/deletes compare pointer addresses, not struct contents.
	clients map[*Client]bool
	mu         sync.Mutex
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte // Channel for broadcasting messages to clients
}

func NewManager() *Manager {
	return &Manager{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte),
	}
}

func (m *Manager) Run() {
	for {
		select {
		case client := <-m.register:
			m.mu.Lock()
			// Check if this userID already has a connection (multi-tab)
			alreadyConnected := false
			for c := range m.clients {
				if c.UserID == client.UserID {
					alreadyConnected = true
					break
				}
			}

			m.clients[client] = true
			log.Printf("Connected new client (userID: %d)", client.UserID)

			// Only broadcast user_joined if this is the first connection for this userID
			if !alreadyConnected {
				joinMsg, _ := json.Marshal(map[string]interface{}{
					"type":   MsgTypeUserJoined,
					"userID": client.UserID,
				})
				for c := range m.clients {
					if c == client {
						continue
					}
					select {
					case c.Send <- joinMsg:
					default:
						close(c.Send)
						delete(m.clients, c)
						log.Println("Removed dead client (send failed)")
					}
				}
			}
			m.mu.Unlock()
		case client := <-m.unregister:
			m.mu.Lock()
			if m.clients[client] {
				delete(m.clients, client)
				close(client.Send)
				log.Printf("Disconnected client (userID: %d)", client.UserID)

				// Only broadcast user_left if no other connections remain for this userID
				stillConnected := false
				for c := range m.clients {
					if c.UserID == client.UserID {
						stillConnected = true
						break
					}
				}
				if !stillConnected {
					leaveMsg, _ := json.Marshal(map[string]interface{}{
						"type":   MsgTypeUserLeft,
						"userID": client.UserID,
					})
					for c := range m.clients {
						select {
						case c.Send <- leaveMsg:
						default:
							close(c.Send)
							delete(m.clients, c)
							log.Println("Removed dead client (send failed)")
						}
					}
				}
			}
			m.mu.Unlock()
		case message := <-m.broadcast:
			m.mu.Lock()
			for client := range m.clients {
				select {
				case client.Send <- message:
					// Message sent successfully
				default:
					// Channel full or closed - remove dead client
					close(client.Send)
					delete(m.clients, client)
					log.Println("Removed dead client (send failed)")
				}
			}
			m.mu.Unlock()
		}
	}
}

func (m *Manager) Register(client *Client) {
	m.register <- client
}

func (m *Manager) Unregister(client *Client) {
	m.unregister <- client
}

func (m *Manager) Broadcast(message []byte) {
	m.broadcast <- message
}

func (m *Manager) GetClientCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return len(m.clients)
}

// GetConnectedUserIDs returns a deduplicated slice of user IDs for all connected clients.
func (m *Manager) GetConnectedUserIDs() []int {
	m.mu.Lock()
	defer m.mu.Unlock()
	seen := make(map[int]bool)
	ids := make([]int, 0, len(m.clients))
	for c := range m.clients {
		if !seen[c.UserID] {
			seen[c.UserID] = true
			ids = append(ids, c.UserID)
		}
	}
	return ids
}
