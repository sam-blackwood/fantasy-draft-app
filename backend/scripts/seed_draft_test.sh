#!/bin/bash
# Seed script for draft testing

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_URL="${DATABASE_URL:-postgres://localhost:5432/fantasy_draft_dev?sslmode=disable}"

echo "Seeding draft test data..."
psql "$DATABASE_URL" -f "$SCRIPT_DIR/seed_draft_test.sql"
echo "Done!"
