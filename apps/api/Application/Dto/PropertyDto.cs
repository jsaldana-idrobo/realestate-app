namespace RealEstate.Api.Application.Dto;

public record PropertyDto(
    string propertyId,       // 👈 nuevo
    string idOwner,
    string name,
    string addressProperty,
    decimal priceProperty,
    string image
);

public record PageResult<T>(
    IEnumerable<T> items,
    int page,
    int pageSize,
    long total,
    int totalPages
);
