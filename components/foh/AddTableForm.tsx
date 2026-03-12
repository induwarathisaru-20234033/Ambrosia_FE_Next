"use client";

import { useToastRef } from "@/contexts/ToastContext";
import { AddTableSchema } from "@/schemas";
import { usePostQuery } from "@/services/queries/postQuery";
import { Form, Formik, FormikHelpers } from "formik";
import { useState } from "react";
import { Card } from "primereact/card";
import LabelGroup from "../LabelGroup";
import { InputSwitch } from "primereact/inputswitch";
import Button from "../Button";
import { IMutateTable } from "@/data-types";

interface InitialValues {
  tableName: string;
  capacity: number;
  isOnlineBookingEnabled: boolean;
}

interface AddTableFormProps {
  onTableAdded?: () => void;
}

export default function AddTableForm({
  onTableAdded,
}: Readonly<AddTableFormProps>) {
  const toastRef = useToastRef();
  const [submitted, setSubmitted] = useState(false);

  const { mutate: addTable, isPending } = usePostQuery({
    invalidateKey: ["tables"],
    successMessage: "Table added successfully",
    toastRef: toastRef,
  });

  const initialValues: InitialValues = {
    tableName: "",
    capacity: 1,
    isOnlineBookingEnabled: false,
  };

  const handleSubmit = (
    values: InitialValues,
    { resetForm }: FormikHelpers<InitialValues>,
  ) => {
    setSubmitted(true);

    const tableData: IMutateTable = {
      tableName: values.tableName,
      capacity: values.capacity,
      isOnlineBookingEnabled: values.isOnlineBookingEnabled,
    };

    addTable(
      { url: "/tables", body: tableData },
      {
        onSuccess: () => {
          resetForm();
          setSubmitted(false);
          onTableAdded?.();
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
      validationSchema={AddTableSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="h-full">
          <Card
            className="border-2 border-[#FF6B6B] rounded-2xl bg-white h-full"
            title={
              <div className="text-2xl font-bold text-[#FF6B6B]">Add Table</div>
            }
          >
            <div className="flex flex-col gap-6">
              {/* Table Name Field */}
              <div>
                <label
                  htmlFor="tableName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Table Name*
                </label>
                <LabelGroup
                  id="tableName"
                  name="tableName"
                  type="text"
                  placeholder="Enter table name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* Capacity Field */}
              <div>
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Capacity*
                </label>
                <LabelGroup
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="Enter capacity"
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* Online Booking Toggle */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="isOnlineBookingEnabled"
                  className="text-sm font-medium text-gray-700"
                >
                  Online Booking Enabled*
                </label>
                <InputSwitch
                  id="isOnlineBookingEnabled"
                  checked={values.isOnlineBookingEnabled}
                  onChange={(e) =>
                    setFieldValue("isOnlineBookingEnabled", e.value)
                  }
                  className="custom-toggle custom-toggle-coral"
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
