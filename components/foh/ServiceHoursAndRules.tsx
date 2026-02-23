"use client";

import { useToastRef } from "@/contexts/ToastContext";
import {
  IDaySchedule,
  IMutateScheduleConfig,
  IServiceLogic,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePostQuery } from "@/services/queries/postQuery";
import { useRef, useState } from "react";
import { StandardOpeningHours } from "./OpeningHoursForm";
import ServiceLogicCard from "./ServiceLogicCard";
import Button from "../Button";
import ServiceHoursAndRulesSkeleton from "../skeletons/ServiceHoursAndRulesSkeleton";

export default function ServiceHoursAndRules() {
  const toastRef = useToastRef();
  const scheduleDataRef = useRef<IDaySchedule[]>([]);
  const [timeSlotLogic, setTimeSlotLogic] = useState<IServiceLogic>({
    bufferTime: 10,
    turnTime: 30,
    bookingInterval: 15,
  });
  const [isServiceLogicValid, setIsServiceLogicValid] = useState(true);
  const [isOpeningHoursValid, setIsOpeningHoursValid] = useState(true);

  const { data: initialData, isLoading } = useGetQuery<
    IMutateScheduleConfig,
    void
  >(["getScheduleConfig"], "Configs");

  const postMutation = usePostQuery({
    invalidateKey: ["schedule"],
    successMessage: "Schedule saved successfully",
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
    payload?: IServiceLogic extends any ? any : never,
  ): IDaySchedule[] | undefined => {
    if (!payload) return undefined;

    const grouped = payload.reduce((acc: Record<string, any>, shift: any) => {
      if (!acc[shift.day]) {
        acc[shift.day] = {
          day: shift.day,
          dayName: shift.day,
          isOpen: shift.isOpen,
          timeSlots: [],
        };
      }
      if (shift.isOpen && shift.startTime && shift.endTime) {
        acc[shift.day].timeSlots.push({
          startTime: shift.startTime,
          endTime: shift.endTime,
        });
      }
      return acc;
    }, {});

    return Object.values(grouped);
  };

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
    postMutation.mutate({
      url: "Configs",
      body: payload,
    });
  };

  if (isLoading) {
    return <ServiceHoursAndRulesSkeleton />;
  }

  const isSaveDisabled =
    postMutation.isPending || !isServiceLogicValid || !isOpeningHoursValid;

  return (
    <div className="flex flex-col items-start text-left gap-8 max-w-7xl">
      <h1 className="text-3xl font-light text-[#FF6B6B]">
        Service Hours & Rules
      </h1>

      <div className="flex flex-col gap-8 w-full">
        {/* Service Logic Card */}
        <ServiceLogicCard
          initialValues={
            initialData?.timeSlotLogic ?? {
              bufferTime: 10,
              turnTime: 30,
              bookingInterval: 15,
            }
          }
          onValuesChange={handleTimeSlotLogicChange}
          onValidityChange={handleServiceLogicValidityChange}
        />

        {/* Standard Opening Hours */}
        <div>
          <StandardOpeningHours
            initialSchedule={transformShiftPayloadToDaySchedule(
              initialData?.serviceShiftPayload,
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
          className="bg-[#ff6b6b] text-white p-[12px] rounded-xl box-shadow w-48"
          type="submit"
          state={!postMutation.isPending}
          disabled={isSaveDisabled}
          id="submit"
          onClick={handleSave}
        />
      </div>
    </div>
  );
}
