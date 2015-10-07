namespace WhatIsMyIP.Controllers
{
   #region using

   using System.Web.Http;

   #endregion

   public class IPController : ApiController
   {
      #region Public Methods and Operators

      public string Get()
      {
         if (this.Request.Properties.ContainsKey("MS_HttpContext"))
         {
            dynamic ctx = this.Request.Properties["MS_HttpContext"];
            if (ctx != null)
            {
               return ctx.Request.UserHostAddress;
            }
         }
         return null;
      }

      #endregion
   }
}