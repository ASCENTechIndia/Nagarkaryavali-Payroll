import React, { useState, useEffect } from "react";

import axios from "axios";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";

import { useAuth } from "@/context/AuthContext";

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
  const { token, user } = useAuth();

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const userId = user?.userId;

  const [tableData, setTableData] = useState([]);

  const [corporationList, setCorporationList] = useState([]);

  const [mode, setMode] = useState(1);



  const initialValues = {
    corporation: "",
  };

  const headers = ["Select", "Bank Name"];

  const keyMapping = {
    Select: "checked",
    "Bank Name": "bankName",
  };

  /* ------------------------------------------------------------ */
  /* CORPORATION LIST                                              */
  /* ------------------------------------------------------------ */

  const getCorporationList = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Branchconfi/corporationlist`,
        { headers: {Authorization: `Bearer ${token}`},
                },
      );

      setCorporationList(response?.data?.data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!token) return;

    getCorporationList();
  }, [token]);

  /* ------------------------------------------------------------ */
  /* SEARCH                                                        */
  /* ------------------------------------------------------------ */

  const handleSearch = async (corporationId) => {
    if (!corporationId) {
      Swal.fire({
        icon: "warning",
        text: "Please Select Corporation",
      });

      return;
    }

    Swal.fire({
      title: "Please Wait...",
      text: "Loading Banks",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const [configuredRes, bankRes] = await Promise.all([
        axios.post(
          `${baseUrl}/api/BankConfig/configuredbanklist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: {Authorization: `Bearer ${token}`},
                },
        ),

        axios.post(
          `${baseUrl}/api/BankConfig/banklist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: {Authorization: `Bearer ${token}`},
                },
        ),
      ]);

      const configuredBanks = configuredRes?.data?.data?.data || [];

      const allBanks = bankRes?.data?.data?.data || [];

    const rows = allBanks.map((bank) => {
  const isConfigured = configuredBanks.some(
    (x) =>
      Number(x.CONFIBANK_ID) ===
      Number(bank.NUM_BANKMST_BANKID)
  );

  return {
    bankId: bank.NUM_BANKMST_BANKID,
    bankName: bank.VAR_BANKMST_BANKNAME,

    checked: isConfigured,

    originallyConfigured: isConfigured,
  };
});

      setMode(configuredBanks.length > 0 ? 2 : 1);

      setTableData(rows);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || "Failed to load banks",
      });
    } finally {
      Swal.close();
    }
  };

  /* ------------------------------------------------------------ */
  /* CHECKBOX                                                      */
  /* ------------------------------------------------------------ */

const handleSelectAll = (checked) => {
  setTableData((prev) =>
    prev.map((item) => ({
      ...item,
      checked: checked === true,
    }))
  );
};

  const handleRowCheck = (row, checked) => {
  setTableData((prev) =>
    prev.map((item) =>
      item.bankId === row.bankId
        ? {
            ...item,
            checked: checked === true,
          }
        : item
    )
  );
};

  /* ------------------------------------------------------------ */
  /* SAVE                                                          */
  /* ------------------------------------------------------------ */
const handleSubmit = async (values) => {
  try {
    if (!values.corporation) {
      Swal.fire({
        icon: "warning",
        text: "Please Select Corporation",
      });
      return;
    }

    let bankStr = "";
    let hasSelection = false;

    tableData.forEach((item) => {
      const oldValue =
        item.originallyConfigured;

      const newValue =
        item.checked;

      if (mode === 1) {
        if (newValue) {
          bankStr +=
            `${item.bankId}#N#Y$`;

          hasSelection = true;
        } else {
          bankStr +=
            `${item.bankId}#N#N$`;
        }
      } else {
        if (newValue && oldValue) {
          bankStr +=
            `${item.bankId}#Y#Y$`;

          hasSelection = true;
        }

        else if (
          newValue &&
          !oldValue
        ) {
          bankStr +=
            `${item.bankId}#N#Y$`;

          hasSelection = true;
        }

        else if (
          !newValue &&
          oldValue
        ) {
          bankStr +=
            `${item.bankId}#Y#N$`;

          hasSelection = true;
        }

        else {
          bankStr +=
            `${item.bankId}#N#N$`;
        }
      }
    });

    if (!hasSelection) {
      Swal.fire({
        icon: "warning",
        text:
          "Select Atleast One CheckBox!",
      });
      return;
    }

    bankStr = bankStr.slice(0, -1);

    Swal.fire({
      title: "Saving...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response =
      await axios.post(
        `${baseUrl}/api/BankConfig/savebankconfiguration`,
        {
          userId,
          ulbId: Number(
            values.corporation
          ),
          bankStr,
          mode,
        },
        { headers: {Authorization: `Bearer ${token}`},
                }
      );

    Swal.close();

    await Swal.fire({
      icon: "success",
      text:
        response?.data?.message ||
        "Configuration Saved Successfully",
    });

    await handleSearch(
      values.corporation
    );
  } catch (error) {
    Swal.fire({
      icon: "error",
      text:
        error?.response?.data
          ?.message ||
        "Save Failed",
    });
  }
};

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
             <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">Bank Config</CardTitle>
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
                    onValueChange={async (value) => {
                      setFieldValue("corporation", value);

                      await handleSearch(value);
                    }}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent className="max-h-72 overflow-y-auto">
                      {corporationList.map((item) => (
                        <SelectItem
                          key={item.ID_VALUE}
                          value={String(item.ID_VALUE)}
                        >
                          {item.DISPLAY_TEXT}
                        </SelectItem>
                      ))}
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
                  rowsPerPage={6}
                  onSelectAllChange={handleSelectAll}
                  onRowCheckChange={handleRowCheck}
                />
              )}

              <div className="flex justify-center gap-3">
                <Button type="submit">Save</Button>

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

export default FrmBankConfig;
