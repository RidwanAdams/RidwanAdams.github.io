# PowerShell script to open the RPG Portfolio
Write-Host "🎮 Opening RPG Portfolio..." -ForegroundColor Cyan

# Get the current directory
$portfolioPath = Join-Path $PSScriptRoot "index.html"
$absolutePath = Resolve-Path $portfolioPath

Write-Host "📁 File: $absolutePath" -ForegroundColor Gray

# Check if file exists
if (-not (Test-Path $portfolioPath)) {
    Write-Host "❌ Error: index.html not found!" -ForegroundColor Red
    exit 1
}

# Open in default browser
try {
    Start-Process $absolutePath
    Write-Host "✅ Portfolio opened successfully!" -ForegroundColor Green
    
    # Show portfolio features
    Start-Sleep -Seconds 1
    Write-Host "`n✨ RPG Portfolio Features:" -ForegroundColor Yellow
    Write-Host "   • Character Selection System" -ForegroundColor Gray
    Write-Host "   • Quest Log (Projects)" -ForegroundColor Gray
    Write-Host "   • Skill Tree (Skills)" -ForegroundColor Gray
    Write-Host "   • Contact Guild (Contact Form)" -ForegroundColor Gray
    Write-Host "   • Dark/Light Mode Toggle" -ForegroundColor Gray
    Write-Host "   • Interactive RPG Elements" -ForegroundColor Gray
    Write-Host "`n🎮 Enjoy your adventure in the CodeRealm!" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error opening portfolio: $_" -ForegroundColor Red
    Write-Host "📋 Please open this file manually in your browser:" -ForegroundColor Yellow
    Write-Host "   file://$absolutePath" -ForegroundColor Gray
}