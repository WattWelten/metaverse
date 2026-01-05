# Demo-Script: Zeigt Test-Updates mit kurzen Intervallen (30 Sekunden)
# Für echte Tests verwenden Sie: pnpm test:progress

param(
    [int]$IntervalSeconds = 30
)

Write-Host "=== Demo: Test mit Progress-Updates ===" -ForegroundColor Cyan
Write-Host "Update-Intervall: $IntervalSeconds Sekunden" -ForegroundColor Yellow
Write-Host ""

$startTime = Get-Date
$lastUpdate = $startTime
$updateCount = 0

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 🚀 Starte Test-Demo..." -ForegroundColor Green

# Simuliere Test-Lauf mit Updates
while ($true) {
    Start-Sleep -Seconds $IntervalSeconds
    
    $currentTime = Get-Date
    $elapsed = $currentTime - $startTime
    $minutes = [math]::Floor($elapsed.TotalMinutes)
    $seconds = [math]::Floor($elapsed.TotalSeconds % 60)
    $updateCount++
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] ⏳ Test läuft noch... (Update #$updateCount, Laufzeit: ${minutes}m ${seconds}s)" -ForegroundColor Yellow
    
    # Demo: Stoppe nach 2 Minuten
    if ($elapsed.TotalSeconds -ge 120) {
        Write-Host "[$timestamp] ✅ Demo beendet nach ${minutes}m ${seconds}s" -ForegroundColor Green
        Write-Host ""
        Write-Host "Für echte Tests verwenden Sie:" -ForegroundColor Cyan
        Write-Host "  pnpm test:progress     (5 Min Updates)" -ForegroundColor White
        Write-Host "  pnpm e2e:progress      (5 Min Updates)" -ForegroundColor White
        break
    }
}













