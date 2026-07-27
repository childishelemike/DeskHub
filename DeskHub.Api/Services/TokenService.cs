using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using DeskHub.Api.Models;

namespace DeskHub.Api.Services;

public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),   // ← antes era JwtRegisteredClaimNames.Sub
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("companyId", user.CompanyId.ToString()),
            new("roleId", user.RoleId.ToString()),
            new(ClaimTypes.Role, user.Role?.Name ?? string.Empty),
            new(ClaimTypes.Name, user.FullName)
        };  

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresMinutes = double.Parse(_config["Jwt:ExpiresInMinutes"] ?? "120");

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}