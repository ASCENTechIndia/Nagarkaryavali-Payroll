import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const initialValues = {
  Year: "",
  Month: "",
  Zone: "",
  department: "",
  reportType: "",
  status: "PDF",
};

const FrmPayrollReport = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [yearOptions, setYearOptions] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const fetchYears = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmPayrollReport/year-list`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setYearOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Year API Error:", error);
    }
  };

  const fetchMonths = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmPayrollReport/month-list`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMonthOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Month API Error:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        {
          ulbid: ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDepartmentOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Department API Error:", error);
    }
  };

  const fetchZones = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
        {
          ulbid: ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setZoneOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Zone API Error:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadDropdowns = async () => {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const results = await Promise.allSettled([
          fetchYears(),
          fetchMonths(),
          fetchDepartments(),
          fetchZones(),
        ]);

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            console.log(`Dropdown ${index} loaded successfully`);
          } else {
            console.error(`Dropdown ${index} failed:`, result.reason);
            Swal.fire("Error", `Failed to load dropdown ${index + 1}`, "error");
          }
        });
      } finally {
        Swal.close();
      }
    };

    loadDropdowns();
  }, [token]);

  const getStartEndDate = (year, month) => {
    const monthIndex = Number(month) - 1;

    const firstDate = new Date(year, monthIndex, 1);
    const lastDate = new Date(year, monthIndex + 1, 0);

    const format = (date) => {
      return date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-");
    };

    return {
      startDate: format(firstDate),
      endDate: format(lastDate),
    };
  };

  const exportExcel = (response) => {
    const rows = response.data || [];

    let total = 0;

    const excelData = rows.map((item, index) => {
      total += Number(item.AMOUNT || 0);

      return {
        "Sr No": index + 1,
        "Department Code": item.DEPTMST_CODE,
        "Department Name": item.DEPNAME,
        "Employee Code": item.EMPCODE,
        "Employee Name": item.EMPNAME,
        "Bank Account No": item.ACCNO,
        "Net Salary": item.AMOUNT,
      };
    });

    excelData.push({
      "Sr No": "",
      "Department Code": "",
      "Department Name": "",
      "Employee Code": "",
      "Employee Name": "TOTAL",
      "Account No": "",
      "Net Salary": total,
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      response.reportName || "Payroll Report",
    );

    XLSX.writeFile(workbook, "Payroll_Report.xlsx");
  };

  const handleSubmit = async (values) => {
    try {

      if (!values.Zone) {
        Swal.fire({
          text: "Please select Zone",
        });
        return;
      }


      if (!values.reportType) {
        Swal.fire({
          text: "Please select Report Type",
        });
        return;
      }

      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const { startDate, endDate } = getStartEndDate(values.Year, values.Month);

      const payload = {
        startDate,
        endDate,
        ulbid: ulbId,
        deptId: values.department || "-1",
        zoneId: values.Zone,
        reportType: values.reportType,
      };

      if (values.status === "PDF") {
        const res = await axios.post(
          `${BASE_URL}/api/FrmPayrollReport/generate-payroll-pdf`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data.success) {
          window.open(res.data.pdfUrl, "_blank");
        }
      } else {
        const res = await axios.post(
          `${BASE_URL}/api/FrmPayrollReport/payroll-report`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        exportExcel(res.data.data);
      }
    } catch (err) {
      console.log(err);

      Swal.fire({
        icon: "error",
        text: "Something went wrong.",
      });
    } finally {
      Swal.close();
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue }) => {
        return (
          <Form>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 md:p-5 min-h-screen"
            >
              <Card className="border-0 shadow-none rounded-none bg-transparent">
                <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                  <CardTitle className="text-xl font-bold">
                    Payroll Report
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          text="Year"
                          className="text-[15px] font-semibold text-black"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.Year}
                        onValueChange={(value) => setFieldValue("Year", value)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          {yearOptions.map((item) => (
                            <SelectItem
                              key={item.NUM_YEAR_ID}
                              value={item.NUM_YEAR_ID.toString()}
                            >
                              {item.VAR_YEAR}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          text="Month"
                          className="text-[15px] font-semibold text-black"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.Month}
                        onValueChange={(value) => setFieldValue("Month", value)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          {monthOptions.map((item) => (
                            <SelectItem
                              key={item.NUM_MONTH_ID}
                              value={item.NUM_MONTH_ID.toString()}
                            >
                              {item.VAR_MONTH_NAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          text="Zone"
                          className="text-[15px] font-semibold text-black"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.Zone}
                        onValueChange={(value) => setFieldValue("Zone", value)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- ALL --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="-1"> -- ALL -- </SelectItem>
                          {zoneOptions.map((item) => (
                            <SelectItem
                              key={item.ZONEID}
                              value={item.ZONEID.toString()}
                            >
                              {item.ZONENAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          text="Department"
                          className="text-[15px] font-semibold text-black"
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.department}
                        onValueChange={(value) =>
                          setFieldValue("department", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- ALL --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="-1"> -- ALL -- </SelectItem>
                          {departmentOptions.map((item) => (
                            <SelectItem
                              key={item.DEPTID}
                              value={item.DEPTID.toString()}
                            >
                              {item.DEPTNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label
                                                    text="Employee Type"
                                                    required
                                                    className="text-[15px] font-semibold text-black"
                                                />
                                                <span>:</span>
                                            </div>

                                            <Select
                                                value={values.empType}
                                                onValueChange={(value) => setFieldValue("empType", value)}
                                            >
                                                <SelectTrigger className="w-full h-9">
                                                    <SelectValue placeholder="-- Select Option --" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="ALL">ALL</SelectItem>
                                                    <SelectItem value="OLD">OLD</SelectItem>
                                                    <SelectItem value="NEW">NEW</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div> */}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          text="Report Type"
                          className="text-[15px] font-semibold text-black"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.reportType}
                        onValueChange={(value) =>
                          setFieldValue("reportType", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="0">
                            --Select Report Type--
                          </SelectItem>
                          <SelectItem value="1">Bank List</SelectItem>
                          <SelectItem value="2">Bank Deduction</SelectItem>
                          <SelectItem value="4">
                            Bank Of Maharashtra List
                          </SelectItem>
                          <SelectItem value="5">Bank ECS List</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          className="text-[15px] font-semibold text-black"
                          required
                        >
                          Export To
                        </Label>

                        <span>:</span>
                      </div>

                      <div className="flex items-center gap-5">
                        <Label className="flex items-center gap-3 cursor-pointer">
                          <Input
                            type="radio"
                            name="status"
                            value="PDF"
                            checked={values.status === "PDF"}
                            onChange={handleChange}
                            className="w-9 h-4"
                          />
                          PDF
                        </Label>

                        <Label className="flex items-center gap-2 cursor-pointer">
                          <Input
                            type="radio"
                            name="status"
                            value="EXCEL"
                            checked={values.status === "EXCEL"}
                            onChange={handleChange}
                            className="w-9 h-4"
                          />
                          EXCEL
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <Button
                      type="submit"
                      className="bg-blue-900 hover:bg-blue-800 text-white px-8"
                    >
                      Search
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="px-8"
                      onClick={() => navigate("/HomePage/FrmHomePage")}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmPayrollReport;
