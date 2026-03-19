"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IPaginatedApiResponse,
  IPurchaseRequest,
  IPurchaseRequestListParams,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePostQuery } from "@/services/queries/postQuery";
import { Field, Form, Formik, FormikProps } from "formik";
import dynamic from "next/dynamic";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import {
  fetchUserProfile,
  getCachedUserProfile,
  type UserProfile,
} from "@/utils/auth/userProfile";
import { PurchaseRequestStatus } from "@/enums/purchaseRequestStatus";
import { GRNStatus } from "@/enums/grnStatus";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

const resolveProfileName = (profile: UserProfile | null) => {
  if (!profile) {
    return "";
  }

  const parts = [profile.given_name, profile.family_name].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(" ");
  }

  if (profile.name) {
    return profile.name;
  }

  return profile.email ?? "";
};

interface PurchaseRequestOption {
  label: string;
  value: string;
}

interface PurchaseRequestItemOption {
  label: string;
  itemName: string;
  prItemId: number;
  lineItemNo: number;
  orderedQuantity: number;
  itemCategory: string;
  uoM: string;
  unitPrice: number;
  currency: string;
}

interface InitialValues {
  purchaseRequestOption: PurchaseRequestOption | null;
  receivedBy: string;
  receivedDate: Date | null;
  supplier: string;
  receivingFacility: string;
  prItemOption: PurchaseRequestItemOption | null;
  orderedQuantity: number | "";
  receivedQuantity: number | "";
  acceptedQuantity: number | "";
  rejectedQuantity: number | "";
  itemCategory: string;
  uoM: string;
  unitPrice: number | "";
  currency: string;
  remarks: string;
}

interface GrnLineItem {
  lineItemNo: number;
  prItemId: number;
  itemName: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  uoM: string;
  unitPrice: number;
  currency: string;
  totalPrice: number;
  remarks: string;
}

const initialValues: InitialValues = {
  purchaseRequestOption: null,
  receivedBy: "",
  receivedDate: new Date(),
  supplier: "",
  receivingFacility: "",
  prItemOption: null,
  orderedQuantity: "",
  receivedQuantity: "",
  acceptedQuantity: "",
  rejectedQuantity: "",
  itemCategory: "",
  uoM: "",
  unitPrice: "",
  currency: "",
  remarks: "",
};

const grnItemsTableStyle = { minWidth: "64rem" };

