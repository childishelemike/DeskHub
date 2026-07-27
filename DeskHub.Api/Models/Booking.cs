namespace DeskHub.Api.Models;

public enum BookingStatus
{
    Confirmed,
    Cancelled,
    Completed,
    NoShow
}

public class Booking
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public int SpaceId { get; set; }
    public Space? Space { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}