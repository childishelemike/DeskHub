namespace DeskHub.Api.DTOs;

public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class RoleCreateDto
{
    public string Name { get; set; } = string.Empty;
}