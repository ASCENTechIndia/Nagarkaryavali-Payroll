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
  employeeId: "",
  employeeName: "",
  department: "",
  designation: "",
  transferType: "",
  payBand: "",
  orderDate: new Date(),
  orderNumber: "",
  joiningDate: new Date(),
  status: "approve",
};

const FrmEmpTransferApproval = () => {
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
  const [designationOptions, setDesignationOptions] = useState([]);
  const [transferTypeOptions, setTransferTypeOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [formInitialValues, setFormInitialValues] = useState(initialValues);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmDeptListMst/department-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDepartmentOptions(res.data?.rows || []);
    } catch (error) {
      console.error("Department API Error:", error);
      setDepartmentOptions([]);
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmDesgListMst/designation-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDesignationOptions(res.data?.rows || []);
    } catch (error) {
      console.error("Designation API Error:", error);
      setDesignationOptions([]);
    }
  };

  const fetchTransferTypes = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmpTransferApproval/transfer-types`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTransferTypeOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Transfer Type API Error:", error);
      setTransferTypeOptions([]);
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmEmployeeMstNewTest/grade-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setGradeOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Grade API Error:", error);
      setGradeOptions([]);
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
        fetchDepartments(),
        fetchDesignations(),
        fetchTransferTypes(),
        fetchGrades(),
      ]);

      if (mode === 2 && empId && empTransId) {
        await fetchTransferDetails();
      }
    } catch (error) {
      console.error(error);
    } finally {
      Swal.close();
    }
  };

  loadData();
}, [token, mode, empId, empTransId]);

  const fetchTransferDetails = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmpTransferApproval/transfer-details`,
        {
          ulbid: ulbId,
          empId: empTransId,
          empTransId: empId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = res.data?.data?.data;

      console.log("data.....", data);

      if (data) {
        setFormInitialValues({
          employeeId: data.EMPID?.toString() || "",
          employeeName: data.EMPNAME || "",
          department: data.NUM_EMPTRANS_NEWDEPTID?.toString() || "",
          designation: data.NUM_EMPTRANS_NEWDESIGID?.toString() || "",
          transferType: data.NUM_EMPTRANS_TRANSFTYPEID?.toString() || "",
          payBand: data.NUM_EMPTRANS_NEWPAYBANDID?.toString() || "",
          orderDate: data.DAT_EMPTRANS_ORDERDATE
            ? new Date(data.DAT_EMPTRANS_ORDERDATE)
            : new Date(),
          orderNumber: data.VAR_EMPTRANS_ORDERNUMBER || "",
          joiningDate: data.SLIPNO ? new Date(data.SLIPNO) : new Date(),
          status: "approve",
        });
      }
    } catch (error) {
      console.error("Transfer Details Error:", error);

      Swal.fire({
        text: "Failed to fetch transfer details.",
      });
    } finally {
      Swal.close();
    }
  };

 const formatDate = (date) => {
  if (!date) return null;

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const handleSubmit = async (values) => {
  try {
    Swal.fire({
      title: "Saving...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const payload = {
      userId: userId,
      empId: empId,
      empNumber: empId,
      deptId: Number(values.department),          
      desigId: Number(values.designation),        
      payBand: Number(values.payBand),           
      dateOfJoin: formatDate(values.joiningDate),
      periodWithDept: values.periodWithDept || "0",
      newDeptId: 0,
      newDesigId: 0,
      transferTypeId: Number(values.transferType),
      newPayBandId: 0,
      orderDate: formatDate(values.orderDate),
      orderNumber: values.orderNumber,
      ulbid: Number(ulbId),
      empTransId: mode === 2 ? Number(empTransId) : 0,
      mode: mode === 2 ? 3 : 1,
      status: values.status === "approve" ? "A" : "R",
    };

    console.log("Payload :", payload);

    const res = await axios.post(
      `${BASE_URL}/api/FrmEmpTransferApproval/save-transfer`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data?.ok && res.data?.data?.success) {
      Swal.fire({
        text: res.data.message,
        confirmButtonColor: "#1e3a8a",
      }).then(() => {
        navigate("/Transactions/FrmEmpTransferApprList");
      });
    } else {
      Swal.fire({

        text: res.data?.message || "Failed to save.",
      });
    }
  } catch (error) {
    console.error(error);

    Swal.fire({
      text: "Failed to save employee transfer.",
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
                    Employee Transfer Approval
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Employee ID */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                
                          text="Employee ID"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Input
                        name="employeeId"
                        value={values.employeeId}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </div>

                    {/* Employee Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                    className="text-nowrap"
                          text="Employee Name"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Input
                        name="employeeName"
                        value={values.employeeName}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </div>

                    {/* New Department */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                    className="text-nowrap"
                          text="New Department"
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
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>

                        <SelectContent>
                          {departmentOptions.map((item) => (
                            <SelectItem
                              key={item.DEPTID}
                              value={item.DEPTID.toString()}
                            >
                              {item.DEPTNAMEE}
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
                          text="New Designation"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.designation}
                        onValueChange={(value) =>
                          setFieldValue("designation", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="Select Designation" />
                        </SelectTrigger>

                        <SelectContent>
                          {designationOptions.map((item) => (
                            <SelectItem
                              key={item.DESGID}
                              value={item.DESGID.toString()}
                            >
                              {item.DESGNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transfer Type */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                    
                          text="Transfer Type"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.transferType}
                        onValueChange={(value) =>
                          setFieldValue("transferType", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="Select Transfer Type" />
                        </SelectTrigger>

                        <SelectContent>
                          {transferTypeOptions.map((item) => (
                            <SelectItem
                              key={item.NUM_TRANSFERTYPE_TRANSID}
                              value={item.NUM_TRANSFERTYPE_TRANSID.toString()}
                            >
                              {item.VAR_TRANSFERTYPE_TRANSFERNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pay Band */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                
                          text="Pay Band"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.payBand}
                        onValueChange={(value) =>
                          setFieldValue("payBand", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="Select Pay Band" />
                        </SelectTrigger>

                        <SelectContent>
                          {gradeOptions.map((item) => (
                            <SelectItem
                              key={item.NUM_GRADEMST_GRADEID}
                              value={item.NUM_GRADEMST_GRADEID.toString()}
                            >
                              {item.VAR_GRADEMST_GRADENAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Order Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                
                          text="Order Date"
                          required
                        />
                        <span>:</span>
                      </div>

                      <DatePicker
                        value={values.orderDate}
                        onChange={(date) => setFieldValue("orderDate", date)}
                        className="w-full"
                      />
                    </div>

                    {/* Order Number */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                    
                          text="Order Number"
                          required
                        />
                        <span>:</span>
                      </div>

                      <Input
                        name="orderNumber"
                        value={values.orderNumber}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </div>

                    {/* Date Of Joining */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                    className="text-nowrap"
                          text="Date Of Joining"
                          required
                        />
                        <span>:</span>
                      </div>

                      <DatePicker
                        value={values.joiningDate}
                        onChange={(date) => setFieldValue("joiningDate", date)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="pt-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                
                          text="Status"
                          required
                        />
                        <span>:</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <Label className="flex items-center gap-2 cursor-pointer">
                          <Input
                            type="radio"
                            name="status"
                            value="approve"
                            checked={values.status === "approve"}
                            onChange={handleChange}
                            className="w-9 h-4"
                          />
                          Approve
                        </Label>

                        <Label className="flex items-center gap-2 cursor-pointer">
                          <Input
                            type="radio"
                            name="status"
                            value="reject"
                            checked={values.status === "reject"}
                            onChange={handleChange}
                            className="w-9 h-4"
                          />
                          Reject
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-center gap-4 pt-8">
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                    >
                      Save
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="px-8"
                      path="/Transactions/FrmEmpTransferApprList"
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

export default FrmEmpTransferApproval;
