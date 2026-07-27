namespace DeskHub.Api.Models;

public class Company
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty; // ej: "acme-corp" — identificador único legible
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Office> Offices { get; set; } = new List<Office>();
    public ICollection<User> Users { get; set; } = new List<User>();
}