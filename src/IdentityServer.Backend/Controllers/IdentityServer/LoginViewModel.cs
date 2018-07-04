using System.Collections.Generic;
using System.Linq;

namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public class LoginViewModel
    {
        public string Username { get; set; }

        public string ReturnUrl { get; set; }

        public bool AllowRememberLogin { get; set; }

        public bool EnableLocalLogin { get; set; }

        public IEnumerable<ExternalProvider> ExternalProviders { get; set; }

        public IEnumerable<ExternalProvider> VisibleExternalProviders => this.ExternalProviders.Where(x => !string.IsNullOrWhiteSpace(x.DisplayName));

        public bool IsExternalLoginOnly => EnableLocalLogin == false && this.ExternalProviders?.Count() == 1;

        public string ExternalLoginScheme => IsExternalLoginOnly ? this.ExternalProviders?.SingleOrDefault()?.AuthenticationScheme : null;
    }
}
