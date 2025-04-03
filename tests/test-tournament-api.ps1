Write-Host "======================================================"
Write-Host "Testing Tournament API Endpoints"
Write-Host "======================================================"
Write-Host ""

Write-Host "1. Register a test user"
Write-Host "======================================================"
$registerResponse = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/v1/auth/register" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@verzot.com","password":"Test123!","firstName":"Test","lastName":"User","birthDate":"1990-01-01","preferredLanguage":"en"}' `
  -ErrorAction SilentlyContinue

if ($registerResponse) {
  Write-Host "Register Response:" -ForegroundColor Green
  $registerResponse | ConvertTo-Json -Depth 5
} else {
  Write-Host "Registration failed or user already exists" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "2. Login with test user"
Write-Host "======================================================"
$loginResponse = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/v1/auth/login" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@verzot.com","password":"Test123!"}' `
  -ErrorAction Stop

Write-Host "Login Response:" -ForegroundColor Green
$loginResponse | ConvertTo-Json -Depth 5
Write-Host ""

# Extract token from login response
$token = $loginResponse.data.token
Write-Host "Token: $token"
Write-Host ""

Write-Host "3. List all tournaments (public)"
Write-Host "======================================================"
$listResponse = Invoke-RestMethod -Method GET -Uri "http://localhost:5000/api/v1/tournaments" `
  -ErrorAction Stop

Write-Host "List Tournaments Response:" -ForegroundColor Green
$listResponse | ConvertTo-Json -Depth 5
Write-Host ""

Write-Host "4. Create a new tournament (requires authentication)"
Write-Host "======================================================"
$createBody = @{
  name = "Test Tournament"
  description = "A test tournament"
  startDate = "2023-12-01"
  endDate = "2023-12-15"
  format = "5-a-side"
  maxTeams = 8
  minTeams = 4
  isPublic = $true
  rules = "{}"
  tiebreakerRules = "{}"
  tournamentStructure = "{}"
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/v1/tournaments" `
  -Headers @{
    "Content-Type"="application/json"
    "Authorization"="Bearer $token"
  } `
  -Body $createBody `
  -ErrorAction Stop

Write-Host "Create Tournament Response:" -ForegroundColor Green
$createResponse | ConvertTo-Json -Depth 5
Write-Host ""

# Extract tournament ID
$tournamentId = $createResponse.data.tournament.id
Write-Host "Tournament ID: $tournamentId"
Write-Host ""

Write-Host "5. Get tournament by ID"
Write-Host "======================================================"
$getResponse = Invoke-RestMethod -Method GET -Uri "http://localhost:5000/api/v1/tournaments/$tournamentId" `
  -ErrorAction Stop

Write-Host "Get Tournament Response:" -ForegroundColor Green
$getResponse | ConvertTo-Json -Depth 5
Write-Host ""

Write-Host "6. Update tournament (requires authentication, organizer only)"
Write-Host "======================================================"
$updateBody = @{
  name = "Updated Test Tournament"
  status = "published"
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Method PUT -Uri "http://localhost:5000/api/v1/tournaments/$tournamentId" `
  -Headers @{
    "Content-Type"="application/json"
    "Authorization"="Bearer $token"
  } `
  -Body $updateBody `
  -ErrorAction Stop

Write-Host "Update Tournament Response:" -ForegroundColor Green
$updateResponse | ConvertTo-Json -Depth 5
Write-Host ""

Write-Host "All tests completed!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit" 