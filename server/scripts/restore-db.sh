#!/bin/bash

# Exit on error
set -e

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "Error: Backup file path is required"
  echo "Usage: $0 <backup_file.tar.gz>"
  exit 1
fi

BACKUP_FILE=$1
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/instrument-status"}
TEMP_DIR="/tmp/mongodb-restore-$(date +%s)"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file $BACKUP_FILE does not exist"
  exit 1
fi

echo "Starting MongoDB restoration from $BACKUP_FILE"

# Create temporary directory
mkdir -p $TEMP_DIR

# Extract backup
echo "Extracting backup file..."
tar -zxvf "$BACKUP_FILE" -C $TEMP_DIR

# Find the extracted directory
EXTRACTED_DIR=$(find $TEMP_DIR -type d -name "*-*-*" | head -n 1)

if [ -z "$EXTRACTED_DIR" ]; then
  echo "Error: Could not find extracted backup directory"
  rm -rf $TEMP_DIR
  exit 1
fi

# Restore database
echo "Restoring database from $EXTRACTED_DIR..."
mongorestore --uri="$MONGODB_URI" --drop $EXTRACTED_DIR

# Clean up
echo "Cleaning up temporary files..."
rm -rf $TEMP_DIR

echo "Database restoration completed successfully!" 