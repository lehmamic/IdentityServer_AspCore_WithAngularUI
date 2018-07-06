using System;

namespace IdentityServer.Backend.Controllers.IdentityServer
{
    public static class LoggedOutInfoExtensions
    {
        public static bool TriggerExternalSignout(this LoggedOutInfoDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            return dto.ExternalAuthenticationScheme != null;
        }
    }
}
