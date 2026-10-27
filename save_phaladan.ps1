Add-Type -AssemblyName System.Drawing

$srcFile = "C:\Users\ayush\.gemini\antigravity-ide\brain\5d8b15ca-5006-47a3-b072-3af2611a68e2\phaladan_ceremony_1793056535267.jpg"
$destWebp = "d:\Antigravity IDE\Wedding Invitation\assets\images\phaladan.webp"
$destPng = "d:\Antigravity IDE\Wedding Invitation\assets\images\phaladan.png"

$src = [System.Drawing.Bitmap]::new($srcFile)
$bmp = [System.Drawing.Bitmap]::new($src)
$bmp.MakeTransparent([System.Drawing.Color]::FromArgb(255, 255, 255))
$bmp.Save($destWebp, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)

$src.Dispose()
$bmp.Dispose()

Write-Host "Phaladan saved with MakeTransparent successfully"
