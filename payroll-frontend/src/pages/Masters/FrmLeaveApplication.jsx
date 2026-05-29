import React, { useEffect, useState } from "react";

import axios from "axios";

import Swal from "sweetalert2";

import { Formik, Form } from "formik";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/context/AuthContext";
import { DatePicker } from "@/components/ui/calendar";

const FrmLeaveApplication = () => {
  const { token, user } = useAuth();

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const ulbId = user?.ulbId;

  const userId = user?.userId;

  const [showDetails, setShowDetails] = useState(false);

  const [employeeList, setEmployeeList] = useState([]);

  const [departmentList, setDepartmentList] = useState([]);

  const [designationList, setDesignationList] = useState([]);

  const [leaveList, setLeaveList] = useState([]);
  const [visibleEmployees, setVisibleEmployees] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState([]);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const today = new Date().toISOString().split("T")[0];

  const initialValues = {
    employee: "",
    department: "",
    designation: "",
    departmentId: "",
    designationId: "",
    leaveId: "",
    leaveType: "",
    allottedLeaves: "",
    balancedLeaves: "",
    fromDate: today,
    toDate: today,
    totalDays: 1,
    reason: "",
    contact: "",
    halfDay: false,
  };

  /* -------------------------------------------------------------------------- */
  /*                                 PAGE LOAD                                  */
  /* -------------------------------------------------------------------------- */
  const showLoader = (title = "Please Wait...") => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const hideLoader = () => {
    Swal.close();
  };
  useEffect(() => {
    if (!token || !ulbId) return;

    const loadMasterData = async () => {
      try {
        showLoader("Loading...");

        const [employeeRes, departmentRes, designationRes, leaveRes] =
          await Promise.all([
            axios.post(
              `${baseUrl}/api/LeaveApplication/employeelist`,
              { ulbId },
              axiosConfig,
            ),
            axios.get(
              `${baseUrl}/api/LeaveApplication/departmentlist`,
              axiosConfig,
            ),
            axios.get(
              `${baseUrl}/api/LeaveApplication/designationlist`,
              axiosConfig,
            ),
            axios.post(
              `${baseUrl}/api/LeaveApplication/leavelist`,
              { ulbId },
              axiosConfig,
            ),
          ]);

        const employees = employeeRes?.data?.data?.data || [];

        setEmployeeList(employees);

        // initially load only first 50
        setVisibleEmployees(employees.slice(0, 50));
        setDepartmentList(departmentRes?.data?.data?.data || []);
        setDesignationList(designationRes?.data?.data?.data || []);
        setLeaveList(leaveRes?.data?.data?.data || []);
      } catch (error) {
        console.log("Master API Error", error);
      } finally {
        hideLoader();
      }
    };

    loadMasterData();
  }, [token, ulbId]);

  /* -------------------------------------------------------------------------- */
  /*                            EMPLOYEE DETAILS API                            */
  /* -------------------------------------------------------------------------- */

  const getEmployeeDetails = async (employeeId, setFieldValue) => {
    try {
      showLoader("Loading Employee Details...");

      const response = await axios.post(
        `${baseUrl}/api/LeaveApplication/employeedetails`,
        {
          ulbId,
          employeeId: Number(employeeId),
        },
        axiosConfig,
      );

      const employeeData = response?.data?.data?.data?.[0];

      if (!employeeData) {
        hideLoader();

        Swal.fire({
          icon: "error",
          title: "Employee Details Not Found",
        });

        return;
      }

      const selectedDepartment = departmentList.find(
        (item) => String(item.ID_VALUE) === String(employeeData.DEPTID),
      );

      const selectedDesignation = designationList.find(
        (item) => String(item.ID_VALUE) === String(employeeData.DESIGID),
      );

      setFieldValue("department", selectedDepartment?.DISPLAY_TEXT || "");

      setFieldValue("designation", selectedDesignation?.DISPLAY_TEXT || "");

      setFieldValue("departmentId", employeeData?.DEPTID || "");

      setFieldValue("designationId", employeeData?.DESIGID || "");

      setShowDetails(true);
    } catch (error) {
      console.log("Employee Details Error", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load employee details",
      });
    } finally {
      hideLoader();
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                          EMPLOYEE LEAVE BALANCE                            */
  /* -------------------------------------------------------------------------- */

  const getEmployeeLeaveBalance = async (
    employeeId,
    leaveId,
    setFieldValue,
  ) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/LeaveApplication/employeeleavebalance`,
        {
          ulbId,
          employeeId: Number(employeeId),
          leaveTypeId: leaveId,
        },
        axiosConfig,
      );

      const balanceData = response?.data?.data?.data?.[0];

      setFieldValue("balancedLeaves", balanceData?.BALANCE_LEAVE || 0);

      setFieldValue("allottedLeaves", balanceData?.TOTAL_LEAVE || 0);
    } catch (error) {
      console.log("Leave Balance Error", error);
    }
  };

  const getEmployeeLeaveSummary = async (employeeId) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/LeaveApplication/employeeleavesummary`,
        {
          ulbId,
          employeeId: Number(employeeId),
        },
        axiosConfig,
      );

      setLeaveSummary(response?.data?.data?.data || []);
    } catch (error) {
      console.log("Leave Summary Error", error);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             CALCULATE TOTAL DAYS                           */
  /* -------------------------------------------------------------------------- */

  const calculateDays = (fromDate, toDate, setFieldValue) => {
    if (!fromDate || !toDate) return;

    const from = new Date(fromDate);

    const to = new Date(toDate);

    const diff = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    setFieldValue("totalDays", diff > 0 ? diff : 0);
  };

  /* -------------------------------------------------------------------------- */
  /*                                  SAVE API                                  */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (values, resetForm) => {
    try {
      const payload = {
        userId,
        leaveId: values.leaveId,
        empId: values.employee,
        leaveType: values.leaveType,
        balanceLeave: values.balancedLeaves,
        isHalfDayLeave: values.halfDay ? "Y" : "N",
        fromDate: values.fromDate,
        toDate: values.toDate,
        leaveReason: values.reason,
        leaveContact: values.contact,
        leaveStatus: "P",
        approveRemark: "",
        ulbId,
        mode: 1,
      };

      const response = await axios.post(
        `${baseUrl}/api/LeaveApplication/saveemployeeleave`,
        payload,
        axiosConfig,
      );

      if (response?.data?.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response?.data?.message,
        });

        resetForm();

        setShowDetails(false);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
    >
      {({ values, handleChange, setFieldValue }) => (
        <Form>
          <Card>
           <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Leave Application
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Search Section */}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                {/* Employee Dropdown */}

                <div className="space-y-2">
                  <Label
                    text="Employee Name"
                    className="min-w-[180px]"
                    required
                  />

                  <Select
                    value={values.employee}
                    disabled={showDetails}
                    onValueChange={(value) => setFieldValue("employee", value)}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>

                    <SelectContent
                      className="max-h-72 overflow-y-auto"
                      onScroll={(e) => {
                        const target = e.target;

                        if (
                          target.scrollTop + target.clientHeight >=
                          target.scrollHeight - 20
                        ) {
                          if (visibleEmployees.length < employeeList.length) {
                            setVisibleEmployees((prev) => [
                              ...prev,
                              ...employeeList.slice(
                                prev.length,
                                prev.length + 50,
                              ),
                            ]);
                          }
                        }
                      }}
                    >
                      {visibleEmployees?.length > 0 ? (
                        visibleEmployees.map((item) => (
                          <SelectItem
                            key={item.NUM_EMPLOYEE_EMPID}
                            value={String(item.NUM_EMPLOYEE_EMPID)}
                          >
                            {item.EMPNAME}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-3 text-sm">No Employees Found</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}

                <div>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!values.employee) {
                        Swal.fire({
                          icon: "warning",
                          title: "Please Select Employee",
                        });

                        return;
                      }

                      await getEmployeeDetails(values.employee, setFieldValue);

                      await getEmployeeLeaveSummary(values.employee);
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* After Search */}

              {showDetails && (
                <div className="border rounded-md p-6 space-y-6">
                  {/* Department + Designation */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Department */}

                    <div className="space-y-2">
                      <Label
                        text="Department"
                        className="min-w-[180px]"
                        required
                      />

                      <Select
                        value={String(values.departmentId || "")}
                        disabled
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>

                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {departmentList?.map((item) => (
                            <SelectItem
                              key={item.ID_VALUE}
                              value={String(item.ID_VALUE)}
                            >
                              {item.DISPLAY_TEXT}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label text="Designation" required />

                      <Select
                        value={String(values.designationId || "")}
                        disabled
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Designation" />
                        </SelectTrigger>

                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {designationList?.map((item) => (
                            <SelectItem
                              key={item.ID_VALUE}
                              value={String(item.ID_VALUE)}
                            >
                              {item.DISPLAY_TEXT}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Leave Details */}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Leave Type */}

                    <div className="space-y-2">
                      <Label
                        text="Leave Type"
                        className="min-w-[180px]"
                        required
                      />

                      <Select
                        value={String(values.leaveId || "")}
                        onValueChange={async (value) => {
                          const selectedLeave = leaveList.find(
                            (item) => String(item.LEAVEID) === String(value),
                          );

                          setFieldValue(
                            "leaveId",
                            selectedLeave?.LEAVEID || "",
                          );

                          setFieldValue(
                            "leaveType",
                            selectedLeave?.LEAVE_NAME || "",
                          );

                          const leaveData = leaveSummary.find(
                            (item) => String(item.LEAVEID) === String(value),
                          );

                          setFieldValue(
                            "allottedLeaves",
                            leaveData?.ALLOTTED_LEAVE || 0,
                          );

                          setFieldValue(
                            "balancedLeaves",
                            leaveData?.BALANCE_LEAVE || 0,
                          );
                        }}
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select Leave Type" />
                        </SelectTrigger>

                        <SelectContent className="max-h-72 overflow-y-auto">
                          {leaveList?.map((item) => (
                            <SelectItem
                              key={item.LEAVEID}
                              value={String(item.LEAVEID)}
                            >
                              {item.LEAVE_NAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Allotted */}

                    <div className="space-y-2">
                      <Label
                        text="Allotted Leaves"
                        required
                        className="min-w-[180px]"
                      />
                      <Input value={values.allottedLeaves} readOnly />
                    </div>

                    {/* Balance */}

                    <div className="space-y-2">
                      <Label text="Balanced Leaves" className="min-w-[180px]" />

                      <Input value={values.balancedLeaves} readOnly />
                    </div>

                    {/* From Date */}

                    <div className="space-y-2">
                      <Label text="From Date" required />

                      <DatePicker
                        value={
                          values.fromDate
                            ? new Date(values.fromDate)
                            : undefined
                        }
                        onChange={(date) => {
                          if (!date) return;

                          const formatted = date.toISOString().split("T")[0];

                          setFieldValue("fromDate", formatted);

                          calculateDays(
                            formatted,
                            values.toDate,
                            setFieldValue,
                          );
                        }}
                      />
                    </div>

                    {/* To Date */}

                    <div className="space-y-2">
                      <Label text="To Date" required />
                      <DatePicker
                        value={
                          values.toDate ? new Date(values.toDate) : undefined
                        }
                        onChange={(date) => {
                          if (!date) return;

                          const formatted = date.toISOString().split("T")[0];

                          setFieldValue("toDate", formatted);

                          calculateDays(
                            values.fromDate,
                            formatted,
                            setFieldValue,
                          );
                        }}
                      />
                    </div>

                    {/* Total Days */}

                    <div className="space-y-2">
                      <Label text="Total No. Days" />

                      <Input value={values.totalDays} readOnly />
                    </div>

                    {/* Half Day */}

                    <div className="space-y-2">
                      <Label text="Half Day" />

                      <div className="flex items-center gap-3 h-10">
                        <Input
                          id="halfDay"
                          type="checkbox"
                          checked={values.halfDay}
                          onChange={(e) =>
                            setFieldValue("halfDay", e.target.checked)
                          }
                        />

                        <Label htmlFor="halfDay">Half Day Leave</Label>
                      </div>
                    </div>

                    {/* Contact */}

                    <div className="space-y-2">
                      <Label text="Contact" />

                      <Input
                        name="contact"
                        value={values.contact}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Reason */}

                  <div className="space-y-2">
                    <Label text="Reason" />

                    <Textarea
                      name="reason"
                      value={values.reason}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Buttons */}

                  <div className="flex justify-center gap-4 pt-4">
                    <Button type="submit">Submit</Button>

                    <Button type="button" variant="secondary">
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmLeaveApplication;
