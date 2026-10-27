Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ayush\.gemini\antigravity-ide\brain\5d8b15ca-5006-47a3-b072-3af2611a68e2\phaladan_ceremony_1793056535267.jpg"
$destWebp = "d:\Antigravity IDE\Wedding Invitation\assets\images\phaladan.webp"
$destPng = "d:\Antigravity IDE\Wedding Invitation\assets\images\phaladan.png"

$src = New-Object System.Drawing.Bitmap $srcPath
$result = New-Object System.Drawing.Bitmap $src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb

for ($y = 0; $y -lt $src.Height; $y++) {
    for ($x = 0; $x -lt $src.Width; $x++) {
        $p = $src.GetPixel($x, $y)
        # Background is white (255, 255, 255)
        $diff = [Math]::Sqrt([Math]::Pow(255 - $p.R, 2) + [Math]::Pow(255 - $p.G, 2) + [Math]::Pow(255 - $p.B, 2))
        if ($diff -lt 15) {
            $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $p.R, $p.G, $p.B))
        } elseif ($diff -lt 35) {
            $alpha = [int](($diff - 15) / (35 - 15) * 255)
            $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
        } else {
            $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
        }
    }
}

$result.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)
$result.Save($destWebp, [System.Drawing.Imaging.ImageFormat]::Png)

$src.Dispose()
$result.Dispose()

Write-Host "Phaladan images saved successfully"
