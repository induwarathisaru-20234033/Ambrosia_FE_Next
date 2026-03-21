import { Day } from "./enums/day";
import { SortOrder } from "primereact/datatable";

export type DateTimeFormatMode = "date" | "time" | "datetime";
export type NullableNumberLike = number | string | null;
export type NullableString = string | null;

export type ShapeType = "round" | "square" | "rectangle" | "booth";

export interface IBaseApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors?: string[];
  data: T;
}

export interface IPaginationMetaData {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  totalItemCount: number;
}

export interface IPaginatedData<T> extends IPaginationMetaData {
  items: T[];
}

export interface IPaginatedApiResponse<T> extends IBaseApiResponse<
  IPaginatedData<T>
> {}

export interface IEmployeeCreateRequest {
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobileNumber: string;
  address: string;
  username: string;
  password: string;
}

export interface IEmployeeUpdateRequest extends IEmployeeCreateRequest {
  status: number;
}

export interface ITimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface IRoleCreateRequest {
  roleCode: string;
  name: string;
  description?: string;
  status?: number;
  permissionIds?: number[];
}

export interface IDaySchedule {
  day: Day;
  dayName: string;
  isOpen: boolean;
  timeSlots: ITimeSlot[];
}

export interface IServiceShiftPayload {
  day: Day;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
}

export interface IServiceLogic {
  bufferTime: number;
  turnTime: number;
  bookingInterval: number;
}

export interface IMutateScheduleConfig {
  timeSlotLogic: IServiceLogic;
  serviceShiftPayload: IServiceShiftPayload[];
}

export interface IScheduleConfigResponse extends IMutateScheduleConfig {}

export interface IEmployee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  username: string;
  email?: string;
  address?: string;
  createdDate: string;
  status: number;
}

export interface SearchEmployeeRequest {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  mobileNumber?: string;
  address?: string;
  status?: string;
  pageNumber: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: SortOrder; // 1 = ASC, -1 = DESC
}
export interface IMutateTable {
  tableName: string;
  capacity: number;
  isOnlineBookingEnabled: boolean;
}

export interface ITable extends IMutateTable {
  id: number;
  existingAllocations?: number;
}

export interface IMutateExclusion {
  exclusionDate: Date;
  reason: string;
}

export interface IExclusion extends IMutateExclusion {
  id: number;
}

export interface ICustomerDetail {
  id: number;
  name: string;
  email?: string;
  phoneNumber: string;
}

export interface IBookingSlot {
  id: number;
  slotId: string;
  startTime: Date | string;
  endTime: Date | string;
  day: Day;
  existingAllocations?: number;
}

export interface IReservation {
  id: number;
  reservationCode: string;
  partySize: number;
  reservationStatus: number;
  reservationDate: Date;
  occasion?: string;
  specialRequests?: string;
  arrivedAt?: Date;
  noShowMarkedAt?: Date;
  cancelledAt?: Date;
  customerDetails: ICustomerDetail;
  bookingSlot: IBookingSlot;
  table: ITable;
}

export interface ISearchReservationsRequest {
  reservationCode?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  tableNo?: string;
  reservationDateFrom?: Date | null;
  reservationDateTo?: Date | null;
  createdDateFrom?: Date | null;
  createdDateTo?: Date | null;
  timeSlot?: string;
}

interface ICreateReservationRequest {
  partySize: number;
  reservationDate: string;
  occasion: string;
  specialRequests: string;
  customerName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  bookingSlotId: number;
  tableId: number;
}

export interface IInventoryItem {
  id?: number | string;
  itemNumber?: string;
  itemName?: string;
  currentQuantity?: NullableNumberLike;
  openingQuantity?: NullableNumberLike;
  itemType?: string;
  itemCategory?: string;
  uoM?: string;
  uom?: string;
  unitPrice?: NullableNumberLike;
  currency?: NullableString;
  inventoryStatus?: string | number;
  remarks?: NullableString;
  itemSubCategory?: string;
  minimumStockLevel?: NullableNumberLike;
  maximumStockLevel?: NullableNumberLike;
  reOrderLevel?: NullableNumberLike;
  reorderLevel?: NullableNumberLike;
  storageLocation?: NullableString;
  shelveLife?: NullableNumberLike;
  shelfLife?: NullableNumberLike;
  storageConditions?: NullableString;
  sku?: NullableString;
  barCode?: NullableString;
  expiryDate?: NullableString;
  specialRemarks?: NullableString;
}

