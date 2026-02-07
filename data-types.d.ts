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