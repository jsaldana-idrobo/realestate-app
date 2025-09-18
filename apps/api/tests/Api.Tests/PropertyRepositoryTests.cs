using Microsoft.Extensions.Options;
using Mongo2Go;
using MongoDB.Bson;
using MongoDB.Driver;
using NUnit.Framework;
using RealEstate.Api.Domain;
using RealEstate.Api.Infrastructure.Mongo;
using RealEstate.Api.Infrastructure.Repositories;
using System.Collections.Generic;
using System.Linq;

namespace Api.Tests;

[TestFixture]
public class PropertyRepositoryTests
{
    private MongoDbRunner _runner = default!;
    private MongoContext _context = default!;
    private PropertyRepository _repository = default!;

    [OneTimeSetUp]
    public async Task OneTimeSetup()
    {
        _runner = MongoDbRunner.Start(singleNodeReplSet: true);

        var options = Options.Create(new MongoOptions
        {
            Uri = _runner.ConnectionString,
            Database = "realestate-tests",
            PropertiesCollection = "properties",
        });

        _context = new MongoContext(options);
        await _context.EnsureIndexesAsync();
        _repository = new PropertyRepository(_context);
    }

    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        _runner?.Dispose();
    }

    [SetUp]
    public async Task Setup()
    {
        await _context.Properties.DeleteManyAsync(FilterDefinition<Property>.Empty);

        var now = DateTime.UtcNow;
        var items = new List<Property>
        {
            new()
            {
                Id = ObjectId.GenerateNewId().ToString(),
                OwnerId = "owner-1",
                Name = "Casa Central",
                Address = "123 Main St",
                Price = 240_000m,
                ImageUrl = "https://example.com/1.jpg",
                CreatedAt = now.AddDays(-2),
                UpdatedAt = now,
            },
            new()
            {
                Id = ObjectId.GenerateNewId().ToString(),
                OwnerId = "owner-2",
                Name = "Loft Urbano",
                Address = "456 Market Ave",
                Price = 510_000m,
                ImageUrl = "https://example.com/2.jpg",
                CreatedAt = now.AddDays(-1),
                UpdatedAt = now,
            },
            new()
            {
                Id = ObjectId.GenerateNewId().ToString(),
                OwnerId = "owner-3",
                Name = "Residencia Norte",
                Address = "789 Sunset Blvd",
                Price = 780_000m,
                ImageUrl = "https://example.com/3.jpg",
                CreatedAt = now,
                UpdatedAt = now,
            },
        };

        await _context.Properties.InsertManyAsync(items);
    }

    [Test]
    public async Task SearchAsync_Filters_ByPriceRange()
    {
        var (items, total) = await _repository.SearchAsync(
            name: null,
            address: null,
            minPrice: 250_000m,
            maxPrice: 800_000m,
            page: 1,
            pageSize: 10,
            sortBy: "price",
            sortDir: "asc");

        var list = items.ToList();
        var prices = list.Select(p => p.Price).ToArray();

        Assert.Multiple(() =>
        {
            Assert.That(total, Is.EqualTo(2));
            Assert.That(prices, Is.EqualTo(new[] { 510_000m, 780_000m }));
        });
    }

    [Test]
    public async Task SearchAsync_Filters_ByNameCaseInsensitive()
    {
        var (items, total) = await _repository.SearchAsync(
            name: "residencia",
            address: null,
            minPrice: null,
            maxPrice: null,
            page: 1,
            pageSize: 5,
            sortBy: "createdAt",
            sortDir: "desc");

        Assert.That(total, Is.EqualTo(1));
        var property = items.Single();
        Assert.That(property.Name, Is.EqualTo("Residencia Norte"));
    }

    [Test]
    public async Task SearchAsync_AppliesPaginationAndSorting()
    {
        var (items, total) = await _repository.SearchAsync(
            name: null,
            address: null,
            minPrice: null,
            maxPrice: null,
            page: 1,
            pageSize: 2,
            sortBy: "createdAt",
            sortDir: "desc");

        var list = items.ToList();

        Assert.Multiple(() =>
        {
            Assert.That(total, Is.EqualTo(3));
            Assert.That(list.Count, Is.EqualTo(2));
            Assert.That(list.First().Name, Is.EqualTo("Residencia Norte"));
        });
    }
}
