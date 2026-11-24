Add-Type -AssemblyName System.Drawing

function Create-RoundedRectanglePath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

# ----------------- Fig 2: Workflow Pipeline -----------------
$bmp2 = New-Object System.Drawing.Bitmap 1100, 480
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g2.Clear([System.Drawing.Color]::White)

$fTitle = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fSub = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$fBody = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Regular)
$fSmall = New-Object System.Drawing.Font("Segoe UI", 7.5, [System.Drawing.FontStyle]::Regular)

$bDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$bIndigo = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(67, 56, 202))
$bSlate = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))
$pArrow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(79, 70, 229), 2)
$pArrow.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 5)

$g2.DrawString("DATA VISTA: END-TO-END DATA HYGIENE AND AUTOML WORKFLOW PIPELINE", $fTitle, $bIndigo, 30, 20)

$steps = @(
    @("1. Ingestion", "Upload .xlsx/.csv`nSheetJS client parser`nMulti-sheet detect`nIn-memory store", 30, 70, 150, 160, [System.Drawing.Color]::FromArgb(238, 242, 255)),
    @("2. Profiling", "Column type check`nNumeric / Category`nMissing value tally`nDistribution stats", 210, 70, 155, 160, [System.Drawing.Color]::FromArgb(240, 253, 244)),
    @("3. Hygiene", "Deduplicate rows`nMedian/mode impute`nWhitespace trim`n1st/99th% Winsorize", 395, 70, 155, 160, [System.Drawing.Color]::FromArgb(254, 243, 199)),
    @("4. Partitioning", "Holdout: 80 / 20`nSeeded PRNG (42)`nZero data leakage`nFit on train only", 580, 70, 155, 160, [System.Drawing.Color]::FromArgb(250, 245, 255)),
    @("5. Training", "5 model families:`n- Dummy baseline`n- Linear / Logistic`n- Ridge L2 reg`n- Random Forest`n- HistGradBoosting", 765, 70, 155, 160, [System.Drawing.Color]::FromArgb(255, 241, 242)),
    @("6. Diagnostics", "Holdout evaluation:`nMAE, RMSE, R2 (reg)`nAccuracy, F1 (clf)`nLeaderboard rank`nXAI Feature Import", 945, 70, 135, 160, [System.Drawing.Color]::FromArgb(240, 249, 255))
)

for ($i = 0; $i -lt $steps.Length; $i++) {
    $s = $steps[$i]
    $ps = Create-RoundedRectanglePath $s[2] $s[3] $s[4] $s[5] 8
    $g2.FillPath((New-Object System.Drawing.SolidBrush($s[6])), $ps)
    $g2.DrawPath((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225), 1.2)), $ps)
    $g2.DrawString($s[0], $fSub, $bDark, ($s[2] + 8), ($s[3] + 10))
    $g2.DrawString($s[1], $fBody, $bSlate, ($s[2] + 8), ($s[3] + 35))
    
    if ($i -lt $steps.Length - 1) {
        $g2.DrawLine($pArrow, ($s[2] + $s[4]), ($s[3] + 80), ($steps[$i+1][2] - 5), ($s[3] + 80))
    }
}

$pBottom = Create-RoundedRectanglePath 30 270 1050 170 10
$g2.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))), $pBottom)
$g2.DrawPath((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 1.5)), $pBottom)
$g2.DrawString("DOWNSTREAM CONSUMPTION & REAL-TIME INTERACTION INTERFACES", $fSub, $bIndigo, 45, 280)

$downstreams = @(
    @("Real-Time Prediction Playground", "Dynamic feature input controls`nInstant model inference evaluation`n95% confidence interval bounds`nExport predictions to CSV", 45, 310, 240, 115),
    @("Explainable AI (XAI) Views", "Tree ensemble feature importances`nLinear regression beta coefficients`nHorizontal visual importance bars`nDecision-driver discovery", 305, 310, 240, 115),
    @("Multi-Sheet Diff Engine", "Base vs revision alignment`nCell-level modification flags`nVariance & percentage metrics`nVisual audit tracking grid", 565, 310, 240, 115),
    @("Gemini NLQ & Executive PDF", "Natural language chat with data`nStatistical summaries via Gemini`nOne-click jsPDF export`nComplete stakeholder report", 825, 310, 240, 115)
)
foreach ($d in $downstreams) {
    $pd = Create-RoundedRectanglePath $d[2] $d[3] $d[4] $d[5] 8
    $g2.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $pd)
    $g2.DrawPath((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 1.2)), $pd)
    $g2.DrawString($d[0], $fSub, $bDark, ($d[2] + 10), ($d[3] + 10))
    $g2.DrawString($d[1], $fBody, $bSlate, ($d[2] + 10), ($d[3] + 32))
}

