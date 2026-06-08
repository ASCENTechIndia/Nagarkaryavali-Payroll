import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
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
  const { token, user } = useAuth();

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const userId = user?.userId;

  const [corporationList, setCorporationList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mode, setMode] = useState(1);

  const initialValues = {
    corporation: "",
  };

  const headers = ["Select", "Branch Name"];

  const keyMapping = {
    Select: "checked",
    "Branch Name": "branchName",
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
    if (!corporationId) return;

    Swal.fire({
      title: "Please Wait...",
      text: "Loading Branches",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const [configuredRes, branchRes] = await Promise.all([
        axios.post(
          `${baseUrl}/api/Branchconfi/configuredbranchlist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        ),

        axios.post(
          `${baseUrl}/api/Branchconfi/branchlist`,
          {
            ulbId: Number(corporationId),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ]);

      const configuredBranches = configuredRes?.data?.data?.data || [];

      const allBranches = branchRes?.data?.data?.data || [];

      const rows = allBranches.map((branch) => {
        const isConfigured = configuredBranches.some(
          (x) =>
            Number(x.CONFIBRANCH_ID) === Number(branch.NUM_BRANCHMST_BRANCHID),
        );

        return {
          branchId: branch.NUM_BRANCHMST_BRANCHID,

          branchName: branch.VAR_BRANCHMST_BRANCHNAME,

          checked: isConfigured,

          originallyConfigured: isConfigured,
        };
      });

      setMode(configuredBranches.length > 0 ? 2 : 1);

      setTableData(rows);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || "Failed to load branches",
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
        item.branchId === row.branchId
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

      let branchStr = "";
      let hasSelection = false;

      tableData.forEach((item) => {
        const oldValue = item.originallyConfigured;

        const newValue = item.checked;

        if (mode === 1) {
          if (newValue) {
            branchStr += `${item.branchId}#N#Y$`;

            hasSelection = true;
          } else {
            branchStr += `${item.branchId}#N#N$`;
          }
        } else {
          if (newValue && oldValue) {
            branchStr += `${item.branchId}#Y#Y$`;

            hasSelection = true;
          } else if (newValue && !oldValue) {
            branchStr += `${item.branchId}#N#Y$`;

            hasSelection = true;
          } else if (!newValue && oldValue) {
            branchStr += `${item.branchId}#Y#N$`;

            hasSelection = true;
          } else {
            branchStr += `${item.branchId}#N#N$`;
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

      branchStr = branchStr.slice(0, -1);

      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${baseUrl}/api/Branchconfi/savebranchconfiguration`,
        {
          userId,
          ulbId: Number(values.corporation),
          branchStr,
          mode,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.close();

      await Swal.fire({
        icon: "success",
        text:
          response?.data?.message ||
          "Branch Configuration Updated Successfully!",
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
              <CardTitle className="text-xl font-bold">Branch Config</CardTitle>
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

export default FrmBankBranchConfig;
