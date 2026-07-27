using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using DeskHub.Api.Data;
using DeskHub.Api.Models;
using DeskHub.Api.DTOs;

namespace DeskHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly DeskHubDbContext _context;

    public BookingsController(DeskHubDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userId!);
    }

    private bool IsAdminOrManager()
    {
        return User.IsInRole("Admin") || User.IsInRole("Manager");
    }

    private static BookingDto ToDto(Booking b) => new()
    {
        Id = b.Id,
        UserId = b.UserId,
        UserName = b.User?.FullName ?? string.Empty,
        SpaceId = b.SpaceId,
        SpaceName = b.Space?.Name ?? string.Empty,
        OfficeName = b.Space?.Office?.Name ?? string.Empty,
        StartTime = b.StartTime,
        EndTime = b.EndTime,
        Status = b.Status.ToString(),
        CreatedAt = b.CreatedAt
    };

    // GET: api/bookings
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookings()
    {
        var query = _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Space).ThenInclude(s => s!.Office)
            .AsQueryable();

        if (!IsAdminOrManager())
        {
            var currentUserId = GetCurrentUserId();
            query = query.Where(b => b.UserId == currentUserId);
        }

        var bookings = await query.OrderByDescending(b => b.StartTime).ToListAsync();
        return bookings.Select(ToDto).ToList();
    }

    // GET: api/bookings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> GetBooking(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Space).ThenInclude(s => s!.Office)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null) return NotFound();

        if (!IsAdminOrManager() && booking.UserId != GetCurrentUserId())
        {
            return Forbid();
        }

        return ToDto(booking);
    }

    // GET: api/bookings/by-space/3
    [HttpGet("by-space/{spaceId}")]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookingsBySpace(int spaceId)
    {
        var bookings = await _context.Bookings
            .Where(b => b.SpaceId == spaceId && b.Status == BookingStatus.Confirmed)
            .Include(b => b.User)
            .Include(b => b.Space).ThenInclude(s => s!.Office)
            .OrderBy(b => b.StartTime)
            .ToListAsync();

        return bookings.Select(ToDto).ToList();
    }

    // POST: api/bookings
    [HttpPost]
    public async Task<ActionResult<BookingDto>> CreateBooking(BookingCreateDto dto)
    {
        // 0. Autorización: un Employee solo puede reservar para sí mismo
        if (!IsAdminOrManager() && dto.UserId != GetCurrentUserId())
        {
            return Forbid();
        }

        // 1. Validar que el horario sea coherente
        if (dto.EndTime <= dto.StartTime)
        {
            return BadRequest("La hora de fin debe ser posterior a la hora de inicio.");
        }

        if (dto.StartTime < DateTime.UtcNow)
        {
            return BadRequest("No se pueden crear reservas en el pasado.");
        }

        // 2. Validar que el usuario y el espacio existan
        var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists) return BadRequest($"No existe un usuario con Id {dto.UserId}");

        var space = await _context.Spaces
            .Include(s => s.Office)
            .FirstOrDefaultAsync(s => s.Id == dto.SpaceId);

        if (space == null) return BadRequest($"No existe un espacio con Id {dto.SpaceId}");

        if (!space.IsActive)
        {
            return BadRequest("Este espacio no está disponible para reservas.");
        }

        if (space.Office == null)
        {
            return BadRequest("El espacio no tiene una oficina asociada válida.");
        }

        // 3. VALIDACIÓN DE HORARIO DE OPERACIÓN
        var startTimeOfDay = dto.StartTime.TimeOfDay;
        var endTimeOfDay = dto.EndTime.TimeOfDay;

        if (startTimeOfDay < space.Office.OpeningTime || endTimeOfDay > space.Office.ClosingTime)
        {
            return BadRequest(
                $"La oficina '{space.Office.Name}' opera de {space.Office.OpeningTime:hh\\:mm} a {space.Office.ClosingTime:hh\\:mm}. " +
                "La reserva debe estar completamente dentro de ese horario.");
        }

        // 4. VALIDACIÓN DE DÍA LABORAL
        var allowedDays = space.Office.WorkingDays
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(d => int.Parse(d.Trim()))
            .ToHashSet();

        int requestedDay = (int)dto.StartTime.DayOfWeek;

        if (!allowedDays.Contains(requestedDay))
        {
            var dayNames = new[] { "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado" };
            return BadRequest(
                $"La oficina '{space.Office.Name}' no opera los {dayNames[requestedDay]}s. " +
                "Selecciona un día laboral.");
        }

        // 5. LA REGLA CLAVE: verificar que no haya solapamiento de horarios
        bool hasOverlap = await _context.Bookings.AnyAsync(b =>
            b.SpaceId == dto.SpaceId &&
            b.Status == BookingStatus.Confirmed &&
            dto.StartTime < b.EndTime &&
            dto.EndTime > b.StartTime);

        if (hasOverlap)
        {
            return Conflict("Ya existe una reserva confirmada para este espacio en ese horario.");
        }

        // 6. Crear la reserva
        var booking = new Booking
        {
            UserId = dto.UserId,
            SpaceId = dto.SpaceId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Status = BookingStatus.Confirmed
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        await _context.Entry(booking).Reference(b => b.User).LoadAsync();
        await _context.Entry(booking).Reference(b => b.Space).LoadAsync();
        await _context.Entry(booking.Space!).Reference(s => s.Office).LoadAsync();

        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, ToDto(booking));
    }

    // PUT: api/bookings/5/cancel
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        if (!IsAdminOrManager() && booking.UserId != GetCurrentUserId())
        {
            return Forbid();
        }

        if (booking.Status != BookingStatus.Confirmed)
        {
            return BadRequest("Solo se pueden cancelar reservas confirmadas.");
        }

        booking.Status = BookingStatus.Cancelled;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT: api/bookings/5/checkin
    [HttpPut("{id}/checkin")]
    public async Task<IActionResult> CheckIn(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        if (!IsAdminOrManager() && booking.UserId != GetCurrentUserId())
        {
            return Forbid();
        }

        if (booking.Status != BookingStatus.Confirmed)
        {
            return BadRequest("Solo se puede hacer check-in en reservas confirmadas.");
        }

        booking.Status = BookingStatus.Completed;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/bookings/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        if (!IsAdminOrManager() && booking.UserId != GetCurrentUserId())
        {
            return Forbid();
        }

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}