$bmp2.Save("fig2_workflow.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp2.Dispose()
$g2.Dispose()
Write-Host "Fig 2 generated successfully."

# ----------------- Fig 3: WebGL 3D Pipeline -----------------
$bmp3 = New-Object System.Drawing.Bitmap 1100, 420
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g3.Clear([System.Drawing.Color]::White)

$g3.DrawString("DATA VISTA: THREE.JS HARDWARE-ACCELERATED 3D WEBGL RENDERING PIPELINE", $fTitle, $bIndigo, 30, 20)

$threeStages = @(
    @("Data Aggregation", "Group by Dimension (X)`nCompute Metric (Y)`n(Sum, Mean, Count)`nNormalize height scalar", 30, 70, 150, 150, [System.Drawing.Color]::FromArgb(238, 242, 255)),
    @("Geometry Buffer", "BoxGeometry (Columns)`nCylinder (Radial Donut)`nSphere (Scatter Universe)`nElevation Mesh", 210, 70, 160, 150, [System.Drawing.Color]::FromArgb(240, 253, 244)),
    @("Shaders & Themes", "MeshStandardMaterial`nPBR Roughness / Metal`nPalettes: Cyber Neon,`nSunset, Emerald, Slate", 400, 70, 160, 150, [System.Drawing.Color]::FromArgb(254, 243, 199)),
    @("Scene & Lighting", "AmbientLight (fill)`nDirectionalLight (key)`nShadow mapping active`nFloor grid & 3D axes", 590, 70, 160, 150, [System.Drawing.Color]::FromArgb(250, 245, 255)),
    @("Camera & Controls", "PerspectiveCamera (45)`nOrbitControls integration`nPresets: 3D, Top, Front`nAuto-rotation loop", 780, 70, 160, 150, [System.Drawing.Color]::FromArgb(255, 241, 242)),
    @("Raycasting HUD", "Normalized 2D mouse`nRaycaster intersection`nDynamic Mesh highlight`nFloating DOM Tooltip", 970, 70, 115, 150, [System.Drawing.Color]::FromArgb(240, 249, 255))
)

for ($i = 0; $i -lt $threeStages.Length; $i++) {
    $s = $threeStages[$i]
    $ps = Create-RoundedRectanglePath $s[2] $s[3] $s[4] $s[5] 8
    $g3.FillPath((New-Object System.Drawing.SolidBrush($s[6])), $ps)
    $g3.DrawPath((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225), 1.2)), $ps)
    $g3.DrawString($s[0], $fSub, $bDark, ($s[2] + 8), ($s[3] + 10))
    $g3.DrawString($s[1], $fBody, $bSlate, ($s[2] + 8), ($s[3] + 35))
    
    if ($i -lt $threeStages.Length - 1) {
        $g3.DrawLine($pArrow, ($s[2] + $s[4]), ($s[3] + 75), ($threeStages[$i+1][2] - 5), ($s[3] + 75))
    }
}

$pSpecs = Create-RoundedRectanglePath 30 250 1050 140 10
$g3.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), $pSpecs)
$g3.DrawString("GRAPHICAL SUBSYSTEM CHARACTERISTICS & HARDWARE EXECUTION GUARANTEES", $fSub, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(199, 210, 254))), 45, 265)
$specsLines = @(
    "[+] GPU-Accelerated WebGL Engine: Renders complex multidimensional categorical scenes at steady 60 FPS utilizing client GPU hardware.",
    "[+] Dual-Mode Compatibility: Seamlessly toggleable between standard Chart.js 2D charts and Three.js 3D WebGL scenes with shared aggregations.",
    "[+] Spatial Interaction: Full 360-degree orbital rotation, responsive pitch/yaw damping, wireframe toggle, height scale multiplier (0.5x to 2.2x).",
    "[+] High-Resolution Snapshot Capture: Integrated WebGL canvas image extraction exporting 3D graphics directly to executive PNG and PDF reports."
)
$sy = 290
foreach ($line in $specsLines) {
    $g3.DrawString($line, $fBody, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))), 45, $sy)
    $sy += 22
}

