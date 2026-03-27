$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# Rebuild all source files to avoid stale class artifacts after model changes.
Get-ChildItem -Path . -Filter *.class -Recurse | Remove-Item -Force
$javaSources = Get-ChildItem -Path . -Filter *.java -Recurse | ForEach-Object { $_.FullName }
javac -cp ".;nioflow-framework-1.0.0.jar;lib/*" $javaSources
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

java -cp ".;nioflow-framework-1.0.0.jar;lib/*" App
