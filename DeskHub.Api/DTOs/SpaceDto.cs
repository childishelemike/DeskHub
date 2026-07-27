namespace DeskHub.Api.DTOs;

public class SpaceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsActive { get; set; }
    public double PositionX { get; set; }
    public double PositionY { get; set; }

    public int OfficeId { get; set; }
    public string OfficeName { get; set; } = string.Empty;

    public int SpaceTypeId { get; set; }
    public string SpaceTypeName { get; set; } = string.Empty;
}

public class SpaceCreateDto
{
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public int OfficeId { get; set; }
    public int SpaceTypeId { get; set; }
}