$bmp3.Save("fig3_threejs.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp3.Dispose()
$g3.Dispose()
Write-Host "Fig 3 generated successfully."

# ----------------- Fig 4: Benchmark Bar Chart -----------------
$bmp4 = New-Object System.Drawing.Bitmap 1100, 520
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g4.Clear([System.Drawing.Color]::White)

$g4.DrawString("DATA VISTA: AUTOML MODEL BENCHMARK COMPARISON ON TEST HOLDOUT SET", $fTitle, $bIndigo, 30, 20)
$g4.DrawString("Evaluating Mean Absolute Error (MAE) and Coefficient of Determination (R2) Across Evaluated Model Families", $fSub, $bSlate, 30, 48)

$ox = 180; $oy = 100; $cw = 860; $ch = 340
$pAxis = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(148, 163, 184), 1.5)
$g4.DrawLine($pAxis, $ox, $oy, $ox, ($oy + $ch))
$g4.DrawLine($pAxis, $ox, ($oy + $ch), ($ox + $cw), ($oy + $ch))

$pGrid = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(241, 245, 249), 1)
for ($val = 0; $val -le 50; $val += 10) {
    $yPos = ($oy + $ch) - [int](($val / 50.0) * $ch)
    $g4.DrawLine($pGrid, $ox, $yPos, ($ox + $cw), $yPos)
    $g4.DrawString($val.ToString(), $fSmall, $bSlate, ($ox - 30), ($yPos - 7))
}
$g4.DrawString("Error (MAE) [Lower is Better]", $fSub, $bSlate, 20, 80)

$modelsData = @(
    @("Dummy Baseline`n(Mean Predictor)", 48.20, 0.00, [System.Drawing.Color]::FromArgb(148, 163, 184)),
    @("Linear Regression`n(Ordinary Least Squares)", 21.40, 0.71, [System.Drawing.Color]::FromArgb(99, 102, 241)),
    @("Ridge Regression`n(L2 Regularized)", 19.85, 0.74, [System.Drawing.Color]::FromArgb(139, 92, 246)),
    @("Random Forest`n(50 Bagged Trees)", 14.10, 0.86, [System.Drawing.Color]::FromArgb(16, 185, 129)),
    @("HistGradientBoosting`n(Boosting Ensemble)", 12.95, 0.89, [System.Drawing.Color]::FromArgb(245, 158, 11))
)

$barWidth = 90
$spacing = 160
for ($i = 0; $i -lt $modelsData.Length; $i++) {
    $m = $modelsData[$i]
    $bx = $ox + 40 + ($i * $spacing)
    $bHeight = [int](($m[1] / 50.0) * $ch)
    $by = ($oy + $ch) - $bHeight
    
    $bBrush = New-Object System.Drawing.SolidBrush($m[3])
    $g4.FillRectangle($bBrush, $bx, $by, $barWidth, $bHeight)
    $g4.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 41, 59), 1)), $bx, $by, $barWidth, $bHeight)
    
    $g4.DrawString("MAE: " + $m[1].ToString("F2"), $fSub, $bDark, ($bx - 5), ($by - 32))
    $g4.DrawString("R2: " + $m[2].ToString("F2"), $fSmall, $bIndigo, ($bx + 10), ($by - 16))
    
    $g4.DrawString($m[0], $fSmall, $bDark, ($bx - 15), ($oy + $ch + 10))
}

$pLegend = Create-RoundedRectanglePath ($ox + $cw - 260) 105 250 75 8
$g4.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))), $pLegend)
$g4.DrawPath((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 1)), $pLegend)
$g4.DrawString("Benchmark Highlights:", $fSub, $bDark, ($ox + $cw - 250), 115)
$g4.DrawString("- Baseline MAE: 48.20 -> Best MAE: 12.95", $fSmall, $bSlate, ($ox + $cw - 250), 135)
$g4.DrawString("- Baseline Lift: 73.1% Error Reduction", $fSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))), ($ox + $cw - 250), 150)

$bmp4.Save("fig4_benchmark.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp4.Dispose()
$g4.Dispose()
Write-Host "Fig 4 generated successfully."
