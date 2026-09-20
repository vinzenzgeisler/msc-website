param(
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\public\social\newsletter.png')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$logoPath = Join-Path $projectRoot 'public\MSC-logo-clean-transparent.png'
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $resolvedOutput
[System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

$bitmap = [System.Drawing.Bitmap]::new(1200, 630)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$logo = $null

try {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $backgroundRect = [System.Drawing.Rectangle]::new(0, 0, 1200, 630)
  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $backgroundRect,
    [System.Drawing.Color]::FromArgb(8, 28, 65),
    [System.Drawing.Color]::FromArgb(25, 67, 145),
    18
  )
  $graphics.FillRectangle($background, $backgroundRect)
  $background.Dispose()

  $yellow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 211, 0))
  $stripe = [System.Drawing.Point[]]@(
    [System.Drawing.Point]::new(1110, 0),
    [System.Drawing.Point]::new(1200, 0),
    [System.Drawing.Point]::new(1200, 630),
    [System.Drawing.Point]::new(1035, 630)
  )
  $graphics.FillPolygon($yellow, $stripe)
  $graphics.FillRectangle($yellow, 410, 207, 92, 7)

  $logo = [System.Drawing.Image]::FromFile($logoPath)
  $graphics.DrawImage($logo, [System.Drawing.Rectangle]::new(80, 140, 250, 267))

  $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(212, 224, 244))
  $titleFont = [System.Drawing.Font]::new('Bahnschrift Condensed', 72, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $labelFont = [System.Drawing.Font]::new('Bahnschrift', 22, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $subtitleFont = [System.Drawing.Font]::new('Bahnschrift', 31, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

  $graphics.DrawString('MSC OBERLAUSITZER DREILÄNDERECK E.V.', $labelFont, $muted, 410, 150)
  $graphics.DrawString('NEWSLETTER', $titleFont, $white, 402, 235)
  $graphics.DrawString('Termine, Neuigkeiten und Vereinsleben', $subtitleFont, $white, 410, 345)
  $graphics.DrawString('direkt in dein Postfach.', $subtitleFont, $white, 410, 388)

  $titleFont.Dispose()
  $labelFont.Dispose()
  $subtitleFont.Dispose()
  $white.Dispose()
  $muted.Dispose()
  $yellow.Dispose()

  $bitmap.Save($resolvedOutput, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  if ($logo) { $logo.Dispose() }
  $graphics.Dispose()
  $bitmap.Dispose()
}

Write-Output "Wrote $resolvedOutput (1200x630)"
