using System;
using System.Threading.Tasks;
using IdentityModel;
using IdentityServer.Backend.Filters;
using IdentityServer4;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
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
                        return Ok(new RedirectResultDto { RedirectUrl = model.ReturnUrl });
                    }

                    // return Ok(new RedirectResultDto { ReturnUrl = "~/" });
                }

                await this.events.RaiseAsync(new UserLoginFailureEvent(model.Username, "invalid credentials"));
            }

            // something went wrong, show form with error
            return this.Unauthorized();
        }

        [HttpGet("logout")]
        public async Task<IActionResult> Logout(string logoutId)
        {
            // build a model so the logout page knows what to display
            var dto = await BuildLogoutOutputModelAsync(logoutId);

            if (dto.ShowLogoutPrompt == false)
            {
                // if the request for logout was properly authenticated from IdentityServer, then
                // we don't need to show the prompt and can just log the user out directly.
                return await Logout(dto);
            }

            return Ok(dto);
        }

        /// <summary>
        /// Handle logout page postback
        /// </summary>
        [HttpPost("logout")]
        //[ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout(LogoutInputModel model)
        {
            //// build a model so the logged out page knows what to display
            var dto = await this.BuildLoggedOutOutputModelAsync(model.LogoutId);

            if (User?.Identity.IsAuthenticated == true)
            {
                // delete local authentication cookie
                await HttpContext.SignOutAsync();

                // raise the logout event
                await this.events.RaiseAsync(new UserLogoutSuccessEvent(User.GetSubjectId(), User.GetDisplayName()));
            }

            //// check if we need to trigger sign-out at an upstream identity provider
            //if (vm.TriggerExternalSignout)
            //{
            //    // build a return URL so the upstream provider will redirect back
            //    // to us after the user has logged out. this allows us to then
            //    // complete our single sign-out processing.
            //    string url = Url.Action("Logout", new { logoutId = vm.LogoutId });

            //    // this triggers a redirect to the external provider for sign-out
            //    return SignOut(new AuthenticationProperties { RedirectUri = url }, vm.ExternalAuthenticationScheme);
            //}

            return Ok(dto);
        }

        private async Task<LogoutOutputModel> BuildLogoutOutputModelAsync(string logoutId)
        {
            var dto = new LogoutOutputModel { LogoutId = logoutId, ShowLogoutPrompt = AccountOptions.ShowLogoutPrompt };

            if (User?.Identity.IsAuthenticated != true)
            {
                // if the user is not authenticated, then just show logged out page
                dto.ShowLogoutPrompt = false;
                return dto;
            }

            var context = await this.interaction.GetLogoutContextAsync(logoutId);
            if (context?.ShowSignoutPrompt == false)
            {
                // it's safe to automatically sign-out
                dto.ShowLogoutPrompt = false;
                return dto;
            }

            // show the logout prompt. this prevents attacks where the user
            // is automatically signed out by another malicious web page.
            return dto;
        }

        private async Task<LoggedOutOutputModel> BuildLoggedOutOutputModelAsync(string logoutId)
        {
            // get context information (client name, post logout redirect URI and iframe for federated signout)
            var logout = await this.interaction.GetLogoutContextAsync(logoutId);

            var dto = new LoggedOutOutputModel
            {
                AutomaticRedirectAfterSignOut = AccountOptions.AutomaticRedirectAfterSignOut,
                PostLogoutRedirectUri = logout?.PostLogoutRedirectUri,
                ClientName = string.IsNullOrEmpty(logout?.ClientName) ? logout?.ClientId : logout?.ClientName,
                SignOutIframeUrl = logout?.SignOutIFrameUrl,
                LogoutId = logoutId
            };

            if (User?.Identity.IsAuthenticated == true)
            {
                var idp = User.FindFirst(JwtClaimTypes.IdentityProvider)?.Value;
                if (idp != null && idp != IdentityServerConstants.LocalIdentityProvider)
                {
                    var providerSupportsSignout = await HttpContext.GetSchemeSupportsSignOutAsync(idp);
                    if (providerSupportsSignout)
                    {
                        if (dto.LogoutId == null)
                        {
                            // if there's no current logout context, we need to create one
                            // this captures necessary info from the current logged in user
                            // before we signout and redirect away to the external IdP for signout
                            dto.LogoutId = await this.interaction.CreateLogoutContextAsync();
                        }

                        dto.ExternalAuthenticationScheme = idp;
                    }
                }
            }

            return dto;
        }
    }
}