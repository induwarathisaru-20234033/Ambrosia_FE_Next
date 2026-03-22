import type {
  IBackendOrder,
  IOrder,
  SearchOrderRequest,
} from "@/data-types";

// Format backend datetime into YYYY-MM-DD for table display
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

// Map FE DataTable sort field names to BE sort field names
export const mapOrderSortFieldToBackend = (
  sortField?: string
): string | undefined => {
  switch (sortField) {
    case "orderId":
      return "orderNumber";
    case "tableNo":
      return "tableName";
    case "orderDate":
      return "createdDate";
    case "orderStatus":
      return "orderStatus";
    default:
      return undefined;
  }
};

// Convert date input into ISO start-of-day for BE query params
export const toStartOfDayIso = (date: string): string =>
  date ? new Date(`${date}T00:00:00`).toISOString() : "";

// Convert date input into ISO end-of-day for BE query params
export const toEndOfDayIso = (date: string): string =>
  date ? new Date(`${date}T23:59:59`).toISOString() : "";

// Build backend query params for order search endpoint
export const buildOrderQueryParams = (filters: SearchOrderRequest) => ({
  Category: filters.category,
  OrderNumber: filters.orderNumber || undefined,
  TableName: filters.tableName || undefined,
  WaiterName: filters.waiterName || undefined,
  CustomerName: filters.customerName || undefined,
  OrderDateFrom: filters.orderDateFrom
    ? toStartOfDayIso(filters.orderDateFrom)
    : undefined,
  OrderDateTo: filters.orderDateTo
    ? toEndOfDayIso(filters.orderDateTo)
    : undefined,
  Status: filters.status || undefined,
  SortField: mapOrderSortFieldToBackend(filters.sortField),
  SortOrder: filters.sortOrder || undefined,
  PageNumber: filters.pageNumber,
  PageSize: filters.pageSize,
});

// Map backend order response to UI order model
export const mapBackendOrderToUI = (
  order: IBackendOrder,
  status: "ongoing" | "completed"
): IOrder => {
  return {
    backendId: order.id,
    orderId: order.orderNumber,
    tableNo: order.tableName ?? order.tableId?.toString() ?? "-",
    email: "-",
    phone: "-",
    waiterName: "-",
    customerName: "-",
    orderDate: formatOrderDate(order.createdDate),
    status,
    orderStatus: order.orderStatus,
    items:
      order.items?.map((item) => ({
        name: item.menuItemName,
        quantity: item.quantity,
        price: `Rs. ${item.unitPrice}`,
      })) ?? [],
  };
};