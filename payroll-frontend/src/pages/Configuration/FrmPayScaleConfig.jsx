import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";

import { useAuth } from "@/context/AuthContext";
import GetIPAddress from "@/utils/ipHelper";
import config from "@/utils/config";

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
  const { token, user } = useAuth();

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const userId = user?.userId;

  const [corporationList, setCorporationList] = useState([]);

  const [tableData, setTableData] = useState([]);

  const [mode, setMode] = useState(1);



  const initialValues = {
    corporation: "",
  };

  const headers = ["Select", "Pay Scale"];

  const keyMapping = {
    Select: "checked",
    "Pay Scale": "payScale",
  };

  const getCorporationList = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Branchconfi/corporationlist`,
        { headers: {Authorization: `Bearer ${token}`},
                },
      );

      setCorporationList(response?.data?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!token) return;

    getCorporationList();
  }, [token]);

  const handleSearch = async (corporationId) => {
    if (!corporationId) return;

    Swal.fire({
      title: "Please Wait...",
      text: "Loading Pay Scales",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const [configuredRes, payScaleRes] = await Promise.all([
        axios.post(
          `${baseUrl}/api/PayScaConfig/configuredpayscalelist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: {Authorization: `Bearer ${token}`},
                },
        ),
        

        axios.post(
          `${baseUrl}/api/PayScaConfig/payscalelist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: {Authorization: `Bearer ${token}`},
                },
        ),
      ]);

      const configuredPayScales = configuredRes?.data?.data?.data || [];
      console.log("Configured Pay Scales", configuredPayScales);

      const allPayScales = payScaleRes?.data?.data?.data || [];

      const rows = allPayScales.map((payScale) => {
        const isConfigured = configuredPayScales.some(
          (item) =>
            Number(item.CONFIPAYSCALE_ID) ===
            Number(payScale.NUM_PAYSCALEMST_PAYSCALEID),
        );

        return {
          payScaleId: payScale.NUM_PAYSCALEMST_PAYSCALEID,

          payScale: payScale.VAR_PAYSCALEMST_PAYSCALENAME,

          checked: isConfigured,

          originallyConfigured: isConfigured,
        };
      });

      setMode(configuredPayScales.length > 0 ? 2 : 1);

      setTableData(rows);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || "Failed to load Pay Scales",
      });
    } finally {
      Swal.close();
    }
  };

  const handleSelectAll = (checked) => {
    setTableData((prev) =>
      prev.map((row) => ({
        ...row,
        checked: checked === true,
      })),
    );
  };

  const handleRowCheck = (row, checked) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.payScaleId === row.payScaleId
          ? {
              ...item,
              checked: checked === true,
            }
          : item,
      ),
    );
  };

const handleSubmit = async (values) => {
  try {
    if (!values.corporation) {
      Swal.fire({
        icon: "warning",
        text: "Please Select Corporation",
      });
      return;
    }

    let payScaleStr = "";
    let hasSelection = false;

    tableData.forEach((item) => {
      const oldValue = item.originallyConfigured;
      const newValue = item.checked;

      if (mode === 1) {
        if (newValue) {
          payScaleStr += `${item.payScaleId}#N#Y$`;
          hasSelection = true;
        } else {
          payScaleStr += `${item.payScaleId}#N#N$`;
        }
      } else {
        if (newValue && oldValue) {
          payScaleStr += `${item.payScaleId}#Y#Y$`;
          hasSelection = true;
        } else if (newValue && !oldValue) {
          payScaleStr += `${item.payScaleId}#N#Y$`;
          hasSelection = true;
        } else if (!newValue && oldValue) {
          payScaleStr += `${item.payScaleId}#Y#N$`;
          hasSelection = true;
        } else {
          payScaleStr += `${item.payScaleId}#N#N$`;
        }
      }
    });

    if (!hasSelection) {
      Swal.fire({
        icon: "warning",
        text: "Select Atleast One CheckBox!",
      });
      return;
    }

    payScaleStr = payScaleStr.slice(0, -1);

    const ipAddress = await GetIPAddress();

    Swal.fire({
      title: "Saving...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const response = await axios.post(
      `${baseUrl}/api/PayScaConfig/savepayscaleconfiguration`,
      {
        userId,
        orgId: Number(values.corporation),
        payScaleStr,
        mode,
        ipAddress,
        source: config.source,
      },
      { headers: {Authorization: `Bearer ${token}`},
                }
    );

    Swal.close();

    const result =
      response?.data?.data ||
      response?.data?.result ||
      response?.data;

    const errorCode =
      result?.Out_errorCode ??
      result?.errorCode ??
      result?.ERRORCODE;

    const errorMsg =
      result?.Out_ErrorMsg ??
      result?.errorMsg ??
      result?.ERRORMSG ??
      response?.data?.message;

    if (
      errorCode &&
      Number(errorCode) !== 9999 &&
      Number(errorCode) !== -100
    ) {
      Swal.fire({
        icon: "warning",
        text: errorMsg || "Save Failed",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      text: errorMsg || "Pay Scale Saved Successfully",
    });

    // Reload latest data from DB
    await handleSearch(values.corporation);

  } catch (error) {
    Swal.close();

    console.error(error);

    Swal.fire({
      icon: "error",
      text:
        error?.response?.data?.message ||
        error?.message ||
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
              <CardTitle className="text-xl font-bold">
                Pay Scale Config
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

              {/* Table */}

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
                <Button type="submit">Save</Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setTableData([]);
                  }}
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
