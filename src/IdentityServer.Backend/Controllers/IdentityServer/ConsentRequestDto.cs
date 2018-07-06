using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public class ConsentRequestDto
    {
        [Required]
        public string Button { get; set; }

        public IEnumerable<string> ScopesConsented { get; set; }

        public bool RememberConsent { get; set; }

        [Url]
        [Required]
        public string ReturnUrl { get; set; }
    }
}
