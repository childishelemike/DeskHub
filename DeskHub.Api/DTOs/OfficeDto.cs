namespace DeskHub.Api.DTOs;

public class OfficeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public TimeSpan OpeningTime { get; set; }
    public TimeSpan ClosingTime { get; set; }
    public string WorkingDays { get; set; } = string.Empty;
}

public class OfficeCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public TimeSpan OpeningTime { get; set; } = new TimeSpan(7, 0, 0);
    public TimeSpan ClosingTime { get; set; } = new TimeSpan(17, 0, 0);
    public string WorkingDays { get; set; } = "1,2,3,4,5";
}