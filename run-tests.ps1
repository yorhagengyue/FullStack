# Navigate to server directory and run tests
$serverPath = Join-Path $PSScriptRoot "Tu2tor\server"
Set-Location $serverPath
npm test
Set-Location $PSScriptRoot
