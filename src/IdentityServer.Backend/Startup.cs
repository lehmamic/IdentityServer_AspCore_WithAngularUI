﻿using IdentityServer.Backend.Utils;
using IdentityServer4;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IdentityServer.Backend
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddCors(options =>
            {
                // this defines a CORS policy called "default"
                options.AddPolicy("default", policy =>
                {
                    // client & identity server ports => require for the redicrect statement in a rest call (e.g. post login).
                    policy.WithOrigins("http://localhost:4200", "http://localhost:4201")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            services.AddAntiforgery(options => options.HeaderName = "X-XSRF-TOKEN");

            // configure identity server with in-memory stores, keys, clients and scopes
            services.AddIdentityServer(opt =>
                {
                    opt.UserInteraction.LoginUrl = "http://localhost:4200/login";
                    opt.UserInteraction.LogoutUrl = "http://localhost:4200/logout";
                    opt.UserInteraction.ConsentUrl = "http://localhost:4200/consent";
                })
                .AddDeveloperSigningCredential()
                .AddInMemoryIdentityResources(Config.GetIdentityResources())
                .AddInMemoryApiResources(Config.GetApiResources())
                .AddInMemoryClients(Config.GetClients())
                .AddTestUsers(Config.GetUsers());

            services.AddAuthentication()
                .AddGoogle("Google", options =>
                {
                    options.SignInScheme = IdentityServerConstants.ExternalCookieAuthenticationScheme;

                    options.ClientId = "1043908805033-5sc9s6iavhd8n6ck4uvpaol8oi84hq57.apps.googleusercontent.com";
                    options.ClientSecret = "7ARLbMr1fujHyfyTKsxgsw9R";
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseCors("default");
            app.UseAntiforgeryToken();

            app.UseIdentityServer();

            app.UseHttpsRedirection();
            app.UseMvc();
        }
    }
}
