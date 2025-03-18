#!/bin/bash
set -e

DB_NAME=${POSTGRES_DB}
DB_USER=${POSTGRES_USER}
DB_PASSWORD=${POSTGRES_PASSWORD}

# Create database if it does not exist
psql --username "$POSTGRES_USER" --no-password <<EOSQL
  DO \$
  BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}') THEN
        CREATE DATABASE ${DB_NAME};
     END IF;
  END
  \$
EOSQL

# Create user if it does not exist
psql --username "$POSTGRES_USER" --no-password <<EOSQL
  DO \$
  BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
     END IF;
  END
  \$
EOSQL

# Grant privileges to the user on the database
psql --username "$POSTGRES_USER" --no-password <<EOSQL
  GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOSQL
