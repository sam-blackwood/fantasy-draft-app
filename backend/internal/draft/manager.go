package draft

import (
	"log"
	"sync"
)

type Manager struct {
	clients    map[*Client]bool
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
			m.clients[client] = true
			log.Println("Connected new client")
		case client := <-m.unregister:
			if m.clients[client] {
				delete(m.clients, client)
				close(client.Send)
				log.Println("Disconnected client")
			}
		case message := <-m.broadcast:
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
