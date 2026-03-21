"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import dynamic from "next/dynamic";
import { useToastRef } from "@/contexts/ToastContext";
import {
  ICreatePurchaseRequestBody,
  IInventoryItem,
  IMaterialLineItem,
  IMaterialSearchParams,
  IPaginatedApiResponse,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePostQuery } from "@/services/queries/postQuery";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import {
  fetchUserProfile,
  getCachedUserProfile,
  type UserProfile,
} from "@/utils/auth/userProfile";

const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface InitialValues {
  description: string;
  supplier: string;
  requester: string;
  requestedDeliveryDate: Date | null;
  urgent: string;
}

const urgentOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

type QuantityChangeHandler = (lineNo: number, value: string) => void;
type RemoveLineHandler = (lineNo: number) => void;

const tableStyle = { minWidth: "50rem" };

const createQuantityBody = (onQuantityChange: QuantityChangeHandler) => {
  return (row: IMaterialLineItem) => (
    <input
      type="number"
      min={0}
      step="any"
      className="form-control !py-1 !text-sm w-20"
      value={row.quantity}
      onChange={(e) => onQuantityChange(row.lineNo, e.target.value)}
    />
  );
};

const unitPriceBody = (row: IMaterialLineItem) => row.unitPrice.toFixed(2);

const totalPriceBody = (row: IMaterialLineItem) =>
  (row.quantity * row.unitPrice).toFixed(2);

const createRemoveBody = (onRemoveLine: RemoveLineHandler) => {
  return (row: IMaterialLineItem) => (
    <button
      type="button"
      className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
      onClick={() => onRemoveLine(row.lineNo)}
    >
      Remove
    </button>
  );
};

const resolveProfileName = (profile: UserProfile | null) => {
  if (!profile) {
    return "";
  }

  if (profile.name) {
    return profile.name;
  }

  const parts = [profile.given_name, profile.family_name].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(" ");
  }

  return profile.email ?? "";
};

