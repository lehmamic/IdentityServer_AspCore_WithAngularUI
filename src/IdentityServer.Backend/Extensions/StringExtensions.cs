using System;

namespace IdentityServer.Backend.Extensions
{
    public static class StringExtensions
    {
        public static Uri ToUri(this string input)
        {
            return new Uri(input, UriKind.RelativeOrAbsolute);
        }
    }
}
