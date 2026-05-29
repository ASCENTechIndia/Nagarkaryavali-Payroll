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

const FrmDepartmentConfig = () => {
  const [tableData, setTableData] = useState([]);

  const initialValues = {
    corporation: "",
  };

  const headers = [
    "Select",
    "Department Name (English)",
    "Department Name (Marathi)",
  ];

  const keyMapping = {
    Select: "checked",
    "Department Name (English)": "deptNameEnglish",
    "Department Name (Marathi)": "deptNameMarathi",
  };

  const columnStyles = {
    Select: {
      width: "70px",
      textAlign: "center",
    },
    "Department Name (English)": {
      width: "50%",
    },
    "Department Name (Marathi)": {
      width: "50%",
    },
  };

  const handleSearch = async () => {
    Swal.fire({
      title: "Please Wait...",
      text: "Loading Departments",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // API CALL HERE

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTableData([
        {
          checked: false,
          deptNameEnglish: "SHASTRI NGR.SHED",
          deptNameMarathi: "SHASTRI NGR.SHED",
        },
        {
          checked: false,
          deptNameEnglish: "SECURITY",
          deptNameMarathi: "SECURITY",
        },
        {
          checked: false,
          deptNameEnglish: "SAWARKAR NGR.SHED",
          deptNameMarathi: "SAWARKAR NGR.SHED",
        },
        {
          checked: false,
          deptNameEnglish: "SAVARKAR NGR.H.CENT",
          deptNameMarathi: "SAVARKAR NGR.H.CENT",
        },
        {
          checked: false,
          deptNameEnglish: "SAMATA NGR.SHED",
          deptNameMarathi: "SAMATA NGR.SHED",
        },
        {
          checked: false,
          deptNameEnglish: "REG.DISASTER MG.CELL",
          deptNameMarathi: "REG.DISASTER MG.CELL",
        },
        {
          checked: false,
          deptNameEnglish: "R.G.MEDICAL COL.TECH",
          deptNameMarathi: "R.G.MEDICAL COL.TECH",
        },
        {
          checked: false,
          deptNameEnglish: "R.G.MEDICAL COL.O.ST",
          deptNameMarathi: "R.G.MEDICAL COL.O.ST",
        },
        {
          checked: false,
          deptNameEnglish: "R.G.MEDICAL COL.MALI",
          deptNameMarathi: "R.G.MEDICAL COL.MALI",
        },
        {
          checked: false,
          deptNameEnglish: "R.G.MEDICAL COL.HONN",
          deptNameMarathi: "R.G.MEDICAL COL.HONN",
        },
      ]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Failed to load Departments",
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
        item.deptNameEnglish === row.deptNameEnglish
          ? {
              ...item,
              checked,
            }
          : item
      )
    );
  };

  const handleSubmit = async (values) => {
    const selectedDepartments = tableData.filter(
      (x) => x.checked
    );

    console.log({
      ...values,
      selectedDepartments,
    });

    Swal.fire({
      icon: "success",
      text: "Department Configuration Saved Successfully",
    });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
           <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Department Config
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

              {/* Department Table */}

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

export default FrmDepartmentConfig;