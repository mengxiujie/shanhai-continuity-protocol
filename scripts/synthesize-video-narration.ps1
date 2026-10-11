param([Parameter(Mandatory = $true)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
$outputPath = (Resolve-Path -LiteralPath $OutputDirectory).Path
$scenes = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $outputPath 'narration.scenes.json') | ConvertFrom-Json
$voice = New-Object -ComObject SAPI.SpVoice
$tokens = $voice.GetVoices()
$selected = $null
for ($i = 0; $i -lt $tokens.Count; $i++) {
    $token = $tokens.Item($i)
    if ($token.GetAttribute('Language') -eq '804') { $selected = $token; break }
}
if ($null -eq $selected) { throw 'No installed Simplified Chinese SAPI voice. No network fallback is permitted.' }
$voice.Voice = $selected
$voice.Rate = 2
$voice.Volume = 100
for ($i = 0; $i -lt $scenes.Count; $i++) {
    $stream = New-Object -ComObject SAPI.SpFileStream
    $wavePath = Join-Path $outputPath ('narration-{0}.wav' -f $i)
    $stream.Open($wavePath, 3, $false)
    try {
        $voice.AudioOutputStream = $stream
        [void]$voice.Speak([string]$scenes[$i].chinese)
    } finally { $stream.Close() }
}
Write-Output ('Local synthesized review voice: ' + $selected.GetDescription())
