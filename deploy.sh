#!/bin/bash
set -e

# ---- Configuration ----
# Update these values after setting up your EC2 instance
SERVER_IP="3.17.232.50"
SERVER_USER="ec2-user"
KEY="~/.ssh/fantasy-draft-key.pem"
REMOTE_DIR="/opt/fantasy-draft"

echo "=== Building Go backend ==="
cd backend
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o ../server ./cmd/server
cd ..

echo "=== Building React frontend ==="
cd frontend
npm run build
cd ..

echo "=== Stopping service ==="
ssh -i "$KEY" "${SERVER_USER}@${SERVER_IP}" "sudo systemctl stop fantasy-draft"

echo "=== Uploading to server ==="
scp -i "$KEY" server "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/server"
rsync -avz -e "ssh -i $KEY" frontend/dist/ "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/static/"
rsync -avz -e "ssh -i $KEY" backend/migrations/ "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/migrations/"
rsync -avz -e "ssh -i $KEY" backend/scripts/ "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/scripts/"

echo "=== Running migrations ==="
ssh -i "$KEY" "${SERVER_USER}@${SERVER_IP}" "source <(grep 'DATABASE_URL' /etc/systemd/system/fantasy-draft.service | sed 's/.*DATABASE_URL=/DATABASE_URL=/') && cd ${REMOTE_DIR} && migrate -path ./migrations -database \"\$DATABASE_URL\" up"

echo "=== Restarting service ==="
ssh -i "$KEY" "${SERVER_USER}@${SERVER_IP}" "sudo systemctl restart fantasy-draft"

echo "=== Done! Checking status... ==="
ssh -i "$KEY" "${SERVER_USER}@${SERVER_IP}" "sudo systemctl status fantasy-draft --no-pager"
