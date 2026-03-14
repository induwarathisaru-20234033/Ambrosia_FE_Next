import { useToastRef } from "@/contexts/ToastContext";
import { IMutateExclusion } from "@/data-types";
import { usePostQuery } from "@/services/queries/postQuery";
import { Form, Formik, FormikHelpers } from "formik";
import { Card } from "primereact/card";
import { useState } from "react";
import LabelGroup from "../LabelGroup";
import { AddExclusionSchema } from "@/schemas";
import Button from "../Button";
import DatePicker from "../DatePicker";
import {
  getDateTimeCombinedDate,
  setTimeToMidnight,
} from "@/utils/datetimeUtils";

interface InitialValues {
  exclusionDate: Date;
  reason: string;
}

interface AddExclusionFormProps {
  onExclusionAdded?: () => void;
}

export default function AddExclusionForm({
  onExclusionAdded,
}: Readonly<AddExclusionFormProps>) {
  const toastRef = useToastRef();
  const [submitted, setSubmitted] = useState(false);

  const { mutate: addExclusion, isPending } = usePostQuery({
    invalidateKey: ["exclusions"],
    successMessage: "Calendar Exclusion added successfully",
    toastRef: toastRef,
  });

  const initialValues: InitialValues = {
    exclusionDate: new Date(),
    reason: "",
  };

  const handleSubmit = (
    values: InitialValues,
    { resetForm }: FormikHelpers<InitialValues>,
  ) => {
    setSubmitted(true);

    const exclusionData: IMutateExclusion = {
      exclusionDate: getDateTimeCombinedDate(
        values.exclusionDate,
        setTimeToMidnight(values.exclusionDate),
      ),
      reason: values.reason,
    };

    addExclusion(
      { url: "/CalenderExclusions", body: exclusionData },
      {
        onSuccess: () => {
          resetForm();
          setSubmitted(false);
          if (onExclusionAdded) {
            onExclusionAdded();
          }
        },
        onError: () => {
          setSubmitted(false);
        },
      },
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={AddExclusionSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="h-full">
          <Card
            className="border-2 border-[#FF6B6B] rounded-2xl bg-white h-full"
            title={
              <div className="text-2xl font-bold text-[#FF6B6B]">
                Add Exclusion
              </div>
            }
          >
            <div className="flex flex-col gap-6">
              {/* Exclusion Date Field */}
              <div>
                <label
                  htmlFor="exclusionDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Exclusion Date*
                </label>
                <DatePicker
                  name="exclusionDate"
                  id="exclusionDate"
                  placeholder="Enter exclusion date"
                />
              </div>

              {/* Reason Field */}
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reason*
                </label>
                <LabelGroup
                  id="reason"
                  name="reason"
                  type="text"
                  placeholder="Enter reason"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-start gap-4">
                <Button
                  text="Add"
                  type="submit"
                  disabled={isSubmitting || isPending || submitted}
                  className="bg-[#ff6b6b] text-white p-[12px] rounded-xl box-shadow w-48 shadow-md"
                  state={!isSubmitting && !isPending && !submitted}
                  id="submit"
                />
              </div>
            </div>
          </Card>
        </Form>
      )}
    </Formik>
  );
}
