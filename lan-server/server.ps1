# Server Valley — Zero-Install Windows Classroom LAN Server (Built-in PowerShell)
param(
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$RootDir = Split-Path -Parent $PSScriptRoot
$Rooms = @{}

function Get-Room([string]$code) {
  if ([string]::IsNullOrWhiteSpace($code)) { $code = "CLASS1" }
  $code = $code.ToUpper()
  if (-not $Rooms.ContainsKey($code)) {
    $Rooms[$code] = @{
      players   = @{}
      coopUnits = New-Object System.Collections.Generic.HashSet[int]
      chats     = New-Object System.Collections.ArrayList
      seq       = 0
    }
  }
  return $Rooms[$code]
}

function Get-LanIp {
  try {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
      $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" -and $_.PrefixOrigin -ne "WellKnown"
    } | Select-Object -First 1 -ExpandProperty IPAddress)
    if ($ip) { return $ip }
  } catch {}
  return "127.0.0.1"
}

function Get-MimeType([string]$path) {
  switch ([System.IO.Path]::GetExtension($path).ToLower()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css"  { return "text/css; charset=utf-8" }
    ".js"   { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".png"  { return "image/png" }
    ".svg"  { return "image/svg+xml" }
    ".ico"  { return "image/x-icon" }
    default { return "application/octet-stream" }
  }
}

function Send-Response($stream, [int]$status, [string]$statusText, [string]$contentType, [byte[]]$bodyBytes) {
  $header = "HTTP/1.1 $status $statusText`r`n" +
            "Access-Control-Allow-Origin: *`r`n" +
            "Access-Control-Allow-Methods: GET, POST, OPTIONS`r`n" +
            "Access-Control-Allow-Headers: Content-Type`r`n" +
            "Content-Type: $contentType`r`n" +
            "Content-Length: $($bodyBytes.Length)`r`n" +
            "Connection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($bodyBytes.Length -gt 0) {
    $stream.Write($bodyBytes, 0, $bodyBytes.Length)
  }
  $stream.Flush()
}

