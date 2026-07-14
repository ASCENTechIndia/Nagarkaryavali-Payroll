import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

const FrmMonthlyBankDeduction = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [departmentList, setDepartmentList] = useState([]);
  const [payHeadList, setPayHeadList] = useState([]);
  const [yearList, setYearList] = useState([]);

  const fetchMasters = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        ulbId,
      };

      const [departmentRes, payHeadRes, yearRes] = await Promise.all([
        axios.post(
          `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/department-list`,
          payload,
          config,
        ),
        axios.post(
          `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/pay-head-list`,
          payload,
          config,
        ),
        axios.get(
          `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/year-list`,
          config,
        ),
      ]);

      setDepartmentList(departmentRes.data?.data || []);
      setPayHeadList(payHeadRes.data?.data || []);
      setYearList(yearRes.data?.data || []);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        text: "Failed to load master data.",
      });
    } finally {
      Swal.close();
    }
  };

  useEffect(() => {
    if (token && ulbId) {
      fetchMasters();
    }
  }, [token, ulbId]);

  const handleDownloadExcel = async (values) => {
    try {
      Swal.fire({
        title: "Preparing Excel...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        ulbId: Number(ulbId),
        payHeadId: Number(values.payHead),
        departmentId:
          values.department === "all" ? 0 : Number(values.department),
        month: Number(values.month),
        year: values.year,
        employeeStatus: values.employeeStatus,
      };

      console.log("Payload :", payload);

      const res = await axios.post(
        `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/download-excel`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("Payload sent to API:", payload);

      console.log("Response :", res.data);

      const data = res.data?.data || [];

      if (!Array.isArray(data) || data.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Records",
          text: "No data found.",
        });
        return;
      }

      // Convert JSON to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-size columns
      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 35 },
        { wch: 40 },
        { wch: 20 },
        { wch: 35 },
        { wch: 20 },
        { wch: 30 },
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Monthly Bank Deduction",
      );

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      // Create Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `MonthlyBankDeduction_${Date.now()}.xlsx`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Excel downloaded successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Download Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to download Excel.",
      });
    }
  };

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


const handleUploadExcel = async (values, resetForm) => {
  try {
    if (!values.excelFile) {
      return Swal.fire({
        icon: "warning",
        title: "Please select an Excel file",
      });
    }

    Swal.fire({
      title: "Uploading...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();

    // Excel file
    formData.append("file", values.excelFile);

    // Required payload
    formData.append("userId", user?.userId || user?.userName || "ADMIN");
    formData.append("ulbId", Number(ulbId));
    formData.append("deptId", Number(values.department || 0));
    formData.append("empId", 0);
    formData.append("payHeadId", Number(values.payHead || 0));
    formData.append("deductionType", 1);
    formData.append("wholeAmt", 0);
    formData.append("year", Number(values.year || 0));
    formData.append("month", Number(values.month || 0));
    formData.append("reason", "Salary Deduction");

    const { data } = await axios.post(
      `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/upload-excel`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Swal.close();

    Swal.fire({
      icon: "success",
      title: "Success",
      text: data?.message || "Excel uploaded successfully.",
    });

    resetForm();
  } catch (err) {
    Swal.close();

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to upload excel.",
    });
  }
};

  return (
   <Formik
  initialValues={{
    department: "all",
    year: "",
    month: "",
    payHead: "",
    employeeStatus: "A",
    excelFile: null,
  }}
  onSubmit={(values, { resetForm }) => {
    handleUploadExcel(values, resetForm);
  }}
>
      {({ values, setFieldValue }) => (
        <Form>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                Monthly Bank Deduction
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Row 1 */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Department */}

                <div>
                  <Label text="Department " required />

                  <Select
                    value={values.department}
                    onValueChange={(v) => setFieldValue("department", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- ALL --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">-- ALL --</SelectItem>

                      {departmentList.map((item) => (
                        <SelectItem key={item.VALUE} value={String(item.VALUE)}>
                          {item.LABEL}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}

                <div>
                  <Label text="Year " required />

                 

                    <Select
                      value={values.year}
                      onValueChange={(v) => setFieldValue("year", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>

                      <SelectContent>
                        {yearList.map((item) => (
                          <SelectItem
                            key={item.VALUE}
                            value={String(item.VALUE)}
                          >
                            {item.LABEL}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
               
                </div>

                {/* Month */}

                <div>
                  <Label text="Month " required />

                  <Select
                    value={values.month}
                    onValueChange={(v) => setFieldValue("month", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>

                    <SelectContent>
                      {months.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Status */}

                <div className="flex flex-col gap-2">
                  <Label text="कर्मचारी स्थिती" />

                  <div className="flex gap-8 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="employeeStatus"
                        checked={values.employeeStatus === "A"}
                        onChange={() => setFieldValue("employeeStatus", "A")}
                      />
                      <span>सक्रिय</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="employeeStatus"
                        checked={values.employeeStatus === "R"}
                        onChange={() => setFieldValue("employeeStatus", "R")}
                      />
                      <span>सेवानिवृत्त</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="employeeStatus"
                        checked={values.employeeStatus === "S"}
                        onChange={() => setFieldValue("employeeStatus", "S")}
                      />
                      <span>निलंबित</span>
                    </label>
                  </div>
                </div>

                {/* PayHead */}

                <div>
                  <Label
                    text="Deduction PayHead "
                    required
                    className="min-w-45"
                  />

                  <Select
                    value={values.payHead}
                    onValueChange={(v) => setFieldValue("payHead", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>

                    <SelectContent>
                      {payHeadList.map((item) => (
                        <SelectItem key={item.VALUE} value={String(item.VALUE)}>
                          {item.LABEL}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Download */}

              <div className="flex justify-center mt-10">
                <Button
                  type="button"
                  onClick={() => handleDownloadExcel(values)}
                >
                  Download Excel
                </Button>
              </div>

              {/* Upload */}

              <div className="mt-16 max-w-md">
                <Label text="Upload Excel File" className="min-w-45" />

                <Input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={(e) =>
                    setFieldValue("excelFile", e.currentTarget.files[0])
                  }
                />

                <div className="flex gap-4 mt-6">
                  <Input
                    value={values.excelFile ? values.excelFile.name : ""}
                    readOnly
                  />

                  <Button type="submit"  >Upload Excel</Button>
                </div>
              </div>

              {/* Back */}

              <div className="flex justify-center mt-16">
                <Button type="button" variant="secondary">
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmMonthlyBankDeduction;
