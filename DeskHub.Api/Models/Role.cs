namespace DeskHub.Api.Models;

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Admin, Manager, Employee

    public ICollection<User> Users { get; set; } = new List<User>();
}