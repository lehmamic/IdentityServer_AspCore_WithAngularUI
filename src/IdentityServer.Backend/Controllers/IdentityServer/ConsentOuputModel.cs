using System.Collections.Generic;

namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public class ConsentOutputModel : ConsentInputModel
    {
        public string ClientName { get; set; }

        public string ClientUrl { get; set; }

        public string ClientLogoUrl { get; set; }

        public bool AllowRememberConsent { get; set; }

        public IEnumerable<ScopeDto> IdentityScopes { get; set; }

        public IEnumerable<ScopeDto> ResourceScopes { get; set; }
    }
}
