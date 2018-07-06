using System.Collections.Generic;
using System.Security.Claims;
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Test;

namespace IdentityServer.Backend
{
  public class Config
  {
    // scopes define the resources in your system
    public static IEnumerable<IdentityResource> GetIdentityResources()
    {
      return new List<IdentityResource>
      {
        new IdentityResources.OpenId(),
        new IdentityResources.Profile(),
        new IdentityResources.Email(), // not in the original example => to add email IdentityResources / ClientAllowedScopes must be added and the client needs to requestthis scope.
      };
    }

    public static IEnumerable<ApiResource> GetApiResources()
    {
      return new List<ApiResource>
      {
        new ApiResource("api1", "My API")
      };
    }

    // clients want to access resources (aka scopes)
    public static IEnumerable<Client> GetClients()
    {
      // client credentials client
      return new List<Client>
      {
        // JavaScript Client
        new Client
        {
          ClientId = "singleapp",
          ClientName = "JavaScript Client",
          AllowedGrantTypes = GrantTypes.Implicit,
          AllowAccessTokensViaBrowser = true,
          AllowOfflineAccess = false, // required for silent renewal

          RedirectUris = { "http://localhost:4201" },
          PostLogoutRedirectUris = { "http://localhost:4201/unauthorized" },
          AllowedCorsOrigins = { "http://localhost:4200", "http://localhost:4201" },
          RequireConsent = true,
          AllowedScopes =
          {
            IdentityServerConstants.StandardScopes.OpenId,
            IdentityServerConstants.StandardScopes.Profile,
            IdentityServerConstants.StandardScopes.Email,
            "api1"
          },
        },
      };
    }

    public static List<TestUser> GetUsers()
    {
      return new List<TestUser>
      {
        new TestUser
        {
          SubjectId = "1",
          Username = "alice",
          Password = "password",

          Claims = new List<Claim>
          {
            new Claim("name", "Alice"),
            new Claim("website", "https://alice.com")
          }
        },
        new TestUser
        {
          SubjectId = "2",
          Username = "bob",
          Password = "password",

          Claims = new List<Claim>
          {
            new Claim("name", "Bob"),
            new Claim("website", "https://bob.com")
          }
        }
      };
    }
  }
}