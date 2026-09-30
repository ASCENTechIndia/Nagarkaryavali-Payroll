import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getDaysInMonth = (year, month) => {
  if (!year || !month) return 0;
  return new Date(Number(year), Number(month), 0).getDate();
};

const calculatePresent = (attendance, medicalLeave, earnedLeave, hp, lwp) => {
  const at = Number(attendance) || 0;
  const ml = Number(medicalLeave) || 0;
  const el = Number(earnedLeave) || 0;
  const halfDay = Number(hp) || 0;
  const withoutPay = Number(lwp) || 0;

  return at - (ml + el + withoutPay + halfDay / 2);
};

export default function FrmAttendenceEntryDMC({
  onUpload,
  onSave,
  onDownloadExcel,
  onBack,
}) {
  const { authUser } = useAuth();

  const authToken = authUser?.token;
  const storedToken = localStorage.getItem("token");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const token = storedToken || authToken;
  const user = storedUser || authUser;

  const ulbId = user?.orgId || user?.ulbId;

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fileInputRef = useRef(null);

  const [category, setCategory] = useState("");
  const [zone, setZone] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("0");
  const [month, setMonth] = useState("");

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const monthDays = getDaysInMonth(year, month);

  const fetchZones = async () => {
    if (!ulbId) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmpPayHeadListRpt/zone-list`,
        {
          ulbid: Number(ulbId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.ZONENAME,
          value: String(item.ZONEID),
        }));

        setZoneOptions(formatted);
      } else {
        setZoneOptions([]);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      setZoneOptions([]);
    }
  };

  const fetchCategories = async () => {
    if (!ulbId) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/category`,
        {
          ulbid: Number(ulbId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_CATEGORY_NAME,
          value: String(item.NUM_CATEGORY_ID),
        }));

        setCategoryOptions(formatted);
      } else {
        setCategoryOptions([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoryOptions([]);
    }
  };

  const fetchYears = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmAttendenceEntryDMC/year-list`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (Array.isArray(apiData) && apiData.length > 0) {
        const formatted = apiData
          .map((item) => ({
            label: String(item.VAR_YEAR ?? item.var_year ?? ""),
            value: String(item.VAR_YEAR ?? item.var_year ?? ""),
            yearId: item.NUM_YEAR_ID ?? item.num_year_id ?? "",
          }))
          .filter((item) => item.value);

        setYearOptions(formatted);
      } else {
        setYearOptions([]);
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      setYearOptions([]);
    }
  };

  const fetchDepartments = async () => {
    if (!ulbId) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/department`,
        {
          ulbid: Number(ulbId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.DEPTNAME,
          value: String(item.DEPTID),
        }));

        setDepartmentOptions(formatted);
      } else {
        setDepartmentOptions([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartmentOptions([]);
    }
  };

  useEffect(() => {
    if (!ulbId) return;

    const loadDropdowns = async () => {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await Promise.allSettled([
          fetchZones(),
          fetchCategories(),
          fetchDepartments(),
          fetchYears(),
        ]);
      } catch (error) {
        console.error("Dropdown loading error:", error);
      } finally {
        Swal.close();
      }
    };

    loadDropdowns();
  }, [ulbId]);

  const validateFilters = () => {
    if (!category) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please Select Category.",
      });
      return false;
    }

    if (!zone) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please Select Zone.",
      });
      return false;
    }

    if (!department) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please Select Department.",
      });
      return false;
    }

    if (!year || year === "0") {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please Select Year.",
      });
      return false;
    }

    if (!month) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please Select Month.",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["xls", "xlsx"].includes(extension)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid File",
        text: "Please upload a valid Excel file (.xls or .xlsx).",
      });

      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!validateFilters()) return;

    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "File Required",
        text: "Please Enter Excel.",
      });
      return;
    }

    try {
      setUploading(true);

      Swal.fire({
        title: "Reading Excel...",
        text: "Please wait while the attendance Excel file is being processed.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const arrayBuffer = await selectedFile.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: true,
      });

      if (!workbook.SheetNames?.length) {
        throw new Error("Excel file does not contain any worksheet.");
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      if (!worksheet) {
        throw new Error("Unable to read the first worksheet.");
      }

      const rawRows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
        blankrows: false,
      });

      if (!rawRows.length) {
        throw new Error("Excel file does not contain any records.");
      }

      console.log("Excel Sheet:", firstSheetName);
      console.log("Excel Raw Rows:", rawRows);

      const normalizeKey = (key) =>
        String(key ?? "")
          .trim()
          .replace(/[\s_-]+/g, "")
          .toLowerCase();

      const getValue = (row, possibleKeys) => {
        const rowKeys = Object.keys(row);

        const matchedKey = rowKeys.find((key) =>
          possibleKeys.includes(normalizeKey(key)),
        );

        return matchedKey !== undefined ? row[matchedKey] : "";
      };

      const requiredHeaders = [
        "empid",
        "name",
        "biometric",
        "attendance",
        "medicalleave",
        "earnedleave",
        "hp",
        "lwp",
        "present",
        "remark",
      ];

      const actualHeaders = Object.keys(rawRows[0]).map(normalizeKey);

      console.log("Excel Headers:", actualHeaders);

      const missingHeaders = requiredHeaders.filter(
        (header) => !actualHeaders.includes(header),
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Invalid Excel format. Missing columns: ${missingHeaders.join(", ")}`,
        );
      }

      const formattedRows = rawRows
        .map((row) => {
          const empId = getValue(row, ["empid"]);
          const name = getValue(row, ["name"]);
          const biometric = getValue(row, ["biometric"]);

          const medicalLeave = Number(getValue(row, ["medicalleave"])) || 0;

          const earnedLeave = Number(getValue(row, ["earnedleave"])) || 0;

          const hp = Number(getValue(row, ["hp", "halfday"])) || 0;

          const lwp = Number(getValue(row, ["lwp", "withoutpay"])) || 0;

          const attendance = Number(getValue(row, ["attendance"])) || monthDays;

          const presentExcelValue = getValue(row, ["present"]);

          const present =
            presentExcelValue !== ""
              ? Number(presentExcelValue) || 0
              : calculatePresent(
                  attendance,
                  medicalLeave,
                  earnedLeave,
                  hp,
                  lwp,
                );

          const remark = getValue(row, ["remark"]);

          return {
            selected: false,
            Emp_ID: empId,
            Name: name,
            "Bio-Metric": biometric,
            Attendance: attendance,
            Medical_Leave: medicalLeave,
            Earned_Leave: earnedLeave,
            HP: hp,
            LWP: lwp,
            Present: present,
            Remark: remark,
            attendentry_id: "",
          };
        })
        .filter(
          (row) =>
            String(row.Emp_ID ?? "").trim() !== "" &&
            String(row.Name ?? "").trim() !== "",
        );

      console.log("Formatted Attendance Rows:", formattedRows);

      if (!formattedRows.length) {
        throw new Error("No valid attendance records found in the Excel file.");
      }

      setTableData(formattedRows);

      Swal.close();

      await Swal.fire({
        icon: "success",
        title: "Excel Uploaded",
        text: `${formattedRows.length} attendance record(s) loaded successfully.`,
        confirmButtonColor: "#1e3a8a",
      });
    } catch (error) {
      console.error("Excel Upload Error:", error);

      Swal.close();

      setTableData([]);

      await Swal.fire({
        icon: "error",
        title: "Excel Upload Failed",
        text: error?.message || "Failed to read attendance Excel file.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setUploading(false);
    }
  };

  const updateRow = (index, field, value) => {
    setTableData((previous) =>
      previous.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const updated = {
          ...row,
          [field]: value,
        };

        if (
          ["Attendance", "Medical_Leave", "Earned_Leave", "HP", "LWP"].includes(
            field,
          )
        ) {
          updated.Present = calculatePresent(
            field === "Attendance" ? value : row.Attendance,

            field === "Medical_Leave" ? value : row.Medical_Leave,

            field === "Earned_Leave" ? value : row.Earned_Leave,

            field === "HP" ? value : row.HP,

            field === "LWP" ? value : row.LWP,
          );
        }

        return updated;
      }),
    );
  };

  const toggleRow = (index, checked) => {
    setTableData((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              selected: Boolean(checked),
            }
          : row,
      ),
    );
  };

  const allSelected =
    tableData.length > 0 &&
    tableData.every((row) => row.selected || row.attendentry_id);

  const toggleAll = (checked) => {
    setTableData((previous) =>
      previous.map((row) =>
        row.attendentry_id
          ? row
          : {
              ...row,
              selected: Boolean(checked),
            },
      ),
    );
  };

  const handleSave = async () => {
    if (!tableData.length) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Please upload Excel first.",
      });
      return;
    }

    const selectedRows = tableData.filter(
      (row) => row.selected && !row.attendentry_id,
    );

    if (!selectedRows.length) {
      Swal.fire({
        icon: "warning",
        title: "Select Record",
        text: "Please select atleast one record to proceed.",
      });
      return;
    }

    if (!validateFilters()) return;

    const invalidRow = selectedRows.find(
      (row) =>
        row.Emp_ID === "" || row.Emp_ID === null || row.Emp_ID === undefined,
    );

    if (invalidRow) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Employee",
        text: "Employee ID is required.",
      });
      return;
    }

    try {
      setSaving(true);

      Swal.fire({
        title: "Saving...",
        text: "Please wait while attendance is being saved.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        userId: user?.userId || user?.userid || user?.id,
        categoryId: Number(category),
        zoneId: Number(zone),
        departmentId: Number(department),
        month: Number(month),
        year: Number(year),
        rows: selectedRows.map((row) => ({
          Emp_Id: Number(row.Emp_ID),
          Name: row.Name ?? "",
          "Bio-Metric": Number(row["Bio-Metric"]) || 0,
          Attendance: Number(row.Attendance) || 0,
          Medical_Leave: Number(row.Medical_Leave) || 0,
          Earned_Leave: Number(row.Earned_Leave) || 0,
          HP: Number(row.HP) || 0,
          LWP: Number(row.LWP) || 0,
          Present: Number(row.Present) || 0,
          Remark: row.Remark ?? "",
        })),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmAttendenceEntryDMC/save-attendance`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const responseData = res.data;

      if (!responseData?.ok || !responseData?.data?.success) {
        throw new Error(
          responseData?.data?.message ||
            responseData?.message ||
            "Attendance save failed.",
        );
      }

      Swal.close();

      await Swal.fire({
        icon: "success",
        title: "Success",
        text:
          responseData?.data?.message ||
          responseData?.message ||
          "Attendance saved successfully.",
        confirmButtonColor: "#1e3a8a",
      });

      handleReset();
    } catch (error) {
      console.error("Save Attendance Error:", error);

      Swal.close();

      await Swal.fire({
        icon: "error",
        title: "Save Failed",
        text:
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to save attendance.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!validateFilters()) return;

    try {
      Swal.fire({
        title: "Downloading...",
        text: "Please wait while the attendance Excel file is being prepared.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmAttendenceEntryDMC/attendance-list`,
        {
          ulbid: Number(ulbId),
          categoryId: Number(category),
          zoneId: Number(zone),
          deptId: Number(department),
          month: Number(month),
          year: Number(year),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (!Array.isArray(apiData) || apiData.length === 0) {
        Swal.close();

        await Swal.fire({
          icon: "info",
          title: "No Record Found",
          text: "No attendance record found for the selected filters.",
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }

      const daysInMonth = getDaysInMonth(year, month);

      const excelData = apiData.map((item, index) => ({
        "Sr No.": index + 1,
        "Emp ID": item.NUM_EMPLOYEE_EMPID ?? "",
        Name: item.EMPNAME ?? "",
        "Bio-Metric": "0",
        Attendance: daysInMonth,
        "Medical Leave": item.MONTHATTEND_MEDICALLEAVE ?? 0,
        "Earned Leave": item.MONTHATTEND_EARNEDLEAVE ?? 0,
        HP: item.MONTHATTEND_HALFDAY ?? 0,
        LWP: item.MONTHATTEND_WITHOUTPAY ?? 0,
        Present: calculatePresent(
          daysInMonth,
          item.MONTHATTEND_MEDICALLEAVE ?? 0,
          item.MONTHATTEND_EARNEDLEAVE ?? 0,
          item.MONTHATTEND_HALFDAY ?? 0,
          item.MONTHATTEND_WITHOUTPAY ?? 0,
        ),
        Remark: item.MONTHATTEND_REMARK ?? "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 30 },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

      const monthName =
        months.find((item) => item.value === String(month))?.label || "Month";

      const fileName = `Attendence_Report_${monthName}_${year}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      Swal.close();

      await Swal.fire({
        icon: "success",
        title: "Download Completed",
        text: "Attendance Excel file downloaded successfully.",
        confirmButtonColor: "#1e3a8a",
      });
    } catch (error) {
      console.error("Download Attendance Excel Error:", error);

      Swal.close();

      await Swal.fire({
        icon: "error",
        title: "Download Failed",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to download attendance Excel.",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const handleReset = () => {
    setCategory("");
    setZone("");
    setDepartment("");
    setYear("0");
    setMonth("");
    setSelectedFile(null);
    setTableData([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <CardTitle className="text-lg font-semibold">
          Attendance Entry DMC
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Category */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Category" required />
              <span>:</span>
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Select Category --" />
              </SelectTrigger>

              <SelectContent >
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zone */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Zone" required />
              <span>:</span>
            </div>

            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger className="w-full! h-9 overflow-hidden">
                <SelectValue placeholder="-- Select Zone --" />
              </SelectTrigger>

              <SelectContent >
                {zoneOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Department" required />
              <span>:</span>
            </div>

            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full! h-9 overflow-hidden">
                <SelectValue placeholder="-- Select Department --" />
              </SelectTrigger>

              <SelectContent>
                {departmentOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Year" required />
              <span>:</span>
            </div>

            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-full! h-9 overflow-hidden">
                <SelectValue placeholder="-- Select Year --" />
              </SelectTrigger>

              <SelectContent >
                {yearOptions.map((option) => (
                  <SelectItem
                    key={option.yearId || option.value}
                    value={String(option.value)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Month" required />
              <span>:</span>
            </div>

            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-full! h-9 overflow-hidden">
                <SelectValue placeholder="-- Select Month --" />
              </SelectTrigger>

              <SelectContent>
                {months.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Download Excel */}
          <div className="flex items-end">
            <Button type="button" onClick={handleDownloadExcel}>
              Download Excel
            </Button>
          </div>
        </div>

        {/* Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Upload Excel File" />
              <span>:</span>
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="h-9 cursor-pointer"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="h-9 bg-blue-800 hover:bg-blue-900"
            >
              {uploading ? "Uploading..." : "Upload Excel"}
            </Button>
          </div>
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected File:{" "}
            <span className="font-medium text-blue-800">
              {selectedFile.name}
            </span>
          </div>
        )}

        {/* Table */}
        {tableData.length > 0 && (
          <div className="pt-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="w-full [&_thead_tr:hover]:bg-[#083c76]">
                  <TableHeader>
                    <TableRow className="bg-[#083c76]">
                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        Sr No.
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        Emp ID
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        Name
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap w-16">
                        <div className="flex justify-center items-center">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={toggleAll}
                            className="border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-900"
                          />
                        </div>
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        Bio-Metric
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        Attendance
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        Medical Leave
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        Earned Leave
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        HP
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        LWP
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        Present
                      </TableHead>

                      <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                        Remark
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {tableData.map((row, index) => {
                      const isDisabled =
                        row.attendentry_id !== null &&
                        row.attendentry_id !== undefined &&
                        row.attendentry_id !== "";

                      return (
                        <TableRow
                          key={`${row.Emp_ID}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="p-2 text-center whitespace-nowrap">
                            {index + 1}
                          </TableCell>

                          <TableCell className="p-2 text-center whitespace-nowrap">
                            {row.Emp_ID}
                          </TableCell>

                          <TableCell className="p-2 text-left whitespace-nowrap">
                            {row.Name}
                          </TableCell>

                          <TableCell className="p-2 text-center whitespace-nowrap">
                            <div className="flex justify-center items-center">
                              <Checkbox
                                checked={row.selected}
                                // disabled={isDisabled}
                                onCheckedChange={(checked) =>
                                  toggleRow(index, checked === true)
                                }
                                className="border-2 border-gray-500"
                              />
                            </div>
                          </TableCell>

                          <TableCell className="p-2 text-center whitespace-nowrap">
                            <Input
                              type="text"
                              value={row["Bio-Metric"] || ""}
                              onChange={(e) =>
                                updateRow(index, "Bio-Metric", e.target.value)
                              }
                              className="w-20 h-8 text-center"
                              disabled={isDisabled}
                            />
                          </TableCell>

                          <TableCell className="p-2 text-center whitespace-nowrap">
                            <Input
                              type="text"
                              value={row.Attendance ?? ""}
                              readOnly
                              className="w-20 h-8 text-center bg-gray-100"
                            />
                          </TableCell>

                          <TableCell className="p-2 text-center whitespace-nowrap">
                            <Input
                              type="text"
                              value={row.Medical_Leave ?? ""}
                              onChange={(e) =>
                                updateRow(
                                  index,
                                  "Medical_Leave",
                                  e.target.value,
                                )
                              }
                              className="w-20 h-8 text-center"
                              disabled={isDisabled}
                            />
                          </TableCell>

                          <TableCell className="p-2 text-center whitespace-nowrap">
                            <Input
                              type="text"
                              value={row.Earned_Leave ?? ""}
                              onChange={(e) =>
                                updateRow(index, "Earned_Leave", e.target.value)
                              }
                              className="w-20 h-8 text-center"
                              disabled={isDisabled}
                            />
                          </TableCell>

                          <TableCell className="p-2 text-center whitespace-nowrap">
                            <Input
                              type="text"
                              value={row.HP ?? ""}
                              onChange={(e) =>
                                updateRow(index, "HP", e.target.value)
                              }
                              className="w-20 h-8 text-center"
                              disabled={isDisabled}
                            />
                          </TableCell>

                          <TableCell className="p-2 text-center whitespace-nowrap">
                            <Input
                              type="text"
                              value={row.LWP ?? ""}
                              onChange={(e) =>
                                updateRow(index, "LWP", e.target.value)
                              }
                              className="w-20 h-8 text-center"
                              disabled={isDisabled}
                            />
                          </TableCell>

                          <TableCell className="p-2 text-center whitespace-nowrap">
                            <Input
                              type="text"
                              value={row.Present ?? ""}
                              readOnly
                              className="w-20 h-8 text-center bg-gray-100"
                            />
                          </TableCell>

                          <TableCell className="p-2 text-left whitespace-nowrap">
                            <Input
                              type="text"
                              value={row.Remark ?? ""}
                              onChange={(e) =>
                                updateRow(index, "Remark", e.target.value)
                              }
                              className="w-40 h-8"
                              disabled={isDisabled}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-6">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-800 hover:bg-blue-900"
              >
                {saving ? "Submitting..." : "Submit"}
              </Button>

              <Button type="button" variant="outline" onClick={onBack}>
                Close
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
