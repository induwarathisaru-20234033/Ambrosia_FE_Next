import { Day } from "./enums/day";
import { SortOrder } from "primereact/datatable";

export type DateTimeFormatMode = "date" | "time" | "datetime";

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
}

export interface IMutateExclusion {
  exclusionDate: Date;
  reason: string;
}

export interface IExclusion extends IMutateExclusion {
  id: number;
}
