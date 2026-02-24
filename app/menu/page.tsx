import { redirect } from "next/navigation";

export default function EmployeeManagementRedirect() {
  redirect("/menu/emp-mgt/employees");
}