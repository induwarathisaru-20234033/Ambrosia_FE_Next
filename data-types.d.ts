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

export interface IRoleCreateRequest {
    roleCode: string;
    roleName: string;
    description?: string;
    isActive?: boolean;
    permissions?: string[];
}