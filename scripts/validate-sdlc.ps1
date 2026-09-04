[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$failures = [System.Collections.Generic.List[string]]::new()

function Add-Failure {
    param([Parameter(Mandatory)][string]$Message)
    $failures.Add($Message)
}

$requiredFiles = @(
    '.specify/memory/constitution.md',
    '.specify/templates/plan-template.md',
    '.specify/templates/spec-template.md',
    '.specify/templates/tasks-template.md',
    'docs/SDLC.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    '.github/pull_request_template.md',
    '.github/CODEOWNERS'
)

foreach ($relativePath in $requiredFiles) {
    $fullPath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        Add-Failure "Missing required SDLC file: $relativePath"
    }
}

$constitutionPath = Join-Path $projectRoot '.specify/memory/constitution.md'
if (Test-Path -LiteralPath $constitutionPath -PathType Leaf) {
    $constitution = Get-Content -LiteralPath $constitutionPath -Raw -Encoding utf8
    if ($constitution -match '\[[A-Z][A-Z0-9_]*\]') {
        Add-Failure 'Constitution contains unresolved placeholder tokens.'
    }
    if ($constitution -notmatch '\*\*Version\*\*: \d+\.\d+\.\d+') {
        Add-Failure 'Constitution has no valid semantic version.'
    }
    if ($constitution -notmatch '\*\*Ratified\*\*: \d{4}-\d{2}-\d{2}') {
        Add-Failure 'Constitution has no ISO ratification date.'
    }
}

$packagePath = Join-Path $projectRoot 'package.json'
if (Test-Path -LiteralPath $packagePath -PathType Leaf) {
    $lockPath = Join-Path $projectRoot 'package-lock.json'
    if (-not (Test-Path -LiteralPath $lockPath -PathType Leaf)) {
        Add-Failure 'package-lock.json is required when package.json exists.'
    }

    $package = Get-Content -LiteralPath $packagePath -Raw -Encoding utf8 | ConvertFrom-Json
    foreach ($scriptName in @('lint', 'typecheck', 'build')) {
        if (-not $package.scripts -or -not $package.scripts.PSObject.Properties[$scriptName]) {
            Add-Failure "package.json must define the '$scriptName' script."
        }
    }

    $allDependencies = @{}
    foreach ($group in @($package.dependencies, $package.devDependencies)) {
        if ($group) {
            foreach ($property in $group.PSObject.Properties) {
                $allDependencies[$property.Name] = $property.Value
            }
        }
    }

    $prohibitedPackages = @(
        '@tanstack/react-query', '@mui/material', 'antd', '@chakra-ui/react',
        '@mantine/core', 'bootstrap', 'react-bootstrap', 'semantic-ui-react', 'primereact'
    )
    foreach ($dependency in $prohibitedPackages) {
        if ($allDependencies.ContainsKey($dependency)) {
            Add-Failure "Prohibited dependency detected: $dependency"
        }
    }

    $tsconfigPath = Join-Path $projectRoot 'tsconfig.json'
    if (-not (Test-Path -LiteralPath $tsconfigPath -PathType Leaf)) {
        Add-Failure 'tsconfig.json is required for the frontend application.'
    } else {
        $tsconfigText = Get-Content -LiteralPath $tsconfigPath -Raw -Encoding utf8
        if ($tsconfigText -notmatch '"strict"\s*:\s*true') {
            Add-Failure 'tsconfig.json must set compilerOptions.strict to true.'
        }
    }
}

$sourcePath = Join-Path $projectRoot 'src'
if (Test-Path -LiteralPath $sourcePath -PathType Container) {
    $sourceFiles = Get-ChildItem -LiteralPath $sourcePath -Recurse -File |
        Where-Object { $_.Extension -in @('.ts', '.tsx', '.js', '.jsx') }

    foreach ($file in $sourceFiles) {
        $rootPrefix = $projectRoot.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
        $relative = $file.FullName.Substring($rootPrefix.Length).Replace('\', '/')
        $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding utf8

        if ($content -match '(?<![A-Za-z0-9_])fetch\s*\(') {
            Add-Failure "Direct fetch call detected in $relative"
        }
        if ($content -match '@tanstack/react-query') {
            Add-Failure "TanStack Query import detected in $relative"
        }
        if ($content -match 'axios\.create\s*\(' -and $relative -notlike 'src/helpers/api/*') {
            Add-Failure "Axios instance outside src/helpers/api detected in $relative"
        }
    }

    $featuresPath = Join-Path $sourcePath 'features'
    if (Test-Path -LiteralPath $featuresPath -PathType Container) {
        $specsPath = Join-Path $projectRoot 'specs'
        foreach ($feature in Get-ChildItem -LiteralPath $featuresPath -Directory) {
            $artifactDirectory = $null
            if (Test-Path -LiteralPath $specsPath -PathType Container) {
                $artifactDirectory = Get-ChildItem -LiteralPath $specsPath -Directory |
                    Where-Object { $_.Name -match "^\d{3}-$([regex]::Escape($feature.Name))$" } |
                    Select-Object -First 1
            }

            if (-not $artifactDirectory) {
                Add-Failure "Feature '$($feature.Name)' has no matching specs/###-$($feature.Name) directory."
                continue
            }

            foreach ($artifact in @('spec.md', 'plan.md', 'tasks.md')) {
                if (-not (Test-Path -LiteralPath (Join-Path $artifactDirectory.FullName $artifact))) {
                    Add-Failure "Feature '$($feature.Name)' is missing $artifact."
                }
            }
        }
    }
}

if ($failures.Count -gt 0) {
    Write-Error ("SDLC validation failed:`n- " + ($failures -join "`n- "))
}

Write-Host 'SDLC validation passed.'