$lanIp = Get-LanIp
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
$listener.Start()

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  SERVER VALLEY — CLASSROOM LAN SERVER (Windows PowerShell)" -ForegroundColor Yellow
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  เครื่องครู (Local) : http://localhost:$Port" -ForegroundColor Green
Write-Host "  วง LAN ห้องแล็บ    : http://${lanIp}:$Port" -ForegroundColor Green
Write-Host "  วิธีใช้งาน: ให้นักเรียนเปิดเบราว์เซอร์เข้า http://${lanIp}:$Port"
Write-Host "  แล้วกดปุ่ม '👥 เล่นกับเพื่อน' -> แท็บ LAN ห้องแล็บ -> กดเชื่อมต่อ!"
Write-Host "  กด Ctrl+C เพื่อหยุดเซิร์ฟเวอร์" -ForegroundColor Gray
Write-Host "==============================================================" -ForegroundColor Cyan

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 3000
      $client.SendTimeout = 3000
      $stream = $client.GetStream()
      $buf = New-Object byte[] 65536
      $ms = New-Object System.IO.MemoryStream
      $headerEnd = -1
      $contentLength = 0

      while ($true) {
        $read = $stream.Read($buf, 0, $buf.Length)
        if ($read -le 0) { break }
        $ms.Write($buf, 0, $read)
        $bytes = $ms.ToArray()
        if ($headerEnd -lt 0) {
          $strSoFar = [System.Text.Encoding]::ASCII.GetString($bytes)
          $idx = $strSoFar.IndexOf("`r`n`r`n")
          if ($idx -ge 0) {
            $headerEnd = $idx + 4
            if ($strSoFar -match "Content-Length:\s*(\d+)") {
              $contentLength = [int]$Matches[1]
            }
          }
        }
        if ($headerEnd -ge 0 -and $bytes.Length -ge ($headerEnd + $contentLength)) { break }
      }

      $allBytes = $ms.ToArray()
      if ($headerEnd -lt 0) { continue }

      $headerStr = [System.Text.Encoding]::ASCII.GetString($allBytes, 0, $headerEnd)
      $firstLine = ($headerStr -split "`r`n")[0]
      $parts = $firstLine -split " "
      if ($parts.Length -lt 2) { continue }
      $method = $parts[0].ToUpper()
      $rawPath = ($parts[1] -split "\?")[0]

      if ($method -eq "OPTIONS") {
        Send-Response $stream 204 "No Content" "text/plain" ([byte[]]@())
        continue
      }

      $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

      if ($method -eq "POST" -and $rawPath -eq "/api/sync") {
        $bodyStr = [System.Text.Encoding]::UTF8.GetString($allBytes, $headerEnd, $allBytes.Length - $headerEnd)
        $payload = $bodyStr | ConvertFrom-Json
        $room = Get-Room $payload.room

        if ($payload.player -and $payload.player.id) {
          $pObj = $payload.player
          $pObj | Add-Member -NotePropertyName "lastSeenServer" -NotePropertyValue $now -Force
          $room.players[$pObj.id] = $pObj
          if ($payload.coopShared -ne $false -and $pObj.completedUnits) {
            foreach ($u in $pObj.completedUnits) { [void]$room.coopUnits.Add([int]$u) }
          }
        }

        # Remove stale players (>12s)
        $staleKeys = @()
        foreach ($k in $room.players.Keys) {
          if (($now - [long]$room.players[$k].lastSeenServer) -gt 12) { $staleKeys += $k }
        }
        foreach ($k in $staleKeys) { $room.players.Remove($k) }

        $lastSeq = 0
        if ($payload.lastChatSeq) { $lastSeq = [int]$payload.lastChatSeq }
        $newChats = @()
        foreach ($c in $room.chats) {
          if ([int]$c.seq -gt $lastSeq) { $newChats += $c }
        }

        $respObj = @{
          ok        = $true
          players   = @($room.players.Values)
          coopUnits = @($room.coopUnits)
          chats     = $newChats
        }
        $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($respObj | ConvertTo-Json -Depth 6 -Compress))
        Send-Response $stream 200 "OK" "application/json; charset=utf-8" $jsonBytes
        continue
      }

      if ($method -eq "POST" -and $rawPath -eq "/api/chat") {
        $bodyStr = [System.Text.Encoding]::UTF8.GetString($allBytes, $headerEnd, $allBytes.Length - $headerEnd)
        $payload = $bodyStr | ConvertFrom-Json
        $room = Get-Room $payload.room
        if ($payload.entry -and $payload.entry.text) {
          $room.seq++
          $entry = $payload.entry
          $entry | Add-Member -NotePropertyName "seq" -NotePropertyValue $room.seq -Force
          [void]$room.chats.Add($entry)
          while ($room.chats.Count -gt 80) { $room.chats.RemoveAt(0) }
        }
        $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes((@{ ok = $true; seq = $room.seq } | ConvertTo-Json -Compress))
        Send-Response $stream 200 "OK" "application/json; charset=utf-8" $jsonBytes
        continue
      }

      # Static file serving
      if ($method -eq "GET") {
        $rel = [Uri]::UnescapeDataString($rawPath.TrimStart("/"))
        if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
        $fullPath = [System.IO.Path]::GetFullPath((Join-Path $RootDir $rel))
        if ($fullPath.StartsWith($RootDir) -and (Test-Path $fullPath -PathType Leaf)) {
          $fileBytes = [System.IO.File]::ReadAllBytes($fullPath)
          Send-Response $stream 200 "OK" (Get-MimeType $fullPath) $fileBytes
        } else {
          $nf = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
          Send-Response $stream 404 "Not Found" "text/plain; charset=utf-8" $nf
        }
        continue
      }

      $na = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
      Send-Response $stream 405 "Method Not Allowed" "text/plain" $na
    } catch {
      # Ignore transient broken sockets
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
