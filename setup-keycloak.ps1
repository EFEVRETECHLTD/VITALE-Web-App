# Setup Keycloak for VITALE Protocol Library
Write-Host "Setting up Keycloak for VITALE Protocol Library..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if Keycloak is running
$keycloak = docker ps -q -f "name=vitale-keycloak"
if (-not $keycloak) {
    Write-Host "Keycloak container is not running. Please start it first." -ForegroundColor Red
    Write-Host "Run: .\start-keycloak-postgres.ps1" -ForegroundColor Yellow
    exit 1
}

# Create the realm using the Keycloak admin console
Write-Host "Creating the vitale realm..." -ForegroundColor Yellow
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin

# Create realm
$realmJson = '{
    "realm": "vitale",
    "enabled": true,
    "displayName": "VITALE Protocol Library",
    "sslRequired": "external",
    "registrationAllowed": false,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "resetPasswordAllowed": true,
    "editUsernameAllowed": false,
    "bruteForceProtected": true
}'

docker exec -it vitale-keycloak bash -c "echo '$realmJson' > /tmp/realm.json"
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh create realms -f /tmp/realm.json

# Create client
$clientJson = '{
    "clientId": "vitale-client",
    "enabled": true,
    "clientAuthenticatorType": "client-secret",
    "redirectUris": [
        "http://localhost:3000/*"
    ],
    "webOrigins": [
        "http://localhost:3000"
    ],
    "publicClient": false,
    "protocol": "openid-connect",
    "fullScopeAllowed": true,
    "directAccessGrantsEnabled": true,
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "serviceAccountsEnabled": false,
    "authorizationServicesEnabled": false,
    "frontchannelLogout": true
}'

docker exec -it vitale-keycloak bash -c "echo '$clientJson' > /tmp/client.json"
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh create clients -r vitale -f /tmp/client.json

# Create roles
Write-Host "Creating roles..." -ForegroundColor Yellow
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh create roles -r vitale -s name=user -s 'description=Regular user role'
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh create roles -r vitale -s name=admin -s 'description=Administrator role'
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh create roles -r vitale -s name=researcher -s 'description=Researcher role'

# Create users
Write-Host "Creating users..." -ForegroundColor Yellow
$userJson = '{
    "username": "testuser",
    "enabled": true,
    "emailVerified": true,
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@example.com",
    "credentials": [
        {
            "type": "password",
            "value": "password",
            "temporary": false
        }
    ]
}'

docker exec -it vitale-keycloak bash -c "echo '$userJson' > /tmp/user.json"
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh create users -r vitale -f /tmp/user.json

# Add role to user
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh add-roles --uusername testuser --rolename user -r vitale

# Create admin user
$adminUserJson = '{
    "username": "admin_user",
    "enabled": true,
    "emailVerified": true,
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "credentials": [
        {
            "type": "password",
            "value": "admin",
            "temporary": false
        }
    ]
}'

docker exec -it vitale-keycloak bash -c "echo '$adminUserJson' > /tmp/admin-user.json"
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh create users -r vitale -f /tmp/admin-user.json

# Add roles to admin user
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh add-roles --uusername admin_user --rolename admin -r vitale
docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh add-roles --uusername admin_user --rolename user -r vitale

# Get the client ID
Write-Host "Getting the client secret..." -ForegroundColor Yellow
$clientId = docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh get clients -r vitale --fields id,clientId | findstr vitale-client
$clientId = $clientId -replace '.*"id" : "([^"]+)".*', '$1'

# Get the client secret
$clientSecret = docker exec -it vitale-keycloak /opt/keycloak/bin/kcadm.sh get clients/$clientId/client-secret -r vitale
$clientSecret = $clientSecret -replace '.*"value" : "([^"]+)".*', '$1'

Write-Host "-----------------------------------" -ForegroundColor Green
Write-Host "Keycloak setup complete!" -ForegroundColor Green
Write-Host "Realm: vitale" -ForegroundColor Green
Write-Host "Client ID: vitale-client" -ForegroundColor Green
Write-Host "Client Secret: $clientSecret" -ForegroundColor Green
Write-Host "Test User: testuser / password" -ForegroundColor Green
Write-Host "Admin User: admin_user / admin" -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green
Write-Host "You can now access the Keycloak admin console at: http://localhost:8080/admin/" -ForegroundColor Green
Write-Host "Login with username 'admin' and password 'admin'" -ForegroundColor Green 