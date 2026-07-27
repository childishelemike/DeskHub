using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DeskHub.Api.Data;
using DeskHub.Api.Models;
using DeskHub.Api.DTOs;

namespace DeskHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly DeskHubDbContext _context;

    public CompaniesController(DeskHubDbContext context)
    {
        _context = context;
    }

    private static CompanyDto ToDto(Company c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        IsActive = c.IsActive,
        CreatedAt = c.CreatedAt
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CompanyDto>>> GetCompanies()
    {
        var companies = await _context.Companies.ToListAsync();
        return companies.Select(ToDto).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyDto>> GetCompany(int id)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null) return NotFound();
        return ToDto(company);
    }

    [HttpPost]
    public async Task<ActionResult<CompanyDto>> CreateCompany(CompanyCreateDto dto)
    {
        var slugExists = await _context.Companies.AnyAsync(c => c.Slug == dto.Slug);
        if (slugExists) return BadRequest("Ya existe una empresa con ese slug.");

        var company = new Company
        {
            Name = dto.Name,
            Slug = dto.Slug
        };

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCompany), new { id = company.Id }, ToDto(company));
    }
}