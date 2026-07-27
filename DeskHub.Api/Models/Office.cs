namespace DeskHub.Api.Models;

public class Office
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;

    public int CompanyId { get; set; }
    public Company? Company { get; set; }

    public TimeSpan OpeningTime { get; set; } = new TimeSpan(7, 0, 0);
    public TimeSpan ClosingTime { get; set; } = new TimeSpan(17, 0, 0);

    // Días laborales permitidos: 0=Domingo, 1=Lunes ... 6=Sábado, separados por coma
    public string WorkingDays { get; set; } = "1,2,3,4,5";

    public ICollection<Space> Spaces { get; set; } = new List<Space>();
    public ICollection<User> Users { get; set; } = new List<User>();
}