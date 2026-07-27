using DeskHub.Api.Models;

namespace DeskHub.Api.DTOs;

// Lectura
public class BookingDto
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;

    public int SpaceId { get; set; }
    public string SpaceName { get; set; } = string.Empty;
    public string OfficeName { get; set; } = string.Empty;

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// Creación
public class BookingCreateDto
{
    public int UserId { get; set; }
    public int SpaceId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}