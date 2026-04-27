$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $ProjectRoot ".local-server.pid"

if (-not (Test-Path -LiteralPath $PidFile)) {
  Write-Host "No PID file found. The local server may already be stopped."
  exit 0
}

$pidValue = (Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
if ($pidValue) {
  $process = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
  if ($process) {
    Stop-Process -Id $pidValue -Force
    Write-Host "Stopped local server (PID $pidValue)."
  } else {
    Write-Host "Process $pidValue is not running."
  }
}

Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
