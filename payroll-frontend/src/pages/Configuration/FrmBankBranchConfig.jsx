
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

const FrmBankBranchConfig = () => {
  const [showTable, setShowTable] = useState(false);

  const [tableData, setTableData] = useState([]);

  const initialValues = {
    corporation: "",
  };

  const handleSearch = async () => {
    Swal.fire({
      title: "Please Wait...",
      text: "Loading Branches",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // API Call Here

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setTableData([
        {
          checked: true,
          branchName: "Virar",
        },
        {
          checked: true,
          branchName: "Sopara",
        },
        {
          checked: true,
          branchName: "Vasai",
        },
        {
          checked: true,
          branchName: "Nallasopara",
        },
        {
          checked: false,
          branchName: "Ahilyanagar",
        },
        {
          checked: false,
          branchName: "FESTIVAL ADVANCE",
        },
        {
          checked: false,
          branchName: "Papady",
        },
        {
          checked: false,
          branchName: "Dhule",
        },
        {
          checked: false,
          branchName: "Gokhivare",
        },
        {
          checked: false,
          branchName: "HEAD",
        },
        {
          checked: false,
          branchName: "MAIN BRANCH",
        },
      ]);

      setShowTable(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Failed to load data",
      });
    } finally {
      Swal.close();
    }
  };

  const handleSelectAll = (checked) => {
    setTableData((prev) =>
      prev.map((row) => ({
        ...row,
        checked,
      })),
    );
  };

  const handleRowCheck = (row, checked) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.branchName === row.branchName
          ? {
              ...item,
              checked,
            }
          : item,
      ),
    );
  };

  const handleSubmit = (values) => {
    const selectedBranches = tableData.filter((x) => x.checked);

    console.log({
      ...values,
      selectedBranches,
    });

    Swal.fire({
      icon: "success",
      text: "Configuration Saved Successfully",
    });
  };

  const headers = ["Select", "Bank Name"];

  const keyMapping = {
    Select: "checked",
    "Bank Name": "branchName",
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
         <CardHeader className="pb-3 border-b">
                                  <CardTitle className="text-xl font-bold">Branch Config</CardTitle>
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
                      <SelectItem value="1">
                        KULGAON BADLAPUR NAGARPARISHAD BADLAPUR
                      </SelectItem>

                      <SelectItem value="2">
                        Sangli Miraj Kupwad Corporation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

               {/* Table */}
              {showTable && (
                <ShadCNTable
                  headers={headers}
                  data={tableData}
                  keyMapping={keyMapping}
                  pagination
                  rowsPerPage={6}
                  onSelectAllChange={handleSelectAll}
                  onRowCheckChange={handleRowCheck}
                />
              )}

              {/* Buttons */}
              <div className="flex justify-center gap-3">
                <Button type="button" onClick={handleSearch}>
                  Search
                </Button>

                {showTable && <Button type="submit">Save</Button>}

                <Button type="button" variant="secondary">
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

export default FrmBankBranchConfig;
