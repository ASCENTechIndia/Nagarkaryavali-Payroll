import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmNetPayRpt = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ulbId = user?.ulbId;

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  useEffect(() => {
    getDepartments();
  }, []);

  const getDepartments = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: Number(ulbId) },
        {  headers: { Authorization: `Bearer ${user?.token}` }
        }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.DEPTNAME || item.deptname,
        value: String(item.DEPTID || item.deptid),
      }));

      setDepartmentOptions([{ value: "0", label: "-- Select Department --" }, ...formatted]);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const initialFormValues = {
    department: "",
    reportType: "NP",
  };

  const handlePrint = async (values) => {
    // Validation
    if (!values.department || values.department === "0") {
      console.log("Please select a department");
      return;
    }

    if (!selectedMonth) {
      console.log("Please select a month");
      return;
    }

    if (values.reportType === "NP" && !selectedYear) {
      console.log("Please select a year");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const corporationName = user?.brNameMar || localStorage.getItem("BrNameMar");
      const brNameMar = user?.brNameMar || localStorage.getItem("BrNameMar");
      const brAddMar = user?.brAddMar || localStorage.getItem("BrAddMar");
      const userId = user?.userId || localStorage.getItem("UserId");
      const chalanOfficeName = user?.chalanOfficeName || localStorage.getItem("ChalanOfficeName");
      const ulbLogo = user?.ulbLogo || localStorage.getItem("UlbLogo") || "";

      const payload = {
        ulbId: Number(ulbId),
        departmentId: values.department,
        month: selectedMonth,
        year: selectedYear,
        corporationName: corporationName,
        brNameMar: brNameMar,
        brAddMar: brAddMar,
        userId: userId,
        chalanOfficeName: chalanOfficeName,
        ulbLogo: ulbLogo,
      };

      const endpoint = values.reportType === "NP" 
        ? `${BASE_URL}/api/FrmNetPayRpt/net-pay-report`
        : `${BASE_URL}/api/FrmNetPayRpt/vacant-posts-report`;

      const res = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data?.success && res.data?.data?.pdfPath) {
        const pdfUrl = `${BASE_URL}${res.data.data.pdfPath}`;
        window.open(pdfUrl, "_blank");
        
        //setSuccessMessage("Report generated successfully!");
        //setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Print Error", error);
      //setErrorMessage(error.response?.data?.message || "Failed to generate report");
      //setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/HomePage/FrmHomePage");
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i;
    return { value: String(year), label: String(year) };
  });

  return (
    <Formik initialValues={initialFormValues} enableReinitialize>
      {({ values, setFieldValue, handleChange }) => (
        <Form>
          <Card className="shadow-sm border">
            <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-2xl font-semibold">
                Net Payment and Vacant Posts Report
              </CardTitle>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">  
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Date</Label>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 w-1/2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Month --" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {values.reportType === "NP" && (
                    <div className="flex flex-col gap-2 w-1/2">
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="-- Select Year --" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y.value} value={y.value}>
                              {y.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Department </Label>
                <Select
                  value={values.department}
                  onValueChange={(value) => setFieldValue("department", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Department --" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Report Type</Label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Input
                      type="radio"
                      name="reportType"
                      value="NP"
                      checked={values.reportType === "NP"}
                      onChange={(e) => {
                        handleChange(e);
                        if (e.target.value === "NP" && !selectedYear) {
                          setSelectedYear(String(today.getFullYear()));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span>Net Pay</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Input
                      type="radio"
                      name="reportType"
                      value="VP"
                      checked={values.reportType === "VP"}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>Vacant Posts</span>
                  </label>
                </div>
              </div>
            </div>

            {/*
            {errorMessage && (
              <div className="mx-6 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            Success Message Display
            {successMessage && (
              <div className="mx-6 mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
            )}
            */}

            <CardContent className="p-6">
              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  onClick={() => handlePrint(values)}
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    "Print"
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="bg-gray-200 text-black hover:bg-gray-300"
                >
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

export default FrmNetPayRpt;