#!/bin/bash

# Exit on error
set -e

# Configuration
BACKUP_DIR="/backup/mongodb/$(date +%Y-%m-%d)"
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/instrument-status"}
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting MongoDB backup to $BACKUP_DIR"

# Run mongodump
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR"

# Compress the backup
tar -zcvf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR"

echo "Backup completed and compressed to $BACKUP_DIR.tar.gz"

# Clean up old backups
echo "Cleaning up backups older than $RETENTION_DAYS days"
find /backup/mongodb -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup process completed successfully!" 