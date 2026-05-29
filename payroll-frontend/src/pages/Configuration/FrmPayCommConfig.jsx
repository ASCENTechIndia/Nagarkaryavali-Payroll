"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import ShadCNTable from "@/components/ui/table";

const FrmPayCommissionConfig = () => {
  const [tableData, setTableData] = useState([]);

  const initialValues = {
    corporation: "",
  };

  const headers = [
    "Select",
    "Pay Commission Name",
    "Pay Commission Code",
    "Pay Commission Status",
  ];

  const keyMapping = {
    Select: "checked",
    "Pay Commission Name": "commissionName",
    "Pay Commission Code": "commissionCode",
    "Pay Commission Status": "status",
  };

  const columnStyles = {
    Select: {
      width: "80px",
      textAlign: "center",
    },
    "Pay Commission Name": {
      width: "40%",
    },
    "Pay Commission Code": {
      width: "20%",
      textAlign: "center",
    },
    "Pay Commission Status": {
      width: "25%",
      textAlign: "center",
    },
  };

  const handleSearch = async () => {
    Swal.fire({
      title: "Please Wait...",
      text: "Loading Pay Commissions",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // API CALL HERE

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTableData([
        {
          checked: false,
          commissionName: "8th Pay",
          commissionCode: "D",
          status: "Active",
        },
        {
          checked: false,
          commissionName: "9th Pay",
          commissionCode: "E",
          status: "InActive",
        },
        {
          checked: false,
          commissionName: "6th Pay",
          commissionCode: "B",
          status: "Active",
        },
        {
          checked: false,
          commissionName: "5th Pay",
          commissionCode: "A",
          status: "Active",
        },
        {
          checked: false,
          commissionName: "7th Pay",
          commissionCode: "C",
          status: "Active",
        },
      ]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Failed to load Pay Commission data",
      });
    } finally {
      Swal.close();
    }
  };

  const handleSelectAll = (checked) => {
    setTableData((prev) =>
      prev.map((item) => ({
        ...item,
        checked,
      }))
    );
  };

  const handleRowCheck = (row, checked) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.commissionCode === row.commissionCode
          ? {
              ...item,
              checked,
            }
          : item
      )
    );
  };

  const handleSubmit = async (values) => {
    const selectedPayCommissions = tableData.filter(
      (item) => item.checked
    );

    console.log({
      ...values,
      selectedPayCommissions,
    });

    Swal.fire({
      icon: "success",
      text: "Pay Commission Configuration Saved Successfully",
    });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
           <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Pay Commission Config
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Corporation */}

              <div className="flex justify-center">
                <div className="w-full max-w-md space-y-2">
                  <Label
                    text="Corporation Name"
                    required
                    className="min-w-[180px]"
                  />

                  <Select
                    value={values.corporation}
                    onValueChange={(value) =>
                      setFieldValue("corporation", value)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="870">
                        KULGAON BADLAPUR NAGARPARISHAD BADLAPUR
                      </SelectItem>

                      <SelectItem value="871">
                        SANGLI MIRAJ KUPWAD CORPORATION
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}

              {tableData.length > 0 && (
                <ShadCNTable
                  headers={headers}
                  data={tableData}
                  keyMapping={keyMapping}
                  columnStyles={columnStyles}
                  pagination
                  rowsPerPage={10}
                  onSelectAllChange={handleSelectAll}
                  onRowCheckChange={handleRowCheck}
                />
              )}

              {/* Buttons */}

              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  onClick={handleSearch}
                >
                  Search
                </Button>

                {tableData.length > 0 && (
                  <Button type="submit">
                    Save
                  </Button>
                )}

                <Button
                  type="button"
                  variant="secondary"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmPayCommissionConfig;