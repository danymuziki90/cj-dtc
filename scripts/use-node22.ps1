$ErrorActionPreference = 'Stop'

$nodeDir = Join-Path $PSScriptRoot '..\.tools\node-v22.22.1-win-x64'
$nodeDir = (Resolve-Path $nodeDir).Path

if (-not (Test-Path (Join-Path $nodeDir 'node.exe'))) {
  throw "Node 22 runtime not found at: $nodeDir"
}

# Prepend local Node 22 to PATH for current shell session.
$env:Path = "$nodeDir;$env:Path"

Write-Host "Node path switched to: $nodeDir"
Write-Host ("node: " + (& node -v))
Write-Host ("npm : " + (& npm.cmd -v))
