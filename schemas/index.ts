import * as Yup from "yup";

const parseTimeToMinutes = (value: unknown): number | null => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getHours() * 60 + value.getMinutes();
  }

  if (typeof value === "string") {
    const timeMatch = /^(\d{1,2}):(\d{2})/.exec(value);
    if (timeMatch) {
      const hours = Number.parseInt(timeMatch[1], 10);
      const minutes = Number.parseInt(timeMatch[2], 10);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        return hours * 60 + minutes;
      }
    }

    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.getHours() * 60 + parsedDate.getMinutes();
    }
  }

  return null;
};

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

export const ServiceLogicSchema = Yup.object().shape({
  bufferTime: Yup.number()
    .min(0, "Buffer time cannot be negative")
    .required("Buffer time is required"),
  turnTime: Yup.number()
    .min(0, "Turn time cannot be negative")
    .required("Turn time is required"),
  bookingInterval: Yup.number()
    .oneOf([15, 30, 45, 60], "Invalid booking interval")
    .required("Booking interval is required"),
});

export const StandardOpeningHoursSchema = Yup.object().shape({
  schedule: Yup.array().of(
    Yup.object().shape({
      day: Yup.number().required("Day is required").min(1).max(7),
      isOpen: Yup.boolean().required("Open/Closed status is required"),
      timeSlots: Yup.array().when("isOpen", {
        is: true,
        then: (schema) =>
          schema
            .of(
              Yup.object().shape({
                id: Yup.string().required("Time slot ID is required"),
                startTime: Yup.mixed()
                  .test(
                    "start-required",
                    "Start time is required",
                    function (value) {
                      const endTime = (this.parent as { endTime?: unknown })
                        .endTime;
                      const startMinutes = parseTimeToMinutes(value);
                      const endMinutes = parseTimeToMinutes(endTime);
                      if (startMinutes === null && endMinutes === null) {
                        return true;
                      }
                      return startMinutes !== null;
                    },
                  )
                  .test(
                    "start-before-end",
                    "Start time must be before end time",
                    function (value) {
                      const endTime = (this.parent as { endTime?: unknown })
                        .endTime;
                      const startMinutes = parseTimeToMinutes(value);
                      const endMinutes = parseTimeToMinutes(endTime);
                      if (startMinutes === null || endMinutes === null) {
                        return true;
                      }
                      return startMinutes < endMinutes;
                    },
                  ),
                endTime: Yup.mixed()
                  .test(
                    "end-required",
                    "End time is required",
                    function (value) {
                      const startTime = (this.parent as { startTime?: unknown })
                        .startTime;
                      const startMinutes = parseTimeToMinutes(startTime);
                      const endMinutes = parseTimeToMinutes(value);
                      if (startMinutes === null && endMinutes === null) {
                        return true;
                      }
                      return endMinutes !== null;
                    },
                  )
                  .test(
                    "end-after-start",
                    "End time must be after start time",
                    function (value) {
                      const startTime = (this.parent as { startTime?: unknown })
                        .startTime;
                      const startMinutes = parseTimeToMinutes(startTime);
                      const endMinutes = parseTimeToMinutes(value);
                      if (startMinutes === null || endMinutes === null) {
                        return true;
                      }
                      return endMinutes > startMinutes;
                    },
                  ),
              }),
            )
            .test(
              "at-least-one-shift",
              "At least one shift must be added",
              function (slots) {
                if (!Array.isArray(slots)) {
                  return false;
                }

                const validCount = slots.filter((slot) => {
                  const startMinutes = parseTimeToMinutes(slot?.startTime);
                  const endMinutes = parseTimeToMinutes(slot?.endTime);
                  if (startMinutes === null || endMinutes === null) {
                    return false;
                  }
                  return startMinutes < endMinutes;
                }).length;

                return validCount >= 1;
              },
            )
            .test(
              "no-overlap",
              "Time slots must not overlap",
              function (slots) {
                if (!Array.isArray(slots)) {
                  return true;
                }

                const intervals = slots
                  .map((slot) => {
                    const startMinutes = parseTimeToMinutes(slot?.startTime);
                    const endMinutes = parseTimeToMinutes(slot?.endTime);
                    if (startMinutes === null || endMinutes === null) {
                      return null;
                    }
                    return { start: startMinutes, end: endMinutes };
                  })
                  .filter(
                    (interval): interval is { start: number; end: number } =>
                      interval !== null,
                  )
                  .sort((a, b) => a.start - b.start);

                for (let i = 1; i < intervals.length; i += 1) {
                  if (intervals[i].start < intervals[i - 1].end) {
                    return false;
                  }
                }

                return true;
              },
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
  ),
});
