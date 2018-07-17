using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using System.Net.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace AuthBackend
{
    public static class MainFunction
    {
        [FunctionName("get-token")]
        public static async Task<IActionResult> GetTokenAsync([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)]HttpRequest req, TraceWriter log)
        {
            try
            {
                // Get the body
                var requestBody = new StreamReader(req.Body).ReadToEnd();
                dynamic data = JsonConvert.DeserializeObject(requestBody);

                // Data
                string clientId = data.client_id;
                string scope = data.scope;
                string code = data.code;
                string redirectUrl = data.redirect_uri;

                // Encode the request data
                var encodedData = new Dictionary<string, string>
                {
                    { "client_id", clientId },
                    { "scope", scope },
                    { "code", code },
                    { "redirect_uri", redirectUrl },
                    { "grant_type", "authorization_code" },
                    { "client_secret", GetClientSecretForId(clientId) }
                };

                // Send the request and return the data
                using (var client = new HttpClient())
                {
                    var response = await client.PostAsync("https://login.microsoftonline.com/common/oauth2/v2.0/token",
                        new FormUrlEncodedContent(encodedData));

                    return new OkObjectResult(await response.Content.ReadAsAsync<dynamic>());
                }
            }
            catch (Exception ex)
            {
                // Log the error
                log.Error(ex.Message, ex);

                return new BadRequestObjectResult(new
                {
                    error = "Unknown Error",
                    error_description = "An error has occured. Please try again."
                });
            }
        }

        [FunctionName("refresh-token")]
        public static async Task<IActionResult> RefreshTokenAsync([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)]HttpRequest req, TraceWriter log)
        {
            try
            {
                // Get the body
                var requestBody = new StreamReader(req.Body).ReadToEnd();
                dynamic data = JsonConvert.DeserializeObject(requestBody);

                // Data
                string clientId = data.client_id;
                string scope = data.scope;
                string refreshToken = data.refresh_token;
                string redirectUrl = data.redirect_uri;

                // Encode the request data
                var encodedData = new Dictionary<string, string>
                {
                    { "client_id", clientId },
                    { "scope", scope },
                    { "refresh_token", refreshToken },
                    { "redirect_uri", redirectUrl },
                    { "grant_type", "refresh_token" },
                    { "client_secret", GetClientSecretForId(clientId) }
                };

                // Send the request and return the data
                using (var client = new HttpClient())
                {
                    var response = await client.PostAsync("https://login.microsoftonline.com/common/oauth2/v2.0/token",
                        new FormUrlEncodedContent(encodedData));

                    return new OkObjectResult(await response.Content.ReadAsAsync<dynamic>());
                }
            }
            catch (Exception ex)
            {
                // Log the error
                log.Error(ex.Message, ex);

                return new BadRequestObjectResult(new
                {
                    error = "Unknown Error",
                    error_description = "An error has occured. Please try again."
                });
            }
        }

        private static string GetClientSecretForId(string clientId)
        {
            switch (clientId)
            {
                // Chrome
                case "70c5f06f-cef4-4541-a705-1adeea3fa58f":
                    return Environment.GetEnvironmentVariable("chrome_client_secret");

                // Firefox
                case "6a421ae0-f2b1-4cf9-84e0-857dc0a4c9a3":
                    return Environment.GetEnvironmentVariable("firefox_client_secret");

                // Generic
                case "3e8214c9-265d-42b6-aa93-bdd810fda5e6":
                    return Environment.GetEnvironmentVariable("generic_client_secret");
                default:
                    return string.Empty;
            }
        }
    }
}