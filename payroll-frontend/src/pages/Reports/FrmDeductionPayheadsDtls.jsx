import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Formik, Form } from "formik";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmDeductionPayheadsDtls = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ulbId = user?.ulbId;

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [deductionOptions, setDeductionOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    String(today.getMonth() + 1)
  );

  const [selectedYear, setSelectedYear] = useState(
    String(today.getFullYear())
  );

  const initialFormValues = {
    department: "",
    deductionHead: "",
  };

  useEffect(() => {
    loadDropdowns();
    fetchDepartment();
    fetchDeductionData(empId,ulbId);
  }, []);

  //remove this and add different func for dept and deduction
  const loadDropdowns = async () => {
    try {
      // Replace with API calls

      setDepartmentOptions([
        { value: "HR", label: "Human Resources" },
        { value: "IT", label: "Information Technology" },
        { value: "ACC", label: "Accounts" },
      ]);

      setDeductionOptions([
        { value: "PF", label: "Provident Fund" },
        { value: "PT", label: "Professional Tax" },
        { value: "LIC", label: "LIC" },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  //dept func check 
  const fetchDepartment = async () => {
    try {
      if (!ulbId) return;
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.DEPTNAME,
          value: String(item.DEPTID),
        }));
        setDepartmentOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  //deduction func check
  const fetchDeductionData = async (empId, ulbId) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/salary-deduction-list`,
        { empid: empId, ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.data?.data) {
        const formattedDeductions = response.data.data.data.map(item => ({
          id: item.NUM_PAYHEADS_ID,
          name: item.VAR_PAYHEADS_ENAME,
          amount: item.NUM_EMPALLOWDED_AMOUNT?.toString() || "0"
        }));
        setDeductionList(formattedDeductions);
      }
    } catch (error) {
      console.error("Error fetching deduction data:", error);
    }
  };

  //check if print is required or search
  //check if pdf is need or table format is enough
  const handlePrint = async (values) => {
    {/* if (!selectedMonth || !selectedYear) {
    Swal.fire({
      icon: "warning",
      text: "Please select month and year",
    });
    return;
    } */}

  try {
    setLoading(true);

    const payload = {
      reportMonth: selectedMonth,
      reportYear: selectedYear,
      department: values.department,
      deductionHead: values.deductionHead,
      ulbid: Number(ulbId),
    };

    const res = await axios.post(
      `${BASE_URL}/api/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        responseType: "blob", // if API returns PDF
      }
    );

    const file = new Blob([res.data], {
      type: "application/pdf",
    });

    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  } catch (error) { 
    console.error("Print Error", error);
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    navigate("/");
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
    <Formik
      initialValues={initialFormValues}
      enableReinitialize
      //onSubmit={handlePrint}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <Card className="shadow-sm border">
            <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-2xl font-semibold">
                Deduction Report
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
                        <SelectItem 
                          key={m.value} 
                          value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 w-1/2">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Year --" />
                    </SelectTrigger>

                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem 
                          key={y.value} 
                          value={y.value}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

              <div className="flex flex-col gap-2">
                <Label className="font-semibold">
                  Department
                </Label>

                <Select
                  value={values.department}
                  onValueChange={(value) =>
                    setFieldValue("department", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Option --" />
                  </SelectTrigger>

                  <SelectContent>
                    {departmentOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-semibold whitespace-nowrap">
                  Deduction Head
                </Label>

                <Select
                  value={values.deductionHead}
                  onValueChange={(value) =>
                    setFieldValue("deductionHead", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Option --" />
                  </SelectTrigger>

                  <SelectContent>
                    {deductionOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex justify-center gap-4">

                <Button
                  type="button"
                  onClick={() => handlePrint(values)}
                  className="bg-blue-600 text-white hover:bg-gray-300 hover:text-blue-600"
                >
                  Print
                </Button>

                <Button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 text-black hover:bg-gray-200"
                >
                  Cancel
                </Button>

              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmDeductionPayheadsDtls;