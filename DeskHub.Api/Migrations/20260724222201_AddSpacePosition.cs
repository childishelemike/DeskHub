using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeskHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSpacePosition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "PositionX",
                table: "Spaces",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "PositionY",
                table: "Spaces",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PositionX",
                table: "Spaces");

            migrationBuilder.DropColumn(
                name: "PositionY",
                table: "Spaces");
        }
    }
}
