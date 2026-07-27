namespace DeskHub.Api.DTOs;

public class SpaceTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class SpaceTypeCreateDto
{
    public string Name { get; set; } = string.Empty;
}