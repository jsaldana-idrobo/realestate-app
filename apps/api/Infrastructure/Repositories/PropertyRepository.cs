// apps/api/Infrastructure/Repositories/PropertyRepository.cs
using MongoDB.Bson;
using MongoDB.Driver;
using RealEstate.Api.Domain;
using RealEstate.Api.Infrastructure.Mongo;

namespace RealEstate.Api.Infrastructure.Repositories;

public interface IPropertyRepository
{
    Task<(IEnumerable<Property> items, long total)> SearchAsync(
        string? name, string? address, decimal? minPrice, decimal? maxPrice,
        int page, int pageSize, string? sortBy, string? sortDir);

    Task<Property?> GetByIdAsync(string id);
}

public class PropertyRepository : IPropertyRepository
{
    private readonly IMongoCollection<Property> _coll;
    private static readonly Collation CaseInsensitiveCollation = new("en", strength: CollationStrength.Secondary);

    public PropertyRepository(MongoContext ctx)
    {
        _coll = ctx.Properties;
    }

    public async Task<Property?> GetByIdAsync(string id)
    {
        var filter = Builders<Property>.Filter.Eq(p => p.Id, id);
        return await _coll.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<(IEnumerable<Property> items, long total)> SearchAsync(
        string? name, string? address, decimal? minPrice, decimal? maxPrice,
        int page, int pageSize, string? sortBy, string? sortDir)
    {
        // ---- Filters (sin $text para evitar conflicto con $regex en OR) ----
        var filters = new List<FilterDefinition<Property>>();

        if (!string.IsNullOrWhiteSpace(name))
        {
            filters.Add(
                Builders<Property>.Filter.Regex(
                    p => p.Name, new BsonRegularExpression(name, "i"))
            );
        }

        if (!string.IsNullOrWhiteSpace(address))
        {
            filters.Add(
                Builders<Property>.Filter.Regex(
                    p => p.Address, new BsonRegularExpression(address, "i"))
            );
        }

        if (minPrice.HasValue)
            filters.Add(Builders<Property>.Filter.Gte(p => p.Price, minPrice.Value));

        if (maxPrice.HasValue)
            filters.Add(Builders<Property>.Filter.Lte(p => p.Price, maxPrice.Value));

        var filter = filters.Count > 0
            ? Builders<Property>.Filter.And(filters)
            : Builders<Property>.Filter.Empty;

        var total = await _coll.CountDocumentsAsync(filter, new CountOptions
        {
            Collation = CaseInsensitiveCollation,
        });

        // ---- Sort estable (tie-breaker por Id) ----
        var sortBuilder = Builders<Property>.Sort;
        var sortDefs = new List<SortDefinition<Property>>();

        switch (sortBy?.ToLowerInvariant())
        {
            case "price":
                sortDefs.Add(sortDir?.ToLowerInvariant() == "asc"
                    ? sortBuilder.Ascending(p => p.Price)
                    : sortBuilder.Descending(p => p.Price));
                break;

            case "name":
                sortDefs.Add(sortDir?.ToLowerInvariant() == "asc"
                    ? sortBuilder.Ascending(p => p.Name)
                    : sortBuilder.Descending(p => p.Name));
                break;

            case "createdat":
            default:
                sortDefs.Add(sortDir?.ToLowerInvariant() == "asc"
                    ? sortBuilder.Ascending(p => p.CreatedAt)
                    : sortBuilder.Descending(p => p.CreatedAt));
                break;
        }

        // Desempate consistente cuando hay muchos createdAt iguales
        sortDefs.Add(sortBuilder.Descending(p => p.Id));

        var sort = sortBuilder.Combine(sortDefs);

        // ---- Query paginada ----
        var findOptions = new FindOptions<Property>
        {
            Collation = CaseInsensitiveCollation,
            Sort = sort,
            Skip = (page - 1) * pageSize,
            Limit = pageSize,
        };

        using var cursor = await _coll.FindAsync(filter, findOptions);
        var items = await cursor.ToListAsync();

        return (items, total);
    }
}
