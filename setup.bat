@echo off
echo Setting up Manorakshak Extension...

echo.
echo Installing backend dependencies...
cd backend
call npm install

echo.
echo Setup complete!
echo.
echo To start the server:
echo   cd backend
echo   npm run dev
echo.
echo To add Gemini AI (optional):
echo   npm install @google/generative-ai
echo   Set GEMINI_API_KEY environment variable
echo.
pause