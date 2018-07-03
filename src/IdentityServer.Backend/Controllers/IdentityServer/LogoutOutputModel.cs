namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public class LogoutOutputModel : LogoutInputModel
    {
        public bool ShowLogoutPrompt { get; set; }
    }
}