export default function AddGoodReceiptNotesPage() {
  const toastRef = useToastRef();
  const formikRef = useRef<FormikProps<InitialValues>>(null);
  const postMutation = usePostQuery({
    redirectPath: "/menu/iap/good-receipt-notes",
    successMessage: "Good receipt note created successfully!",
    toastRef,
  });

  const [purchaseRequestSearch, setPurchaseRequestSearch] = useState("");
  const [debouncedPurchaseRequestSearch, setDebouncedPurchaseRequestSearch] =
    useState("");
  const [showPurchaseRequestSuggestions, setShowPurchaseRequestSuggestions] =
    useState(false);
  const [receivedByInitial, setReceivedByInitial] = useState(() =>
    resolveProfileName(getCachedUserProfile()),
  );
  const [selectedPurchaseRequestId, setSelectedPurchaseRequestId] = useState<
    string | null
  >(null);
  const [lineItems, setLineItems] = useState<GrnLineItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const hydrateReceivedBy = async () => {
      const freshProfile = await fetchUserProfile();
      if (!isMounted) {
        return;
      }

      const name = resolveProfileName(freshProfile);
      if (!name) {
        return;
      }

      setReceivedByInitial(name);

      const currentValue = formikRef.current?.values.receivedBy?.trim();
      if (!currentValue) {
        formikRef.current?.setFieldValue("receivedBy", name, false);
      }
    };

    void hydrateReceivedBy();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedPurchaseRequestSearch(purchaseRequestSearch.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [purchaseRequestSearch]);

  const purchaseRequestQueryParams: IPurchaseRequestListParams = useMemo(
    () => ({
      pageNumber: 1,
      pageSize: 10,
      purchaseRequestCode: debouncedPurchaseRequestSearch,
      supplier: "",
      requestedBy: "",
      purchaseRequestStatus: PurchaseRequestStatus.Approved,
      createdDateFrom: undefined,
      createdDateTo: undefined,
    }),
    [debouncedPurchaseRequestSearch],
  );

  const { data: purchaseRequestsData, isFetching: isPurchaseRequestsFetching } =
    useGetQuery<
      IPaginatedApiResponse<IPurchaseRequest>,
      IPurchaseRequestListParams
    >(
      ["purchaseRequestsForGrn", debouncedPurchaseRequestSearch],
      "/PurchaseRequests",
      purchaseRequestQueryParams,
      {
        enabled: debouncedPurchaseRequestSearch.length >= 2,
        toastRef,
      },
    );

  const {
    data: selectedPurchaseRequestResponse,
    isFetching: isSelectedPurchaseRequestFetching,
  } = useGetQuery<IBaseApiResponse<IPurchaseRequest>, undefined>(
    ["purchaseRequestDetailsForGrn", selectedPurchaseRequestId ?? ""],
    `/PurchaseRequests/${selectedPurchaseRequestId}`,
    undefined,
    {
      enabled: !!selectedPurchaseRequestId,
      toastRef,
    },
  );

  const purchaseRequestOptions: PurchaseRequestOption[] = useMemo(() => {
    const requests = purchaseRequestsData?.data?.items ?? [];
    return requests
      .filter((request) => request.purchaseRequestCode)
      .map((request) => ({
        label: request.purchaseRequestCode as string,
        value: String(request.id ?? request.purchaseRequestCode),
      }));
  }, [purchaseRequestsData]);

  const selectedPurchaseRequest = selectedPurchaseRequestResponse?.data;

  const purchaseRequestItemOptions: Array<{
    label: string;
    value: PurchaseRequestItemOption;
  }> = useMemo(() => {
    const prItems = selectedPurchaseRequest?.prItems ?? [];

    return prItems
      .filter((item) => item.id !== undefined && item.id !== null)
      .map((item, idx) => {
        const lineItemNo = item.lineItemNo ?? idx + 1;
        const itemName = item.inventoryItem?.itemName ?? "Item";
        const itemNumber = item.inventoryItem?.itemNumber ?? "-";
        const orderedQuantity = Number(item.requestedQuantity ?? 0);

        return {
          label: `${lineItemNo} - ${itemName} (${itemNumber})`,
          value: {
            label: `${lineItemNo} - ${itemName}`,
            itemName,
            prItemId: Number(item.id),
            lineItemNo,
            orderedQuantity,
            itemCategory: item.inventoryItem?.itemCategory ?? "",
            uoM: item.inventoryItem?.uoM ?? item.inventoryItem?.uom ?? "",
            unitPrice: Number(item.price ?? item.inventoryItem?.unitPrice ?? 0),
            currency: item.inventoryItem?.currency ?? "",
          },
        };
      });
  }, [selectedPurchaseRequest]);

  const clearLineDetails = (clearSelectedPrItem = true) => {
    if (!formikRef.current) {
      return;
    }

    if (clearSelectedPrItem) {
      formikRef.current.setFieldValue("prItemOption", null, false);
    }
    formikRef.current.setFieldValue("orderedQuantity", "", false);
    formikRef.current.setFieldValue("receivedQuantity", "", false);
    formikRef.current.setFieldValue("acceptedQuantity", "", false);
    formikRef.current.setFieldValue("rejectedQuantity", "", false);
    formikRef.current.setFieldValue("itemCategory", "", false);
    formikRef.current.setFieldValue("uoM", "", false);
    formikRef.current.setFieldValue("unitPrice", "", false);
    formikRef.current.setFieldValue("currency", "", false);
    formikRef.current.setFieldValue("remarks", "", false);
  };

  const removeLineItem = (lineItemNo: number) => {
    setLineItems((prev) => {
      const filtered = prev.filter((item) => item.lineItemNo !== lineItemNo);
      return filtered.map((item, idx) => ({ ...item, lineItemNo: idx + 1 }));
    });
  };

  const renderRemoveAction = (rowData: GrnLineItem) => {
    return (
      <button
        type="button"
        className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
        onClick={() => removeLineItem(rowData.lineItemNo)}
      >
        Remove
      </button>
    );
  };

  useEffect(() => {
    if (!formikRef.current) {
      return;
    }

    formikRef.current.setFieldValue(
      "supplier",
      selectedPurchaseRequest?.supplier ?? "",
      false,
    );
    clearLineDetails(true);
  }, [selectedPurchaseRequest]);

  const handleSubmit = (values: InitialValues, grnStatus: GRNStatus) => {
    if (!values.purchaseRequestOption || !selectedPurchaseRequestId) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please select a purchase request.",
        life: 3000,
      });
      return;
    }

    if (!values.receivedBy.trim()) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Received By is required.",
        life: 3000,
      });
      return;
    }

    if (!values.receivingFacility.trim()) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Receiving Store is required.",
        life: 3000,
      });
      return;
    }

    if (lineItems.length === 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please add at least one item.",
        life: 3000,
      });
      return;
    }

    postMutation.mutate({
      url: "/GoodReceiptNotes",
      body: {
        receivedBy: values.receivedBy.trim(),
        receivedDate: values.receivedDate
          ? new Date(values.receivedDate).toISOString()
          : new Date().toISOString(),
        receivingFacility: values.receivingFacility.trim(),
        grnStatus,
        items: lineItems.map((item) => ({
          prItemId: item.prItemId,
          lineItemNo: item.lineItemNo,
          receivedQuantity: item.receivedQuantity,
          acceptedQuantity: item.acceptedQuantity,
          rejectedQuantity: item.rejectedQuantity,
          totalPrice: item.totalPrice,
          remarks: item.remarks,
        })),
      },
    });
  };

  return (
    <Formik<InitialValues>
      innerRef={formikRef}
      initialValues={{
        ...initialValues,
        receivedBy: receivedByInitial,
      }}
      enableReinitialize
      onSubmit={() => {
        // Action buttons control the submit status.
      }}
    >
      {({ setFieldValue, values, resetForm }) => (
        <Form className="p-3 sm:p-6">
          <div className="max-w-7xl space-y-6">
            <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
              Add Good Receipt Note
            </h1>

            <h2 className="text-base font-bold text-gray-800 mb-2">
              GRN Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                <label
                  htmlFor="purchaseRequestSearch"
                  className="block mb-2 text-black"
                >
                  Purchase Request*
                </label>
                <div className="relative">
                  <input
                    id="purchaseRequestSearch"
                    type="text"
                    className="form-control"
                    placeholder="Type PR code"
                    value={purchaseRequestSearch}
                    onChange={(event) => {
                      const value = event.target.value;
                      setPurchaseRequestSearch(value);
                      setSelectedPurchaseRequestId(null);
                      setFieldValue("purchaseRequestOption", null);
                      setFieldValue("supplier", "");
                      setLineItems([]);
                      clearLineDetails(true);

                      if (value.trim().length >= 2) {
                        setShowPurchaseRequestSuggestions(true);
                      } else {
                        setShowPurchaseRequestSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (
                        purchaseRequestSearch.trim().length >= 2 &&
                        purchaseRequestOptions.length > 0
                      ) {
                        setShowPurchaseRequestSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(
                        () => setShowPurchaseRequestSuggestions(false),
                        150,
                      );
                    }}
                    autoComplete="off"
                  />

                  {showPurchaseRequestSuggestions &&
                    purchaseRequestOptions.length > 0 && (
                      <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {purchaseRequestOptions.map((option) => (
                          <li key={option.value}>
                            <button
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                              onMouseDown={() => {
                                setPurchaseRequestSearch(option.label);
                                setFieldValue("purchaseRequestOption", option);
                                setSelectedPurchaseRequestId(option.value);
                                setShowPurchaseRequestSuggestions(false);
                                setLineItems([]);
                              }}
                            >
                              {option.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
                {(isPurchaseRequestsFetching ||
                  isSelectedPurchaseRequestFetching) && (
                  <small className="text-gray-500">Loading...</small>
                )}
              </div>

              <LabelGroup
                name="receivedBy"
                id="receivedBy"
                label="Received By*"
                type="text"
                placeholder="Enter received by"
              />

              <DatePicker
                name="receivedDate"
                id="receivedDate"
                label="Received Date"
                placeholder="Select date"
              />

              <LabelGroup
                name="supplier"
                id="supplier"
                label="Supplier"
                type="text"
                placeholder="Auto-filled from PR"
                disabled
              />

              <LabelGroup
                name="receivingFacility"
                id="receivingFacility"
                label="Receiving Store*"
                type="text"
                placeholder="Enter receiving store"
              />
            </div>

            <h2 className="text-base font-bold text-black">Line Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <Dropdown
                name="prItemOption"
                id="grnPrItem"
                label="Item*"
                placeholder={
                  selectedPurchaseRequestId
                    ? "Select PR item"
                    : "Select a PR first"
                }
                options={purchaseRequestItemOptions}
                disabled={!selectedPurchaseRequestId}
                isSearchable
                showClearOption
                onChange={(event: {
                  value?: PurchaseRequestItemOption | null;
                }) => {
                  const selected = event.value;

                  if (!selected) {
                    clearLineDetails(false);
                    return;
                  }

                  setFieldValue("orderedQuantity", selected.orderedQuantity);
                  setFieldValue("itemCategory", selected.itemCategory);
                  setFieldValue("uoM", selected.uoM);
                  setFieldValue("unitPrice", selected.unitPrice);
                  setFieldValue("currency", selected.currency);
                  setFieldValue("receivedQuantity", selected.orderedQuantity);
                  setFieldValue("acceptedQuantity", selected.orderedQuantity);
                  setFieldValue("rejectedQuantity", 0);
                }}
              />

              <LabelGroup
                name="orderedQuantity"
                id="orderedQuantity"
                label="Ordered Quantity*"
                type="number"
                disabled
              />

              <LabelGroup
                name="receivedQuantity"
                id="receivedQuantity"
                label="Received Quantity*"
                type="number"
                min={0}
              />

              <LabelGroup
                name="acceptedQuantity"
                id="acceptedQuantity"
                label="Accepted Quantity*"
                type="number"
                min={0}
                max={
                  values.receivedQuantity === ""
                    ? undefined
                    : Number(values.receivedQuantity)
                }
              />

              <LabelGroup
                name="rejectedQuantity"
                id="rejectedQuantity"
                label="Rejected Quantity*"
                type="number"
                min={0}
                max={
                  values.receivedQuantity === ""
                    ? undefined
                    : Number(values.receivedQuantity)
                }
              />

              <LabelGroup
                name="itemCategory"
                id="itemCategory"
                label="Item Category"
                type="text"
                disabled
              />

              <LabelGroup
                name="uoM"
                id="uoM"
                label="UOM"
                type="text"
                disabled
              />

              <LabelGroup
                name="unitPrice"
                id="unitPrice"
                label="Unit Price"
                type="number"
                disabled
              />

              <LabelGroup
                name="currency"
                id="currency"
                label="Currency"
                type="text"
                disabled
              />

              <div className="md:col-span-2 lg:col-span-5">
                <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                  <label className="form-label" htmlFor="remarks">
                    Remarks
                  </label>
                  <Field
                    as="textarea"
                    id="remarks"
                    name="remarks"
                    className="form-control"
                    placeholder="Enter remarks"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                id="addGrnItemBtn"
                text="Add Item"
                type="button"
                className="bg-[#15B097] text-white px-4 py-2 rounded-md"
                state={true}
                onClick={() => {
                  if (!values.prItemOption) {
                    toastRef.current?.show({
                      severity: "warn",
                      summary: "Validation",
                      detail: "Please select an item.",
                      life: 3000,
                    });
                    return;
                  }

                  const receivedQuantity = Number(values.receivedQuantity ?? 0);
                  const acceptedQuantity = Number(values.acceptedQuantity ?? 0);
                  const rejectedQuantity = Number(values.rejectedQuantity ?? 0);
                  const unitPrice = Number(values.unitPrice ?? 0);

                  if (receivedQuantity <= 0) {
                    toastRef.current?.show({
                      severity: "warn",
                      summary: "Validation",
                      detail: "Received quantity must be greater than zero.",
                      life: 3000,
                    });
                    return;
                  }

                  if (acceptedQuantity > receivedQuantity) {
                    toastRef.current?.show({
                      severity: "warn",
                      summary: "Validation",
                      detail:
                        "Accepted quantity cannot be more than received quantity.",
                      life: 3000,
                    });
                    return;
                  }

                  if (rejectedQuantity > receivedQuantity) {
                    toastRef.current?.show({
                      severity: "warn",
                      summary: "Validation",
                      detail:
                        "Rejected quantity cannot be more than received quantity.",
                      life: 3000,
                    });
                    return;
                  }

                  const newRow: GrnLineItem = {
                    lineItemNo: lineItems.length + 1,
                    prItemId: values.prItemOption.prItemId,
                    itemName: values.prItemOption.itemName,
                    receivedQuantity,
                    acceptedQuantity,
                    rejectedQuantity,
                    uoM: values.uoM,
                    unitPrice,
                    currency: values.currency,
                    totalPrice: acceptedQuantity * unitPrice,
                    remarks: values.remarks?.trim() || "",
                  };

                  setLineItems((prev) => [...prev, newRow]);
                  clearLineDetails(true);
                }}
              />
              <Button
                id="clearGrnItemBtn"
                text="Clear"
                type="button"
                className="bg-white border-2 border-[#15B097] text-[#15B097] px-4 py-2 rounded-md"
                state={true}
                onClick={() => clearLineDetails(true)}
              />
            </div>

            <div className="mt-6">
              <DataTable
                value={lineItems}
                emptyMessage="No items added yet"
                stripedRows
                size="small"
                scrollable
                tableStyle={grnItemsTableStyle}
              >
                <Column field="lineItemNo" header="Line Item No" />
                <Column field="itemName" header="Item" />
                <Column field="receivedQuantity" header="Received Quantity" />
                <Column field="acceptedQuantity" header="Accepted Quantity" />
                <Column field="rejectedQuantity" header="Rejected Quantity" />
                <Column field="uoM" header="UoM" />
                <Column
                  field="unitPrice"
                  header="Unit Price"
                  body={(rowData: GrnLineItem) => rowData.unitPrice.toFixed(2)}
                />
                <Column field="currency" header="Currency" />
                <Column
                  field="totalPrice"
                  header="Total Price"
                  body={(rowData: GrnLineItem) => rowData.totalPrice.toFixed(2)}
                />
                <Column
                  header="Actions"
                  body={renderRemoveAction}
                  frozen
                  alignFrozen="right"
                  style={{ minWidth: "9rem" }}
                />
              </DataTable>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Button
                id="resetGrnFormBtn"
                text="Reset"
                type="button"
                className="bg-[#696E79] text-white mr-2 p-[12px] rounded-xl box-shadow w-full"
                state={!postMutation.isPending}
                disabled={postMutation.isPending}
                onClick={() => {
                  resetForm();
                  setSelectedPurchaseRequestId(null);
                  setPurchaseRequestSearch("");
                  setDebouncedPurchaseRequestSearch("");
                  setShowPurchaseRequestSuggestions(false);
                  setLineItems([]);
                }}
              />
              <Button
                id="saveGrnDraftBtn"
                text="Save as Draft"
                type="button"
                className="bg-white border-2 border-[#15B097] text-[#15B097] p-[12px] rounded-xl box-shadow w-full"
                state={!postMutation.isPending}
                disabled={postMutation.isPending}
                onClick={() => handleSubmit(values, GRNStatus.Draft)}
              />
              <Button
                id="postGrnBtn"
                text="Post"
                type="button"
                className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                state={!postMutation.isPending}
                disabled={postMutation.isPending}
                onClick={() => handleSubmit(values, GRNStatus.Posted)}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
