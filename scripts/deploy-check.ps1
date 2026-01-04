# Deployment Validation Script (PowerShell)
# Prüft ob alle notwendigen Environment-Variablen gesetzt sind

Write-Host "=== Deployment Validation ===" -ForegroundColor Cyan
Write-Host ""

$missing = @()

# Required Client Variables
$clientVars = @(
    "VITE_TEMPLATE_ID",
    "VITE_MULTIPLAYER_ENABLED",
    "VITE_XR_ENABLED",
    "VITE_DEBUG_ENABLED",
    "VITE_NET_URL"
)

Write-Host "=== Client Environment Variables ===" -ForegroundColor Yellow
foreach ($var in $clientVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "✗ $var is not set" -ForegroundColor Red
        $missing += $var
    } else {
        Write-Host "✓ $var=$value" -ForegroundColor Green
    }
}

# Required Server Variables
$serverVars = @(
    "CLIENT_URL",
    "NODE_ENV",
    "PORT"
)

Write-Host ""
Write-Host "=== Server Environment Variables ===" -ForegroundColor Yellow
foreach ($var in $serverVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "✗ $var is not set" -ForegroundColor Red
        $missing += $var
    } else {
        Write-Host "✓ $var=$value" -ForegroundColor Green
    }
}

Write-Host ""
if ($missing.Count -eq 0) {
    Write-Host "✓ All required environment variables are set" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some required environment variables are missing" -ForegroundColor Red
    Write-Host ""
    Write-Host "See docs/PRODUCTION_ENV.md for required variables" -ForegroundColor Yellow
    exit 1
}






