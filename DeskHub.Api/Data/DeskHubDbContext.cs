using Microsoft.EntityFrameworkCore;
using DeskHub.Api.Models;

namespace DeskHub.Api.Data;

public class DeskHubDbContext : DbContext
{
    // Se llenará automáticamente con la empresa del usuario autenticado
    // cuando implementemos JWT. Mientras tanto, null = sin filtro (ve todo).
    public int? CurrentCompanyId { get; set; }

    public DeskHubDbContext(DbContextOptions<DeskHubDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Office> Offices => Set<Office>();
    public DbSet<Space> Spaces => Set<Space>();
    public DbSet<SpaceType> SpaceTypes => Set<SpaceType>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Índices únicos
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Company>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        // Guardar el enum de Booking.Status como texto legible en la BD
        modelBuilder.Entity<Booking>()
            .Property(b => b.Status)
            .HasConversion<string>();

        // Evitar múltiples rutas de cascada al borrar una Company:
        // Company → Users se restringe (no cascada)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Company)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        // Company → Offices sí puede seguir en cascada
        modelBuilder.Entity<Office>()
            .HasOne(o => o.Company)
            .WithMany(c => c.Offices)
            .HasForeignKey(o => o.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        // GLOBAL QUERY FILTERS — aíslan los datos por empresa automáticamente.
        // Mientras CurrentCompanyId sea null (aún no hay JWT), no restringen nada.
        modelBuilder.Entity<Office>()
            .HasQueryFilter(o => CurrentCompanyId == null || o.CompanyId == CurrentCompanyId);

        modelBuilder.Entity<User>()
            .HasQueryFilter(u => CurrentCompanyId == null || u.CompanyId == CurrentCompanyId);

        modelBuilder.Entity<Space>()
            .HasQueryFilter(s => CurrentCompanyId == null || s.Office!.CompanyId == CurrentCompanyId);

        modelBuilder.Entity<Booking>()
            .HasQueryFilter(b => CurrentCompanyId == null || b.Space!.Office!.CompanyId == CurrentCompanyId);

        base.OnModelCreating(modelBuilder);
    }
}