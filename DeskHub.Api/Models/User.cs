namespace DeskHub.Api.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    public int RoleId { get; set; }
    public Role? Role { get; set; }

    public int CompanyId { get; set; }
    public Company? Company { get; set; }

    public int? OfficeId { get; set; }
    public Office? Office { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}