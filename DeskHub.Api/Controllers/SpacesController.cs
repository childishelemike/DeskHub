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
public class SpacesController : ControllerBase
{
    private readonly DeskHubDbContext _context;

    public SpacesController(DeskHubDbContext context)
    {
        _context = context;
    }

    private static SpaceDto ToDto(Space s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Capacity = s.Capacity,
        IsActive = s.IsActive,
        PositionX = s.PositionX,
        PositionY = s.PositionY,
        OfficeId = s.OfficeId,
        OfficeName = s.Office?.Name ?? string.Empty,
        SpaceTypeId = s.SpaceTypeId,
        SpaceTypeName = s.SpaceType?.Name ?? string.Empty
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SpaceDto>>> GetSpaces()
    {
        var spaces = await _context.Spaces
            .Include(s => s.Office)
            .Include(s => s.SpaceType)
            .ToListAsync();

        return spaces.Select(ToDto).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SpaceDto>> GetSpace(int id)
    {
        var space = await _context.Spaces
            .Include(s => s.Office)
            .Include(s => s.SpaceType)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (space == null) return NotFound();
        return ToDto(space);
    }

    [HttpGet("by-office/{officeId}")]
    public async Task<ActionResult<IEnumerable<SpaceDto>>> GetSpacesByOffice(int officeId)
    {
        var spaces = await _context.Spaces
            .Where(s => s.OfficeId == officeId && s.IsActive)
            .Include(s => s.Office)
            .Include(s => s.SpaceType)
            .ToListAsync();

        return spaces.Select(ToDto).ToList();
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<SpaceDto>> CreateSpace(SpaceCreateDto dto)
    {
        var officeExists = await _context.Offices.AnyAsync(o => o.Id == dto.OfficeId);
        if (!officeExists) return BadRequest($"No existe una oficina con Id {dto.OfficeId}");

        var typeExists = await _context.SpaceTypes.AnyAsync(t => t.Id == dto.SpaceTypeId);
        if (!typeExists) return BadRequest($"No existe un tipo de espacio con Id {dto.SpaceTypeId}");

        var space = new Space
            {
                Name = dto.Name,
                Capacity = dto.Capacity,
                IsActive = dto.IsActive,
                PositionX = dto.PositionX,
                PositionY = dto.PositionY,
                OfficeId = dto.OfficeId,
                SpaceTypeId = dto.SpaceTypeId
            };

        _context.Spaces.Add(space);
        await _context.SaveChangesAsync();

        await _context.Entry(space).Reference(s => s.Office).LoadAsync();
        await _context.Entry(space).Reference(s => s.SpaceType).LoadAsync();

        return CreatedAtAction(nameof(GetSpace), new { id = space.Id }, ToDto(space));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateSpace(int id, SpaceCreateDto dto)
    {
        var space = await _context.Spaces.FindAsync(id);
        if (space == null) return NotFound();

        space.Name = dto.Name;
        space.Capacity = dto.Capacity;
        space.IsActive = dto.IsActive;
        space.PositionX = dto.PositionX;
        space.PositionY = dto.PositionY;
        space.OfficeId = dto.OfficeId;
        space.SpaceTypeId = dto.SpaceTypeId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> DeleteSpace(int id)
    {
        var space = await _context.Spaces.FindAsync(id);
        if (space == null) return NotFound();

        _context.Spaces.Remove(space);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}