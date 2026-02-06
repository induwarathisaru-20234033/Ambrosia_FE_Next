"use client";

import { ErrorMessage, Field, useField } from "formik";
import { Tooltip } from "primereact/tooltip";
import { classNames } from "primereact/utils";
import { useEffect, useState } from "react";
import { Form, FormControl, FormGroup } from "react-bootstrap";

interface LabelGroupProps extends Readonly<
  React.AllHTMLAttributes<HTMLInputElement>
> {
  readonly name: string;
  readonly id?: string;
  readonly className?: string;
  readonly formLableClassName?: string;
  readonly tooltipValue?: string;
  readonly prefix?: string;
  readonly labelTooltip?: string;
  readonly min?: number;
  readonly showDecimals?: boolean;
  readonly as?: any;
  readonly options?: { label: string; value: string }[];
}

export default function LabelGroup({
  name,
  label,
  type,
  placeholder,
  disabled,
  id,
  className,
  formLableClassName,
  tooltipValue,
  min,
  showDecimals,
  labelTooltip,
  ...props
}: LabelGroupProps) {
  const [field, , helpers] = useField(name);
  const showingDecimal = showDecimals && type === "number";
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType && showPassword ? "text" : type;

  const togglePasswordVisibility = () => {
    setShowPassword((prev: boolean) => !prev);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (showingDecimal) {
      let inputValue = event.target.value;
      let formattedValue = inputValue
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*?)\..*/g, "$1");

      const parts = formattedValue.split(".");
      if (parts[1]?.length > 2) {
        formattedValue = `${parts[0]}.${parts[1].slice(0, 2)}`;
      }

      helpers.setValue(formattedValue);
    } else {
      helpers.setValue(event.target.value);
    }
  };

  const handleBlur = () => {
    if (showingDecimal) {
      const currentValue = field.value ?? "0";
      const numberValue = Number.parseFloat(currentValue);
      helpers.setValue(numberValue.toFixed(2));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      type === "number" &&
      (event.key.toLocaleLowerCase() === "e" || event.key === "+")
    ) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (type === "number") {
        event.preventDefault();
      }
    };

    const addWheelEventListener = () => {
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener("wheel", handleWheel, { passive: false });
          return () => {
            element.removeEventListener("wheel", handleWheel);
          };
        }
      }
    };

    return addWheelEventListener();
  }, [id, type]);

  useEffect(() => {
    handleBlur();
  }, []);

  return (
    <FormGroup
      key={name}
      className="mb-3 label text-xs xs:text-sm sm:text-base"
      controlId={id}
    >
      <div className="flex gap-2 w-full">
        {label && (
          <Form.Label className={formLableClassName}>{label}</Form.Label>
        )}
        {labelTooltip && (
          <>
            <Tooltip
              mouseTrackTop={10}
              mouseTrack
              target={`.${id}`}
              className="w-36 !z-100"
            />
            <i
              className={classNames(
                "pi-info-circle",
                "pi",
                id,
                "p-mr-2 mt-1 sm:!mt-2",
              )}
              style={{
                fontSize: "0.75rem",
                color: "#575656",
                pointerEvents: "auto",
              }}
              data-pr-position="top"
              data-pr-tooltip={labelTooltip}
              data-pr-at="center top-3"
            ></i>
          </>
        )}
      </div>

      {tooltipValue && <Tooltip target=".tooltipEnabled" />}
      <div
        data-pr-position="top"
        data-pr-tooltip={tooltipValue}
        className="tooltipEnabled flex"
      >
        {props.prefix && (
          <p
            className={`flex justify-center font-semibold text-[9px] md:text-xs text-[#495057] bg-[#e9ecef] border-[#ced4da] ${formLableClassName} items-center p-2 mr-1 rounded-md border-[1px] `}
          >
            {props.prefix}
          </p>
        )}
        <div className="relative w-full">
          <Field
            className={`${className} truncate w-full`}
            value={field.value ?? ""}
            disabled={disabled}
            as={FormControl}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            name={name}
            type={inputType}
            placeholder={placeholder}
            min={min}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer focus:outline-none"
            >
              <i
                className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`}
                aria-hidden="true"
                style={{ fontSize: "1rem" }}
              />
            </button>
          )}
        </div>
      </div>
      <ErrorMessage
        render={(msg: string) => <div className="text-red">{msg}</div>}
        name={name}
      />
    </FormGroup>
  );
}
