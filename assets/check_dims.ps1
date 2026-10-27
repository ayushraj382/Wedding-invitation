Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap "d:\Antigravity IDE\Wedding Invitation\assets\rang-and-riwaj.pages.dev_ (2).png"
Write-Host "Width=$($bmp.Width) Height=$($bmp.Height)"
$bmp.Dispose()
