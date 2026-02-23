import { Day } from "./enums/day";

export type DateTimeFormatMode = 'date' | 'time' | 'datetime';

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

export interface IPaginatedApiResponse<T> extends IPaginationMetaData {
  items: T[];
}

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
