import { SortOrder } from 'primereact/datatable';

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