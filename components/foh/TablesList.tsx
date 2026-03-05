"use client";

import { IBaseApiResponse, ITable } from "@/data-types";
import { useDeleteQuery } from "@/services/queries/deleteQuery";
import { useGetQuery } from "@/services/queries/getQuery";
import { InputSwitch } from "primereact/inputswitch";
import Button from "../Button";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useToastRef } from "@/contexts/ToastContext";

export default function TablesList() {
  const toastRef = useToastRef();

  const { data: tablesData, isLoading } = useGetQuery<
    IBaseApiResponse<ITable[]>,
    {}
  >(["tables"], "/Tables", undefined, { enabled: true, toastRef });

  const { mutate: deleteTable } = useDeleteQuery({
    invalidateKey: ["tables"],
    successMessage: "Table deleted successfully",
    toastRef: toastRef,
  });

  const handleDelete = (tableId: number) => {
    if (confirm("Are you sure you want to delete this table?")) {
      deleteTable(
        { url: `/tables/${tableId}` },
        {
          onSuccess: () => {
            console.log(
              "Table deleted successfully, cache should be invalidated",
            );
          },
          onError: (error) => {
            console.error("Failed to delete table:", error);
            toastRef?.current?.show({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete table",
              life: 3000,
            });
          },
        },
      );
    }
  };

  const statusBodyTemplate = (rowData: ITable) => {
    return (
      <InputSwitch
        checked={rowData.isOnlineBookingEnabled}
        disabled
        className="custom-toggle"
      />
    );
  };

  const actionBodyTemplate = (rowData: ITable) => {
    return (
      <div className="flex justify-center">
        <Button
          text="Remove"
          className="!border !border-[#FF6B6B] !text-[#FF6B6B] px-2 py-2 rounded"
          id={`remove-${rowData.id}`}
          state={true}
          onClick={() => handleDelete(rowData.id)}
          outlined={true}
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Card
        className="border-2 border-[#FF6B6B] rounded-2xl bg-white h-full flex flex-col overflow-hidden"
        title={
          <div className="text-2xl font-bold text-[#FF6B6B]">
            Existing Tables
          </div>
        }
      >
        <DataTable
          value={tablesData?.data}
          loading={isLoading}
          stripedRows
          emptyMessage="No tables found. Add your first table!"
          scrollable
          scrollHeight="300px"
          className="tables-list-datatable"
        >
          <Column field="tableName" header="Table Name" sortable />
          <Column field="capacity" header="Capacity" sortable />
          <Column
            header="Online Booking Status"
            body={statusBodyTemplate}
            style={{ textAlign: "center" }}
          />
          <Column
            body={actionBodyTemplate}
            style={{ textAlign: "center", width: "150px" }}
          />
        </DataTable>
      </Card>
    </div>
  );
}
