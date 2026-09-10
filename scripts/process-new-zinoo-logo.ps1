param(
  [string]$Source = "C:\Users\shivr\Downloads\ChatGPT Image Aug 31, 2026, 06_2.png"
)

Add-Type -AssemblyName System.Drawing

function Save-BrandImage($bitmap, $path) {
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function New-Canvas($width, $height) {
  return [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

$sourceImage = [System.Drawing.Bitmap]::FromFile($Source)
$left = $sourceImage.Width; $top = $sourceImage.Height; $right = -1; $bottom = -1
for ($y = 0; $y -lt $sourceImage.Height; $y++) {
  for ($x = 0; $x -lt $sourceImage.Width; $x++) {
    $pixel = $sourceImage.GetPixel($x, $y)
    if ([Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B)) -gt 88) {
      $left = [Math]::Min($left, $x); $top = [Math]::Min($top, $y)
      $right = [Math]::Max($right, $x); $bottom = [Math]::Max($bottom, $y)
    }
  }
}
if ($right -lt $left) { throw "Could not locate the light logo artwork in $Source" }

$wordmark = New-Canvas ($right - $left + 1) ($bottom - $top + 1)
$brandBlue = [System.Drawing.Color]::FromArgb(255, 9, 92, 243)
for ($y = $top; $y -le $bottom; $y++) {
  for ($x = $left; $x -le $right; $x++) {
    $pixel = $sourceImage.GetPixel($x, $y)
    $alpha = [Math]::Max(0, [Math]::Min(255, ([Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B)) - 72) * 2))
    if ($alpha -gt 0) {
      $wordmark.SetPixel($x - $left, $y - $top, [System.Drawing.Color]::FromArgb($alpha, $brandBlue.R, $brandBlue.G, $brandBlue.B))
    }
  }
}

$gapStart = -1; $markRight = $wordmark.Width
for ($x = [Math]::Floor($wordmark.Width * .14); $x -lt $wordmark.Width; $x++) {
  $occupied = $false
  for ($y = 0; $y -lt $wordmark.Height; $y++) { if ($wordmark.GetPixel($x, $y).A -gt 0) { $occupied = $true; break } }
  if (-not $occupied -and $gapStart -lt 0) { $gapStart = $x }
  if ($occupied -and $gapStart -ge 0) { $markRight = $gapStart; break }
}
$mark = $wordmark.Clone([System.Drawing.Rectangle]::new(0, 0, $markRight, $wordmark.Height), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$brand = Join-Path $PSScriptRoot "..\public\brand"
Save-BrandImage $wordmark (Join-Path $brand "zinoo-logo.png")
Save-BrandImage $mark (Join-Path $brand "zinoo-mark.png")
foreach ($size in @(64, 192, 512)) {
  # Browsers and Android scale this compact, high-contrast source cleanly for
  # the corresponding icon surface.
  Copy-Item -LiteralPath (Join-Path $brand "zinoo-mark.png") -Destination (Join-Path $brand "zinoo-mark-$size.png") -Force
}
Copy-Item -LiteralPath (Join-Path $brand "zinoo-mark.png") -Destination (Join-Path $PSScriptRoot "..\public\favicon.ico") -Force
$mark.Dispose(); $wordmark.Dispose(); $sourceImage.Dispose()
