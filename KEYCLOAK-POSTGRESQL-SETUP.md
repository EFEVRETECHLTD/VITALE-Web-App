# Setting Up VITALE Protocol Library with Keycloak and PostgreSQL

This guide provides instructions for setting up the VITALE Protocol Library to use Keycloak for authentication and PostgreSQL for data storage.

## Prerequisites

- Docker and Docker Compose
- Node.js (v14 or higher)
- npm (v6 or higher)
- PowerShell (for Windows) or Bash (for Linux/macOS)

## Setting Up PostgreSQL

### Using Docker

1. Create a Docker Compose file for PostgreSQL:

```yaml
version: '3'

services:
  postgres:
    image: postgres:14
    container_name: vitale-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vitale
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. Start PostgreSQL:

```bash
docker-compose up -d postgres
```

### Manual Installation

1. Download and install PostgreSQL from the [official website](https://www.postgresql.org/download/).
2. Create a database named `vitale`.
3. Create a user with username `postgres` and password `postgres`.
4. Grant all privileges on the `vitale` database to the `postgres` user.

## Setting Up Keycloak

### Using Docker

1. Add Keycloak to your Docker Compose file:

```yaml
version: '3'

services:
  postgres:
    # ... (as above)

  keycloak:
    image: quay.io/keycloak/keycloak:22.0.5
    container_name: vitale-keycloak
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: postgres
      KC_DB_PASSWORD: postgres
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_HOSTNAME: localhost
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    command: start-dev
```

2. Start Keycloak:

```bash
docker-compose up -d keycloak
```

### Configuring Keycloak

1. Access the Keycloak admin console at http://localhost:8080/admin/ and log in with username `admin` and password `admin`.

2. Create a new realm:
   - Click on the dropdown in the top-left corner and select "Create Realm"
   - Name it `vitale` and click "Create"

3. Create a client:
   - Go to "Clients" in the left sidebar and click "Create client"
   - Set Client ID to `vitale-client`
   - Enable "Client authentication"
   - Set "Valid redirect URIs" to `http://localhost:3000/*`
   - Set "Web origins" to `http://localhost:3000`
   - Click "Save"

4. Create roles:
   - Go to "Realm roles" in the left sidebar and click "Create role"
   - Create the following roles: `user`, `admin`, `researcher`

5. Create a user:
   - Go to "Users" in the left sidebar and click "Add user"
   - Fill in the username, email, first name, and last name
   - Enable "Email verified"
   - Click "Save"
   - Go to the "Credentials" tab and set a password
   - Go to the "Role mappings" tab and assign roles to the user

6. Get the client secret:
   - Go to "Clients" and select `vitale-client`
   - Go to the "Credentials" tab and copy the client secret

7. Get the realm public key:
   - Go to "Realm settings" in the left sidebar
   - Go to the "Keys" tab
   - Find the RSA key and click on the "Public key" button to copy it

## Configuring the Application

1. Update the `.env` file in the server directory:

```
# Database Configuration
DB_ADAPTER=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=vitale
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SSL=false

# Authentication Configuration
AUTH_ADAPTER=keycloak
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=vitale
KEYCLOAK_CLIENT_ID=vitale-client
KEYCLOAK_CLIENT_SECRET=your_client_secret_here
KEYCLOAK_PUBLIC_KEY=your_public_key_here
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

2. Update the `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_AUTH_PROVIDER=keycloak
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=vitale
REACT_APP_KEYCLOAK_CLIENT_ID=vitale-client
```

## Running the Application

1. Install dependencies:

```bash
npm install
cd server
npm install
cd ..
```

2. Run the application with PostgreSQL and Keycloak:

```bash
.\run-with-postgresql-keycloak.ps1
```

## Troubleshooting

### PostgreSQL Connection Issues

- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Check PostgreSQL logs: `docker logs vitale-postgres`
- Verify connection settings in the `.env` file

### Keycloak Connection Issues

- Ensure Keycloak is running: `docker ps | grep keycloak`
- Check Keycloak logs: `docker logs vitale-keycloak`
- Verify Keycloak settings in the `.env` file
- Ensure the client secret and public key are correct

### Application Issues

- Check the server logs for any errors
- Verify that the environment variables are set correctly
- Ensure that the necessary dependencies are installed 