Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap "d:\Antigravity IDE\Wedding Invitation\assets\rang-and-riwaj.pages.dev_ (2).png"

function CropAndMakeTransparent($source, $rect, $outputPath) {
    $cropped = $source.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bgR = 243; $bgG = 235; $bgB = 221 # paper color approx #F3EBDD

    for ($y = 0; $y -lt $cropped.Height; $y++) {
        for ($x = 0; $x -lt $cropped.Width; $x++) {
            $p = $cropped.GetPixel($x, $y)
            $diff = [Math]::Sqrt([Math]::Pow($p.R - $bgR, 2) + [Math]::Pow($p.G - $bgG, 2) + [Math]::Pow($p.B - $bgB, 2))
            
            # If color is close to background texture color
            if ($diff -lt 28) {
                $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $p.R, $p.G, $p.B))
            } elseif ($diff -lt 40) {
                $alpha = [int](($diff - 28) / (40 - 28) * 255)
                $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
            }
        }
    }
    $cropped.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
}

# Haldi
$rectHaldi = New-Object System.Drawing.Rectangle 205, 1960, 310, 310
CropAndMakeTransparent $src $rectHaldi "d:\Antigravity IDE\Wedding Invitation\assets\test_haldi_trans.png"

# Reception
$rectRec = New-Object System.Drawing.Rectangle 1350, 1950, 290, 320
CropAndMakeTransparent $src $rectRec "d:\Antigravity IDE\Wedding Invitation\assets\test_rec_trans.png"

$src.Dispose()
Write-Host "Processed transparent crops"
