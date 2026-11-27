$ErrorActionPreference='Stop'
$toolsDir=Join-Path $PSScriptRoot 'tools'
$original=Join-Path $toolsDir 'blender-4.5.9-windows-x64.zip'
$offset=(Get-Item -LiteralPath $original).Length
$total=399051129L
$chunk=[long][math]::Ceiling(($total-$offset)/6)
$config=@();$parts=@();$processes=@()
for($i=0;$i -lt 6;$i++){
 $start=$offset+$i*$chunk;$end=[math]::Min($total-1,$start+$chunk-1)
 if($start -gt $end){break}
 $part=Join-Path $toolsDir "blender-tail-$i.part"
 $parts+=@{path=$part;length=($end-$start+1)}
 $args='--http1.1 --fail --silent --show-error --max-time 240 --range "'+$start+'-'+$end+'" --output "'+$part+'" "https://mirror.freedif.org/blender/release/Blender4.5/blender-4.5.9-windows-x64.zip"'
 $processes+=Start-Process -FilePath 'C:\Windows\System32\curl.exe' -ArgumentList $args -WindowStyle Hidden -PassThru
 if($i -gt 0){$config+='next'}
 $config+='url = "https://mirror.freedif.org/blender/release/Blender4.5/blender-4.5.9-windows-x64.zip"'
 $config+='output = "'+$part.Replace('\','/')+'"'
 $config+='range = "'+$start+'-'+$end+'"'
 $config+='fail';$config+='silent';$config+='show-error'
}
$cfg=Join-Path $toolsDir 'download.config';$config | Set-Content -LiteralPath $cfg
foreach($proc in $processes){$proc.WaitForExit();if($proc.ExitCode -ne 0){throw 'Blender download failed'}}
foreach($p in $parts){if((Get-Item -LiteralPath $p.path).Length -ne $p.length){throw 'Unexpected chunk length'}}
$combined=Join-Path $toolsDir 'blender-complete.zip'
$out=[IO.File]::Create($combined)
try{foreach($path in @($original)+@($parts | ForEach-Object {$_.path})){$inputStream=[IO.File]::OpenRead($path);try{$inputStream.CopyTo($out)}finally{$inputStream.Dispose()}}}finally{$out.Dispose()}
if((Get-Item -LiteralPath $combined).Length -ne $total){throw 'Unexpected archive length'}
Expand-Archive -LiteralPath $combined -DestinationPath $toolsDir -Force
Write-Output 'Blender portable ready'
