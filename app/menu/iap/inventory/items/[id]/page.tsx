"use client";

import { Form, Formik, Field, ErrorMessage } from "formik";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { ScrollPanel } from "primereact/scrollpanel";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IInventoryCurrency,
  IInventoryItem,
  IInventoryItemUpdateRequest,
  IInventoryUoM,
  NullableNumberLike,
} from "@/data-types";
import { AddInventoryItemSchema } from "@/schemas";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePatchQuery } from "@/services/queries/patchQuery";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface InitialValues {
  itemNumber: string;
  itemName: string;
  openingQuantity: string;
  itemType: string;
  itemCategory: string;
  uom: string;
  unitPrice: string;
  currency: string;
  remarks: string;
  minimumStockLevel: string;
  maximumStockLevel: string;
  reorderLevel: string;
  storageLocation: string;
  shelfLife: string;
  storageConditions: string;
  sku: string;
  expiryDate: string;
}

const itemTypeOptions = [
  { label: "Inventory", value: "Inventory" },
  { label: "Service", value: "Service" },
];

const itemCategoryOptions = [
  { label: "Raw Food", value: "Raw Food" },
  { label: "Beverages", value: "Beverages" },
  { label: "Dry Goods", value: "Dry Goods" },
  { label: "Equipment", value: "Equipment" },
];

const toStringValue = (value: NullableNumberLike | undefined): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const formatDateForInput = (value?: string | null): string => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
};

