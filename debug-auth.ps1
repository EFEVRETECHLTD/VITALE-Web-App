# Script to debug authentication issues
Write-Host "=== VITALE Authentication Debug Script ===" -ForegroundColor Cyan

# 1. Check if the server is running
Write-Host "Checking if the server is running..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/protocols?limit=1" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "Server is running and responding to API requests." -ForegroundColor Green
    }
}
catch {
    Write-Host "Server is not responding to API requests." -ForegroundColor Red
}

if (-not $serverRunning) {
    Write-Host "Starting the server..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell.exe" -ArgumentList "-Command cd server; npm start"
    Write-Host "Waiting for server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# 2. Test the authentication endpoints
Write-Host "`nTesting authentication endpoints..." -ForegroundColor Yellow

# Create a test HTML file to check localStorage token
$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Auth Debug</title>
    <script>
        function checkToken() {
            const token = localStorage.getItem('token');
            document.getElementById('tokenStatus').innerText = token ? 'Token found in localStorage' : 'No token found in localStorage';
            
            if (token) {
                try {
                    // Parse the token
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    
                    const tokenData = JSON.parse(jsonPayload);
                    document.getElementById('tokenInfo').innerText = JSON.stringify(tokenData, null, 2);
                    
                    // Check if token is expired
                    const now = Math.floor(Date.now() / 1000);
                    if (tokenData.exp < now) {
                        document.getElementById('tokenStatus').innerText += ' (EXPIRED)';
                    } else {
                        const timeLeft = tokenData.exp - now;
                        document.getElementById('tokenStatus').innerText += ` (Valid for ${timeLeft} seconds)`;
                    }
                } catch (e) {
                    document.getElementById('tokenInfo').innerText = 'Error parsing token: ' + e.message;
                }
            }
        }

        function testEndpoint() {
            const token = localStorage.getItem('token');
            if (!token) {
                document.getElementById('apiResult').innerText = 'No token found in localStorage';
                return;
            }

            fetch('http://localhost:3001/api/protocols?limit=1', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('apiResult').innerText = 'API call successful: ' + JSON.stringify(data, null, 2);
            })
            .catch(error => {
                document.getElementById('apiResult').innerText = 'API call failed: ' + error.message;
            });
        }

        function testBookmarkEndpoint() {
            const token = localStorage.getItem('token');
            if (!token) {
                document.getElementById('bookmarkResult').innerText = 'No token found in localStorage';
                return;
            }

            // Get the first protocol ID
            fetch('http://localhost:3001/api/protocols?limit=1', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                const protocolId = data.protocols[0].id;
                
                // Test bookmark endpoint
                return fetch(`http://localhost:3001/api/protocols/${protocolId}/bookmark`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('bookmarkResult').innerText = 'Bookmark API call successful: ' + JSON.stringify(data, null, 2);
            })
            .catch(error => {
                document.getElementById('bookmarkResult').innerText = 'Bookmark API call failed: ' + error.message;
            });
        }

        window.onload = function() {
            checkToken();
        };
    </script>
</head>
<body>
    <h1>Authentication Debug</h1>
    <button onclick="checkToken()">Check Token</button>
    <button onclick="testEndpoint()">Test API Endpoint</button>
    <button onclick="testBookmarkEndpoint()">Test Bookmark Endpoint</button>
    
    <h2>Token Status:</h2>
    <div id="tokenStatus">Checking...</div>
    
    <h2>Token Information:</h2>
    <pre id="tokenInfo"></pre>
    
    <h2>API Test Result:</h2>
    <pre id="apiResult"></pre>
    
    <h2>Bookmark Test Result:</h2>
    <pre id="bookmarkResult"></pre>
</body>
</html>
"@

$htmlPath = Join-Path $PWD "auth-debug.html"
$htmlContent | Out-File -FilePath $htmlPath -Encoding utf8

Write-Host "Created debug HTML file at: $htmlPath" -ForegroundColor Green
Write-Host "Please open this file in your browser after logging in to the application." -ForegroundColor Yellow
Write-Host "The file will help diagnose authentication issues by checking your token and testing API endpoints." -ForegroundColor Yellow

# 3. Check if isAuthenticated is being properly set in the UI
Write-Host "`nChecking for authentication state issues in the code..." -ForegroundColor Yellow

# Create a patch for ProtocolSelection.js to add debug logging
$debugPatchContent = @"
// Add this at the top of the file, after the imports
console.log('AuthContext debug patch loaded');

// Modify the ProtocolSelection component to add debugging
const ProtocolSelection = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, token } = useContext(AuthContext);
    
    // Add debug logging
    console.log('ProtocolSelection - Auth State:', { 
        isAuthenticated, 
        user: user ? 'User exists' : 'No user', 
        token: token ? 'Token exists' : 'No token' 
    });
    
    // Rest of the component...
"@

Write-Host "To debug the authentication state in the UI, add the following code to src/components/ProtocolSelection.js:" -ForegroundColor Magenta
Write-Host $debugPatchContent -ForegroundColor Gray

Write-Host "`nInstructions for debugging:" -ForegroundColor Cyan
Write-Host "1. Open the application in your browser" -ForegroundColor White
Write-Host "2. Log in with your credentials" -ForegroundColor White
Write-Host "3. Open the browser's developer tools (F12 or Ctrl+Shift+I)" -ForegroundColor White
Write-Host "4. Check the console for any authentication errors" -ForegroundColor White
Write-Host "5. Open the auth-debug.html file to check your token status" -ForegroundColor White
Write-Host "6. If the token is valid but you still see login prompts, there might be an issue with the isAuthenticated state" -ForegroundColor White

Write-Host "`nPossible fixes:" -ForegroundColor Green
Write-Host "1. Clear your browser cache and cookies" -ForegroundColor White
Write-Host "2. Try using a different browser" -ForegroundColor White
Write-Host "3. Check if the token is being properly set in localStorage" -ForegroundColor White
Write-Host "4. Ensure the AuthContext is properly updating the isAuthenticated state" -ForegroundColor White 