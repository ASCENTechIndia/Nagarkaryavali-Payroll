import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FALLBACK_MONTHS = [
  { NUM_MONTH_ID: 1, VAR_MONTH_NAME: "January" },
  { NUM_MONTH_ID: 2, VAR_MONTH_NAME: "February" },
  { NUM_MONTH_ID: 3, VAR_MONTH_NAME: "March" },
  { NUM_MONTH_ID: 4, VAR_MONTH_NAME: "April" },
  { NUM_MONTH_ID: 5, VAR_MONTH_NAME: "May" },
  { NUM_MONTH_ID: 6, VAR_MONTH_NAME: "June" },
  { NUM_MONTH_ID: 7, VAR_MONTH_NAME: "July" },
  { NUM_MONTH_ID: 8, VAR_MONTH_NAME: "August" },
  { NUM_MONTH_ID: 9, VAR_MONTH_NAME: "September" },
  { NUM_MONTH_ID: 10, VAR_MONTH_NAME: "October" },
  { NUM_MONTH_ID: 11, VAR_MONTH_NAME: "November" },
  { NUM_MONTH_ID: 12, VAR_MONTH_NAME: "December" },
];

const formatSalaryEndDate = (year, month) => {
  const yearNum = Number(year);
  const monthNum = Number(month);
  const lastDay = new Date(yearNum, monthNum, 0).getDate();
  const monthAbbr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][monthNum - 1];

  return `${String(lastDay).padStart(2, "0")}-${monthAbbr}-${yearNum}`;
};

const FrmDesignationWiseEmployeeCountReport = () => {
  const { user, token: authToken } = useAuth();
  const token = authToken || user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const currentDate = new Date();
  const fallbackYears = Array.from({ length: 10 }, (_, i) => {
    const y = currentDate.getFullYear() - i;
    return { NUM_YEAR_ID: y, VAR_YEAR: String(y) };
  });

  const [monthList, setMonthList] = useState(FALLBACK_MONTHS);
  const [yearList, setYearList] = useState(fallbackYears);
  const [departmentList, setDepartmentList] = useState([]);

  const initialValues = {
    month: String(currentDate.getMonth() + 1),
    year: String(currentDate.getFullYear()),
    department: "-1",
    empType: "NEW",
    fileFormat: "PDF",
  };

  useEffect(() => {
    if (!token || !ulbId) return;

    const loadMasters = async () => {
      try {
        Swal.fire({
          title: "Loading...",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        });

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [monthRes, yearRes, deptRes] = await Promise.allSettled([
          axios.post(`${BASE_URL}/api/FrmPayrollReport/month-list`, {}, config),
          axios.post(`${BASE_URL}/api/FrmPayrollReport/year-list`, {}, config),
          axios.post(
            `${BASE_URL}/api/FrmDesignationWiseEmployeeCountReport/department-list`,
            { ulbid: Number(ulbId) },
            config
          ),
        ]);

        if (monthRes.status === "fulfilled") {
          const months = monthRes.value?.data?.data?.data || [];
          if (months.length > 0) setMonthList(months);
        }

        if (yearRes.status === "fulfilled") {
          const years = yearRes.value?.data?.data?.data || [];
          if (years.length > 0) setYearList(years);
        }

        if (deptRes.status === "fulfilled") {
          const depts =
            deptRes.value?.data?.data?.data ||
            deptRes.value?.data?.data?.rows ||
            [];
          setDepartmentList(depts);
        }
      } catch (error) {
        console.error("Failed to load dropdown masters:", error);
      } finally {
        Swal.close();
      }
    };

    loadMasters();
  }, [token, ulbId]);

  const exportToExcel = (rows, values) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      Swal.fire({
        icon: "warning",
        text: "No Data Found",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Designation Working Status");
    XLSX.writeFile(
      workbook,
      `Designation_Working_Status_${values.month}_${values.year}.xlsx`
    );
  };

  const handleSubmit = async (values) => {
    if (!values.month) {
      Swal.fire({ icon: "warning", text: "Please select Month." });
      return;
    }
    if (!values.year) {
      Swal.fire({ icon: "warning", text: "Please select Year." });
      return;
    }
    if (!values.department) {
      Swal.fire({ icon: "warning", text: "Please select Department." });
      return;
    }

    try {
      Swal.fire({
        title: "Generating...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const selectedDept = departmentList.find(
        (d) => String(d.DEPTID) === String(values.department)
      );

      const payload = {
        ulbId: Number(ulbId),
        ulbid: Number(ulbId),
        month: Number(values.month),
        year: Number(values.year),
        salaryDate: formatSalaryEndDate(values.year, values.month),
        deptId: values.department,
        deptName: selectedDept ? selectedDept.DEPTNAME : null,
        empType: values.empType,
        fileFormat: values.fileFormat,
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (values.fileFormat === "PDF") {
        const response = await axios.post(
          `${BASE_URL}/api/FrmDesignationWiseEmployeeCountReport/generate-pdf`,
          payload,
          config
        );

        Swal.close();

        if (response?.data?.success && response?.data?.pdfUrl) {
          window.open(response.data.pdfUrl, "_blank");
        } else {
          Swal.fire({
            icon: "warning",
            text: response?.data?.message || "No Data Found",
          });
        }
      } else {
        const response = await axios.post(
          `${BASE_URL}/api/FrmDesignationWiseEmployeeCountReport/report-data`,
          payload,
          config
        );

        Swal.close();

        const rows =
          response?.data?.data?.data ||
          response?.data?.data ||
          [];
        exportToExcel(rows, values);
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to generate report.",
      });
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-5"
          >
            <Card className="border shadow-sm">
              <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                <CardTitle className="text-xl font-bold">
                  Designation Working Status Report
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex justify-start sm:justify-between items-center">
                      <Label
                        text="Salary Date"
                        className="text-[15px] font-semibold text-black"
                      />
                      <span>:</span>
                    </div>
                    <div className="flex gap-3">
                      <Select
                        value={values.month}
                        onValueChange={(value) => setFieldValue("month", value)}
                      >
                        <SelectTrigger className="h-9 flex-1 min-w-0">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent showDefaultOption={false}>
                          {monthList.map((m) => (
                            <SelectItem
                              key={m.NUM_MONTH_ID}
                              value={String(m.NUM_MONTH_ID)}
                            >
                              {m.VAR_MONTH_NAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={values.year}
                        onValueChange={(value) => setFieldValue("year", value)}
                      >
                        <SelectTrigger className="h-9 w-28 shrink-0">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent showDefaultOption={false}>
                          {yearList.map((y) => (
                            <SelectItem
                              key={y.NUM_YEAR_ID}
                              value={String(y.VAR_YEAR)}
                            >
                              {y.VAR_YEAR}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex justify-start sm:justify-between items-center">
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
                      <SelectContent showDefaultOption={false}>
                        <SelectItem value="-1">-- ALL --</SelectItem>
                        {departmentList.map((dept) => (
                          <SelectItem
                            key={dept.DEPTID}
                            value={String(dept.DEPTID)}
                          >
                            {dept.DEPTNAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                  <Button type="submit" className="px-8">
                    Submit
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
      )}
    </Formik>
  );
};

export default FrmDesignationWiseEmployeeCountReport;
