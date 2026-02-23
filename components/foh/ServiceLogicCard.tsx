"use client";

import { useEffect } from "react";
import { Tooltip } from "primereact/tooltip";
import { IServiceLogic } from "@/data-types";
import { ServiceLogicSchema } from "@/schemas";
import { Formik, Form } from "formik";
import Dropdown from "../Dropdown";
import { ServiceLogicTooltipMessages } from "@/utils/constants";
import { classNames } from "primereact/utils";

interface ServiceLogicCardProps {
  initialValues?: IServiceLogic;
  onValuesChange?: (data: IServiceLogic) => void;
  onValidityChange?: (isValid: boolean) => void;
}

export default function ServiceLogicCard({
  initialValues = { bufferTime: 10, turnTime: 30, bookingInterval: 15 },
  onValuesChange,
  onValidityChange,
}: Readonly<ServiceLogicCardProps>) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ServiceLogicSchema}
      validateOnMount={true}
      enableReinitialize={true}
      onSubmit={() => {}}
    >
      {(formik) => (
        <ServiceLogicCardForm
          formik={formik}
          onValuesChange={onValuesChange}
          onValidityChange={onValidityChange}
        />
      )}
    </Formik>
  );
}

function ServiceLogicCardForm({
  formik,
  onValuesChange,
  onValidityChange,
}: Readonly<{
  formik: any;
  onValuesChange?: (data: IServiceLogic) => void;
  onValidityChange?: (isValid: boolean) => void;
}>) {
  const { values, setFieldValue } = formik;

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  useEffect(() => {
    onValidityChange?.(formik.isValid);
  }, [formik.isValid, onValidityChange]);

  const bookingIntervalOptions = [
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "45 minutes", value: 45 },
    { label: "60 minutes", value: 60 },
  ];

  const handleTurnTimeIncrement = () => {
    setFieldValue("turnTime", values.turnTime + 5);
  };

  const handleTurnTimeDecrement = () => {
    setFieldValue("turnTime", Math.max(0, values.turnTime - 5));
  };

  const handleBufferTimeIncrement = () => {
    setFieldValue("bufferTime", values.bufferTime + 5);
  };

  const handleBufferTimeDecrement = () => {
    setFieldValue("bufferTime", Math.max(0, values.bufferTime - 5));
  };

  return (
    <div className="w-full">
      <Form>
        <div className="border-2 border-[#FF6B6B] rounded-2xl p-6 bg-white">
          <h2 className="text-xl font-bold text-[#FF6B6B] mb-6">
            Service Logic
          </h2>

          <div className="flex gap-8 flex-wrap">
            {/* Turn Time Section */}
            <div className="flex-1 min-w-fit">
              <div className="flex items-center gap-2 mb-4">
                <label
                  htmlFor="turn-time"
                  className="text-sm font-medium text-gray-900"
                >
                  Turn Time (Minutes)
                </label>
                <Tooltip
                  target={`[data-pr-tooltip="${ServiceLogicTooltipMessages.turnTime}"]`}
                  className=" !bg-gray-50 !text-gray-800 w-48 !z-100"
                  mouseTrack
                  mouseTrackTop={10}
                />
                <i
                  className={classNames(
                    "pi",
                    "pi-info-circle",
                    "text-gray-400 cursor-help inline-flex items-center",
                  )}
                  data-pr-tooltip={ServiceLogicTooltipMessages.turnTime}
                  data-pr-position="right"
                ></i>
              </div>
              <div className="flex items-center justify-start gap-6">
                <button
                  type="button"
                  onClick={handleTurnTimeDecrement}
                  className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Decrease turn time"
                >
                  <span className="text-xl font-semibold text-gray-900">−</span>
                </button>
                <span
                  id="turn-time"
                  className="text-4xl font-bold text-gray-900 w-16 text-center"
                >
                  {values.turnTime}
                </span>
                <button
                  type="button"
                  onClick={handleTurnTimeIncrement}
                  className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Increase turn time"
                >
                  <span className="text-xl font-semibold text-gray-900">+</span>
                </button>
              </div>
            </div>

            {/* Buffer Time Section */}
            <div className="flex-1 min-w-fit">
              <div className="flex items-center gap-2 mb-4">
                <label
                  htmlFor="buffer-time"
                  className="text-sm font-medium text-gray-900"
                >
                  Buffer Time (Minutes)
                </label>
                <i
                  className="pi pi-info-circle text-gray-400 cursor-help"
                  data-pr-tooltip={ServiceLogicTooltipMessages.bufferTime}
                  data-pr-position="right"
                />
                <Tooltip
                  target={`[data-pr-tooltip="${ServiceLogicTooltipMessages.bufferTime}"]`}
                />
              </div>
              <div className="flex items-center justify-start gap-6">
                <button
                  type="button"
                  onClick={handleBufferTimeDecrement}
                  className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Decrease buffer time"
                >
                  <span className="text-xl font-semibold text-gray-900">−</span>
                </button>
                <span
                  id="buffer-time"
                  className="text-4xl font-bold text-gray-900 w-16 text-center"
                >
                  {values.bufferTime}
                </span>
                <button
                  type="button"
                  onClick={handleBufferTimeIncrement}
                  className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Increase buffer time"
                >
                  <span className="text-xl font-semibold text-gray-900">+</span>
                </button>
              </div>
            </div>

            {/* Booking Interval Section */}
            <div className="flex-1 min-w-fit">
              <Dropdown
                label="Booking Interval"
                id="formBookingInterval"
                placeholder="Select Booking Interval"
                options={bookingIntervalOptions.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                className="w-full"
                name="bookingInterval"
                formLabelClassName="text-sm font-medium text-gray-900"
                labelTooltip={ServiceLogicTooltipMessages.bookingInterval}
              />
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
