import { useToastRef } from "@/contexts/ToastContext";
import { IBaseApiResponse, IExclusion } from "@/data-types";
import { useDeleteQuery } from "@/services/queries/deleteQuery";
import { useGetQuery } from "@/services/queries/getQuery";
import Button from "../Button";
import { DataTable } from "primereact/datatable";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { getLocalDateFromISODateString } from "@/utils/datetimeUtils";

export default function ExclusionsList() {
  const toastRef = useToastRef();

  const { data: exclusionsData, isLoading } = useGetQuery<
    IBaseApiResponse<IExclusion[]>,
    {}
  >(["exclusions"], "/CalenderExclusions", undefined, { enabled: true, toastRef });

  const { mutate: deleteExclusion } = useDeleteQuery({
    invalidateKey: ["exclusions"],
    successMessage: "Calendar Exclusion deleted successfully",
    toastRef: toastRef,
  });

  const handleDelete = (exclusionId: number) => {
    if (confirm("Are you sure you want to delete this calendar exclusion?")) {
      deleteExclusion(
        { url: `/CalenderExclusions/${exclusionId}` },
        {
          onSuccess: () => {
            console.log(
              "Calendar exclusion deleted successfully, cache should be invalidated",
            );
          },
          onError: (error) => {
            console.error("Failed to delete calendar exclusion:", error);
            toastRef?.current?.show({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete calendar exclusion",
              life: 3000,
            });
          },
        },
      );
    }
  };

  const actionBodyTemplate = (rowData: IExclusion) => {
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

  const renderExclusionDate = (date: Date | string) => {
    console.log("Rendering exclusion date:", date);
    const datetime = getLocalDateFromISODateString(date)
    return <div>{datetime}</div>
  }

  return (
    <div className="h-full flex flex-col">
      <Card
        className="border-2 border-[#FF6B6B] rounded-2xl bg-white h-full flex flex-col overflow-hidden"
        title={
          <div className="text-2xl font-bold text-[#FF6B6B]">
            Existing Exclusions
          </div>
        }
      >
        <DataTable
          value={exclusionsData?.data}
          loading={isLoading}
          stripedRows
          emptyMessage="No calendar exclusions found. Add your first exclusion!"
          scrollable
          scrollHeight="300px"
          className="tables-list-datatable"
        >
          <Column body={(rowData) => renderExclusionDate(rowData.exclusionDate)} header="Exclusion Date" sortable />
          <Column field="reason" header="Reason" sortable />
          <Column
            body={actionBodyTemplate}
            style={{ textAlign: "center", width: "150px" }}
          />
        </DataTable>
      </Card>
    </div>
  );
}