export interface IInventoryItemCreateRequest {
  itemNumber: string;
  itemName: string;
  openingQuantity: number;
  itemType: string;
  itemCategory: string;
  uoM: string;
  unitPrice: number | null;
  currency: string | null;
  remarks: string | null;
  minimumStockLevel: number | null;
  maximumStockLevel: number | null;
  reOrderLevel: number | null;
  storageLocation: string | null;
  shelveLife: number | null;
  storageConditions: string | null;
  sku: string | null;
  expiryDate: string | null;
}

export interface IInventoryItemUpdateRequest extends IInventoryItemCreateRequest {}

export interface IInventoryCurrency {
  id: number;
  currencyCode: string;
  description: string;
}

export interface IInventoryUoM {
  id: number;
  uoM: string;
  description: string;
}

export interface ICreatePurchaseRequestBody {
  description: string;
  supplier: string;
  requestedBy: string;
  requestedDeliveryDate: string;
  isUrgent: boolean;
  prItems: Array<{
    lineItemNo: number;
    requestedQuantity: number;
    price: number;
    inventoryItemId: number;
  }>;
}

export interface IMaterialLineItem {
  lineNo: number;
  itemNumber: string;
  itemName: string;
  itemCategory: string;
  inventoryItemId: number;
  quantity: number;
  uoM: string;
  unitPrice: number;
}

export interface IMaterialSearchParams {
  itemName: string;
  pageNumber: number;
  pageSize: number;
}

export interface IPurchaseRequest {
  id?: number | string;
  purchaseRequestCode?: string;
  description?: string;
  supplier?: string;
  createdBy?: string;
  requestedBy?: string;
  requestedDeliveryDate?: string;
  createdDate?: string;
  isUrgent?: boolean;
  purchaseRequestStatus?: number;
  reviewedBy?: string;
  reviewedDate?: string;
  prItems?: Array<{
    id?: number;
    lineItemNo?: number;
    requestedQuantity?: number;
    price?: number;
    inventoryItemId?: number;
    inventoryItem?: IInventoryItem;
  }>;
}

export interface IPurchaseRequestListParams {
  pageNumber: number;
  pageSize: number;
  purchaseRequestCode?: string;
  supplier?: string;
  requestedBy?: string;
  purchaseRequestStatus?: number;
  createdDateFrom?: string;
  createdDateTo?: string;
}

export interface ICanvasShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  assignedTableId?: string;
}

export interface IApiFloorMapShape {
  type: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  assignedTableId: number | null;
}

export interface IFloorMapData {
  shapes?: IApiFloorMapShape[] | null;
}
export interface IGoodReceiptNoteItem {
  id?: number;
  lineItemNo?: number;
  prItemId?: number;
  purchaseRequestItem?: {
    id?: number;
    lineItemNo?: number;
    requestedQuantity?: number;
    price?: number;
    inventoryItemId?: number;
    inventoryItem?: IInventoryItem | null;
  } | null;
  receivedQuantity?: number;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  totalPrice?: number;
  remarks?: string;
}

export interface IGoodReceiptNote {
  id?: number | string;
  grnNumber?: string;
  supplier?: string;
  receivedDate?: string;
  receivedBy?: string;
  receivedFacility?: string;
  purchaseRequestId?: number;
  grnStatus?: number;
  items?: IGoodReceiptNoteItem[];
}

export interface IGoodReceiptNoteListParams {
  pageNumber: number;
  pageSize: number;
  gRNNumber?: string;
  supplier?: string;
  receivedBy?: string;
  grnStatus?: number;
  receivedDateFrom?: Date | string;
  receivedDateTo?: Date | string;
}
export interface IOrderItem {
  name: string;
  quantity: number;
  price: string;
}

export interface IOrder {
  orderId: string;
  tableNo: string;
  email: string;
  phone: string;
  waiterName: string;
  customerName: string;
  orderDate: string;
  status: "ongoing" | "completed" | "unassigned";
  items?: IOrderItem[];
  backendId?: number;
  orderStatus?: number;
}

export interface IBackendOrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  category: string;
  specialInstructions: string | null;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  isAvailable: boolean;
  createdDate: string;
  itemStatus: number | null;
}

export interface IBackendOrder {
  id: number;
  orderNumber: string;
  tableId: number | null;
  tableName: string | null;
  orderStatus: number;
  createdDate: string;
  updatedDate: string | null;
  items: IBackendOrderItem[];
}

export interface SearchOrderRequest {
  category?: string;
  orderNumber: string;
  tableName: string;
  waiterName: string;
  customerName: string;
  orderDateFrom: string;
  orderDateTo: string;
  sortField?: string;
  sortOrder?: SortOrder | 0 | null;
  pageNumber: number;
  pageSize: number;
}

export interface OrderFilterFormValues {
  orderNumber: string;
  tableName: string;
  waiterName: string;
  customerName: string;
  orderDateFrom: string;
  orderDateTo: string;
}

