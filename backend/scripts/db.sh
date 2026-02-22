#!/bin/bash
# Database management script
# Usage: ./scripts/db.sh <command>
#
# Commands:
#   draft-reset   Clear draft picks and reset event status (keeps users)
#   seed          Full re-seed (wipes everything, inserts players + event)
#   migrate-up    Run all pending migrations
#   migrate-down  Roll back ALL migrations
#   clear-users   Delete all users and draft results, reset event status
#   fresh         Full rebuild: drop schema, re-migrate, re-seed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
DATABASE_URL="${DATABASE_URL:-postgres://localhost:5432/fantasy_draft_dev?sslmode=disable}"

case "${1}" in
  draft-reset)
    echo "Resetting draft state (keeping users)..."
    psql "$DATABASE_URL" -f "$SCRIPT_DIR/draft_reset.sql"
    ;;
  clear-users)
    echo "Clearing all users and draft results..."
    psql "$DATABASE_URL" -f "$SCRIPT_DIR/clear_users.sql"
    ;;
  seed)
    echo "Seeding all data from scratch..."
    psql "$DATABASE_URL" -f "$SCRIPT_DIR/seed_all.sql"
    ;;
  migrate-up)
    echo "Running migrations up..."
    migrate -path "$BACKEND_DIR/migrations" -database "$DATABASE_URL" up
    ;;
  migrate-down)
    echo "Rolling back all migrations..."
    migrate -path "$BACKEND_DIR/migrations" -database "$DATABASE_URL" down -all
    ;;
  fresh)
    echo "Full rebuild: migrate down + up + seed..."
    "$0" migrate-down
    "$0" migrate-up
    "$0" seed
    ;;
  *)
    echo "Usage: $0 {draft-reset|clear-users|seed|migrate-up|migrate-down|fresh}"
    echo ""
    echo "Commands:"
    echo "  draft-reset   Clear draft picks, reset event status (keeps users)"
    echo "  clear-users   Delete all users and draft results, reset event status"
    echo "  seed          Full re-seed (wipes everything, inserts players + event)"
    echo "  migrate-up    Run all pending migrations"
    echo "  migrate-down  Roll back ALL migrations"
    echo "  fresh         Full rebuild: drop schema → migrate → seed"
    exit 1
    ;;
esac
