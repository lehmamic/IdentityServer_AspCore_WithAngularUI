using System.ComponentModel.DataAnnotations;

namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public class LoginRequestDto
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        public bool RememberLogin { get; set; }

        [Url]
        [Required]
        public string ReturnUrl { get; set; }
    }
}