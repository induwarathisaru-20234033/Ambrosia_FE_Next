"use client";

import { ErrorMessage, Field, useFormikContext } from "formik";
import { FormGroup, Form } from "react-bootstrap";
import { Dropdown as drpdwn, DropdownChangeEvent } from "primereact/dropdown";
import { useState } from "react";
import { Tooltip } from "primereact/tooltip";
import { classNames } from "primereact/utils";

interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

interface DropdownProps {
  name: string;
  placeholder?: string;
  className?: string;
  options: SelectOption[];
  id: string;
  label?: string;
  optionLabel?: string;
  disabled?: boolean;
  formLabelClassName?: string;
  onChange?: (value: any) => void;
  showClearOption?: boolean;
  isSearchable?: boolean;
  hideErrorMessage?: boolean;
  editable?: boolean;
  itemTemplate?: (option: SelectOption) => React.ReactNode;
  labelTooltip?: string;
}

export default function Dropdown({
  name,
  placeholder,
  className,
  options,
  id,
  label,
  optionLabel,
  disabled,
  formLabelClassName,
  onChange,
  showClearOption,
  isSearchable = false,
  hideErrorMessage = false,
  itemTemplate,
  editable,
  labelTooltip,
}: Readonly<DropdownProps>) {
  const { setFieldValue, values } = useFormikContext<any>();
  const [hasInteracted, setHasInteracted] = useState(false);
  const handleChange = (event: DropdownChangeEvent) => {
    const { value } = event;
    setFieldValue(name, value);
    setHasInteracted(true);
    if (onChange) {
      onChange(event);
    }
  };
  const currentValue = values[name];

  return (
    <FormGroup
      key={name}
      className="mb-3 label text-xs xs:text-sm sm:text-base"
      controlId={id}
    >
      {label && (
        <div className="flex items-center gap-2 mb-3">
          <Form.Label className={`${formLabelClassName} m-0`}>
            {label}
          </Form.Label>
          {labelTooltip && (
            <>
              <Tooltip
                target={`.${id}`}
                className=" !bg-gray-50 !text-gray-800 w-48 !z-100 mb-3"
                mouseTrack
                mouseTrackTop={10}
              />
              <i
                className={classNames(
                  "pi",
                  id,
                  "pi-info-circle",
                  "text-gray-400 cursor-help inline-flex items-center",
                )}
                data-pr-tooltip={labelTooltip}
                data-pr-position="right"
              ></i>
            </>
          )}
        </div>
      )}
      <Field
        as={drpdwn}
        name={name}
        options={options}
        placeholder={placeholder}
        className={`${disabled ? "bg-gray-300 cursor-not-allowed" : ""} truncate ${className} border border-gray-300`}
        optionLabel={optionLabel}
        panelClassName="border border-gray-300"
        disabled={disabled}
        onChange={handleChange}
        showClear={
          showClearOption &&
          (hasInteracted ||
            (currentValue !== null &&
              currentValue !== "" &&
              currentValue !== undefined))
        }
        filter={isSearchable}
        editable={editable}
        itemTemplate={itemTemplate}
      />
      {!hideErrorMessage && (
        <ErrorMessage
          name={name}
          render={(msg: string) => <div className="text-red">{msg}</div>}
        />
      )}
    </FormGroup>
  );
}
