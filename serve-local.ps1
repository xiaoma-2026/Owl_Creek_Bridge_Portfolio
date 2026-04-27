$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $ProjectRoot ".local-server.pid"
$LogFile = Join-Path $ProjectRoot ".local-server.log"
$ErrorLogFile = Join-Path $ProjectRoot ".local-server.err.log"
$Port = 8000

function Get-AccessUrls {
  $urls = [System.Collections.Generic.List[string]]::new()
  $urls.Add("http://localhost:${Port}/")
  $urls.Add("http://127.0.0.1:${Port}/")

  $lanIps = Get-NetIPConfiguration -ErrorAction SilentlyContinue |
    Where-Object { $_.NetAdapter.Status -eq "Up" } |
    ForEach-Object { $_.IPv4Address } |
    Where-Object { $_ -and $_.IPAddress -and $_.IPAddress -notmatch "^127\." } |
    Select-Object -ExpandProperty IPAddress -Unique

  foreach ($ip in $lanIps) {
    $urls.Add("http://${ip}:${Port}/")
  }

  return $urls | Select-Object -Unique
}

function Write-AccessUrls {
  param(
    [string]$Label
  )

  Write-Output $Label
  foreach ($url in Get-AccessUrls) {
    Write-Output "  $url"
  }
}

if (Test-Path -LiteralPath $PidFile) {
  $existingPid = (Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
  if ($existingPid) {
    $process = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    if ($process) {
      Write-Output "Local server is already running on port $Port (PID $existingPid)."
      Write-AccessUrls "Accessible URLs:"
      exit 0
    }
  }
  Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}

$pythonCandidates = @(
  "C:\Users\19907\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe",
  "python"
)

$python = $pythonCandidates | Where-Object { $_ -eq "python" -or (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (-not $python) {
  throw "Python runtime not found."
}

$server = Start-Process `
  -FilePath $python `
  -ArgumentList "-m", "http.server", "$Port", "--bind", "0.0.0.0" `
  -WorkingDirectory $ProjectRoot `
  -RedirectStandardOutput $LogFile `
  -RedirectStandardError $ErrorLogFile `
  -PassThru `
  -WindowStyle Hidden

Set-Content -LiteralPath $PidFile -Value $server.Id
Write-Output "Local server started on port $Port (PID $($server.Id))."
Write-AccessUrls "Accessible URLs:"
