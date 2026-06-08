import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
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

const FrmReligionConfig = () => {
  const { token, user } = useAuth();

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const userId = user?.userId;

  const [corporationList, setCorporationList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mode, setMode] = useState(1);

  const axiosConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const initialValues = {
    corporation: "",
  };

  const headers = ["Select", "Religion Name"];

  const keyMapping = {
    Select: "checked",
    "Religion Name": "religionName",
  };

  const getCorporationList = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Branchconfi/corporationlist`,
        axiosConfig,
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
      text: "Loading Religions",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const [configuredRes, religionRes] = await Promise.all([
        axios.post(
          `${baseUrl}/api/ReligConfig/configreligionlist`,
          {
            ulbId: Number(corporationId),
          },
          axiosConfig,
        ),

        axios.post(
          `${baseUrl}/api/ReligConfig/religionlist`,
          {
            ulbId: Number(corporationId),
          },
          axiosConfig,
        ),
      ]);

      const configuredReligions = configuredRes?.data?.data?.data || [];

      const allReligions = religionRes?.data?.data?.data || [];

      const rows = allReligions.map((religion) => {
        const isConfigured = configuredReligions.some(
          (x) =>
            Number(x.CONFIGRELATIONID) ===
            Number(religion.NUM_RELEGION_RELEGIONID),
        );

        return {
          religionId: religion.NUM_RELEGION_RELEGIONID,

          religionName: religion.VAR_RELEGION_NAME,

          checked: isConfigured,

          originallyConfigured: isConfigured,
        };
      });

      setMode(configuredReligions.length > 0 ? 2 : 1);

      setTableData(rows);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || "Failed to load Religions",
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
        item.religionId === row.religionId
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

      let religionStr = "";
      let hasSelection = false;

      tableData.forEach((item) => {
        const oldValue = item.originallyConfigured;

        const newValue = item.checked;

        if (mode === 1) {
          if (newValue) {
            religionStr += `${item.religionId}#N#Y$`;

            hasSelection = true;
          } else {
            religionStr += `${item.religionId}#N#N$`;
          }
        } else {
          if (newValue && oldValue) {
            religionStr += `${item.religionId}#Y#Y$`;

            hasSelection = true;
          } else if (newValue && !oldValue) {
            religionStr += `${item.religionId}#N#Y$`;

            hasSelection = true;
          } else if (!newValue && oldValue) {
            religionStr += `${item.religionId}#Y#N$`;

            hasSelection = true;
          } else {
            religionStr += `${item.religionId}#N#N$`;
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

      religionStr = religionStr.slice(0, -1);

      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${baseUrl}/api/ReligConfig/savereliconfig`,
        {
          userId,
          ulbId: Number(values.corporation),
          religionStr,
          mode,
        },
        axiosConfig,
      );

      Swal.close();

      await Swal.fire({
        icon: "success",
        text:
          response?.data?.message ||
          "Religion Configuration Updated Successfully!",
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
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">
                Religion Config
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

              {/* Religion Table */}

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
                {tableData.length > 0 && <Button type="submit">Save</Button>}

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

export default FrmReligionConfig;
