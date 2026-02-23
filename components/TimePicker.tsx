"use client";

import { NumberConstants } from "@/utils/constants";
import {
  getDateTimeCombinedDate,
  getNewDate,
  getPrimeReactHourFormat,
  HourFormat,
} from "@/utils/datetimeUtils";
import { Field, useField } from "formik";
import { useEffect } from "react";
import { Calendar, CalendarViewChangeEvent } from "primereact/calendar";
import { Form, FormGroup } from "react-bootstrap";

interface TimePickerProps {
  name: string;
  label?: string;
  disabled?: boolean;
  date?: Date;
  formLabelClassName?: string;
  placeholder?: string;
  showIcon?: boolean;
  format?: HourFormat;
  showErrorMessage?: boolean;
}

const roundMinutesToStep = (minutes: number) => {
  return (
    Math.ceil(minutes / NumberConstants.STEP_MINUTE_INTERVAL) *
    NumberConstants.STEP_MINUTE_INTERVAL
  );
};

const getErrorMessage = (error: unknown): string | undefined => {
  if (Array.isArray(error)) {
    return error.find((msg) => typeof msg === "string" && msg.length > 0);
  }
  if (typeof error === "string") {
    return error;
  }
  return undefined;
};

export default function TimePicker({
  name,
  label,
  disabled,
  date,
  formLabelClassName,
  placeholder,
  showIcon = true,
  format = getPrimeReactHourFormat(),
  showErrorMessage = true,
}: Readonly<TimePickerProps>) {
  const [, meta, helpers] = useField(name);
  const errorMessage = getErrorMessage(meta.error);

  useEffect(() => {
    if (date && meta.value) {
      const modifiedTime = getDateTimeCombinedDate(
        date ?? getNewDate(),
        meta.value,
      );
      helpers.setValue(modifiedTime);
    }
  }, [date]);

  const handleTimeChange = (event: CalendarViewChangeEvent) => {
    const currentDate = getNewDate();
    let currentTime = currentDate?.getMinutes();
    currentTime = roundMinutesToStep(currentTime);
    const selectedTime = event.value;
    selectedTime.setSeconds(0, 0);
    let minutes = selectedTime.getMinutes();
    minutes = roundMinutesToStep(minutes);
    if (
      !meta.value &&
      selectedTime.getHours() === currentDate.getHours() &&
      minutes === currentTime
    ) {
      selectedTime.setMinutes(minutes + NumberConstants.STEP_MINUTE_INTERVAL);
    } else {
      selectedTime.setMinutes(minutes);
    }
    const modifiedTime = getDateTimeCombinedDate(
      date ?? getNewDate(),
      selectedTime,
    );
    helpers.setValue(modifiedTime);
  };

  const customClockIcon = (
    <i className="pi pi-clock" style={{ color: "#000" }}></i>
  );

  return (
    <FormGroup className="label text-xs xs:text-sm sm:text-base">
      {label && <Form.Label className={formLabelClassName}>{label}</Form.Label>}
      <Field
        name={name}
        as={Calendar}
        className={disabled ? "bg-[#ced5db]" : ""}
        inputClassName="border border-gray-300 pl-3"
        panelClassName="border border-gray-300"
        value={meta.value ? new Date(meta.value) : null}
        onChange={handleTimeChange}
        timeOnly
        hourFormat={format}
        stepMinute={NumberConstants.STEP_MINUTE_INTERVAL}
        style={{ width: "100%", height: "38px" }}
        disabled={disabled}
        showIcon={showIcon}
        icon={customClockIcon}
        readOnlyInput
        placeholder={meta.value ? undefined : placeholder}
      />
      {showErrorMessage && errorMessage ? (
        <div className="text-red">{errorMessage}</div>
      ) : null}
    </FormGroup>
  );
}
