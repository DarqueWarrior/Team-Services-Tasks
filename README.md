# Custom Team Services Agent Tasks
Custom VSTS Agent Tasks I have created for demos and personal use.

The SqlPackageTask is only here for education. It was adopted by the Visual Studio Team Services team and now is in the box.

The SqlPackageTask requires a [Web API that simply returns the IP of the caller](http://www.donovanbrown.com/post/2015/05/15/i-need-my-external-ip-in-my-powershell). This is required to set the firewall rules in Azure. The WebOps project can be built using Visual Studio 2015 and hosted in a free Azure Web App. The directions on how to upload these tasks to your Visual Studio Team Services account are on [DonovanBrown.com](http://donovanbrown.com).

If you have questions ping me on [Twitter](http://twitter.com/donovanBrown).
