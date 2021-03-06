﻿using System.Linq;
using System.Threading.Tasks;
using IdentityServer.Backend.Extensions;
using IdentityServer.Backend.Utils;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace IdentityServer.Backend.Controllers.IdentityServer
{
    [SecurityHeaders]
    [Route("api/[controller]")]
    public class ConsentController : ControllerBase
    {
        private readonly IIdentityServerInteractionService interaction;
        private readonly IClientStore clientStore;
        private readonly IResourceStore resourceStore;
        private readonly ILogger<ConsentController> logger;

        public ConsentController(
            IIdentityServerInteractionService interaction,
            IClientStore clientStore,
            IResourceStore resourceStore,
            ILogger<ConsentController> logger)
        {
            this.interaction = interaction;
            this.clientStore = clientStore;
            this.resourceStore = resourceStore;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Index(string returnUrl)
        {
            ConsentInfoDto dto = await this.BuildConsentInfoDtoAsync(returnUrl);
            if (dto != null)
            {
                return Ok(dto);
            }

            return BadRequest();
        }

        [HttpPost]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index([FromBody]ConsentRequestDto model)
        {
            if(!this.ModelState.IsValid)
            {
                BadRequest(ModelState);
            }

            var result = await this.ProcessConsent(model);

            if (result.IsRedirect)
            {
                return Ok(new RedirectResultDto { RedirectUrl = result.RedirectUri });
            }

            if (result.HasValidationError)
            {
                ModelState.AddModelError("", result.ValidationError);
            }

            return BadRequest(ModelState);
        }

        private async Task<ProcessConsentResult> ProcessConsent(ConsentRequestDto model)
        {
            var result = new ProcessConsentResult();

            ConsentResponse grantedConsent = null;

            // user clicked 'no' - send back the standard 'access_denied' response
            if (model.Button == "no")
            {
                grantedConsent = ConsentResponse.Denied;
            }
            // user clicked 'yes' - validate the data
            else if (model.Button == "yes" && model != null)
            {
                // if the user consented to some scope, build the response model
                if (model.ScopesConsented != null && model.ScopesConsented.Any())
                {
                    var scopes = model.ScopesConsented;
                    if (ConsentOptions.EnableOfflineAccess == false)
                    {
                        scopes = scopes.Where(x => x != IdentityServer4.IdentityServerConstants.StandardScopes.OfflineAccess);
                    }

                    grantedConsent = new ConsentResponse
                    {
                        RememberConsent = model.RememberConsent,
                        ScopesConsented = scopes.ToArray()
                    };
                }
                else
                {
                    result.ValidationError = ConsentOptions.MustChooseOneErrorMessage;
                }
            }
            else
            {
                result.ValidationError = ConsentOptions.InvalidSelectionErrorMessage;
            }

            if (grantedConsent != null)
            {
                // validate return url is still valid
                var request = await this.interaction.GetAuthorizationContextAsync(model.ReturnUrl.ToUri().PathAndQuery);
                if (request == null)
                {
                    return result;
                }

                // communicate outcome of consent back to identityserver
                await this.interaction.GrantConsentAsync(request, grantedConsent);

                // indicate that's it ok to redirect back to authorization endpoint
                result.RedirectUri = model.ReturnUrl;
            }

            return result;
        }

        private async Task<ConsentInfoDto> BuildConsentInfoDtoAsync(string returnUrl, ConsentRequestDto model = null)
        {
            var request = await this.interaction.GetAuthorizationContextAsync(returnUrl.ToUri().PathAndQuery);
            if (request != null)
            {
                var client = await this.clientStore.FindEnabledClientByIdAsync(request.ClientId);
                if (client != null)
                {
                    var resources = await this.resourceStore.FindEnabledResourcesByScopeAsync(request.ScopesRequested);
                    if (resources != null && (resources.IdentityResources.Any() || resources.ApiResources.Any()))
                    {
                        return this.CreateConsentInfoDto(model, returnUrl, request, client, resources);
                    }
                    else
                    {
                        this.logger.LogError("No scopes matching: {0}", request.ScopesRequested.Aggregate((x, y) => x + ", " + y));
                    }
                }
                else
                {
                    this.logger.LogError("Invalid client id: {0}", request.ClientId);
                }
            }
            else
            {
                this.logger.LogError("No consent request matching request: {0}", returnUrl);
            }

            return null;
        }

        private ConsentInfoDto CreateConsentInfoDto(
            ConsentRequestDto model,
            string returnUrl,
            AuthorizationRequest request,
            Client client,
            Resources resources)
        {
            // TODO: Remove the checked property and check everything automatically in the UI.
            var dto = new ConsentInfoDto
            {
                ReturnUrl = returnUrl,

                ClientName = client.ClientName ?? client.ClientId,
                ClientUrl = client.ClientUri,
                ClientLogoUrl = client.LogoUri,
                AllowRememberConsent = client.AllowRememberConsent
            };

            dto.IdentityScopes = resources.IdentityResources
                .Select(x => this.CreateScopeDto(x, true))
                .ToArray();
            
            dto.ResourceScopes = resources.ApiResources
                .SelectMany(x => x.Scopes)
                .Select(x => this.CreateScopeDto(x, true))
                .ToArray();
            
            if (ConsentOptions.EnableOfflineAccess && resources.OfflineAccess)
            {
                dto.ResourceScopes = dto.ResourceScopes.Union(
                    new ScopeDto[]
                    {
                        this.GetOfflineAccessScope(true)
                    });
            }

            return dto;
        }

        private ScopeDto CreateScopeDto(IdentityResource identity, bool check)
        {
            return new ScopeDto
            {
                Name = identity.Name,
                DisplayName = identity.DisplayName,
                Description = identity.Description,
                Emphasize = identity.Emphasize,
                Required = identity.Required,
                Checked = check || identity.Required
            };
        }

        public ScopeDto CreateScopeDto(Scope scope, bool check)
        {
            return new ScopeDto
            {
                Name = scope.Name,
                DisplayName = scope.DisplayName,
                Description = scope.Description,
                Emphasize = scope.Emphasize,
                Required = scope.Required,
                Checked = check || scope.Required
            };
        }

        private ScopeDto GetOfflineAccessScope(bool check)
        {
            return new ScopeDto
            {
                Name = IdentityServer4.IdentityServerConstants.StandardScopes.OfflineAccess,
                DisplayName = ConsentOptions.OfflineAccessDisplayName,
                Description = ConsentOptions.OfflineAccessDescription,
                Emphasize = true,
                Checked = check
            };
        }
    }
}
