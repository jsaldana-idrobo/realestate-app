using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using RealEstate.Api.Domain;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;

namespace RealEstate.Api.Infrastructure.Mongo;

public class MongoContext
{
    public IMongoDatabase Db { get; }
    public IMongoCollection<Property> Properties { get; }
    private readonly SemaphoreSlim _indexLock = new(1, 1);
    private bool _indexesEnsured;
    private bool _schemaEnsured;

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

    public async Task EnsureSchemaAsync()
    {
        if (_schemaEnsured) return;

        await _indexLock.WaitAsync();
        try
        {
            if (_schemaEnsured) return;

            var raw = Db.GetCollection<BsonDocument>(Properties.CollectionNamespace.CollectionName);
            var filter = Builders<BsonDocument>.Filter.Type("price", BsonType.String);
            var docs = await raw
                .Find(filter)
                .Project(new BsonDocument
                {
                    { "_id", 1 },
                    { "price", 1 }
                })
                .ToListAsync();

            if (docs.Count > 0)
            {
                var writes = new List<WriteModel<BsonDocument>>(docs.Count);

                foreach (var doc in docs)
                {
                    if (!doc.TryGetValue("price", out var priceValue) || priceValue.BsonType != BsonType.String)
                        continue;

                    if (!decimal.TryParse(priceValue.AsString, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed))
                        continue;

                    var update = Builders<BsonDocument>.Update.Set("price", BsonDecimal128.Create(parsed));
                    writes.Add(new UpdateOneModel<BsonDocument>(
                        Builders<BsonDocument>.Filter.Eq("_id", doc["_id"]),
                        update));
                }

                if (writes.Count > 0)
                {
                    await raw.BulkWriteAsync(writes);
                }
            }

            _schemaEnsured = true;
        }
        finally
        {
            _indexLock.Release();
        }
    }
}
