# Event Management Runbook

## SSH into EC2

```bash
ssh -i ~/.ssh/fantasy-draft-key.pem ec2-user@3.17.232.50
```

## Initial Prod Setup (one-time)

Once SSH'd in, run:

```bash
DATABASE_URL=postgres://user:pass@your-rds:5432/fantasy_draft_prod ./scripts/db.sh migrate-up
DATABASE_URL=postgres://user:pass@your-rds:5432/fantasy_draft_prod ./scripts/db.sh seed
```

This creates the schema and populates the global `players` table (142 players). This is destructive — it wipes all existing data.

## Adding/Removing Players from the Global Table

Players must exist in the global `players` table before they can be linked to an event.

**Add a player:**

```sql
INSERT INTO players (first_name, last_name, status, country_code)
VALUES ('Tiger', 'Woods', 'professional', 'USA');
```

Run via psql or add to `seed_all.sql` for persistence across reseeds.

**Remove a player:**

```sql
DELETE FROM players WHERE first_name = 'Tiger' AND last_name = 'Woods';
```

This cascades — it also removes them from any event they're linked to.

## Updating an Event's Field

Edit `seed_players_championship_2026.sql` (or the relevant event seed file). The player list is in the `WHERE (p.first_name, p.last_name) IN (...)` block.

**Add a player to the field:** Add a new `('FirstName', 'LastName'),` line inside the `IN (...)` clause. Make sure the player exists in the global `players` table first.

**Remove a player from the field:** Delete their `('FirstName', 'LastName'),` line from the `IN (...)` clause.

## Spinning Up a New Event Instance

When you're ready to create the event (minutes, hours, or days before draft):

```bash
# From SSH on EC2
DATABASE_URL=postgres://user:pass@your-rds:5432/fantasy_draft_prod \
  ./scripts/db.sh new-event seed_players_championship_2026.sql
```

This creates a new event record and links the field players. Output confirms the event ID and player count. You can run this multiple times to create multiple instances of the same event — each gets its own ID, users, and draft results.

After running, friends can join immediately using the passkey on the login page.
