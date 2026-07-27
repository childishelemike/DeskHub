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
public class SpaceTypesController : ControllerBase
{
    private readonly DeskHubDbContext _context;

    public SpaceTypesController(DeskHubDbContext context)
    {
        _context = context;
    }

    private static SpaceTypeDto ToDto(SpaceType s) => new() { Id = s.Id, Name = s.Name };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SpaceTypeDto>>> GetSpaceTypes()
    {
        var types = await _context.SpaceTypes.ToListAsync();
        return types.Select(ToDto).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SpaceTypeDto>> GetSpaceType(int id)
    {
        var type = await _context.SpaceTypes.FindAsync(id);
        if (type == null) return NotFound();
        return ToDto(type);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<SpaceTypeDto>> CreateSpaceType(SpaceTypeCreateDto dto)
    {
        var type = new SpaceType { Name = dto.Name };
        _context.SpaceTypes.Add(type);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSpaceType), new { id = type.Id }, ToDto(type));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateSpaceType(int id, SpaceTypeCreateDto dto)
    {
        var type = await _context.SpaceTypes.FindAsync(id);
        if (type == null) return NotFound();

        type.Name = dto.Name;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> DeleteSpaceType(int id)
    {
        var type = await _context.SpaceTypes.FindAsync(id);
        if (type == null) return NotFound();

        _context.SpaceTypes.Remove(type);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}