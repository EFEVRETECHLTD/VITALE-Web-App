# Get admin token
$adminToken = Invoke-RestMethod -Uri "http://localhost:8080/realms/master/protocol/openid-connect/token" -Method Post -Body @{
    grant_type = "password"
    client_id = "admin-cli"
    username = "admin"
    password = "admin"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Got admin token: $($adminToken.access_token.Substring(0, 20))..." -ForegroundColor Green

# Create realm
$realmJson = @{
    realm = "vitale"
    enabled = $true
    displayName = "VITALE Protocol Library"
    sslRequired = "external"
    registrationAllowed = $false
    loginWithEmailAllowed = $true
    duplicateEmailsAllowed = $false
    resetPasswordAllowed = $true
    editUsernameAllowed = $false
    bruteForceProtected = $true
}

try {
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms" -Method Post -Body ($realmJson | ConvertTo-Json) -Headers @{
        Authorization = "Bearer $($adminToken.access_token)"
        "Content-Type" = "application/json"
    }
    Write-Host "Created realm 'vitale'" -ForegroundColor Green
} catch {
    Write-Host "Error creating realm: $_" -ForegroundColor Red
}

# Create client
$clientJson = @{
    clientId = "vitale-client"
    enabled = $true
    clientAuthenticatorType = "client-secret"
    redirectUris = @("http://localhost:3000/*")
    webOrigins = @("http://localhost:3000")
    publicClient = $false
    protocol = "openid-connect"
    fullScopeAllowed = $true
    directAccessGrantsEnabled = $true
    standardFlowEnabled = $true
    implicitFlowEnabled = $false
    serviceAccountsEnabled = $false
    authorizationServicesEnabled = $false
    frontchannelLogout = $true
}

try {
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/vitale/clients" -Method Post -Body ($clientJson | ConvertTo-Json) -Headers @{
        Authorization = "Bearer $($adminToken.access_token)"
        "Content-Type" = "application/json"
    }
    Write-Host "Created client 'vitale-client'" -ForegroundColor Green
} catch {
    Write-Host "Error creating client: $_" -ForegroundColor Red
}

# Create roles
$roles = @("user", "admin", "researcher")
foreach ($role in $roles) {
    $roleJson = @{
        name = $role
        description = "$role role"
    }
    
    try {
        Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/vitale/roles" -Method Post -Body ($roleJson | ConvertTo-Json) -Headers @{
            Authorization = "Bearer $($adminToken.access_token)"
            "Content-Type" = "application/json"
        }
        Write-Host "Created role '$role'" -ForegroundColor Green
    } catch {
        Write-Host "Error creating role '$role': $_" -ForegroundColor Red
    }
}

# Create test user
$userJson = @{
    username = "testuser"
    enabled = $true
    emailVerified = $true
    firstName = "Test"
    lastName = "User"
    email = "testuser@example.com"
    credentials = @(
        @{
            type = "password"
            value = "password"
            temporary = $false
        }
    )
}

try {
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/vitale/users" -Method Post -Body ($userJson | ConvertTo-Json) -Headers @{
        Authorization = "Bearer $($adminToken.access_token)"
        "Content-Type" = "application/json"
    }
    Write-Host "Created user 'testuser'" -ForegroundColor Green
} catch {
    Write-Host "Error creating user: $_" -ForegroundColor Red
}

# Get user ID
try {
    $users = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/vitale/users?username=testuser" -Method Get -Headers @{
        Authorization = "Bearer $($adminToken.access_token)"
    }
    $userId = $users[0].id
    
    # Get role ID
    $roles = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/vitale/roles" -Method Get -Headers @{
        Authorization = "Bearer $($adminToken.access_token)"
    }
    $userRoleId = ($roles | Where-Object { $_.name -eq "user" }).id
    
    # Assign role to user
    $roleMapping = @(
        @{
            id = $userRoleId
            name = "user"
        }
    )
    
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/vitale/users/$userId/role-mappings/realm" -Method Post -Body ($roleMapping | ConvertTo-Json) -Headers @{
        Authorization = "Bearer $($adminToken.access_token)"
        "Content-Type" = "application/json"
    }
    Write-Host "Assigned role 'user' to user 'testuser'" -ForegroundColor Green
} catch {
    Write-Host "Error assigning role to user: $_" -ForegroundColor Red
}

# Get client ID and secret
try {
    $clients = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/vitale/clients" -Method Get -Headers @{
        Authorization = "Bearer $($adminToken.access_token)"
    }
    $clientId = ($clients | Where-Object { $_.clientId -eq "vitale-client" }).id
    
    $clientSecret = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/vitale/clients/$clientId/client-secret" -Method Get -Headers @{
        Authorization = "Bearer $($adminToken.access_token)"
    }
    
    Write-Host "-----------------------------------" -ForegroundColor Green
    Write-Host "Keycloak setup complete!" -ForegroundColor Green
    Write-Host "Realm: vitale" -ForegroundColor Green
    Write-Host "Client ID: vitale-client" -ForegroundColor Green
    Write-Host "Client Secret: $($clientSecret.value)" -ForegroundColor Green
    Write-Host "Test User: testuser / password" -ForegroundColor Green
    Write-Host "-----------------------------------" -ForegroundColor Green
} catch {
    Write-Host "Error getting client secret: $_" -ForegroundColor Red
} 