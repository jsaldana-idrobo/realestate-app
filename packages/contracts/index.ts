export type PropertyDto = {
  propertyId: string; // 👈 nuevo
  idOwner: string;
  name: string;
  addressProperty: string;
  priceProperty: number;
  image: string;
};

export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
