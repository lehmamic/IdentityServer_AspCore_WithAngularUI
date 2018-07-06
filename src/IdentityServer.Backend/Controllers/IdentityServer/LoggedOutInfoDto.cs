namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public class LoggedOutInfoDto
    {
        public string LogoutId { get; set; }

        public string PostLogoutRedirectUri { get; set; }

        public string ClientName { get; set; }

        public string SignOutIframeUrl { get; set; }

        public bool AutomaticRedirectAfterSignOut { get; set; }

        public string ExternalAuthenticationScheme { get; set; }
    }
}
