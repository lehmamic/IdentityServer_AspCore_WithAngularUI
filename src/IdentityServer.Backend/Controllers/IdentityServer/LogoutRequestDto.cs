using System.ComponentModel.DataAnnotations;

namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public class LogoutRequestDto
    {
        [Required]
        public string LogoutId { get; set; }
    }
}
