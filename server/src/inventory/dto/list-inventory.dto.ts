export class ListInventoryDto {
  page?: number;
  pageSize?: number;
  companyCode?: string;
  itemCode?: string;
  itemName?: string;
  warehouse?: string;
  status?: string;
}
