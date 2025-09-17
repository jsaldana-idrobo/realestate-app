namespace RealEstate.Api.Infrastructure.Mongo;

public class MongoOptions
{
    public string Uri { get; set; } = "mongodb://localhost:27017";
    public string Database { get; set; } = "realestate";
    public string PropertiesCollection { get; set; } = "properties";
    public bool SeedOnStart { get; set; } = false;
}
