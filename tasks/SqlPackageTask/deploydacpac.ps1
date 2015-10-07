# The purpose of this script is to create an Azure SQL Database and server if 
# it does not already exist.  If the server already exist it will not be 
# modified.  If the database already exist it will not be recreated.

param(
    [Parameter(Mandatory = $true)] 
    [String]$ConnectedServiceName, 

    [parameter(Mandatory=$true, HelpMessage="The server login name" )]
    [string]$userName,
    
    [parameter(Mandatory=$true, HelpMessage="The server login password")]
    [string]$password,
    
    [parameter(HelpMessage="The regional to create the server")]
    [string]$location = "Central US",
    
    [parameter(Mandatory=$true)]
    [string]$dbName,
    
    [parameter(HelpMessage="The pricing tier of the server")]
    [string]$dbEdition = "Standard",

    [parameter(HelpMessage="If provided will be used to search for an exsiting server")]
    [string]$serverName,
    
    [parameter(HelpMessage="Path to dacpac file to deploy")]
    [string]$dacpacPath,

    [parameter(HelpMessage="Specifies the type of SQL Database Server to create. Accepts values 2.0 or 12.0")]
    [single]$version = 12.0,

    [parameter(Mandatory=$true, HelpMessage="The unique ID used to look up values in the WebOps store")]
    [string]$releaseID,

    [parameter(Mandatory=$true, HelpMessage="The URL to a Web Service that provides an API for getting your external IP and storing Key Value pairs. http://www.donovanbrown.com/post/2015/05/15/i-need-my-external-ip-in-my-powershell")]
    [string]$webOpsStoreURL,

    [parameter(HelpMessage="Additional arguments to pass to SqlPackage.exe")]
    [string]$additionalArgs
)

Write-Host "Starting Azure DacPac Deployer"
Write-Host "ConnectedServiceName= $ConnectedServiceName"

$currentDir = (Get-Item -Path ".\" -Verbose).FullName
$sqlPackageDir = [System.IO.Path]::Combine($currentDir, "bin")
$sqlPackagePath = [System.IO.Path]::Combine($sqlPackageDir, "sqlpackage.exe")

if (![System.IO.File]::Exists($sqlPackagePath))
{
	throw "Could not find $sqlPackagePath"
}

#Find the package to deploy 
import-module "Microsoft.TeamFoundation.DistributedTask.Task.Common" 


Write-Host "packageFile = Find-Files -SearchPattern $dacpacPath" 
$packageFile = Find-Files -SearchPattern $dacpacPath 
Write-Host "packageFile = $packageFile" 

$server = $null

try
{
    # if they did not provide a server name search the WebOps store
    if([System.String]::IsNullOrEmpty($serverName) -eq $true)
    {
        # Use the releaseID and search the WebOps Store for a database server
        try
        {
            $webOpsStore = "$webOpsStoreURL/valueitems/$releaseID/?key=serverName"
            Write-Host "Searching WebOps store ($webOpsStore) for databae server name"
            $serverName = Invoke-RestMethod -Uri $webOpsStore
            Write-Host "Databae server name $serverName was found"
        }
        catch [Net.WebException]
        {
            Write-Host "A Net.WebException was thrown"
            [System.Net.HttpWebResponse] $resp = [System.Net.HttpWebResponse] $_.Exception.Response
        
            # this just means a record has not been stored yet
            if($resp.StatusCode -eq[System.Net.HttpStatusCode]::NotFound)
            {
                Write-Host "Server name was not found in WebOps store"
                $serverName = $null
            }
            else
            {
                throw $_.Exception
            }
        }
    }

    # if they provided a server name or we found one in the WebOps store try and find it
    if([System.String]::IsNullOrEmpty($serverName) -eq $false)
    {
        Write-Host "Trying to locate server $serverName"
        $server = Get-AzureSqlDatabaseServer -ServerName $serverName -ErrorAction SilentlyContinue -WarningAction SilentlyContinue

        if($server -eq $null)
        {
            Write-Host "Server $serverName was not found"
        }
        else
        {
            Write-Host "Server $serverName located"
        }
    }
    
    # if the server could not be found create the database server
    if($server -eq $null)
    {       
        Write-Host "Creating new server" 
        $server = New-AzureSqlDatabaseServer -Location $location -AdministratorLogin $userName -AdministratorLoginPassword $password -Version $version
        $serverName = $server.ServerName
        Write-Host "Server $serverName was created"
        
        # store the server name in the WebOps store
        Write-Host "Storing $serverName in WebOps store"
        Invoke-RestMethod -Uri "$webOpsStoreURL/valueitems/" -Method Post -Body @{"Id"="$releaseID"; "Key"="serverName"; "Value"="$serverName"}  | Out-Null
    }

    #get my external ip address
    Write-Host "Getting agent IP Address"
    $myip = Invoke-RestMethod -Uri "$webOpsStoreURL/ip"

    Write-Host "Trying to locate firewall rule for IP Address $myip"
    if((Get-AzureSqlDatabaseServerFirewallRule -ServerName $serverName -WarningAction SilentlyContinue |  Where-Object {$_.StartIpAddress -eq $myip -or $_.EndIpAddress -eq $myip}) -eq $null)
    {
        Write-Host "Adding firewall rule for IP address $myip"
        New-AzureSqlDatabaseServerFirewallRule -ServerName $server.ServerName -RuleName "AgentAccess" -StartIpAddress $myip -EndIpAddress $myip | Out-Null
    }
    else
    {
        Write-Host "Firewall rule for IP address $myip already exists"
    }

    #create your creds
    Write-Host "Creating credentials for $userName"
    $servercredential = new-object System.Management.Automation.PSCredential($userName, ($password  | ConvertTo-SecureString -asPlainText -Force))

    #create a connection context
    Write-Host "Connecting to server $serverName"
    $ctx = $server | New-AzureSqlDatabaseServerContext -Credential $serverCredential 

    Write-Host "Trying to locate database $dbName"
    $database = Get-AzureSqlDatabase -ConnectionContext $ctx -DatabaseName $dbName -ErrorAction SilentlyContinue -WarningAction SilentlyContinue
    if($database -eq $null)
    {
        #create database
        Write-Host "Creating new database named $dbName" 
        New-AzureSqlDatabase -ConnectionContext $ctx -DatabaseName $dbName -Edition $dbEdition | Out-Null
        Write-Host "Database $dbName created"
    }
    else
    {
        Write-Host "Database $dbName already exists"
    }

    Write-Host "Publishing database changes from $packageFile"
    & "$sqlPackagePath" /Action:Publish /SourceFile:$packageFile /TargetConnectionString:"Data Source=$serverName.database.windows.net;User ID=$userName;Password=$password;Initial Catalog=$dbName" $additionalArgs
}
Catch
{
    Write-Error $_
}