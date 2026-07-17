import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";

import * as XLSX from "xlsx";

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

const FrmMonthlyBankUploadReport = () => {
  const { user } = useAuth();

  const token = user?.token;
  const ulbid = user?.ulbId;

  const [departments, setDepartments] = useState([]);
  const [yearList, setYearList] = useState([]);

  const [departmentId, setDepartmentId] = useState("-1");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    if (token && ulbid) {
      fetchMasters();
    }
  }, [token, ulbid]);

  const fetchMasters = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        ulbid: Number(ulbid),
      };

      const [departmentRes, yearRes] = await Promise.all([
        axios.post(
          `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
          payload,
          config,
        ),

        axios.get(
          `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/year-list`,
          config,
        ),
      ]);

      const departmentData =
        departmentRes?.data?.data?.data ||
        departmentRes?.data?.data?.rows ||
        [];

      setDepartments([
        {
          DEPTID: -1,
          DEPTNAME: "-- ALL --",
        },
        ...departmentData,
      ]);

      setYearList(yearRes?.data?.data || []);

      Swal.close();
    } catch (err) {
      Swal.close();

      Swal.fire({
        icon: "error",
        text: err.response?.data?.message || "Failed to load master data.",
      });
    }
  };

  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const handleBack = () => {
    setDepartmentId("-1");
    setSelectedYear("");
    setSelectedMonth("");
  };

  const generateExcel = (rows) => {
    if (!rows || rows.length === 0) {
      Swal.fire({
        icon: "warning",
        text: "No data found.",
      });
      return;
    }

    const excelRows = rows.map((row, index) => ({
      "Sr. No.": index + 1,
      "Employee Code": row.EMPLOYEE_CODE ?? "",
      "Employee Name": row.EMPLOYEE_NAME ?? "",
      Department: row.DEPARTMENT ?? "",
      "Salary Month/Year": row.SALARY_MONTH_YEAR ?? "",
      "Deduction Payhead": row.DEDUCTION_PAYHEAD ?? "",
      "Deduction Amount": Number(row.DEDUCTION_AMOUNT ?? 0),
      Remarks: row.REMARKS ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 35 },
      { wch: 35 },
      { wch: 18 },
      { wch: 30 },
      { wch: 18 },
      { wch: 35 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Monthly Bank Upload Report",
    );

    XLSX.writeFile(
      workbook,
      `Monthly_Bank_Upload_Report_${selectedMonth}_${selectedYear}.xlsx`,
    );

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Excel generated successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handlePrint = async () => {
    if (!selectedYear) {
      Swal.fire({
        icon: "warning",
        text: "Please select Year.",
      });
      return;
    }

    if (!selectedMonth) {
      Swal.fire({
        icon: "warning",
        text: "Please select Month.",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Generating...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        ulbId: Number(ulbid),
        departmentId: Number(departmentId),
        month: Number(selectedMonth),
        year: Number(selectedYear),
      };

      const response = await axios.post(
        `${BASE_URL}/api/FrmMonthlyBankUploadReport/monthly-bank-upload-report`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Swal.close();

      const result = response.data?.data;

      if (!result?.success) {
        Swal.fire({
          icon: "error",
          text: response.data?.message || "Failed to generate report.",
        });
        return;
      }

      if (!result.data || result.data.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Records",
          text: "No data found for the selected filters.",
        });
        return;
      }

      generateExcel(result.data);
    } catch (err) {
      Swal.close();

      console.error("API Error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        err.message ||
        "Unable to generate report.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        {/* Header */}
        <CardHeader className="border-b">
          <CardTitle className="text-xl md:text-xl font-bold">
            Monthly Bank Upload Report
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Department */}
            <div className="flex items-center gap-3">
              <Label required text="Department" className="w-28 shrink-0" />
              <span>:</span>

              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="flex-1 h-10">
                  <SelectValue placeholder="-- Select Department --" />
                </SelectTrigger>

                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.DEPTID} value={String(dept.DEPTID)}>
                      {dept.DEPTNAME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="flex items-center gap-3">
              <Label required text="Year" className="w-20 shrink-0" />
              <span>:</span>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="flex-1 h-10">
                  <SelectValue placeholder="-- Select Year --" />
                </SelectTrigger>

                <SelectContent>
                  {yearList.map((item) => (
                    <SelectItem key={item.VALUE} value={String(item.LABEL)}>
                      {item.LABEL}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div className="flex items-center gap-3">
              <Label required text="Month" className="w-20 shrink-0" />
              <span>:</span>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="flex-1 h-10">
                  <SelectValue placeholder="-- Select Month --" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-10">
            <Button type="button" onClick={handlePrint}>
              Print
            </Button>

            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmMonthlyBankUploadReport;
