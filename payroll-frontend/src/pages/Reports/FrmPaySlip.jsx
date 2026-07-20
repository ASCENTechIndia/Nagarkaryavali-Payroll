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
  salaryDate: new Date(),
  Year: "",
  Month: "",
  zone: "",
  department: "",
  category: "",
  employeeId: "",
};

const FrmPaySlip = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();


  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [zoneOptions, setZoneOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);


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
        }
      );

      setZoneOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Zone API Error:", error);
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
        }
      );

      setDepartmentOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Department API Error:", error);
    }
  };


  const fetchCategories = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/category`,
        {
          ulbid: ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCategoryOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Category API Error:", error);
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
        await Promise.allSettled([
          fetchZones(),
          fetchDepartments(),
          fetchCategories(),
          fetchYears(),
          fetchMonths(),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        Swal.close();
      }
    };

    loadDropdowns();
  }, [token]);

  const handleSubmit = async (values) => {
    try {
      // Validation
      if (!values.zone) {
        Swal.fire({
          text: "Please select Zone",
        });
        return;
      }

      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const payload = {
        ulbId: Number(ulbId),
        empId: values.employeeId || "",
        oldEmpNo: "",
        deptId: Number(values.department) || "",
        subDept: "",
        categoryId: Number(values.category) || "",
        zoneId: Number(values.zone),
        month: Number(values.Month),
        year: Number(values.Year),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmPayslip/generate-payslip`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );



      if (res.data?.success) {

        if (res.data?.pdfUrl) {
          window.open(res.data.pdfUrl, "_blank");
        }
        Swal.close();

      } else {
        Swal.fire({
          text: res.data?.message || "Failed to generate pay slip",
        });
      }
    } catch (error) {
      console.error("Generate Pay Slip API Error:", error);

      Swal.fire({
        text: error.response?.data?.message || "Failed to generate pay slip",
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, setFieldValue }) => {

        useEffect(() => {
          if (
            monthOptions.length > 0 &&
            yearOptions.length > 0 &&
            !values.Month &&
            !values.Year
          ) {
            const currentDate = new Date();

            const currentMonth = currentDate.getMonth() + 1; // 1-12
            const currentYear = currentDate.getFullYear();

            const month = monthOptions.find(
              (item) => Number(item.NUM_MONTH_ID) === currentMonth
            );

            const year = yearOptions.find(
              (item) => Number(item.VAR_YEAR) === currentYear
            );

            if (month) {
              setFieldValue("Month", month.NUM_MONTH_ID.toString());
            }

            if (year) {
              setFieldValue("Year", year.NUM_YEAR_ID.toString());
            }
          }
        }, [monthOptions, yearOptions]);

        return (
          <Form>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 md:p-5 min-h-screen"
            >
              <Card className="border-0 shadow-none rounded-none bg-transparent">
                <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                  <CardTitle className="text-xl font-bold">Pay Slip</CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          text="Salary Date"
                          className="text-[15px] font-semibold text-black"
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.Month}
                        onValueChange={(value) => setFieldValue("Month", value)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Month --" />
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

                      <Select
                        value={values.Year}
                        onValueChange={(value) => setFieldValue("Year", value)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Year --" />
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
                          text="Zone"
                          required
                          className="text-[15px] font-semibold text-black"
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.zone}
                        onValueChange={(value) => setFieldValue("zone", value)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>

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
                          className="text-[15px] font-semibold text-black "
                          required
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
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
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
                                                    text="Sub Department"
                                                    className="text-[15px] font-semibold text-black "
                                                    required
                                                />
                                                <span>:</span>
                                            </div>

                                            <Select
                                                value={values.subDepartment}
                                                onValueChange={(value) =>
                                                    setFieldValue("subDepartment", value)
                                                }
                                            >
                                                <SelectTrigger className="w-full h-9">
                                                    <SelectValue placeholder="-- Select Option --" />
                                                </SelectTrigger>

                                                <SelectContent> */}
                    {/* {subDepartmentOptions?.map((item) => (
                                                        <SelectItem
                                                            key={item.id}
                                                            value={item.id.toString()}
                                                        >
                                                            {item.name}
                                                        </SelectItem>
                                                    ))} */}
                    {/* </SelectContent>
                                            </Select>
                                        </div> */}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          text="Category"
                          className="text-[15px] font-semibold text-black"
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.category}
                        onValueChange={(value) =>
                          setFieldValue("category", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select category --" />
                        </SelectTrigger>

                        <SelectContent>
                          {categoryOptions.map((item) => (
                            <SelectItem
                              key={item.NUM_CATEGORY_ID}
                              value={item.NUM_CATEGORY_ID.toString()}
                            >
                              {item.VAR_CATEGORY_NAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label className="text-[15px] font-semibold text-black text-nowrap">
                          Employee Id
                        </Label>
                        <span>:</span>
                      </div>

                      <Input
                        name="employeeId"
                        value={values.employeeId}
                        onChange={handleChange}
                        className="w-full h-9"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <Button
                      type="submit"
                      className="bg-blue-900 hover:bg-blue-800 text-white px-8"
                    >
                      Process
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="px-8"
                      path="/HomePage/FrmHomePage"
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

export default FrmPaySlip;
