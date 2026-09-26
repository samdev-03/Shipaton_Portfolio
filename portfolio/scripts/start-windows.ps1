param([ValidateSet('rehearsal','care','meal','quote')][string]$Variant='rehearsal')
$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
node scripts/dev.mjs $Variant
