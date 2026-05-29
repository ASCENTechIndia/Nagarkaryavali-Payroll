import React, { useState } from "react";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";

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

const FrmBankConfig = () => {
  const [tableData, setTableData] = useState([]);

  const initialValues = {
    corporation: "",
  };

  const headers = ["Select", "Bank Name"];

  const keyMapping = {
    Select: "checked",
    "Bank Name": "bankName",
  };

  const handleSearch = async () => {
    Swal.fire({
      title: "Please Wait...",
      text: "Loading Banks",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // API CALL HERE

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTableData([
        {
          checked: true,
          bankName: "KALAS UTKARSHA SAH.PATPEDHI LTD. VASHI",
        },
        {
          checked: false,
          bankName: "JUDICIAL MAGISTRATE FIRST CLASS",
        },
        {
          checked: false,
          bankName: "JYOTIRLINGA CO-OP CREDIT SOCIETY LTD MUMBAI",
        },
        {
          checked: false,
          bankName: "JYOTIRLINGA NAGARI SAHAKARI PATSANSTHA",
        },
        {
          checked: false,
          bankName: "K.A. ICHALKARANJI JANTA SAH.BANK",
        },
        {
          checked: false,
          bankName: "KALWA BALAPUR SA.BANK.(VASHI-NEW BOMBAY)",
        },
        {
          checked: false,
          bankName: "KALYAN JANTA SAHAKARI BANK",
        },
        {
          checked: false,
          bankName: "KALYAN JANTA SAHAKARI BANK (ULHASNAGAR)",
        },
        {
          checked: false,
          bankName: "KAMGAR EKATA NAGRI SAH.PATPEDHI LTD.",
        },
        {
          checked: false,
          bankName: "KANCHANGAURI MAHILA SAHAKARI PETHPEDHI LTD.",
        },
      ]);
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
      prev.map((item) => ({
        ...item,
        checked,
      }))
    );
  };

  const handleRowCheck = (row, checked) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.bankName === row.bankName
          ? {
              ...item,
              checked,
            }
          : item
      )
    );
  };

  const handleSubmit = async (values) => {
    const selectedBanks = tableData.filter((x) => x.checked);

    console.log({
      ...values,
      selectedBanks,
    });

    Swal.fire({
      icon: "success",
      text: "Configuration Saved Successfully",
    });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Bank Config
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
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

export default FrmBankConfig;