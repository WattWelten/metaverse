# Test-Runner mit Heartbeat-Updates für PowerShell
# Gibt alle 5 Minuten ein Update aus

param(
    [string]$TestCommand = "test"
)

$UPDATE_INTERVAL_SECONDS = 300 # 5 Minuten
$CHECK_INTERVAL_SECONDS = 10 # Prüfe alle 10 Sekunden

Write-Host "🚀 Starte Tests: pnpm $TestCommand" -ForegroundColor Cyan
Write-Host "📊 Progress-Updates alle 5 Minuten" -ForegroundColor Yellow
Write-Host ""

# Starte Tests im Hintergrund
$job = Start-Job -ScriptBlock {
    param($cmd)
    Set-Location $using:PWD
    pnpm $cmd 2>&1
} -ArgumentList $TestCommand

$startTime = Get-Date
$lastUpdate = $startTime

# Heartbeat-Loop
while ($job.State -eq "Running") {
    Start-Sleep -Seconds $CHECK_INTERVAL_SECONDS
    
    $currentTime = Get-Date
    $elapsed = $currentTime - $startTime
    $timeSinceUpdate = $currentTime - $lastUpdate
    
    # Update alle 5 Minuten
    if ($timeSinceUpdate.TotalSeconds -ge $UPDATE_INTERVAL_SECONDS) {
        $minutes = [math]::Floor($elapsed.TotalMinutes)
        $seconds = [math]::Floor($elapsed.TotalSeconds % 60)
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] ⏳ Tests laufen noch... (Laufzeit: ${minutes}m ${seconds}s)" -ForegroundColor Yellow
        $lastUpdate = $currentTime
    }
    
    # Zeige Output vom Job
    $output = Receive-Job -Job $job
    if ($output) {
        Write-Host $output
    }
}

# Warte auf Job-Ende
Wait-Job -Job $job | Out-Null
$output = Receive-Job -Job $job
Write-Host $output

$exitCode = (Get-Job -Id $job.Id).State
Remove-Job -Job $job

$totalTime = (Get-Date) - $startTime
$minutes = [math]::Floor($totalTime.TotalMinutes)
$seconds = [math]::Floor($totalTime.TotalSeconds % 60)
$timestamp = Get-Date -Format "HH:mm:ss"

if ($exitCode -eq "Completed") {
    Write-Host "[$timestamp] ✅ Tests beendet nach ${minutes}m ${seconds}s" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[$timestamp] ❌ Tests fehlgeschlagen nach ${minutes}m ${seconds}s" -ForegroundColor Red
    exit 1
}











