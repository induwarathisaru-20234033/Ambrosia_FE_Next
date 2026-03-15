"use client";

import { Form, Formik, Field, ErrorMessage } from "formik";
import dynamic from "next/dynamic";
import { ScrollPanel } from "primereact/scrollpanel";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IInventoryCurrency,
  IInventoryItemCreateRequest,
  IInventoryUoM,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePostQuery } from "@/services/queries/postQuery";
import { AddInventoryItemSchema } from "@/schemas";

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

export default function AddInventoryItemPage() {
  const toastRef = useToastRef();

  const { data: uomResponse } = useGetQuery<
    IBaseApiResponse<IInventoryUoM[]>,
    undefined
  >(["inventoryUoms"], "/Inventory/uoms", undefined, { toastRef });

  const { data: currencyResponse } = useGetQuery<
    IBaseApiResponse<IInventoryCurrency[]>,
    undefined
  >(["inventoryCurrencies"], "/Inventory/currencies", undefined, {
    toastRef,
  });

  const mutation = usePostQuery({
    redirectPath: "/menu/iap/inventory/items",
    successMessage: "Inventory item added successfully!",
    toastRef,
  });

  const uomOptions = (uomResponse?.data ?? []).map((uom) => ({
    label: `${uom.uoM} - ${uom.description}`,
    value: uom.uoM,
  }));

  const currencyOptions = (currencyResponse?.data ?? []).map((currency) => ({
    label: `${currency.currencyCode} - ${currency.description}`,
    value: currency.currencyCode,
  }));

  return (
    <Formik<InitialValues>
      initialValues={{
        itemNumber: "",
        itemName: "",
        openingQuantity: "",
        itemType: "",
        itemCategory: "",
        uom: "",
        unitPrice: "",
        currency: "",
        remarks: "",
        minimumStockLevel: "",
        maximumStockLevel: "",
        reorderLevel: "",
        storageLocation: "",
        shelfLife: "",
        storageConditions: "",
        sku: "",
        expiryDate: "",
      }}
      validationSchema={AddInventoryItemSchema}
      onSubmit={(values) => {
        const body: IInventoryItemCreateRequest = {
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
        mutation.mutate({ url: "Inventory/items", body });
      }}
    >
      {() => (
        <ScrollPanel style={{ width: "100%", height: "100vh" }}>
          <Form className="p-6">
            <div className="max-w-7xl">
              {/* ── Section 1: Item Details ── */}
              <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
                Add Inventory Item
              </h1>
              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-800 mb-2">
                  Item Details
                </h2>
                <hr className="mb-4 border-gray-300" />

                {/* Rows 1 & 2 – 4-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
                  <LabelGroup
                    label="Item Number*"
                    name="itemNumber"
                    type="text"
                    placeholder="Item Number"
                    id="itemNumber"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Item Name*"
                    name="itemName"
                    type="text"
                    placeholder="Item Name"
                    id="itemName"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Opening  Quantity*"
                    name="openingQuantity"
                    type="number"
                    placeholder="Opening Quantity"
                    id="openingQuantity"
                    disabled={false}
                  />
                  <Dropdown
                    name="itemType"
                    id="itemType"
                    label="Item Type*"
                    placeholder="Select Item Type"
                    options={itemTypeOptions}
                  />
                  <Dropdown
                    name="itemCategory"
                    id="itemCategory"
                    label="Item Category*"
                    placeholder="Select Item Category"
                    options={itemCategoryOptions}
                  />
                  <Dropdown
                    name="uom"
                    id="uom"
                    label="UOM*"
                    placeholder="Select UOM"
                    options={uomOptions}
                  />
                  <LabelGroup
                    label="Unit Price"
                    name="unitPrice"
                    type="number"
                    placeholder="0.00"
                    id="unitPrice"
                    disabled={false}
                    showDecimals
                  />
                  <Dropdown
                    name="currency"
                    id="currency"
                    label="Currency"
                    placeholder="Select Currency"
                    options={currencyOptions}
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

              {/* ── Section 2: Item Management Information ── */}
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
                    disabled={false}
                  />
                  <LabelGroup
                    label="Maximum Stock Level"
                    name="maximumStockLevel"
                    type="number"
                    placeholder="Maximum Stock Level"
                    id="maximumStockLevel"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Re-Order Level"
                    name="reorderLevel"
                    type="number"
                    placeholder="Re-Order Level"
                    id="reorderLevel"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Storage Location"
                    name="storageLocation"
                    type="text"
                    placeholder="Storage Location"
                    id="storageLocation"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Shelve Life (Days)"
                    name="shelfLife"
                    type="number"
                    placeholder="Shelve Life (Days)"
                    id="shelfLife"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Storage Conditions"
                    name="storageConditions"
                    type="text"
                    placeholder="Storage Conditions"
                    id="storageConditions"
                    disabled={false}
                  />
                  <LabelGroup
                    label="SKU"
                    name="sku"
                    type="text"
                    placeholder="SKU"
                    id="sku"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Expiry Date"
                    name="expiryDate"
                    type="date"
                    placeholder="Expiry Date"
                    id="expiryDate"
                    disabled={false}
                  />
                </div>
              </div>

              {/* ── Action Buttons ── */}
              <div className="flex gap-4 mt-2 mb-8">
                <Button
                  text="Reset"
                  className="bg-[#696E79] text-white p-[12px] rounded-xl box-shadow w-full"
                  type="reset"
                  state={true}
                  disabled={mutation.isPending}
                  id="reset"
                />
                <Button
                  text="Save"
                  className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                  type="submit"
                  state={!mutation.isPending}
                  disabled={mutation.isPending}
                  id="submit"
                />
              </div>
            </div>
          </Form>
        </ScrollPanel>
      )}
    </Formik>
  );
}
