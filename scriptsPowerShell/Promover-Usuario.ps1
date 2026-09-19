param (
    [Parameter(Mandatory=$true)]
    [string]$Email,

    [Parameter(Mandatory=$true)]
    [ValidateSet("ADMIN_ROLE", "TEACHER_ROLE", "STUDENT_ROLE")]
    [string]$Rol,

    [string]$Grado = "",
    [string]$Seccion = ""
)

$scriptPath = Join-Path $PSScriptRoot "manage_user.cjs"
node $scriptPath promote $Email $Rol $Grado $Seccion
