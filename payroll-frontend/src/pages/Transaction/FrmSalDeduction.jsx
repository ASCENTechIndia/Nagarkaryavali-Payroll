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
import { DatePicker } from "@/components/ui/calendar";

const initialValues = {
  department: "",
  empSelection: "-1",
  deductionHead: "",
  deductionType: "",
  deductionAmount: "",
  year: "",
  month: "",
  remarks: "",
};

const FrmSalDeduction = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();

  const mode = location.state?.mode;

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [deductionHeadOptions, setDeductionHeadOptions] = useState([]);
  const [formInitialValues, setFormInitialValues] = useState(initialValues);

  const [yearOptions, setYearOptions] = useState([]);

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

  const fetchEmployees = async (deptId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalDeduction/employee-list`,
        {
          ulbId,
          deptId: Number(deptId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEmployeeOptions(res.data?.data || []);
    } catch (error) {
      console.error("Employee API Error:", error);
      setEmployeeOptions([]);
    }
  };

  const fetchDeductionHeads = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalDeduction/deduction-head-list`,
        {
          ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDeductionHeadOptions(res.data?.data || []);
    } catch (error) {
      console.error("Deduction Head API Error:", error);
      setDeductionHeadOptions([]);
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

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await Promise.allSettled([fetchDepartments(), fetchDeductionHeads(), fetchYears(),]);
      } catch (error) {
        console.error(error);
      } finally {
        Swal.close();
      }
    };

    loadData();
  }, [token, mode]);


  const handleSubmit = async (values) => {
    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        userId: userId,
        ulbId: Number(ulbId),
        deptId: Number(values.department),
        empId:
          values.empSelection && values.empSelection !== "-1"
            ? Number(values.empSelection)
            : 0,
        payHeadId: Number(values.deductionHead),
        deductionType: Number(values.deductionType),
        wholeAmt:
          Number(values.deductionType) === 1
            ? 0
            : Number(values.deductionAmount || 0),
        year: Number(values.year),
        month: Number(values.month),
        reason: values.remarks,
      };

      console.log("Payload :", payload);

      const res = await axios.post(
        `${BASE_URL}/api/FrmSalDeduction/insert`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.success && res.data?.errorCode === 9999) {
        Swal.fire({
          text: res.data.errorMsg,
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          navigate("/HomePage/FrmHomePage");
        });
      } else {
        Swal.fire({
          text: res.data?.errorMsg || "Failed to save.",
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        text: "Failed to save deduction.",
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
                        <Label
                          className="text-nowrap"
                          text="Department"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.department}
                        onValueChange={(value) => {
                          setFieldValue("department", value);
                          setFieldValue("empSelection", "");
                          fetchEmployees(value);
                        }}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Department --" />
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

                    {/* Employee Selection */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          className="text-nowrap"
                          text="Employee Selection"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.empSelection}
                        onValueChange={(value) =>
                          setFieldValue("empSelection", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- ALL --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="-1">ALL</SelectItem>

                          {employeeOptions.map((item) => (
                            <SelectItem
                              key={item.NUM_EMPLOYEE_EMPID}
                              value={item.NUM_EMPLOYEE_EMPID.toString()}
                            >
                              {item.VAR_EMPLOYEE_ENGNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* New Designation */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          className="text-nowrap"
                          text=" Deduction Head"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.deductionHead}
                        onValueChange={(value) =>
                          setFieldValue("deductionHead", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Deduction Head --" />
                        </SelectTrigger>

                        <SelectContent>
                          {deductionHeadOptions.map((item) => (
                            <SelectItem
                              key={item.NUM_PAYHEADS_ID}
                              value={item.NUM_PAYHEADS_ID.toString()}
                            >
                              {item.VAR_PAYHEADS_ENAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transfer Type */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          className="text-nowrap"
                          text="Deduction Type"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.deductionType}
                        onValueChange={(value) =>
                          setFieldValue("deductionType", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="1">
                            {"Whole Day Deduction"}{" "}
                          </SelectItem>
                          <SelectItem value="2">
                            {"Actual Amount Deduction"}{" "}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          className="text-nowrap"
                          text="Deduction Amount"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Input
                        name="deductionAmount"
                        value={values.deductionAmount}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </div>

                    {/* Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Date" required />
                        <span>:</span>
                      </div>

                      <div className="flex gap-3 w-full">
                        <Select
                          value={values.month}
                          onValueChange={(value) => setFieldValue("month", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>

                          <SelectContent>
                            {monthOptions.map((item) => (
                              <SelectItem key={item.VALUE} value={item.VALUE}>
                                {item.LABEL}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={values.year}
                          onValueChange={(value) => setFieldValue("year", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Year" />
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
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          className="text-nowrap"
                          text="Remarks"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Input
                        name="remarks"
                        value={values.remarks}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-center gap-4 pt-8">
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                    >
                      Submit
                    </Button>

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

export default FrmSalDeduction;
