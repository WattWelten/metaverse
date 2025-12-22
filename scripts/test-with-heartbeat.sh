#!/bin/bash
# Test-Runner mit Heartbeat-Updates
# Gibt alle 5 Minuten ein Update aus

UPDATE_INTERVAL=300 # 5 Minuten in Sekunden
TEST_COMMAND="${1:-test}"

echo "🚀 Starte Tests: pnpm $TEST_COMMAND"
echo "📊 Progress-Updates alle 5 Minuten"
echo ""

# Starte Tests im Hintergrund und fange Output ab
pnpm "$TEST_COMMAND" &
TEST_PID=$!

# Heartbeat-Loop
START_TIME=$(date +%s)
LAST_UPDATE=$START_TIME

while kill -0 $TEST_PID 2>/dev/null; do
  sleep 10 # Prüfe alle 10 Sekunden
  
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  TIME_SINCE_UPDATE=$((CURRENT_TIME - LAST_UPDATE))
  
  # Update alle 5 Minuten
  if [ $TIME_SINCE_UPDATE -ge $UPDATE_INTERVAL ]; then
    MINUTES=$((ELAPSED / 60))
    SECONDS=$((ELAPSED % 60))
    echo "[$(date +%H:%M:%S)] ⏳ Tests laufen noch... (Laufzeit: ${MINUTES}m ${SECONDS}s)"
    LAST_UPDATE=$CURRENT_TIME
  fi
done

# Warte auf Test-Ende
wait $TEST_PID
EXIT_CODE=$?

TOTAL_TIME=$(( $(date +%s) - START_TIME ))
MINUTES=$((TOTAL_TIME / 60))
SECONDS=$((TOTAL_TIME % 60))
echo "[$(date +%H:%M:%S)] ✅ Tests beendet nach ${MINUTES}m ${SECONDS}s (Exit Code: $EXIT_CODE)"

exit $EXIT_CODE






