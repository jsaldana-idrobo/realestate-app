using Microsoft.Extensions.Options;
using MongoDB.Driver;
using RealEstate.Api.Domain;

namespace RealEstate.Api.Infrastructure.Mongo;

public class MongoContext
{
    public IMongoDatabase Db { get; }
    public IMongoCollection<Property> Properties { get; }

    public MongoContext(IOptions<MongoOptions> options)
    {
        var o = options.Value ?? throw new ArgumentNullException(nameof(options));

        var client = new MongoClient(o.Uri);
        Db = client.GetDatabase(o.Database);
        Properties = Db.GetCollection<Property>(o.PropertiesCollection);
    }
}
