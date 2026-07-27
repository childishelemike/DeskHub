namespace DeskHub.Api.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;

    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;

    public int? OfficeId { get; set; }
    public string? OfficeName { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class UserCreateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public int CompanyId { get; set; }
    public int? OfficeId { get; set; }
}