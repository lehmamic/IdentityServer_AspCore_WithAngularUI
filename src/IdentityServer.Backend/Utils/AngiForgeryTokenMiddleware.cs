using System.Threading.Tasks;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;

namespace IdentityServer.Backend.Utils
{
    public class AntiforgeryTokenMiddleware
    {
        private readonly RequestDelegate next;
        private readonly IAntiforgery antiforgery;

        public AntiforgeryTokenMiddleware(RequestDelegate next, IAntiforgery antiforgery)
        {
            this.next = next;
            this.antiforgery = antiforgery;
        }

        public Task Invoke(HttpContext context)
        {
            if (context.Request.Path == "/")
            {
                var tokens = antiforgery.GetAndStoreTokens(context);
                context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, new CookieOptions { HttpOnly = false });
            }
            return next(context);
          }
    }
}
