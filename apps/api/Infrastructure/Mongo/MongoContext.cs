using Microsoft.Extensions.Options;
using MongoDB.Driver;
using RealEstate.Api.Domain;
using System.Collections.Generic;
using System.Threading;

namespace RealEstate.Api.Infrastructure.Mongo;

public class MongoContext
{
    public IMongoDatabase Db { get; }
    public IMongoCollection<Property> Properties { get; }
    private readonly SemaphoreSlim _indexLock = new(1, 1);
    private bool _indexesEnsured;

    public MongoContext(IOptions<MongoOptions> options)
    {
        var o = options.Value ?? throw new ArgumentNullException(nameof(options));

        var client = new MongoClient(o.Uri);
        Db = client.GetDatabase(o.Database);
        Properties = Db.GetCollection<Property>(o.PropertiesCollection);
    }

    public async Task EnsureIndexesAsync()
    {
        if (_indexesEnsured) return;

        await _indexLock.WaitAsync();
        try
        {
            if (_indexesEnsured) return;

            var models = new List<CreateIndexModel<Property>>
            {
                new(
                    Builders<Property>.IndexKeys.Ascending(p => p.Price),
                    new CreateIndexOptions { Name = "idx_properties_price" }
                ),
                new(
                    Builders<Property>.IndexKeys.Descending(p => p.CreatedAt).Descending(p => p.Id),
                    new CreateIndexOptions { Name = "idx_properties_created_desc_id_desc" }
                ),
                new(
                    Builders<Property>.IndexKeys.Ascending(p => p.Name),
                    new CreateIndexOptions
                    {
                        Name = "idx_properties_name",
                        Collation = new Collation("en", strength: CollationStrength.Secondary),
                    }
                ),
                new(
                    Builders<Property>.IndexKeys.Ascending(p => p.Address),
                    new CreateIndexOptions
                    {
                        Name = "idx_properties_address",
                        Collation = new Collation("en", strength: CollationStrength.Secondary),
                    }
                ),
            };

            await Properties.Indexes.CreateManyAsync(models);
            _indexesEnsured = true;
        }
        finally
        {
            _indexLock.Release();
        }
    }
}
