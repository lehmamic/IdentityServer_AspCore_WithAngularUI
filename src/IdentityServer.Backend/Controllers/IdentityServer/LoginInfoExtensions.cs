using System;
using System.Linq;

namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public static class LoginInfoExtensions
    {
        public static bool IsExternalLoginOnly(this LoginInfoDto dto)
        {
            if(dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            return dto.EnableLocalLogin == false && dto.ExternalProviders?.Count() == 1;
        }

        public static string ExternalLoginScheme(this LoginInfoDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            return dto.IsExternalLoginOnly() ? dto.ExternalProviders?.SingleOrDefault()?.AuthenticationScheme : null;
        }
    }
}
