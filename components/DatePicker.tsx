"use client";

import { Form, FormGroup } from "react-bootstrap";
import { ErrorMessage, useField } from "formik";
import {
  Calendar,
  CalendarProps,
} from "primereact/calendar";
import { getPrimeReactDateFormat } from "@/utils/datetimeUtils";

interface DatePickerProps {
  readonly id?: string;
  readonly name: string;
  readonly label?: string;
  readonly disabled?: boolean;
  readonly minDate?: Date;
  readonly maxDate?: Date;
  readonly format?: string;
  readonly formLableClassName?: string;
  readonly placeholder?: string;
}

export default function DatePicker({
  id,
  name,
  label,
  disabled,
  minDate,
  maxDate,
  format = getPrimeReactDateFormat(),
  formLableClassName,
  placeholder,
}: DatePickerProps) {
  const [, meta, helpers] = useField(name);
  const handleDateChange: CalendarProps["onChange"] = (event) => {
    helpers.setValue(event.value);
  };

  return (
    <FormGroup
      className="mb-3 label text-xs xs:text-sm sm:text-base"
      controlId={id}
    >
      {label && <Form.Label className={formLableClassName}>{label}</Form.Label>}
      <Calendar
        name={name}
        value={meta.value ? new Date(meta.value) : null}
        onChange={handleDateChange}
        style={{ width: "100%", height: "38px" }}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        dateFormat={format}
        showIcon
        readOnlyInput
        placeholder={placeholder}
        className={disabled ? "bg-[#ced5db]" : ""}
      />

      <ErrorMessage
        name={name}
        render={(msg: string) => <div className="text-red">{msg}</div>}
      />
    </FormGroup>
  );
}
