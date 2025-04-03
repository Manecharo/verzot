@echo off
echo ======================================================
echo Testing Tournament API Endpoints
echo ======================================================

echo.
echo 1. Register a test user
echo ======================================================
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@verzot.com\",\"password\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"User\",\"birthDate\":\"1990-01-01\",\"preferredLanguage\":\"en\"}" ^
  -o register-response.json

echo.
echo Response saved to register-response.json
type register-response.json
echo.
echo.

echo 2. Login with test user
echo ======================================================
curl -X POST http://localhost:5000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@verzot.com\",\"password\":\"Test123!\"}" ^
  -o login-response.json

echo.
echo Response saved to login-response.json
type login-response.json
echo.
echo.

REM Extract the token from the login response
for /f "tokens=*" %%a in ('type login-response.json ^| findstr /c:"token"') do set TOKEN_LINE=%%a
set TOKEN=%TOKEN_LINE:*token":"=%
set TOKEN=%TOKEN:"}}}=%

echo Token: %TOKEN%
echo.

echo 3. List all tournaments (public)
echo ======================================================
curl -X GET http://localhost:5000/api/v1/tournaments ^
  -o list-tournaments-response.json

echo.
echo Response saved to list-tournaments-response.json
type list-tournaments-response.json
echo.
echo.

echo 4. Create a new tournament (requires authentication)
echo ======================================================
curl -X POST http://localhost:5000/api/v1/tournaments ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"Test Tournament\",\"description\":\"A test tournament\",\"startDate\":\"2023-12-01\",\"endDate\":\"2023-12-15\",\"format\":\"5-a-side\",\"maxTeams\":8,\"minTeams\":4,\"isPublic\":true,\"rules\":\"{}\",\"tiebreakerRules\":\"{}\",\"tournamentStructure\":\"{}\"}" ^
  -o create-tournament-response.json

echo.
echo Response saved to create-tournament-response.json
type create-tournament-response.json
echo.
echo.

REM Extract the tournament ID from the create response
for /f "tokens=*" %%a in ('type create-tournament-response.json ^| findstr /c:"id"') do set ID_LINE=%%a
set TOURNAMENT_ID=%ID_LINE:*id":"=%
set TOURNAMENT_ID=%TOURNAMENT_ID:",=%

echo Tournament ID: %TOURNAMENT_ID%
echo.

echo 5. Get tournament by ID
echo ======================================================
curl -X GET http://localhost:5000/api/v1/tournaments/%TOURNAMENT_ID% ^
  -o get-tournament-response.json

echo.
echo Response saved to get-tournament-response.json
type get-tournament-response.json
echo.
echo.

echo 6. Update tournament (requires authentication, organizer only)
echo ======================================================
curl -X PUT http://localhost:5000/api/v1/tournaments/%TOURNAMENT_ID% ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"Updated Test Tournament\",\"status\":\"published\"}" ^
  -o update-tournament-response.json

echo.
echo Response saved to update-tournament-response.json
type update-tournament-response.json
echo.
echo.

echo All tests completed!
echo.
pause 