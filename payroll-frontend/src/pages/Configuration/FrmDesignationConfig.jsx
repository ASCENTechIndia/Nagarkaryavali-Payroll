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

const FrmDesignationConfig = () => {
  const [tableData, setTableData] = useState([]);

  const initialValues = {
    corporation: "",
  };

  const headers = [
    "Select",
    "Designation Name (English)",
    "Designation Name (Marathi)",
  ];

  const keyMapping = {
    Select: "checked",
    "Designation Name (English)": "designationNameEnglish",
    "Designation Name (Marathi)": "designationNameMarathi",
  };

  const columnStyles = {
    Select: {
      width: "70px",
      textAlign: "center",
    },
    "Designation Name (English)": {
      width: "50%",
    },
    "Designation Name (Marathi)": {
      width: "50%",
    },
  };

  const handleSearch = async () => {
    Swal.fire({
      title: "Please Wait...",
      text: "Loading Designations",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // API CALL HERE

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTableData([
        {
          checked: false,
          designationNameEnglish: "Vaccinator",
          designationNameMarathi: "Vaccinator",
        },
        {
          checked: false,
          designationNameEnglish: "Vet. Offic",
          designationNameMarathi: "Vet. Offic",
        },
        {
          checked: false,
          designationNameEnglish: "Vice Principal",
          designationNameMarathi: "Vice Principal",
        },
        {
          checked: false,
          designationNameEnglish: "Ward Boy",
          designationNameMarathi: "Ward Boy",
        },
        {
          checked: false,
          designationNameEnglish: "Warden",
          designationNameMarathi: "Warden",
        },
        {
          checked: false,
          designationNameEnglish: "Welder",
          designationNameMarathi: "Welder",
        },
        {
          checked: false,
          designationNameEnglish: "Wireless S",
          designationNameMarathi: "Wireless S",
        },
        {
          checked: false,
          designationNameEnglish: "Wireman",
          designationNameMarathi: "Wireman",
        },
        {
          checked: false,
          designationNameEnglish: "Wom.& Chi.WelOf",
          designationNameMarathi: "Wom.& Chi.WelOf",
        },
        {
          checked: false,
          designationNameEnglish: "X-RAY TECHNICIA",
          designationNameMarathi: "X-RAY TECHNICIA",
        },
      ]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Failed to load Designations",
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
        item.designationNameEnglish ===
        row.designationNameEnglish
          ? {
              ...item,
              checked,
            }
          : item
      )
    );
  };

  const handleSubmit = async (values) => {
    const selectedDesignations = tableData.filter(
      (x) => x.checked
    );

    console.log({
      ...values,
      selectedDesignations,
    });

    Swal.fire({
      icon: "success",
      text: "Designation Configuration Saved Successfully",
    });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
           <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Designation Config
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

              {/* Designation Table */}

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

export default FrmDesignationConfig;