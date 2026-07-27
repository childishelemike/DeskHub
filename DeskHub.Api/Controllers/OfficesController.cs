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
public class OfficesController : ControllerBase
{
    private readonly DeskHubDbContext _context;

    public OfficesController(DeskHubDbContext context)
    {
        _context = context;
    }

    private static OfficeDto ToDto(Office o) => new()
    {
        Id = o.Id,
        Name = o.Name,
        Address = o.Address,
        City = o.City,
        CompanyId = o.CompanyId,
        CompanyName = o.Company?.Name ?? string.Empty,
        OpeningTime = o.OpeningTime,
        ClosingTime = o.ClosingTime,
        WorkingDays = o.WorkingDays
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OfficeDto>>> GetOffices()
    {
        var offices = await _context.Offices.Include(o => o.Company).ToListAsync();
        return offices.Select(ToDto).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OfficeDto>> GetOffice(int id)
    {
        var office = await _context.Offices.Include(o => o.Company).FirstOrDefaultAsync(o => o.Id == id);
        if (office == null) return NotFound();
        return ToDto(office);
    }

    [HttpPost]
[Authorize(Roles = "Admin")]
    public async Task<ActionResult<OfficeDto>> CreateOffice(OfficeCreateDto dto)
    {
        var companyExists = await _context.Companies.AnyAsync(c => c.Id == dto.CompanyId);
        if (!companyExists) return BadRequest($"No existe una empresa con Id {dto.CompanyId}");

        if (dto.OpeningTime >= dto.ClosingTime)
        {
            return BadRequest("La hora de apertura debe ser anterior a la hora de cierre.");
        }

        var office = new Office
        {
            Name = dto.Name,
            Address = dto.Address,
            City = dto.City,
            CompanyId = dto.CompanyId,
            OpeningTime = dto.OpeningTime,
            ClosingTime = dto.ClosingTime,
            WorkingDays = dto.WorkingDays
        };

        _context.Offices.Add(office);
        await _context.SaveChangesAsync();
        await _context.Entry(office).Reference(o => o.Company).LoadAsync();

        return CreatedAtAction(nameof(GetOffice), new { id = office.Id }, ToDto(office));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOffice(int id, OfficeCreateDto dto)
    {
        var office = await _context.Offices.FindAsync(id);
        if (office == null) return NotFound();

        if (dto.OpeningTime >= dto.ClosingTime)
        {
            return BadRequest("La hora de apertura debe ser anterior a la hora de cierre.");
        }

        office.Name = dto.Name;
        office.Address = dto.Address;
        office.City = dto.City;
        office.OpeningTime = dto.OpeningTime;
        office.ClosingTime = dto.ClosingTime;
        office.WorkingDays = dto.WorkingDays;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteOffice(int id)
    {
        var office = await _context.Offices.FindAsync(id);
        if (office == null) return NotFound();

        _context.Offices.Remove(office);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}