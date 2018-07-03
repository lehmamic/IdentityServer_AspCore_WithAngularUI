using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel;
using IdentityServer.Backend.Filters;
using IdentityServer4;
using IdentityServer4.Events;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using IdentityServer4.Test;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServer.Backend.Controllers.IdentityServer
{

    [SecurityHeaders]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly TestUserStore users;
        private readonly IIdentityServerInteractionService interaction;
        private readonly IClientStore clientStore;
        private readonly IAuthenticationSchemeProvider schemeProvider;
        private readonly IEventService events;

        public AccountController(
                    IIdentityServerInteractionService interaction,
                    IClientStore clientStore,
                    IAuthenticationSchemeProvider schemeProvider,
                    IEventService events,
                    TestUserStore users = null)
        {
            // if the TestUserStore is not in DI, then we'll just use the global users collection
            // this is where you would plug in your own custom identity management library (e.g. ASP.NET Identity)
            this.users = users ?? new TestUserStore(TestUsers.Users);
            this.interaction = interaction;
            this.clientStore = clientStore;
            this.schemeProvider = schemeProvider;
            this.events = events;
        }

        /// <summary>
        /// Handle postback from username/password login
        /// </summary>
        [HttpPost("login")]
        //[ValidateAntiForgeryToken]
        public async Task<IActionResult> Login([FromBody]LoginInputModel model)
        {
            if (ModelState.IsValid)
            {
                // validate username/password against in-memory store
                if (this.users.ValidateCredentials(model.Username, model.Password))
                {
                    var user = this.users.FindByUsername(model.Username);
                    await this.events.RaiseAsync(new UserLoginSuccessEvent(user.Username, user.SubjectId, user.Username));

                    // only set explicit expiration here if user chooses "remember me". 
                    // otherwise we rely upon expiration configured in cookie middleware.
                    AuthenticationProperties props = null;
                    if (AccountOptions.AllowRememberLogin && model.RememberLogin)
                    {
                        props = new AuthenticationProperties
                        {
                            IsPersistent = true,
                            ExpiresUtc = DateTimeOffset.UtcNow.Add(AccountOptions.RememberMeLoginDuration)
                        };
                    };

                    // issue authentication cookie with subject ID and username
                    //var claims = new List<Claim>
                    //{
                    //    new Claim(JwtClaimTypes.Subject, user.SubjectId),
                    //    new Claim(JwtClaimTypes.Name, user.Username),
                    //};

                    //var claimsIdentity = new ClaimsIdentity(
                        //claims, 
                        //IdentityServerConstants.DefaultCookieAuthenticationScheme);

                    await HttpContext.SignInAsync(user.SubjectId, user.Username, props);

                    // make sure the returnUrl is still valid, and if so redirect back to authorize endpoint or a local page
                    // the IsLocalUrl check is only necessary if you want to support additional local pages, otherwise IsValidReturnUrl is more strict
                    //if (this.interaction.IsValidReturnUrl(model.ReturnUrl) || Url.IsLocalUrl(model.ReturnUrl))
                    {
                        return Ok(new { ReturnUrl = model.ReturnUrl });
                    }

                    // return Ok(new { ReturnUrl = "~/" });
                }

                await this.events.RaiseAsync(new UserLoginFailureEvent(model.Username, "invalid credentials"));
            }

            // something went wrong, show form with error
            return this.Unauthorized();
        }
    }
}