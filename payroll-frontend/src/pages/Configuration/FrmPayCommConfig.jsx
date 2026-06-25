import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import axios from "axios";

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
import { useAuth } from "@/context/AuthContext";
const FrmPayCommissionConfig = () => {
  const { token, user } = useAuth();

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const userId = user?.userId;

  const [corporationList, setCorporationList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mode, setMode] = useState(1);

  const initialValues = {
    corporation: "",
  };

  const headers = [
    "Select",
    "Pay Commission Name",
    "Pay Commission Code",
    "Status",
  ];

  const keyMapping = {
    Select: "checked",
    "Pay Commission Name": "commissionName",
    "Pay Commission Code": "commissionCode",
    Status: "status",
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

  const getCorporationList = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Branchconfi/corporationlist`,
        { headers: { Authorization: `Bearer ${token}` } },
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

  const handleSearch = async (corporationId) => {
    if (!corporationId) {
      Swal.fire({
        icon: "warning",
        text: "Please Select Corporation",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Please Wait...",
        text: "Loading Pay Commission Data...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const [configRes, listRes] = await Promise.all([
        axios.post(
          `${baseUrl}/api/PayCommConf/configpaycommlist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        axios.post(
          `${baseUrl}/api/PayCommConf/paycommlist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ]);

      console.log("Configured API", configRes?.data);

      console.log("Pay Comm API", listRes?.data);

      const configuredList = configRes?.data?.data?.data || [];

      const payCommList = listRes?.data?.data?.data || [];

      const rows = payCommList.map((item) => {
        const isConfigured = configuredList.some(
          (x) => Number(x.CONFIPAYCOMM_ID) === Number(item.NUM_PAYCOMM_ID),
        );

        return {
          payCommId: item.NUM_PAYCOMM_ID,
          commissionName: item.VAR_PAYCOMM_NAME,
          commissionCode: item.VAR_PAYCOMM_CODE,
          status: item.ACTIVEFLAG,

          checked: isConfigured,
          originallyConfigured: isConfigured,
        };
      });

      console.log("Rows", rows);

      setMode(configuredList.length > 0 ? 2 : 1);

      setTableData(rows);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || "Failed To Load Data",
      });
    } finally {
      Swal.close();
    }
  };

  const handleSelectAll = (checked) => {
    setTableData((prev) =>
      prev.map((item) => ({
        ...item,
        checked: checked === true,
      })),
    );
  };

  const handleRowCheck = (row, checked) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.payCommId === row.payCommId
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

      let payCommStr = "";
      let hasSelection = false;

      tableData.forEach((item) => {
        const oldValue = item.originallyConfigured;

        const newValue = item.checked;

        if (mode === 1) {
          if (newValue) {
            payCommStr += `${item.payCommId}#N#Y$`;
            hasSelection = true;
          } else {
            payCommStr += `${item.payCommId}#N#N$`;
          }
        } else {
          if (newValue && oldValue) {
            payCommStr += `${item.payCommId}#Y#Y$`;
            hasSelection = true;
          } else if (newValue && !oldValue) {
            payCommStr += `${item.payCommId}#N#Y$`;
            hasSelection = true;
          } else if (!newValue && oldValue) {
            payCommStr += `${item.payCommId}#Y#N$`;
            hasSelection = true;
          } else {
            payCommStr += `${item.payCommId}#N#N$`;
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

      payCommStr = payCommStr.slice(0, -1);

      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${baseUrl}/api/PayCommConf/savepaycommconfig`,
        {
          userId,
          ulbId: Number(values.corporation),
          payCommStr,
          mode,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.close();

      await Swal.fire({
        icon: "success",
        text: response?.data?.data?.errorMsg || response?.data?.message,
      });

      await handleSearch(values.corporation);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || "Save Failed",
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
                  columnStyles={columnStyles}
                  pagination
                  rowsPerPage={10}
                  onSelectAllChange={handleSelectAll}
                  onRowCheckChange={handleRowCheck}
                />
              )}

              {/* Buttons */}

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

export default FrmPayCommissionConfig;
