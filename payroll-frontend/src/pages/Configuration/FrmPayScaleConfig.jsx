

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

const FrmPayConfig = () => {
  const [tableData, setTableData] = useState([]);

  const initialValues = {
    corporation: "",
  };

  const headers = ["Select", "Pay Scale"];

  const keyMapping = {
    Select: "checked",
    "Pay Scale": "payScale",
  };

  const handleSearch = async () => {
    Swal.fire({
      title: "Please Wait...",
      text: "Loading Pay Scales",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // API CALL HERE

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTableData([
        { checked: true, payScale: "9300-34800" },
        { checked: true, payScale: "S3-16600-52400" },
        { checked: true, payScale: "750-12-870-14-940" },
        { checked: true, payScale: "S2-(15300-48700)" },
        { checked: true, payScale: "9500-34800" },
        { checked: true, payScale: "test 1234" },
        { checked: true, payScale: "S2-15300-48700" },
        { checked: true, payScale: "NA" },
        { checked: true, payScale: "S23-67700-208700" },
        { checked: true, payScale: "S13-35400-112400" },
      ]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Failed to load Pay Scales",
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
        item.payScale === row.payScale
          ? {
              ...item,
              checked,
            }
          : item
      )
    );
  };

  const handleSubmit = async (values) => {
    const selectedPayScales = tableData.filter((x) => x.checked);

    console.log({
      ...values,
      selectedPayScales,
    });

    Swal.fire({
      icon: "success",
      text: "Pay Configuration Saved Successfully",
    });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
           <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Pay Config
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

              {/* Pay Scale Table */}

              {tableData.length > 0 && (
                <ShadCNTable
                  headers={headers}
                  data={tableData}
                  keyMapping={keyMapping}
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

export default FrmPayConfig;