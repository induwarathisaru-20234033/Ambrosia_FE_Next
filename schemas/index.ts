import * as Yup from "yup";

export const addEmployeeSchema = Yup.object({
  employeeId: Yup.string().required("Employee ID is required"),
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string().email("Please enter a valid email.").optional(),
  mobileNumber: Yup.string().required("Mobile Number is required"),
  address: Yup.string().required("Address is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .required("Password is required")
    .test(
      "password-validation",
      "Password must be at least 8 characters with an uppercase letter, lowercase letter, number, and special character.",
      function (value) {
        if (!value) return false;

        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return passwordRegex.test(value);
      },
    ),
});
