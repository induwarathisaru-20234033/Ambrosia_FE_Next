"use client";

import { IDaySchedule } from "@/data-types";
import { Day } from "@/enums/day";
import { StandardOpeningHoursSchema } from "@/schemas";
import { FormikProvider, getIn, useFormik } from "formik";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { useEffect } from "react";
import TimePicker from "../TimePicker";
import { hasValidTime, toMinutes } from "@/utils/datetimeUtils";

interface StandardOpeningHoursProps {
  initialSchedule?: IDaySchedule[];
  onScheduleChange?: (data: IDaySchedule[]) => void;
  onValidityChange?: (isValid: boolean) => void;
}

export const StandardOpeningHours = ({
  initialSchedule,
  onScheduleChange,
  onValidityChange,
}: StandardOpeningHoursProps) => {
  const daysOfWeek = [
    { day: Day.Monday, name: "Monday" },
    { day: Day.Tuesday, name: "Tuesday" },
    { day: Day.Wednesday, name: "Wednesday" },
    { day: Day.Thursday, name: "Thursday" },
    { day: Day.Friday, name: "Friday" },
    { day: Day.Saturday, name: "Saturday" },
    { day: Day.Sunday, name: "Sunday" },
  ];

  const initialValues = {
    schedule:
      initialSchedule ||
      daysOfWeek.map(({ day, name }) => ({
        day: day,
        dayName: name,
        isOpen: true,
        timeSlots: [{ id: "1", startTime: "", endTime: "" }],
      })),
  };

  const formik = useFormik({
    initialValues,
    validationSchema: StandardOpeningHoursSchema,
    validateOnMount: true,
    onSubmit: () => {},
  });

  useEffect(() => {
    onScheduleChange?.(formik.values.schedule);
  }, [formik.values.schedule, onScheduleChange]);

  useEffect(() => {
    onValidityChange?.(formik.isValid);
  }, [formik.isValid, onValidityChange]);

  const toggleDay = (dayIndex: number) => {
    formik.setFieldValue(
      `schedule[${dayIndex}].isOpen`,
      !formik.values.schedule[dayIndex].isOpen,
    );
  };

  const addTimeSlot = (dayIndex: number) => {
    const currentSlots = formik.values.schedule[dayIndex].timeSlots;
    const newId = Math.max(
      ...currentSlots.map((slot) => Number.parseInt(slot.id)),
      0,
    );

    formik.setFieldValue(`schedule[${dayIndex}].timeSlots`, [
      ...currentSlots,
      {
        id: (newId + 1).toString(),
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const currentSlots = formik.values.schedule[dayIndex].timeSlots;
    formik.setFieldValue(
      `schedule[${dayIndex}].timeSlots`,
      currentSlots.filter((_, index) => index !== slotIndex),
    );
  };

  return (
    <FormikProvider value={formik}>
      <div>
        <div className="border-2 border-[#FF6B6B] rounded-2xl p-8 bg-white">
          {/* Title */}
          <h2 className="text-xl font-bold text-[#FF6B6B] mb-8">
            Standard Opening Hours
          </h2>

          {/* Days List */}
          <div className="space-y-6">
            {formik.values.schedule.map((daySchedule, dayIndex) => {
              const timeSlotsError = getIn(
                formik.errors,
                `schedule[${dayIndex}].timeSlots`,
              );

              return (
                <div key={daySchedule.dayName} className="flex flex-col gap-2">
                  <div className="flex items-center gap-10">
                    {/* Day Header with Toggle */}
                    <div className="w-24 font-medium text-gray-900">
                      {daySchedule.dayName}
                    </div>
                    <InputSwitch
                      checked={daySchedule.isOpen}
                      onChange={() => toggleDay(dayIndex)}
                      className="custom-toggle"
                    />

                    {/* Time Slots */}
                    {daySchedule.isOpen && (
                      <div className="flex flex-col gap-3">
                        {daySchedule.timeSlots.map((slot, slotIndex) => {
                          const startError = getIn(
                            formik.errors,
                            `schedule[${dayIndex}].timeSlots[${slotIndex}].startTime`,
                          );
                          const endError = getIn(
                            formik.errors,
                            `schedule[${dayIndex}].timeSlots[${slotIndex}].endTime`,
                          );
                          const startTouched = getIn(
                            formik.touched,
                            `schedule[${dayIndex}].timeSlots[${slotIndex}].startTime`,
                          );
                          const endTouched = getIn(
                            formik.touched,
                            `schedule[${dayIndex}].timeSlots[${slotIndex}].endTime`,
                          );
                          const showStartError = startTouched && startError;
                          const showEndError =
                            endTouched && endError && endError !== startError;

                          return (
                            <div
                              key={slot.id}
                              className="flex items-start gap-6"
                            >
                              {/* Start Time Input */}
                              <div className="w-48">
                                <TimePicker
                                  name={`schedule[${dayIndex}].timeSlots[${slotIndex}].startTime`}
                                  placeholder="Start Time"
                                  showIcon={true}
                                  showErrorMessage={false}
                                />
                                {showStartError && (
                                  <div className="text-red text-base">
                                    {startError}
                                  </div>
                                )}
                              </div>

                              {/* End Time Input */}
                              <div className="w-48">
                                <TimePicker
                                  name={`schedule[${dayIndex}].timeSlots[${slotIndex}].endTime`}
                                  placeholder="End Time"
                                  showIcon={true}
                                  showErrorMessage={false}
                                />
                                {showEndError && (
                                  <div className="text-red text-base">
                                    {endError}
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                {slotIndex ===
                                daySchedule.timeSlots.length - 1 ? (
                                  <Button
                                    type="button"
                                    icon="pi pi-plus"
                                    className="w-10 h-10 bg-[#FF6B6B] hover:bg-[#FF5252] border-0 text-white rounded-sm"
                                    disabled={
                                      !hasValidTime(slot.startTime) ||
                                      !hasValidTime(slot.endTime) ||
                                      (toMinutes(slot.startTime) !== null &&
                                        toMinutes(slot.endTime) !== null &&
                                        toMinutes(slot.startTime)! >=
                                          toMinutes(slot.endTime)!)
                                    }
                                    onClick={() => addTimeSlot(dayIndex)}
                                    aria-label="Add time slot"
                                  />
                                ) : (
                                  <Button
                                    type="button"
                                    icon="pi pi-times"
                                    className="w-10 h-10 bg-white hover:bg-gray-50 text-[#ef6630] border-2 border-[#ef6630] rounded-sm"
                                    onClick={() =>
                                      removeTimeSlot(dayIndex, slotIndex)
                                    }
                                    aria-label="Remove time slot"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {daySchedule.isOpen && typeof timeSlotsError === "string" && (
                    <div className="text-red text-sm">{timeSlotsError}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FormikProvider>
  );
};
