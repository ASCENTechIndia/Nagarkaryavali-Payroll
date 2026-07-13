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
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";

const initialValues = {
  department: "",
  year: "",
  month: "",
  deductionPayHead: "",
  status: "Active",
};

const FrmMonthlyBankDeductionUpload = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode;
  const empId = location.state?.empId;
  const empTransId = location.state?.empTransId;

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  console.log("console.log", {
    mode,
    empId,
    empTransId,
    ulbId,
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [payHeadOptions, setPayHeadOptions] = useState([]);
  const [formInitialValues, setFormInitialValues] = useState(initialValues);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadedData, setUploadedData] = useState([]);

  const tableHeaders = [
    "Employee Code",
    "Employee Name",
    "Department",
    "Salary Month Year",
    "Deduction Payhead",
    "Deduction Amount",
    "Remarks",
  ];

  const keyMapping = {
    "Employee Code": "Employee_Code",
    "Employee Name": "Employee_Name",
    Department: "Department",
    "Salary Month Year": "Salary_Month_Year",
    "Deduction Payhead": "Deduction_Payhead",
    "Deduction Amount": "Deduction_Amount",
    Remarks: "Remarks",
  };


  const monthOptions = [
    { VALUE: "1", LABEL: "January" },
    { VALUE: "2", LABEL: "February" },
    { VALUE: "3", LABEL: "March" },
    { VALUE: "4", LABEL: "April" },
    { VALUE: "5", LABEL: "May" },
    { VALUE: "6", LABEL: "June" },
    { VALUE: "7", LABEL: "July" },
    { VALUE: "8", LABEL: "August" },
    { VALUE: "9", LABEL: "September" },
    { VALUE: "10", LABEL: "October" },
    { VALUE: "11", LABEL: "November" },
    { VALUE: "12", LABEL: "December" },
  ];

  const handleDownloadExcel = async (values) => {
    try {
      if (
        !values.department ||
        !values.year ||
        !values.month ||
        !values.deductionPayHead
      ) {
        Swal.fire({
          text: "Please select all required fields.",
        });
        return;
      }

      Swal.fire({
        title: "Downloading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        ulbId: Number(ulbId),
        payHeadId: Number(values.deductionPayHead),
        departmentId: Number(values.department),
        month: Number(values.month),
        year: values.year,
        employeeStatus:
          values.status === "Active"
            ? "A"
            : values.status === "retire"
              ? "R"
              : "S",
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/download-excel`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = res.data.data || [];

      if (!data.length) {
        Swal.close();
        Swal.fire({
          text: "No data found.",
        });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Monthly Bank Deduction",
      );

      XLSX.writeFile(
        workbook,
        `Monthly_Bank_Deduction_${values.month}_${values.year}.xlsx`,
      );

      Swal.close();
    } catch (error) {
      console.error(error);

      Swal.fire({
        text: "Failed to download Excel.",
      });
    }
  };

  const handleUploadExcel = async () => {
    try {
      if (!excelFile) {
        Swal.fire({
          text: "Please select an Excel file.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", excelFile);

      Swal.fire({
        title: "Uploading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/upload-excel`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload Response:", res.data);

      if (res.data?.success) {
        setUploadedData(res.data.data || []);

        // Swal.fire({
        //   text: `${res.data.totalRows} records loaded successfully.`,
        // });
        Swal.close();
      } else {
        Swal.fire({
          text: "No data found in uploaded file.",
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        text: "Failed to upload Excel.",
      });
    }
  };

  const fetchYears = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/year-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setYearOptions(res.data?.data || []);
    } catch (error) {
      console.error("Year API Error:", error);
      setYearOptions([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/department-list`,
        {
          ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDepartmentOptions(res.data?.data || []);
    } catch (error) {
      console.error("Department API Error:", error);
      setDepartmentOptions([]);
    }
  };

  const fetchPayHeads = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/pay-head-list`,
        {
          ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPayHeadOptions(res.data?.data || []);
    } catch (error) {
      console.error("Pay Head API Error:", error);
      setPayHeadOptions([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await Promise.allSettled([
          fetchYears(),
          fetchDepartments(),
          fetchPayHeads(),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        Swal.close();
      }
    };

    loadData();
  }, [token, mode, empId, empTransId]);


  const handleSubmit = async (values) => {
  try {
    if (uploadedData.length === 0) {
      Swal.fire({
        text: "Please upload Excel first.",
      });
      return;
    }

    Swal.fire({
      title: "Submitting...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const in_str = uploadedData
      .map((row) => {
        return [
          row.Employee_Code ?? "",
          row.Employee_Name ?? "",
          row.Department ?? "",
          row.Salary_Month_Year ?? "",
          row.Deduction_Payhead ?? "",
          row.Deduction_Amount ?? "",
          row.Remarks ?? "",
        ].join("$");
      })
      .join("#");

    const payload = {
      userId: userId,
      month: Number(values.month),
      year: Number(values.year),
      mode: 1,
      id: 0,
      in_str,
    };

    console.log("Submit Payload", payload);

    const res = await axios.post(
      `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/submit`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Submit Response", res.data);

    if (res.data?.success || res.data?.ok) {
      Swal.fire({
        text:
          res.data.errorMsg ||
          res.data.data?.errorMsg ||
          "Submitted Successfully",
      }).then(() => {
        setUploadedData([]);
        setExcelFile(null);
      });
      navigate("/Transactions/FrmMonthlyBankDeductionUpload")
    } else {
      Swal.fire({
        text:
          res.data.errorMsg ||
          res.data.data?.errorMsg ||
          "Submission Failed",
      });
    }
  } catch (error) {
    console.error(error);

    Swal.fire({
      text:
        error.response?.data?.errorMsg ||
        error.response?.data?.data?.errorMsg ||
        "Failed to submit data.",
    });
  }
};

  return (
    <Formik
      initialValues={formInitialValues}
      enableReinitialize={true}
      onSubmit={handleSubmit}
    >
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
                    Monthly Bank Deduction
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Department" required />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.department}
                        onValueChange={(value) =>
                          setFieldValue("department", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          {departmentOptions.map((item) => (
                            <SelectItem
                              key={item.VALUE}
                              value={item.VALUE.toString()}
                            >
                              {item.LABEL}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Year" required />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.year}
                        onValueChange={(value) => setFieldValue("year", value)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="--Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          {yearOptions.map((item) => (
                            <SelectItem
                              key={item.VALUE}
                              value={item.VALUE.toString()}
                            >
                              {item.LABEL}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text=" Month" required />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.month}
                        onValueChange={(value) => setFieldValue("month", value)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          {monthOptions.map((item) => (
                            <SelectItem key={item.VALUE} value={item.VALUE}>
                              {item.LABEL}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          text="Deduction PayHead"
                          required
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.deductionPayHead}
                        onValueChange={(value) =>
                          setFieldValue("deductionPayHead", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          {payHeadOptions.map((item) => (
                            <SelectItem
                              key={item.VALUE}
                              value={item.VALUE.toString()}
                            >
                              {item.LABEL}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="कर्मचारी स्थिती" />
                          <span>:</span>
                        </div>

                        <div className="flex items-center gap-6">
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <Input
                              type="radio"
                              name="status"
                              value="Active"
                              checked={values.status === "Active"}
                              onChange={handleChange}
                              className="w-9 h-4"
                            />
                            सक्रिय
                          </Label>

                          <Label className="flex items-center gap-2 cursor-pointer">
                            <Input
                              type="radio"
                              name="status"
                              value="retire"
                              checked={values.status === "retire"}
                              onChange={handleChange}
                              className="w-9 h-4"
                            />
                            सेवानिवृत्त
                          </Label>
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <Input
                              type="radio"
                              name="status"
                              value="inActive"
                              checked={values.status === "inActive"}
                              onChange={handleChange}
                              className="w-9 h-4"
                            />
                            निलंबित
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-6">
                    <Button
                      type="button"
                      onClick={() => handleDownloadExcel(values)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-10"
                    >
                      Download Excel
                    </Button>
                  </div>

                  <div className="pt-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label
                            text="Upload Excel File"
                            className="text-nowrap"
                            required
                          />
                          <span>:</span>
                        </div>

                        <Input
                          type="file"
                          accept=".xls,.xlsx"
                          onChange={(e) =>
                            setExcelFile(e.target.files?.[0] || null)
                          }
                          className="cursor-pointer"
                        />
                      </div>

                      <div className="md:self-end">
                        <Button
                          type="button"
                          onClick={handleUploadExcel}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-10"
                        >
                          Upload Excel
                        </Button>
                      </div>
                    </div>
                  </div>

                  {uploadedData.length > 0 && (
                    <div className="pt-8">
                      <ShadCNTable
                        headers={tableHeaders}
                        data={uploadedData}
                        keyMapping={keyMapping}
                      />
                    </div>
                  )}

                  <div className="flex justify-center gap-4 pt-8">
                    {uploadedData.length > 0 && (
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                      >
                        Submit
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="px-8"
                      path="/HomePage/FrmHomePage"
                    >
                      Back
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

export default FrmMonthlyBankDeductionUpload;
