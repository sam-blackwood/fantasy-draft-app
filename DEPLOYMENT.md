# Deployment Guide

## Quick Deploy (Most Common)

For any frontend or backend code changes, just run from the project root:

```bash
./deploy.sh
```

This builds the Go binary + React frontend locally, uploads them to EC2, and restarts the app. That's it.

## Infrastructure Overview

```
Browser → Caddy (ports 80/443, handles SSL) → Fantasy Draft App (port 8080, internal only)
```

- **EC2 instance**: Amazon Linux 2023, Elastic IP `3.17.232.50`
- **Domain**: `clubhousedraft.com` (DNS via Cloudflare, A record → `3.17.232.50`)
- **Caddy**: Reverse proxy at `/etc/caddy/Caddyfile`, auto-renews SSL certificates
- **App**: Go binary + static React files at `/opt/fantasy-draft/`
- **Database**: RDS PostgreSQL at `fantasy-draft-db.cfgm04iqaaf2.us-east-2.rds.amazonaws.com`

## SSH Access

```bash
ssh -i ~/.ssh/fantasy-draft-key.pem ec2-user@3.17.232.50
```

## Useful Commands (run via SSH)

### View app logs
```bash
sudo journalctl -u fantasy-draft -f
```

### View Caddy logs
```bash
sudo journalctl -u caddy -f
```

### Restart the app
```bash
sudo systemctl restart fantasy-draft
```

### Restart Caddy
```bash
sudo systemctl restart caddy
```

### Check service status
```bash
sudo systemctl status fantasy-draft
sudo systemctl status caddy
```

### Edit app environment variables
```bash
sudo systemctl edit fantasy-draft --full
```

Then `sudo systemctl daemon-reload && sudo systemctl restart fantasy-draft` after changes.

### Edit Caddy config
```bash
sudo nano /etc/caddy/Caddyfile
```

Then `sudo systemctl restart caddy` after changes.

## Database Access

Tunnel through EC2 to reach RDS:

```bash
ssh -i ~/.ssh/fantasy-draft-key.pem -L 5433:fantasy-draft-db.cfgm04iqaaf2.us-east-2.rds.amazonaws.com:5432 ec2-user@3.17.232.50 -N &
```

Then run DB scripts through the tunnel:

```bash
DATABASE_URL="postgres://fantasyadmin:PASSWORD@localhost:5433/fantasy_draft_prod?sslmode=require" ./backend/scripts/db.sh <command>
```

## Running Database Migrations

After adding new migration files in `backend/migrations/`:

1. `deploy.sh` already uploads migrations to `/opt/fantasy-draft/migrations/` on the server
2. Use the DB tunnel above to run them, or SSH in and run them directly

## Troubleshooting

### App won't start
```bash
sudo journalctl -u fantasy-draft --no-pager -n 50
```

### SSL certificate issues
```bash
sudo journalctl -u caddy --no-pager -n 50
```

Caddy auto-renews certs. If there's an issue, make sure ports 80 and 443 are open in the `fantasy-draft-ec2-sg` security group and the Cloudflare DNS proxy is off (gray cloud, not orange).

### Port conflict
Caddy needs ports 80 and 443. The app must run on 8080 (or any other port that doesn't conflict). Check what's using a port:

```bash
sudo ss -tlnp | grep :80
```

### Can't SSH in
- Make sure `~/.ssh/fantasy-draft-key.pem` exists and has correct permissions (`chmod 400`)
- Make sure port 22 is open in the `fantasy-draft-ec2-sg` security group
