# Zip Task
This is a Node.js based task so it will work on Linux, Mac and PC. Simply point it at a folder and give it a destination path and a zip will be produced. 

I needed this to work with ASP.NET Core RC2 projects.  After the dotnet publish command I needed to zip up the folder to deploy to Azure.

Clone repo and run:
npm install

Then use [tfx](https://www.npmjs.com/package/tfx-cli) to upload to your Team Services account.  You can learn how on [DonovanBrown.com](http://donovanbrown.com).

To test run: npm test

If you have questions ping me on [Twitter](http://twitter.com/donovanBrown).