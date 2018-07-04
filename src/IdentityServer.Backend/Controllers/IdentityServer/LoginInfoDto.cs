using System.Collections.Generic;
using System.Linq;

namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public class LoginInfoDto
    {
        public string Username { get; set; }

        public string ReturnUrl { get; set; }

        public bool AllowRememberLogin { get; set; }

        public bool EnableLocalLogin { get; set; }

        public IEnumerable<ExternalProvider> ExternalProviders { get; set; }
    }
}
