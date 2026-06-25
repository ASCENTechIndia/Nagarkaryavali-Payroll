import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";

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

const FrmLeaveConfig = () => {
  const { token, user } = useAuth();

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const userId = user?.userId;

  const [tableData, setTableData] = useState([]);
  const [corporationList, setCorporationList] = useState([]);
  const [mode, setMode] = useState(1);

  const initialValues = {
    corporation: "",
  };

  const headers = ["Select", "Leave Name"];

  const keyMapping = {
    Select: "checked",
    "Leave Name": "leaveName",
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

  const loadLeaves = async (corporationId) => {
    if (!corporationId) return;

    Swal.fire({
      title: "Please Wait...",
      text: "Loading Leaves",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const [configuredRes, leaveRes] = await Promise.all([
        axios.post(
          `${baseUrl}/api/LeaveConfig/configuredleavelist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        ),

        axios.post(
          `${baseUrl}/api/LeaveConfig/leavelist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ]);

      const configuredLeaves = configuredRes?.data?.data?.data || [];

      const allLeaves = leaveRes?.data?.data?.data || [];

      const rows = allLeaves.map((leave) => {
        const isConfigured = configuredLeaves.some(
          (x) => Number(x.LEAVECONFIG) === Number(leave.NUM_LEAVE_LEAVEID),
        );

        return {
          leaveId: leave.NUM_LEAVE_LEAVEID,
          leaveName: leave.VAR_LEAVE_NAME,

          checked: isConfigured,

          // IMPORTANT FOR UPDATE MODE
          originallyConfigured: isConfigured,
        };
      });

      setMode(configuredLeaves.length > 0 ? 2 : 1);

      setTableData(rows);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || "Failed to load leave data",
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
        item.leaveId === row.leaveId
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

      let leaveStr = "";
      let hasSelection = false;

      tableData.forEach((item) => {
        const oldValue = item.originallyConfigured;

        const newValue = item.checked;

        if (mode === 1) {
          if (newValue) {
            leaveStr += `${item.leaveId}#N#Y$`;
            hasSelection = true;
          } else {
            leaveStr += `${item.leaveId}#N#N$`;
          }
        } else {
          if (newValue && oldValue) {
            leaveStr += `${item.leaveId}#Y#Y$`;
            hasSelection = true;
          } else if (newValue && !oldValue) {
            leaveStr += `${item.leaveId}#N#Y$`;
            hasSelection = true;
          } else if (!newValue && oldValue) {
            leaveStr += `${item.leaveId}#Y#N$`;
            hasSelection = true;
          } else {
            leaveStr += `${item.leaveId}#N#N$`;
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

      leaveStr = leaveStr.slice(0, -1);

      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${baseUrl}/api/LeaveConfig/saveleaveconfiguration`,
        {
          userId,
          ulbId: Number(values.corporation),
          leaveStr,
          mode,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.close();

      await Swal.fire({
        icon: "success",
        text:
          response?.data?.message || "Leave Configuration Saved Successfully",
      });

      await loadLeaves(values.corporation);
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
              <CardTitle className="text-xl font-bold">Leave Config</CardTitle>
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

                      await loadLeaves(value);
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

export default FrmLeaveConfig;
