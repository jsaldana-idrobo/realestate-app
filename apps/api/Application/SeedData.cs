// apps/api/Application/SeedData.cs
using RealEstate.Api.Domain;

namespace RealEstate.Api.Application;

public static class SeedData
{
    public static IEnumerable<Property> Sample()
    {
        var now = DateTime.UtcNow;

        var list = new List<Property>
        {
            new Property { OwnerId = "owner-001", Name = "Park View Apartment", Address = "123 Main St, Springfield", Price = 250000, ImageUrl = "https://picsum.photos/seed/park/800/500" },
            new Property { OwnerId = "owner-002", Name = "Sunny Loft", Address = "456 Elm St, Springfield", Price = 320000, ImageUrl = "https://picsum.photos/seed/loft/800/500" },
            new Property { OwnerId = "owner-003", Name = "Cozy Cottage", Address = "789 Oak Ave, Shelbyville", Price = 180000, ImageUrl = "https://picsum.photos/seed/cottage/800/500" },
            new Property { OwnerId = "owner-004", Name = "Modern Villa", Address = "12 Ocean Dr, Capital City", Price = 980000, ImageUrl = "https://picsum.photos/seed/villa/800/500" },
            new Property { OwnerId = "owner-005", Name = "Downtown Studio", Address = "75 Market St, Springfield", Price = 140000, ImageUrl = "https://picsum.photos/seed/studio/800/500" },
            new Property { OwnerId = "owner-006", Name = "Riverside House", Address = "41 River Rd, Ogdenville", Price = 450000, ImageUrl = "https://picsum.photos/seed/river/800/500" },
            new Property { OwnerId = "owner-007", Name = "Penthouse Elite", Address = "5 Skyline Blvd, North Haverbrook", Price = 1200000, ImageUrl = "https://picsum.photos/seed/penthouse/800/500" },
            new Property { OwnerId = "owner-008", Name = "Suburban Home", Address = "9 Maple St, Springfield", Price = 300000, ImageUrl = "https://picsum.photos/seed/suburban/800/500" },
            new Property { OwnerId = "owner-009", Name = "Country Farm", Address = "Route 7, Ruralville", Price = 520000, ImageUrl = "https://picsum.photos/seed/farm/800/500" },
            new Property { OwnerId = "owner-010", Name = "Lake Cabin", Address = "2 Pine Rd, Lakeview", Price = 210000, ImageUrl = "https://picsum.photos/seed/lake/800/500" }
        };

        // Asegura createdAt/updatedAt únicos y ordenables de forma estable
        for (int i = 0; i < list.Count; i++)
        {
            list[i].CreatedAt = now.AddSeconds(i);
            list[i].UpdatedAt = list[i].CreatedAt;
        }

        return list;
    }
}
