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