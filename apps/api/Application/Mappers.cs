using RealEstate.Api.Domain;
using RealEstate.Api.Application.Dto;

namespace RealEstate.Api.Application;

public static class Mappers
{
    public static PropertyDto ToDto(this Property e) =>
        new PropertyDto(
            propertyId: e.Id,           // 👈 mapear el id
            idOwner: e.OwnerId,
            name: e.Name,
            addressProperty: e.Address,
            priceProperty: e.Price,
            image: e.ImageUrl
        );
}
