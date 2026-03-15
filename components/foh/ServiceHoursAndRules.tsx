"use client";

import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IServiceShiftPayload,
  IDaySchedule,
  IMutateScheduleConfig,
  IServiceLogic,
} from "@/data-types";
import { Day } from "@/enums/day";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePatchQuery } from "@/services/queries/patchQuery";
import { usePostQuery } from "@/services/queries/postQuery";
import { useRef, useState } from "react";
import { StandardOpeningHours } from "./OpeningHoursForm";
import ServiceLogicCard from "./ServiceLogicCard";
import Button from "../Button";
import ServiceHoursAndRulesSkeleton from "../skeletons/ServiceHoursAndRulesSkeleton";

export default function ServiceHoursAndRules() {
  const toastRef = useToastRef();
  const defaultTimeSlotLogic: IServiceLogic = {
    bufferTime: 10,
    turnTime: 30,
    bookingInterval: 10,
  };
  const daysOfWeek = [
    { day: Day.Monday, name: "Monday" },
    { day: Day.Tuesday, name: "Tuesday" },
    { day: Day.Wednesday, name: "Wednesday" },
    { day: Day.Thursday, name: "Thursday" },
    { day: Day.Friday, name: "Friday" },
    { day: Day.Saturday, name: "Saturday" },
    { day: Day.Sunday, name: "Sunday" },
  ];
  const scheduleDataRef = useRef<IDaySchedule[]>([]);
  const [timeSlotLogic, setTimeSlotLogic] =
    useState<IServiceLogic>(defaultTimeSlotLogic);
  const [isServiceLogicValid, setIsServiceLogicValid] = useState(true);
  const [isOpeningHoursValid, setIsOpeningHoursValid] = useState(true);

  const { data: initialResponse, isLoading } = useGetQuery<
    IBaseApiResponse<IMutateScheduleConfig>,
    void
  >(["getScheduleConfig"], "Configs", undefined, { enabled: true, toastRef });

  const postMutation = usePostQuery({
    invalidateKey: ["schedule"],
    successMessage: "Schedule saved successfully",
    toastRef: toastRef,
  });

  const patchMutation = usePatchQuery({
    invalidateKey: ["schedule"],
    successMessage: "Schedule updated successfully",
    toastRef: toastRef,
  });

  const handleTimeSlotLogicChange = (values: IServiceLogic) => {
    setTimeSlotLogic(values);
  };

  const handleScheduleChange = (data: IDaySchedule[]) => {
    scheduleDataRef.current = data;
  };

  const handleServiceLogicValidityChange = (isValid: boolean) => {
    setIsServiceLogicValid(isValid);
  };

  const handleOpeningHoursValidityChange = (isValid: boolean) => {
    setIsOpeningHoursValid(isValid);
  };

  const transformShiftPayloadToDaySchedule = (
    payload?: IServiceShiftPayload[],
  ): IDaySchedule[] | undefined => {
    if (!payload || payload.length === 0) return undefined;

    const scheduleByDay = new Map<Day, IDaySchedule>(
      daysOfWeek.map(({ day, name }) => [
        day,
        {
          day,
          dayName: name,
          isOpen: false,
          timeSlots: [],
        },
      ]),
    );

    payload.forEach((shift) => {
      const daySchedule = scheduleByDay.get(shift.day);
      if (!daySchedule) {
        return;
      }

      if (!shift.isOpen) {
        daySchedule.isOpen = false;
        daySchedule.timeSlots = [];
        return;
      }

      daySchedule.isOpen = true;
      if (shift.startTime && shift.endTime) {
        daySchedule.timeSlots.push({
          id: String(daySchedule.timeSlots.length + 1),
          startTime: shift.startTime,
          endTime: shift.endTime,
        });
      }
    });

    return Array.from(scheduleByDay.values());
  };

  const configData = initialResponse?.data;

  const hasDefaultTimeSlotLogic = (logic?: IServiceLogic) => {
    if (!logic) {
      return true;
    }

    return (
      logic.bufferTime === defaultTimeSlotLogic.bufferTime &&
      logic.turnTime === defaultTimeSlotLogic.turnTime &&
      logic.bookingInterval === defaultTimeSlotLogic.bookingInterval
    );
  };

  const hasExistingServiceShiftData = (payload?: IServiceShiftPayload[]) => {
    if (!payload || payload.length === 0) {
      return false;
    }

    return payload.some(
      (shift) =>
        shift.isOpen || shift.startTime !== null || shift.endTime !== null,
    );
  };

  const shouldCreateConfig =
    !configData ||
    (!hasExistingServiceShiftData(configData.serviceShiftPayload) &&
      hasDefaultTimeSlotLogic(configData.timeSlotLogic));

  const resolvedTimeSlotLogic =
    configData?.timeSlotLogic &&
    typeof configData.timeSlotLogic.bufferTime === "number" &&
    typeof configData.timeSlotLogic.turnTime === "number" &&
    typeof configData.timeSlotLogic.bookingInterval === "number"
      ? configData.timeSlotLogic
      : defaultTimeSlotLogic;

  const handleSave = async () => {
    const payload: IMutateScheduleConfig = {
      timeSlotLogic,
      serviceShiftPayload: scheduleDataRef.current
        .map((day) => {
          if (!day.isOpen) {
            return {
              day: day.day,
              isOpen: false,
              startTime: null,
              endTime: null,
            };
          }
          return day.timeSlots
            .map((slot) => ({
              day: day.day,
              isOpen: true,
              startTime: slot.startTime,
              endTime: slot.endTime,
            }))
            .filter((slot) => slot.startTime && slot.endTime);
        })
        .flat(),
    };

    const mutation = shouldCreateConfig ? postMutation : patchMutation;

    mutation.mutate({
      url: "Configs",
      body: payload,
    });
  };

  if (isLoading) {
    return <ServiceHoursAndRulesSkeleton />;
  }

  const isSaving = postMutation.isPending || patchMutation.isPending;

  const isSaveDisabled =
    isSaving || !isServiceLogicValid || !isOpeningHoursValid;

  return (
    <div className="flex flex-col items-start text-left gap-8 max-w-7xl">
      <h1 className="text-3xl font-light text-[#FF6B6B]">
        Service Hours & Rules
      </h1>

      <div className="flex flex-col gap-8 w-full">
        {/* Service Logic Card */}
        <ServiceLogicCard
          initialValues={resolvedTimeSlotLogic}
          onValuesChange={handleTimeSlotLogicChange}
          onValidityChange={handleServiceLogicValidityChange}
        />

        {/* Standard Opening Hours */}
        <div>
          <StandardOpeningHours
            initialSchedule={transformShiftPayloadToDaySchedule(
              configData?.serviceShiftPayload,
            )}
            onScheduleChange={handleScheduleChange}
            onValidityChange={handleOpeningHoursValidityChange}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          text="Save"
          className="bg-[#ff6b6b] text-white p-[12px] rounded-xl box-shadow w-48 shadow-md"
          type="submit"
          state={!isSaving}
          disabled={isSaveDisabled}
          id="submit"
          onClick={handleSave}
        />
      </div>
    </div>
  );
}
