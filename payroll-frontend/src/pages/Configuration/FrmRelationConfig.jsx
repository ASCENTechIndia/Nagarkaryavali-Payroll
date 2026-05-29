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

const FrmRelationConfig = () => {
  const [tableData, setTableData] = useState([]);

  const initialValues = {
    corporation: "",
  };

  const headers = ["Select", "Relation Name"];

  const keyMapping = {
    Select: "checked",
    "Relation Name": "relationName",
  };

  const handleSearch = async () => {
    Swal.fire({
      title: "Please Wait...",
      text: "Loading Relations",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // API CALL HERE

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTableData([
        {
          checked: true,
          relationName: "Husband",
        },
        {
          checked: true,
          relationName: "Grand Father",
        },
        {
          checked: false,
          relationName: "Daughter",
        },
        {
          checked: false,
          relationName: "Aunty",
        },
        {
          checked: false,
          relationName: "Brother",
        },
        {
          checked: false,
          relationName: "Grand Mother",
        },
        {
          checked: false,
          relationName: "Test.",
        },
        {
          checked: false,
          relationName: "Father",
        },
        {
          checked: false,
          relationName: "Mother",
        },
        {
          checked: false,
          relationName: "Uncle",
        },
      ]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Failed to load Relations",
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
        item.relationName === row.relationName
          ? {
              ...item,
              checked,
            }
          : item
      )
    );
  };

  const handleSubmit = async (values) => {
    const selectedRelations = tableData.filter((x) => x.checked);

    console.log({
      ...values,
      selectedRelations,
    });

    Swal.fire({
      icon: "success",
      text: "Relation Configuration Saved Successfully",
    });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">
                Relation Config
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

              {/* Relation Table */}

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

export default FrmRelationConfig;