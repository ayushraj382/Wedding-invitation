Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap "d:\Antigravity IDE\Wedding Invitation\assets\rang-and-riwaj.pages.dev_ (2).png"

# Let's inspect the cards around Y = 1900 to 2500
# Card 1: Haldi
$rectHaldi = New-Object System.Drawing.Rectangle 200, 1950, 320, 320
$cropHaldi = $src.Clone($rectHaldi, $src.PixelFormat)
$cropHaldi.Save("d:\Antigravity IDE\Wedding Invitation\assets\test_haldi_card.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropHaldi.Dispose()

# Card 4: Reception
$rectRec = New-Object System.Drawing.Rectangle 1210, 1950, 320, 320
$cropRec = $src.Clone($rectRec, $src.PixelFormat)
$cropRec.Save("d:\Antigravity IDE\Wedding Invitation\assets\test_rec_card.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropRec.Dispose()

# Scratch to reveal card around Y = 750 to 1250
$rectScratch = New-Object System.Drawing.Rectangle 550, 780, 630, 350
$cropScratch = $src.Clone($rectScratch, $src.PixelFormat)
$cropScratch.Save("d:\Antigravity IDE\Wedding Invitation\assets\test_scratch.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropScratch.Dispose()

$src.Dispose()
Write-Host "Cropped test images saved"
