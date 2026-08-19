# Backs up the live production database (Neon) to a local timestamped .sql file.
# Run this any time you want a safety copy - e.g. before a schema change,
# before switching database providers, or just periodically for peace of mind.
#
# Usage:
#   powershell -File scripts\backup-database.ps1

$ErrorActionPreference = "Stop"

$pgDump = "C:\Users\shaya\anaconda3\envs\plgame\Library\bin\pg_dump.exe"
# Direct (non-pooled) connection - more reliable for pg_dump than the pooled one.
$databaseUrl = "postgresql://neondb_owner:npg_IGA5X0WdLVcv@ep-fancy-truth-azy4ffc5.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupsDir = Join-Path (Split-Path -Parent $scriptDir) "backups"
if (-not (Test-Path $backupsDir)) {
    New-Item -ItemType Directory -Path $backupsDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$outFile = Join-Path $backupsDir "gaffers-picks-backup-$timestamp.sql"

Write-Output "Backing up production database to: $outFile"
& $pgDump $databaseUrl --no-owner --no-privileges -f $outFile

if ($LASTEXITCODE -eq 0) {
    $size = (Get-Item $outFile).Length
    Write-Output "Done. Backup size: $([math]::Round($size / 1KB, 1)) KB"
} else {
    Write-Output "pg_dump failed with exit code $LASTEXITCODE"
}