export default function AddPurchaseRequestsPage() {
  const toastRef = useToastRef();
  const createPurchaseRequestMutation = usePostQuery({
    redirectPath: "/menu/iap/purchase-requests",
    successMessage: "Purchase request created successfully!",
    toastRef,
  });

  const [materialSearch, setMaterialSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<IInventoryItem | null>(null);
  const [lineItems, setLineItems] = useState<IMaterialLineItem[]>([]);
  const [requesterInitial, setRequesterInitial] = useState(() =>
    resolveProfileName(getCachedUserProfile()),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formikRef = useRef<FormikProps<InitialValues>>(null);

  const { data: materialItemsData } = useGetQuery<
    IPaginatedApiResponse<IInventoryItem>,
    IMaterialSearchParams
  >(
    ["inventoryItemsSearch", debouncedSearch],
    "/Inventory/items",
    { itemName: debouncedSearch, pageNumber: 1, pageSize: 10 },
    { enabled: debouncedSearch.length >= 4, toastRef },
  );

  const materialSuggestions = materialItemsData?.data?.items ?? [];

  useEffect(() => {
    let isMounted = true;

    const hydrateRequester = async () => {
      const freshProfile = await fetchUserProfile();
      if (!isMounted) {
        return;
      }

      const name = resolveProfileName(freshProfile);
      if (!name) {
        return;
      }

      setRequesterInitial(name);

      const currentRequester = formikRef.current?.values.requester?.trim();
      if (!currentRequester) {
        formikRef.current?.setFieldValue("requester", name, false);
      }
    };

    void hydrateRequester();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMaterialSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setMaterialSearch(value);
    setSelectedMaterial(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 4) {
      debounceRef.current = setTimeout(() => {
        setDebouncedSearch(value);
        setShowSuggestions(true);
      }, 500);
    } else {
      setDebouncedSearch("");
      setShowSuggestions(false);
    }
  };

  const handleSelectMaterial = (item: IInventoryItem) => {
    setSelectedMaterial(item);
    setMaterialSearch(item.itemName ?? "");
    setShowSuggestions(false);
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial) return;
    const newLineItem: IMaterialLineItem = {
      lineNo: lineItems.length + 1,
      itemNumber: selectedMaterial.itemNumber ?? "",
      itemName: selectedMaterial.itemName ?? "",
      itemCategory: selectedMaterial.itemCategory ?? "",
      inventoryItemId: Number(selectedMaterial.id ?? 0),
      quantity: 1,
      uoM: selectedMaterial.uoM ?? selectedMaterial.uom ?? "",
      unitPrice: Number(selectedMaterial.unitPrice ?? 0),
    };
    setLineItems((prev) => [...prev, newLineItem]);
    setMaterialSearch("");
    setSelectedMaterial(null);
    setDebouncedSearch("");
  };

  const handleQuantityChange = useCallback((lineNo: number, value: string) => {
    const qty = Math.max(0, Number(value) || 0);
    setLineItems((prev) =>
      prev.map((item) =>
        item.lineNo === lineNo ? { ...item, quantity: qty } : item,
      ),
    );
  }, []);

  const handleRemoveLine = useCallback((lineNo: number) => {
    setLineItems((prev) => {
      const filtered = prev.filter((item) => item.lineNo !== lineNo);
      return filtered.map((item, idx) => ({ ...item, lineNo: idx + 1 }));
    });
  }, []);

  const quantityBody = useMemo(
    () => createQuantityBody(handleQuantityChange),
    [handleQuantityChange],
  );

  const removeBody = useMemo(
    () => createRemoveBody(handleRemoveLine),
    [handleRemoveLine],
  );

  const validateBeforeSubmit = (values: InitialValues) => {
    if (!values.description.trim()) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Description is required.",
        life: 5000,
      });
      return false;
    }

    if (!values.supplier.trim()) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Supplier is required.",
        life: 5000,
      });
      return false;
    }

    if (!values.requester.trim()) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Requester is required.",
        life: 5000,
      });
      return false;
    }

    if (!values.requestedDeliveryDate) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Requested delivery date is required.",
        life: 5000,
      });
      return false;
    }

    if (lineItems.length === 0) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "At least one material line item is required.",
        life: 5000,
      });
      return false;
    }

    if (
      lineItems.some(
        (item) =>
          !Number.isFinite(item.inventoryItemId) ||
          item.inventoryItemId <= 0 ||
          item.quantity <= 0,
      )
    ) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          "Each material line must have a valid item and quantity greater than zero.",
        life: 5000,
      });
      return false;
    }

    return true;
  };

  return (
    <Formik<InitialValues>
      innerRef={formikRef}
      initialValues={{
        description: "",
        supplier: "RCE_HOLDINGS",
        requester: requesterInitial,
        requestedDeliveryDate: null,
        urgent: "Yes",
      }}
      onSubmit={(values) => {
        if (!validateBeforeSubmit(values)) {
          return;
        }

        const body: ICreatePurchaseRequestBody = {
          description: values.description.trim(),
          supplier: values.supplier.trim(),
          requestedBy: values.requester.trim(),
          requestedDeliveryDate: values.requestedDeliveryDate!.toISOString(),
          isUrgent: values.urgent === "Yes",
          prItems: lineItems.map((item) => ({
            lineItemNo: item.lineNo,
            requestedQuantity: item.quantity,
            price: item.unitPrice,
            inventoryItemId: item.inventoryItemId,
          })),
        };

        createPurchaseRequestMutation.mutate({
          url: "PurchaseRequests",
          body,
        });
      }}
    >
      {({ resetForm }) => (
        <Form className="p-3 sm:p-6">
          <div className="max-w-7xl">
            <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
              Add Purchase Request
            </h1>

            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-800 mb-2">
                Requision Details
              </h2>
              <hr className="mb-4 border-gray-300" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                    <label className="form-label" htmlFor="description">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      className="form-control"
                      placeholder="Enter description"
                      rows={3}
                    />
                    <ErrorMessage
                      name="description"
                      render={(msg) => (
                        <div className="text-red text-xs mt-1">{msg}</div>
                      )}
                    />
                  </div>
                </div>

                <LabelGroup
                  label="Supplier"
                  name="supplier"
                  type="text"
                  placeholder="Enter Supplier"
                  id="supplier"
                  disabled={false}
                />

                <LabelGroup
                  label="Requester"
                  name="requester"
                  type="text"
                  placeholder="Enter Requester"
                  id="requester"
                  disabled={false}
                />

                <DatePicker
                  name="requestedDeliveryDate"
                  id="requestedDeliveryDate"
                  label="Requested Delivery Date"
                  placeholder="Select Date"
                />

                <Dropdown
                  name="urgent"
                  id="urgent"
                  label="Urgent"
                  placeholder="Select Urgent Status"
                  options={urgentOptions}
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-800 mb-2">
                Materials
              </h2>
              <hr className="mb-4 border-gray-300" />

              <div
                className="flex items-start gap-2"
                style={{ maxWidth: "24rem" }}
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Item name"
                    value={materialSearch}
                    onChange={handleMaterialSearchChange}
                    onFocus={() => {
                      if (materialSuggestions.length > 0)
                        setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    autoComplete="off"
                  />
                  {showSuggestions && materialSuggestions.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {materialSuggestions.map((item) => (
                        <li key={item.id ?? item.itemNumber}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            onMouseDown={() => handleSelectMaterial(item)}
                          >
                            {item.itemNumber}
                            {item.itemName ? ` - ${item.itemName}` : ""}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button
                  id="add-material-btn"
                  text="Add"
                  type="button"
                  className="!h-9 !px-7 !text-xs !font-medium !rounded-md !bg-[#15B097] !border !border-[#15B097] !text-white !shrink-0 !whitespace-nowrap"
                  state={true}
                  disabled={!selectedMaterial}
                  onClick={handleAddMaterial}
                />
              </div>

              <div className="mt-6">
                <DataTable
                  value={lineItems}
                  emptyMessage=""
                  stripedRows
                  size="small"
                  tableStyle={tableStyle}
                >
                  <Column
                    field="lineNo"
                    header="Line Item No"
                    style={{ width: "6rem", textAlign: "center" }}
                  />
                  <Column field="itemNumber" header="Item Number" />
                  <Column field="itemName" header="Item Name" />
                  <Column field="itemCategory" header="Item Category" />
                  <Column
                    header="Quantity"
                    style={{ width: "8rem" }}
                    body={quantityBody}
                  />
                  <Column field="uoM" header="UoM" />
                  <Column
                    header="Unit Price"
                    style={{ textAlign: "right" }}
                    body={unitPriceBody}
                  />
                  <Column
                    header="Total Price"
                    style={{ textAlign: "right", maxWidth: "8rem" }}
                    body={totalPriceBody}
                  />
                  <Column
                    style={{ width: "10rem", textAlign: "center" }}
                    body={removeBody}
                  />
                </DataTable>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Button
                id="reset-purchase-request-btn"
                text="Reset"
                type="button"
                className="bg-[#696E79] text-white mr-2 p-[12px] rounded-xl box-shadow w-full"
                state={!createPurchaseRequestMutation.isPending}
                disabled={createPurchaseRequestMutation.isPending}
                onClick={() => {
                  resetForm({
                    values: {
                      description: "",
                      supplier: "RCE_HOLDINGS",
                      requester: requesterInitial,
                      requestedDeliveryDate: null,
                      urgent: "Yes",
                    },
                  });
                  setLineItems([]);
                  setMaterialSearch("");
                  setDebouncedSearch("");
                  setShowSuggestions(false);
                  setSelectedMaterial(null);
                }}
              />
              <Button
                id="save-purchase-request-btn"
                text="Save"
                type="submit"
                className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                state={!createPurchaseRequestMutation.isPending}
                disabled={createPurchaseRequestMutation.isPending}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
