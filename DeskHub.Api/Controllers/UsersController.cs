using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using DeskHub.Api.Data;
using DeskHub.Api.Models;
using DeskHub.Api.DTOs;

namespace DeskHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly DeskHubDbContext _context;

    public UsersController(DeskHubDbContext context)
    {
        _context = context;
    }

    private static UserDto ToDto(User u) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        RoleId = u.RoleId,
        RoleName = u.Role?.Name ?? string.Empty,
        CompanyId = u.CompanyId,
        CompanyName = u.Company?.Name ?? string.Empty,
        OfficeId = u.OfficeId,
        OfficeName = u.Office?.Name,
        CreatedAt = u.CreatedAt
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Company)
            .Include(u => u.Office)
            .ToListAsync();

        return users.Select(ToDto).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Company)
            .Include(u => u.Office)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();
        return ToDto(user);
    }

    [HttpGet("by-company/{companyId}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersByCompany(int companyId)
    {
        var users = await _context.Users
            .Where(u => u.CompanyId == companyId)
            .Include(u => u.Role)
            .Include(u => u.Company)
            .Include(u => u.Office)
            .ToListAsync();

        return users.Select(ToDto).ToList();
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> CreateUser(UserCreateDto dto)
    {
        var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (emailExists) return BadRequest("Ya existe un usuario con este correo.");

        var companyExists = await _context.Companies.AnyAsync(c => c.Id == dto.CompanyId);
        if (!companyExists) return BadRequest($"No existe una empresa con Id {dto.CompanyId}");

        var roleExists = await _context.Roles.AnyAsync(r => r.Id == dto.RoleId);
        if (!roleExists) return BadRequest($"No existe un rol con Id {dto.RoleId}");

        if (dto.OfficeId.HasValue)
        {
            var office = await _context.Offices.FindAsync(dto.OfficeId.Value);
            if (office == null) return BadRequest($"No existe una oficina con Id {dto.OfficeId}");

            if (office.CompanyId != dto.CompanyId)
                return BadRequest("La oficina seleccionada no pertenece a la empresa indicada.");
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = dto.RoleId,
            CompanyId = dto.CompanyId,
            OfficeId = dto.OfficeId
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        await _context.Entry(user).Reference(u => u.Role).LoadAsync();
        await _context.Entry(user).Reference(u => u.Company).LoadAsync();
        if (user.OfficeId.HasValue)
            await _context.Entry(user).Reference(u => u.Office).LoadAsync();

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, ToDto(user));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(int id, UserCreateDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        if (user.Email != dto.Email)
        {
            var emailTaken = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id);
            if (emailTaken) return BadRequest("Ya existe otro usuario con este correo.");
        }

        if (dto.OfficeId.HasValue)
        {
            var office = await _context.Offices.FindAsync(dto.OfficeId.Value);
            if (office == null) return BadRequest($"No existe una oficina con Id {dto.OfficeId}");

            if (office.CompanyId != dto.CompanyId)
                return BadRequest("La oficina seleccionada no pertenece a la empresa indicada.");
        }

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.RoleId = dto.RoleId;
        user.CompanyId = dto.CompanyId;
        user.OfficeId = dto.OfficeId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}