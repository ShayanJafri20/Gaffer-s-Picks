# Run this whenever you open your PC and want to work on the project.
# It will:
#   1. Back up the live production database to a timestamped local file
#   2. Copy that same data into your local Postgres (so local testing has real data)
#   3. Restart your local backend + frontend dev servers
#
# Usage:
#   powershell -File scripts\daily-update.ps1

$ErrorActionPreference = "Stop"

$condaExe = "C:\Users\shaya\anaconda3\Scripts\conda.exe"
$pgDump = "C:\Users\shaya\anaconda3\envs\plgame\Library\bin\pg_dump.exe"
$psql = "C:\Users\shaya\anaconda3\envs\plgame\Library\bin\psql.exe"
$prodUrl = "postgresql://neondb_owner:npg_IGA5X0WdLVcv@ep-fancy-truth-azy4ffc5.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
$localMaintenanceUrl = "postgresql://plgame:plgame@localhost:5432/postgres"
$localDbUrl = "postgresql://plgame:plgame@localhost:5432/plgame"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$backupsDir = Join-Path $rootDir "backups"
if (-not (Test-Path $backupsDir)) { New-Item -ItemType Directory -Path $backupsDir | Out-Null }

Write-Output "Stopping local dev servers..."
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupFile = Join-Path $backupsDir "gaffers-picks-backup-$timestamp.sql"

Write-Output "1/4 Backing up production database to $backupFile ..."
& $pgDump $prodUrl --no-owner --no-privileges -f $backupFile
if ($LASTEXITCODE -ne 0) { Write-Output "pg_dump failed"; exit 1 }

Write-Output "2/4 Refreshing local database with production data..."
& $psql $localMaintenanceUrl -c "DROP DATABASE IF EXISTS plgame;" | Out-Null
& $psql $localMaintenanceUrl -c "CREATE DATABASE plgame OWNER plgame;" | Out-Null
& $psql $localDbUrl -f $backupFile | Out-Null

Write-Output "3/4 Starting local backend..."
Set-Location (Join-Path $rootDir "backend")
Start-Process -FilePath $condaExe -ArgumentList "run","-n","plgame","uvicorn","app.main:app","--reload","--port","8000" -WindowStyle Hidden -RedirectStandardOutput "..\backend_out.log" -RedirectStandardError "..\backend_err.log"

Write-Output "4/4 Starting local frontend..."
Set-Location (Join-Path $rootDir "frontend")
Start-Process -FilePath $condaExe -ArgumentList "run","-n","plgame","npm","run","dev" -WindowStyle Hidden -RedirectStandardOutput "..\frontend_out.log" -RedirectStandardError "..\frontend_err.log"

Start-Sleep -Seconds 8
Write-Output ""
Write-Output "Done. Backend: http://localhost:8000  Frontend: http://localhost:5173"
Write-Output "Backup saved: $backupFile"
