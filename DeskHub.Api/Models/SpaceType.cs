namespace DeskHub.Api.Models;

public class SpaceType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Escritorio, Sala de reuniones, Cabina

    public ICollection<Space> Spaces { get; set; } = new List<Space>();
}