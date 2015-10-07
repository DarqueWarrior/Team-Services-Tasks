param(
    [string]$AzureWebsiteName,    
    [string]$From,
    [string]$To
)

# Use Set-AzureWebsite -Name mysite -SlotStickyConnectionStringNames @("myconn")
Write-Verbose "Starting swap from $From to $To on $AzureWebsiteName"

Switch-AzureWebsiteSlot -Name $AzureWebsiteName -Slot1 $From -Slot2 $To -Force -Verbose

Write-Verbose "Swap complete"