# VPS Server Setup — inferops.dev

This runbook documents the full server setup. Run these steps on a fresh Ubuntu 24.04 LTS VPS.

## 1. Initial Hardening

```bash
# Update system
apt update && apt upgrade -y

# Create deploy user
adduser deploy
usermod -aG sudo deploy

# Set up SSH key authentication for deploy user
mkdir -p /home/deploy/.ssh
# Copy your public key into /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# Harden SSH — edit /etc/ssh/sshd_config:
#   Port 2222                  (change from 22)
#   PermitRootLogin no
#   PasswordAuthentication no
#   PubkeyAuthentication yes
systemctl restart sshd

# Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 2222/tcp    # SSH (custom port)
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable

# fail2ban
apt install -y fail2ban
systemctl enable fail2ban

# Unattended security upgrades
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## 2. Install Docker

```bash
# Install Docker Engine (official method)
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy

# Install Docker Compose plugin (ships with Docker Engine now)
docker compose version
```

## 3. Install Caddy

```bash
# Install Caddy via official repo
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudflare.com/caddy/stable/gpg.key' | \
  gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudflare.com/caddy/stable/deb/debian.list' | \
  tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# Copy Caddyfile to /etc/caddy/Caddyfile
# Then reload:
systemctl reload caddy
```

## 4. Deploy Site Directory

```bash
mkdir -p /var/www/inferops.dev
chown deploy:deploy /var/www/inferops.dev
```

## 5. Start Umami Analytics

```bash
# As the deploy user
mkdir -p /opt/inferops/analytics
# Copy docker-compose.yml and .env to /opt/inferops/analytics/
cd /opt/inferops/analytics
docker compose up -d
```

## 6. Backups

### Analytics database (daily cron)

```bash
# Add to deploy user's crontab: crontab -e
0 3 * * * docker exec inferops-analytics-db-1 pg_dump -U umami umami | \
  gzip > /var/backups/umami/umami-$(date +\%Y\%m\%d).sql.gz

# Retain 30 days
5 3 * * * find /var/backups/umami/ -name "*.sql.gz" -mtime +30 -delete
```

Create the backup directory:

```bash
mkdir -p /var/backups/umami
chown deploy:deploy /var/backups/umami
```

### Off-site backup (optional)

Sync to Hetzner Storage Box or Backblaze B2:

```bash
# Example with rclone (configure rclone first)
15 3 * * * rclone sync /var/backups/umami remote:inferops-backups/umami/
```

## 7. DNS (Cloudflare)

| Type | Name         | Content      | Proxy   |
|------|-------------|-------------|---------|
| A    | inferops.dev | `<VPS_IP>`  | Proxied |
| A    | analytics    | `<VPS_IP>`  | DNS only |
| AAAA | inferops.dev | `<VPS_IPv6>` | Proxied |

Analytics subdomain is DNS-only so Caddy handles TLS directly
(avoids ad-blocker issues with Cloudflare-proxied analytics).

## 8. Verify

```bash
# Check Caddy is serving
curl -I https://inferops.dev

# Check security headers
# Visit: https://securityheaders.com/?q=inferops.dev

# Check Umami is running
curl -I https://analytics.inferops.dev

# Check TLS
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=inferops.dev
```
