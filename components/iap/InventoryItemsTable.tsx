"use client";

import { useState } from "react";
import { Formik, Form } from "formik";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IInventoryItem,
  IInventoryUoM,
  IPaginatedApiResponse,
} from "@/data-types";
import { InventoryStatus } from "@/enums/inventoryStatus";
import { useGetQuery } from "@/services/queries/getQuery";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";

interface InventoryItemsFilters {
  itemNumber: string;
  itemName: string;
  uoM: string;
  inventoryStatus?: number;
  pageNumber: number;
  pageSize: number;
}

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });
const TableSkeleton = dynamic(
  () => import("@/components/skeletons/TableSkeleton"),
  { ssr: false },
);

export default function InventoryItemsTable() {
  const router = useRouter();
  const toastRef = useToastRef();

  const initialFilters: InventoryItemsFilters = {
    itemNumber: "",
    itemName: "",
    uoM: "",
    inventoryStatus: undefined,
    pageNumber: 1,
    pageSize: 10,
  };

  const [filters, setFilters] = useState<InventoryItemsFilters>({
    ...initialFilters,
  });

  const queryParams: InventoryItemsFilters = {
    ...filters,
    itemNumber: filters.itemNumber?.trim() || "",
    itemName: filters.itemName?.trim() || "",
    uoM: filters.uoM || "",
    inventoryStatus: filters.inventoryStatus,
  };

  const { data: uomResponse } = useGetQuery<
    IBaseApiResponse<IInventoryUoM[]>,
    undefined
  >(["inventoryUoms"], "/Inventory/uoms", undefined, { toastRef });

  const uomOptions = (uomResponse?.data ?? []).map((uom) => ({
    label: `${uom.uoM} - ${uom.description}`,
    value: uom.uoM,
  }));

  const inventoryStatusOptions = [
    { label: "In Stock", value: InventoryStatus.InStock },
    { label: "Low Stock", value: InventoryStatus.LowStock },
    { label: "High Stock", value: InventoryStatus.HighStock },
    { label: "Discontinued", value: InventoryStatus.Discontinued },
  ];

  const { data: itemsData, isLoading: isItemsLoading } = useGetQuery<
    IPaginatedApiResponse<IInventoryItem>,
    InventoryItemsFilters
  >(
    ["inventoryItems", JSON.stringify(queryParams)],
    "/Inventory/items",
    queryParams,
    {
      toastRef,
    },
  );

  const rows = itemsData?.data?.items ?? [];
  const totalRecords = itemsData?.data?.totalItemCount ?? 0;

  const onPage = (event: any) => {
    setFilters((prev) => ({
      ...prev,
      pageNumber: event.page + 1,
      pageSize: event.rows,
    }));
  };

  const handleFilter = (values: InventoryItemsFilters) => {
    setFilters((prev) => ({
      ...prev,
      itemNumber: values.itemNumber,
      itemName: values.itemName,
      uoM: values.uoM,
      inventoryStatus: values.inventoryStatus,
      pageNumber: 1,
    }));
  };

  const resolveItemId = (item: IInventoryItem): string | null => {
    if (item.id !== undefined && item.id !== null) return String(item.id);
    if (item.itemNumber) return item.itemNumber;
    return null;
  };

  const handleUpdate = (item: IInventoryItem) => {
    const itemId = resolveItemId(item);
    if (!itemId) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing Identifier",
        detail: "Unable to open update page because item id is unavailable.",
        life: 3000,
      });
      return;
    }

    router.push(`/menu/iap/inventory/items/${itemId}`);
  };

  const handleViewMore = (item: IInventoryItem) => {
    const itemId = resolveItemId(item);
    if (!itemId) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing Identifier",
        detail: "Unable to open item details because item id is unavailable.",
        life: 3000,
      });
      return;
    }

    router.push(`/menu/iap/inventory/items/${itemId}?mode=view`);
  };

  const handlePrintSku = async (item: IInventoryItem) => {
    const sku = item.sku ?? item.itemNumber ?? "N/A";
    const itemName = item.itemName ?? "Inventory Item";

    const popW = 800;
    const popH = 600;
    const left = Math.round((screen.width - popW) / 2);
    const top = Math.round((screen.height - popH) / 2);
    const printWindow = window.open(
      "",
      "_blank",
      `width=${popW},height=${popH},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );
    if (!printWindow) {
      toastRef.current?.show({
        severity: "error",
        summary: "Print Blocked",
        detail: "Unable to open print window. Please allow pop-ups and retry.",
        life: 4000,
      });
      return;
    }

    const doc = printWindow.document;
    doc.open();
    doc.close();

    if (!doc.head || !doc.body) {
      toastRef.current?.show({
        severity: "error",
        summary: "Print Failed",
        detail: "Unable to prepare printable content.",
        life: 4000,
      });
      return;
    }

    doc.title = "Print SKU";

    const style = doc.createElement("style");
    style.textContent =
      "*, *::before, *::after { box-sizing: border-box; }" +
      "body { font-family: Arial, sans-serif; margin: 0; padding: 32px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }" +
      ".label { background: #fff; border: 1px solid #ddd; border-radius: 12px; padding: 40px 48px; max-width: 520px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }" +
      ".heading { color: #15B097; font-size: 22px; font-weight: 700; margin-bottom: 6px; }" +
      ".name { font-size: 15px; color: #444; margin-bottom: 20px; }" +
      ".barcode-wrap { display: flex; justify-content: center; margin: 16px 0; }" +
      ".barcode-wrap svg { width: 100%; max-width: 420px; height: auto; }" +
      ".sku { font-size: 18px; font-weight: 700; letter-spacing: 2px; text-align: center; margin-top: 12px; color: #111; }" +
      ".print-btn { display: block; margin: 28px auto 0; padding: 10px 36px; background: #15B097; color: #fff; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }" +
      "@media print { .print-btn { display: none; } body { background: #fff; padding: 0; } }";
    doc.head.appendChild(style);

    const label = doc.createElement("div");
    label.className = "label";

    const heading = doc.createElement("div");
    heading.className = "heading";
    heading.textContent = "SKU Label";

    const name = doc.createElement("div");
    name.className = "name";
    name.textContent = itemName;

    const barcodeWrap = doc.createElement("div");
    barcodeWrap.className = "barcode-wrap";

    const barcodeSvg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");

    try {
      const { default: JsBarcode } = await import("jsbarcode");
      JsBarcode(barcodeSvg, sku, {
        format: "CODE128",
        displayValue: false,
        lineColor: "#000000",
        width: 2,
        height: 70,
        margin: 0,
      });
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: "Print Failed",
        detail: "Unable to generate barcode for printing.",
        life: 4000,
      });
      printWindow.close();
      return;
    }

    const skuValue = doc.createElement("div");
    skuValue.className = "sku";
    skuValue.textContent = sku;

    const printBtn = doc.createElement("button");
    printBtn.className = "print-btn";
    printBtn.textContent = "Print";
    printBtn.onclick = () => printWindow.print();

    barcodeWrap.appendChild(barcodeSvg);

    label.appendChild(heading);
    label.appendChild(name);
    label.appendChild(barcodeWrap);
    label.appendChild(skuValue);
    label.appendChild(printBtn);
    doc.body.appendChild(label);

    printWindow.focus();
  };

  const renderIdentity = (rowData: IInventoryItem) => {
    return (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">
          {rowData.itemNumber || "-"}
        </span>
        <span className="text-xs text-gray-500">{rowData.itemName || "-"}</span>
      </div>
    );
  };

  const renderSkuOrBarcode = (rowData: IInventoryItem) => {
    return <span>{rowData.sku || rowData.barCode || "-"}</span>;
  };

  const renderCategoryType = (rowData: IInventoryItem) => {
    const category = rowData.itemCategory || "-";
    const type = rowData.itemType || "-";
    return <span>{`${category} / ${type}`}</span>;
  };

  const renderStockLevel = (rowData: IInventoryItem) => {
    const quantity = rowData.currentQuantity ?? rowData.openingQuantity;
    return <span>{quantity ?? "-"}</span>;
  };

  const renderUom = (rowData: IInventoryItem) => {
    return <span>{rowData.uoM || rowData.uom || "-"}</span>;
  };

  const renderUnitPrice = (rowData: IInventoryItem) => {
    const amount = rowData.unitPrice;
    const currency = rowData.currency || "";

    if (amount === null || amount === undefined || amount === "")
      return <span>-</span>;

    const numericAmount = Number(amount);
    const formattedAmount = Number.isNaN(numericAmount)
      ? String(amount)
      : numericAmount.toFixed(2);

    const formattedWithCurrency = currency
      ? formattedAmount + " " + currency
      : formattedAmount;

    return <span>{formattedWithCurrency}</span>;
  };

  const renderStatus = (rowData: IInventoryItem) => {
    const statusValue = Number(rowData.inventoryStatus);
    let statusLabel = "-";
    let statusClasses = "bg-gray-100 text-gray-700";

    if (statusValue === InventoryStatus.InStock) {
      statusLabel = "In Stock";
      statusClasses = "bg-green-100 text-green-700";
    } else if (statusValue === InventoryStatus.LowStock) {
      statusLabel = "Low Stock";
      statusClasses = "bg-yellow-100 text-yellow-700";
    } else if (statusValue === InventoryStatus.HighStock) {
      statusLabel = "High Stock";
      statusClasses = "bg-blue-100 text-blue-700";
    } else if (statusValue === InventoryStatus.Discontinued) {
      statusLabel = "Discontinued";
      statusClasses = "bg-red-100 text-red-700";
    } else if (
      rowData.inventoryStatus !== undefined &&
      rowData.inventoryStatus !== null
    ) {
      statusLabel = String(rowData.inventoryStatus);
    }

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
      >
        {statusLabel}
      </span>
    );
  };

  const renderActions = (rowData: IInventoryItem) => {
    return (
      <div className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap min-w-max">
        <button
          type="button"
          className="bg-[#15B097] text-white py-1 px-3 rounded-md hover:opacity-90"
          onClick={() => handleUpdate(rowData)}
        >
          Update
        </button>
        <button
          type="button"
          className="bg-[#15B097] text-white py-1 px-3 rounded-md hover:opacity-90"
          onClick={() => handlePrintSku(rowData)}
        >
          Print SKU
        </button>
        <button
          type="button"
          className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
          onClick={() => handleViewMore(rowData)}
        >
          View More
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Formik<InventoryItemsFilters>
        initialValues={filters}
        enableReinitialize
        onSubmit={handleFilter}
      >
        {({ resetForm }) => (
          <Form>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <LabelGroup
                label="Item Number"
                name="itemNumber"
                type="text"
                placeholder="Item Number"
                id="filterItemNumber"
                disabled={false}
              />
              <LabelGroup
                label="Item Name"
                name="itemName"
                type="text"
                placeholder="Item Name"
                id="filterItemName"
                disabled={false}
              />
              <Dropdown
                name="uoM"
                id="filterUom"
                label="UoM"
                placeholder="Select UoM"
                options={uomOptions}
                showClearOption
              />
              <Dropdown
                name="inventoryStatus"
                id="filterInventoryStatus"
                label="Inventory Status"
                placeholder="Select Status"
                options={inventoryStatusOptions}
                showClearOption
              />
            </div>
            <div className="mb-4 flex gap-2">
              <Button
                id="filterInventoryBtn"
                text="Filter"
                type="submit"
                className="bg-[#15B097] text-white px-4 py-2 rounded-md"
                state={true}
              />
              <Button
                id="clearInventoryFilterBtn"
                text="Clear"
                type="button"
                className="bg-white border border-[#15B097] text-[#15B097] px-4 py-2 rounded-md"
                state={true}
                onClick={() => {
                  resetForm({ values: initialFilters });
                  setFilters(initialFilters);
                }}
              />
            </div>
          </Form>
        )}
      </Formik>

      {isItemsLoading ? (
        <TableSkeleton rows={8} columns={8} />
      ) : (
        <DataTable
          value={rows}
          stripedRows
          paginator
          lazy
          first={(filters.pageNumber - 1) * filters.pageSize}
          rows={filters.pageSize}
          totalRecords={totalRecords}
          onPage={onPage}
          rowsPerPageOptions={[10, 20, 50]}
          emptyMessage="No inventory items found"
        >
          <Column header="Item Identity" body={renderIdentity} />
          <Column header="SKU / Barcode" body={renderSkuOrBarcode} />
          <Column header="Category / Type" body={renderCategoryType} />
          <Column header="Stock Level" body={renderStockLevel} />
          <Column header="UoM" body={renderUom} />
          <Column header="Unit Price" body={renderUnitPrice} />
          <Column header="Status" body={renderStatus} />
          <Column header="Actions" body={renderActions} />
        </DataTable>
      )}
    </div>
  );
}
