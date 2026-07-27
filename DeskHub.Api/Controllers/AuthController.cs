using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DeskHub.Api.Data;
using DeskHub.Api.DTOs;
using DeskHub.Api.Services;

namespace DeskHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DeskHubDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(DeskHubDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
        {
            return Unauthorized("Correo o contraseña incorrectos.");
        }

        bool passwordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!passwordValid)
        {
            return Unauthorized("Correo o contraseña incorrectos.");
        }

        var token = _tokenService.GenerateToken(user);

        return new AuthResponseDto
        {
            UserId = user.Id,   // ← nuevo
            Token = token,
            FullName = user.FullName,
            Email = user.Email,
            CompanyId = user.CompanyId,
            CompanyName = user.Company?.Name ?? string.Empty,
            RoleId = user.RoleId,
            RoleName = user.Role?.Name ?? string.Empty
        };
    }
}