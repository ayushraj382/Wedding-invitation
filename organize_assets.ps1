Add-Type -AssemblyName System.Drawing

$baseDir = "d:\Antigravity IDE\Wedding Invitation"
$assetsDir = "$baseDir\assets"
$imagesDir = "$assetsDir\images"
$fontsDir = "$assetsDir\fonts"
$iconsDir = "$assetsDir\icons"

# Create target directories
New-Item -ItemType Directory -Force -Path $imagesDir | Out-Null
New-Item -ItemType Directory -Force -Path $fontsDir | Out-Null
New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null
New-Item -ItemType Directory -Force -Path "$baseDir\css" | Out-Null
New-Item -ItemType Directory -Force -Path "$baseDir\js" | Out-Null

# Font
if (Test-Path "$assetsDir\brittany_signature\BrittanySignature.ttf") {
    Copy-Item "$assetsDir\brittany_signature\BrittanySignature.ttf" "$fontsDir\BrittanySignature.ttf" -Force
}

# Icon
if (Test-Path "$assetsDir\map.svg") {
    Copy-Item "$assetsDir\map.svg" "$iconsDir\map.svg" -Force
}

# Existing Images to copy to assets/images
$existingImages = @(
    "paper texture bg.webp",
    "floral divider.webp",
    "bottom (1).png",
    "flap (1).png",
    "garland.webp",
    "illustration mobile.webp",
    "sprig.webp",
    "banana leaves.webp",
    "border corner.webp",
    "mehandii.webp",
    "wedding.webp"
)

foreach ($img in $existingImages) {
    if (Test-Path "$assetsDir\$img") {
        Copy-Item "$assetsDir\$img" "$imagesDir\$img" -Force
    }
}

# Scratch to reveal image
$scratchSource = "C:\Users\ayush\.gemini\antigravity-ide\brain\5d8b15ca-5006-47a3-b072-3af2611a68e2\scratch_to_reveal_1793053274623.jpg"
if (Test-Path $scratchSource) {
    # Load and save to $imagesDir\scratch to reveal.webp as PNG
    $sBmp = New-Object System.Drawing.Bitmap $scratchSource
    $sBmp.Save("$imagesDir\scratch to reveal.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $sBmp.Dispose()
}

# Extract Haldi and Reception from rang-and-riwaj screenshot
$refPng = "$assetsDir\rang-and-riwaj.pages.dev_ (2).png"
if (Test-Path $refPng) {
    $src = New-Object System.Drawing.Bitmap $refPng

    function CropAndCleanTransparent($source, $rect, $outputPath) {
        $cropped = $source.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $bgR = 243; $bgG = 235; $bgB = 221

        for ($y = 0; $y -lt $cropped.Height; $y++) {
            for ($x = 0; $x -lt $cropped.Width; $x++) {
                $p = $cropped.GetPixel($x, $y)
                $diff = [Math]::Sqrt([Math]::Pow($p.R - $bgR, 2) + [Math]::Pow($p.G - $bgG, 2) + [Math]::Pow($p.B - $bgB, 2))
                
                if ($diff -lt 30) {
                    $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $p.R, $p.G, $p.B))
                }
                elseif ($diff -lt 45) {
                    $alpha = [int](($diff - 30) / (45 - 30) * 255)
                    $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
                }
            }
        }
        $cropped.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $cropped.Dispose()
    }

    # Haldi (tight crop avoiding outer lines)
    $rectHaldi = New-Object System.Drawing.Rectangle 222, 1968, 290, 305
    CropAndCleanTransparent $src $rectHaldi "$imagesDir\haldi.webp"

    # Reception (tight crop avoiding left card line and bottom text)
    $rectRec = New-Object System.Drawing.Rectangle 1385, 1955, 305, 315
    CropAndCleanTransparent $src $rectRec "$imagesDir\reception.webp"

    $src.Dispose()
}

# Clean up temporary test files
Remove-Item "$assetsDir\test_*.png" -ErrorAction SilentlyContinue
Remove-Item "$assetsDir\check_dims.ps1" -ErrorAction SilentlyContinue
Remove-Item "$assetsDir\crop_*.ps1" -ErrorAction SilentlyContinue
Remove-Item "$assetsDir\make_transparent.ps1" -ErrorAction SilentlyContinue

Write-Host "Assets organized successfully"
