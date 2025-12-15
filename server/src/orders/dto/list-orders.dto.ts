export class ListOrdersDto {
  page?: number;
  pageSize?: number;
  companyCode?: string;
  code?: string;
  customerName?: string;
  itemName?: string;
  status?: string;
  dueFrom?: string;
  dueTo?: string;
}
