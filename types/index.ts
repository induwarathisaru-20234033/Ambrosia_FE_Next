// Employee Types

export interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  mobileNumber: string;
  address: string;
  status: 'Active' | 'Inactive';
  role?: string;
}

export interface EmployeeFormValues {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  mobileNumber: string;
  address: string;
  password?: string;
  role?: string;
  status?: 'Active' | 'Inactive';
}

// Role Types
export interface Role {
  roleCode: string;
  roleName: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface RoleFormValues {
  roleCode: string;
  roleName: string;
  description: string;
  status?: 'Active' | 'Inactive';
}