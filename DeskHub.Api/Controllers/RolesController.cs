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
public class RolesController : ControllerBase
{
    private readonly DeskHubDbContext _context;

    public RolesController(DeskHubDbContext context)
    {
        _context = context;
    }

    private static RoleDto ToDto(Role r) => new() { Id = r.Id, Name = r.Name };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetRoles()
    {
        var roles = await _context.Roles.ToListAsync();
        return roles.Select(ToDto).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoleDto>> GetRole(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null) return NotFound();
        return ToDto(role);
    }

    [HttpPost]
    [AllowAnonymous] // ⚠️ TEMPORAL — quitar después de sembrar datos iniciales en producción
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoleDto>> CreateRole(RoleCreateDto dto)
    {
        var role = new Role { Name = dto.Name };
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRole), new { id = role.Id }, ToDto(role));
    }
}