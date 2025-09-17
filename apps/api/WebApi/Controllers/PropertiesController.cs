using Microsoft.AspNetCore.Mvc;
using RealEstate.Api.Infrastructure.Repositories;
using RealEstate.Api.Application;
using RealEstate.Api.Application.Dto;

namespace RealEstate.Api.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyRepository _repo;

    public PropertiesController(IPropertyRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<ActionResult<PageResult<PropertyDto>>> Get(
        [FromQuery] string? name,
        [FromQuery] string? address,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = "createdAt",
        [FromQuery] string? sortDir = "desc")
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);

        var (items, total) = await _repo.SearchAsync(name, address, minPrice, maxPrice, page, pageSize, sortBy, sortDir);
        var dtos = items.Select(x => x.ToDto()).ToArray();
        var totalPages = (int)Math.Ceiling(total / (double)pageSize);

        return Ok(new PageResult<PropertyDto>(dtos, page, pageSize, total, totalPages));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PropertyDto>> GetById([FromRoute] string id)
    {
        var prop = await _repo.GetByIdAsync(id);
        if (prop is null) return NotFound();
        return Ok(prop.ToDto());
    }
}
