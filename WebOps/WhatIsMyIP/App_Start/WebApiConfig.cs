namespace WhatIsMyIP
{
   #region using

   using System.Web.Http;

   #endregion

   public static class WebApiConfig
   {
      #region Public Methods and Operators

      public static void Register(HttpConfiguration config)
      {
         // Web API configuration and services

         // Web API routes
         config.MapHttpAttributeRoutes();

         config.Routes.MapHttpRoute(name: "DefaultApi", routeTemplate: "api/{controller}/{id}", defaults: new { id = RouteParameter.Optional });
      }

      #endregion
   }
}