export default function EditInventoryItemPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params?.id;
  const toastRef = useToastRef();
  const isViewMode = searchParams?.get("mode") === "view";

  const { data: uomResponse } = useGetQuery<
    IBaseApiResponse<IInventoryUoM[]>,
    undefined
  >(["inventoryUoms"], "/Inventory/uoms", undefined, { toastRef });

  const { data: currencyResponse } = useGetQuery<
    IBaseApiResponse<IInventoryCurrency[]>,
    undefined
  >(["inventoryCurrencies"], "/Inventory/currencies", undefined, { toastRef });

  const uomOptions = (uomResponse?.data ?? []).map((uom) => ({
    label: `${uom.uoM} - ${uom.description}`,
    value: uom.uoM,
  }));

  const currencyOptions = (currencyResponse?.data ?? []).map((currency) => ({
    label: `${currency.currencyCode} - ${currency.description}`,
    value: currency.currencyCode,
  }));

  const patchMutation = usePatchQuery({
    redirectPath: "/menu/iap/inventory/items",
    successMessage: "Inventory item updated successfully!",
    toastRef,
  });

  const {
    data: itemResponse,
    isLoading,
    isFetching,
  } = useGetQuery<IBaseApiResponse<IInventoryItem>, undefined>(
    ["getInventoryItem", id ?? ""],
    `/Inventory/items/${id}`,
    undefined,
    {
      enabled: !!id,
      toastRef,
    },
  );

  const itemData =
    itemResponse && "data" in itemResponse ? itemResponse.data : itemResponse;
  const isInitialLoading = (isLoading || isFetching) && !itemData;

  if (isInitialLoading) {
    return (
      <div className="p-6 text-sm text-gray-600">Loading inventory item...</div>
    );
  }

  return (
    <Formik<InitialValues>
      enableReinitialize
      initialValues={{
        itemNumber: itemData?.itemNumber ?? "",
        itemName: itemData?.itemName ?? "",
        openingQuantity: toStringValue(itemData?.openingQuantity),
        itemType: itemData?.itemType ?? "",
        itemCategory: itemData?.itemCategory ?? "",
        uom: itemData?.uoM ?? itemData?.uom ?? "",
        unitPrice: toStringValue(itemData?.unitPrice),
        currency: itemData?.currency ?? "",
        remarks: itemData?.remarks ?? "",
        minimumStockLevel: toStringValue(itemData?.minimumStockLevel),
        maximumStockLevel: toStringValue(itemData?.maximumStockLevel),
        reorderLevel: toStringValue(
          itemData?.reOrderLevel ?? itemData?.reorderLevel,
        ),
        storageLocation: itemData?.storageLocation ?? "",
        shelfLife: toStringValue(itemData?.shelveLife ?? itemData?.shelfLife),
        storageConditions: itemData?.storageConditions ?? "",
        sku: itemData?.sku ?? "",
        expiryDate: formatDateForInput(itemData?.expiryDate),
      }}
      validationSchema={AddInventoryItemSchema}
      onSubmit={(values) => {
        if (!id) return;

        const body: IInventoryItemUpdateRequest = {
          itemNumber: values.itemNumber,
          itemName: values.itemName,
          openingQuantity: Number(values.openingQuantity),
          itemType: values.itemType,
          itemCategory: values.itemCategory,
          uoM: values.uom,
          unitPrice: values.unitPrice ? Number(values.unitPrice) : null,
          currency: values.currency || null,
          remarks: values.remarks || null,
          minimumStockLevel: values.minimumStockLevel
            ? Number(values.minimumStockLevel)
            : null,
          maximumStockLevel: values.maximumStockLevel
            ? Number(values.maximumStockLevel)
            : null,
          reOrderLevel: values.reorderLevel
            ? Number(values.reorderLevel)
            : null,
          storageLocation: values.storageLocation || null,
          shelveLife: values.shelfLife ? Number(values.shelfLife) : null,
          storageConditions: values.storageConditions || null,
          sku: values.sku || null,
          expiryDate: values.expiryDate || null,
        };

        patchMutation.mutate({ url: `Inventory/items/${id}`, body });
      }}
    >
      {() => (
        <ScrollPanel style={{ width: "100%", height: "100vh" }}>
          <Form className="p-6">
            <div className="max-w-7xl">
              <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
                {isViewMode ? "View Inventory Item" : "Update Inventory Item"}
              </h1>
              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-800 mb-2">
                  Item Details
                </h2>
                <hr className="mb-4 border-gray-300" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
                  <LabelGroup
                    label="Item Number*"
                    name="itemNumber"
                    type="text"
                    placeholder="Item Number"
                    id="itemNumber"
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="Item Name*"
                    name="itemName"
                    type="text"
                    placeholder="Item Name"
                    id="itemName"
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="Opening  Quantity*"
                    name="openingQuantity"
                    type="number"
                    placeholder="Opening Quantity"
                    id="openingQuantity"
                    disabled={isViewMode}
                  />
                  <Dropdown
                    name="itemType"
                    id="itemType"
                    label="Item Type*"
                    placeholder="Select Item Type"
                    options={itemTypeOptions}
                    disabled={isViewMode}
                  />
                  <Dropdown
                    name="itemCategory"
                    id="itemCategory"
                    label="Item Category*"
                    placeholder="Select Item Category"
                    options={itemCategoryOptions}
                    disabled={isViewMode}
                  />
                  <Dropdown
                    name="uom"
                    id="uom"
                    label="UOM*"
                    placeholder="Select UOM"
                    options={uomOptions}
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="Unit Price"
                    name="unitPrice"
                    type="number"
                    placeholder="0.00"
                    id="unitPrice"
                    disabled={isViewMode}
                    showDecimals
                  />
                  <Dropdown
                    name="currency"
                    id="currency"
                    label="Currency"
                    placeholder="Select Currency"
                    options={currencyOptions}
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
                  <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                    <label className="form-label" htmlFor="remarks">
                      Remarks
                    </label>
                    <Field
                      as="textarea"
                      name="remarks"
                      id="remarks"
                      className="form-control"
                      placeholder="Enter Remarks"
                      rows={4}
                      disabled={isViewMode}
                    />
                    <ErrorMessage
                      name="remarks"
                      render={(msg) => (
                        <div className="text-red text-xs mt-1">{msg}</div>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-800 mb-2">
                  Item Management Information
                </h2>
                <hr className="mb-4 border-gray-300" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                  <LabelGroup
                    label="Minimum Stock Level"
                    name="minimumStockLevel"
                    type="number"
                    placeholder="Minimum Stock Level"
                    id="minimumStockLevel"
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="Maximum Stock Level"
                    name="maximumStockLevel"
                    type="number"
                    placeholder="Maximum Stock Level"
                    id="maximumStockLevel"
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="Re-Order Level"
                    name="reorderLevel"
                    type="number"
                    placeholder="Re-Order Level"
                    id="reorderLevel"
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="Storage Location"
                    name="storageLocation"
                    type="text"
                    placeholder="Storage Location"
                    id="storageLocation"
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="Shelve Life (Days)"
                    name="shelfLife"
                    type="number"
                    placeholder="Shelve Life (Days)"
                    id="shelfLife"
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="Storage Conditions"
                    name="storageConditions"
                    type="text"
                    placeholder="Storage Conditions"
                    id="storageConditions"
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="SKU"
                    name="sku"
                    type="text"
                    placeholder="SKU"
                    id="sku"
                    disabled={isViewMode}
                  />
                  <LabelGroup
                    label="Expiry Date"
                    name="expiryDate"
                    type="date"
                    placeholder="Expiry Date"
                    id="expiryDate"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {!isViewMode && (
                <div className="flex gap-4 mt-2 mb-8">
                  <Button
                    text="Reset"
                    className="bg-[#696E79] text-white p-[12px] rounded-xl box-shadow w-full"
                    type="reset"
                    state={true}
                    disabled={patchMutation.isPending}
                    id="reset"
                  />
                  <Button
                    text="Update"
                    className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                    type="submit"
                    state={!patchMutation.isPending}
                    disabled={patchMutation.isPending}
                    id="submit"
                  />
                </div>
              )}
            </div>
          </Form>
        </ScrollPanel>
      )}
    </Formik>
  );
}
