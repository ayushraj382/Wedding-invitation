Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap "d:\Antigravity IDE\Wedding Invitation\assets\rang-and-riwaj.pages.dev_ (2).png"

# Gallery Haldi around y = 3700..4250, x = 600..1150
$rectG1 = New-Object System.Drawing.Rectangle 680, 3700, 420, 420
$cropG1 = $src.Clone($rectG1, $src.PixelFormat)
$cropG1.Save("d:\Antigravity IDE\Wedding Invitation\assets\test_gallery_haldi.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropG1.Dispose()

$src.Dispose()
Write-Host "Gallery haldi cropped"
