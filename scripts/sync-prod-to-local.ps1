# Copies the live production database (Neon) down into your local Postgres,
# so local testing can use real, current data - registrations, predictions,
# everything. One-way only: local never affects production.
#
# Run this any time you want your local database to reflect what's really
# happening on the live site.
#
# Usage:
#   powershell -File scripts\sync-prod-to-local.ps1

$ErrorActionPreference = "Stop"

$pgDump = "C:\Users\shaya\anaconda3\envs\plgame\Library\bin\pg_dump.exe"
$psql = "C:\Users\shaya\anaconda3\envs\plgame\Library\bin\psql.exe"
$prodUrl = "postgresql://neondb_owner:npg_IGA5X0WdLVcv@ep-fancy-truth-azy4ffc5.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
$localMaintenanceUrl = "postgresql://plgame:plgame@localhost:5432/postgres"
$localDbName = "plgame"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$tempDump = Join-Path $scriptDir "_prod_sync_temp.sql"

Write-Output "1/4 Dumping production database..."
& $pgDump $prodUrl --no-owner --no-privileges -f $tempDump
if ($LASTEXITCODE -ne 0) { Write-Output "pg_dump failed"; exit 1 }

Write-Output "2/4 Dropping local database..."
& $psql $localMaintenanceUrl -c "DROP DATABASE IF EXISTS $localDbName;"

Write-Output "3/4 Recreating local database..."
& $psql $localMaintenanceUrl -c "CREATE DATABASE $localDbName OWNER plgame;"

Write-Output "4/4 Restoring production data into local database..."
$localDbUrl = "postgresql://plgame:plgame@localhost:5432/$localDbName"
& $psql $localDbUrl -f $tempDump | Out-Null

Remove-Item $tempDump

Write-Output "Done. Local database now mirrors production."
