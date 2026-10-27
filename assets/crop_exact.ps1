Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap "d:\Antigravity IDE\Wedding Invitation\assets\rang-and-riwaj.pages.dev_ (2).png"

# Haldi: let's crop x: 170..530 (w: 360), y: 1950..2350 (h: 400)
$rectHaldi = New-Object System.Drawing.Rectangle 180, 1950, 320, 350
$cropHaldi = $src.Clone($rectHaldi, $src.PixelFormat)
$cropHaldi.Save("d:\Antigravity IDE\Wedding Invitation\assets\test_haldi_exact.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropHaldi.Dispose()

# Reception: let's crop x: 1240..1600 (w: 360), y: 1950..2350 (h: 400)
$rectRec = New-Object System.Drawing.Rectangle 1240, 1950, 320, 350
$cropRec = $src.Clone($rectRec, $src.PixelFormat)
$cropRec.Save("d:\Antigravity IDE\Wedding Invitation\assets\test_rec_exact.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropRec.Dispose()

$src.Dispose()
Write-Host "Exact cropped"
