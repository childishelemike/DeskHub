namespace DeskHub.Api.Models;

public class Space
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;

    public double PositionX { get; set; }
    public double PositionY { get; set; }

    public int OfficeId { get; set; }
    public Office? Office { get; set; }

    public int SpaceTypeId { get; set; }
    public SpaceType? SpaceType { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}