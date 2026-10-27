Add-Type -AssemblyName System.Drawing

$hPath = "d:\Antigravity IDE\Wedding Invitation\assets\images\haldi.webp"
$h = New-Object System.Drawing.Bitmap $hPath
for ($y = 0; $y -lt $h.Height; $y++) {
    for ($x = 0; $x -lt 20; $x++) {
        $h.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
    }
}
$h.Save("$hPath.tmp", [System.Drawing.Imaging.ImageFormat]::Png)
$h.Dispose()
Move-Item "$hPath.tmp" $hPath -Force

$rPath = "d:\Antigravity IDE\Wedding Invitation\assets\images\reception.webp"
$r = New-Object System.Drawing.Bitmap $rPath
for ($y = 0; $y -lt 55; $y++) {
    for ($x = 275; $x -lt $r.Width; $x++) {
        $r.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
    }
}
$r.Save("$rPath.tmp", [System.Drawing.Imaging.ImageFormat]::Png)
$r.Dispose()
Move-Item "$rPath.tmp" $rPath -Force

Write-Host "Artifact edges cleaned successfully"
