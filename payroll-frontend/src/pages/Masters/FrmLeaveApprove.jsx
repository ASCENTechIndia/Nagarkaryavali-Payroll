import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import Swal from "sweetalert2";
import { FrmLeaveApprovalValidationSchema } from "@/validations/global.validation";
import { DatePicker } from "@/components/ui/calendar";

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08 },
  },
};

const FrmLeaveApprove = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();
  const location = useLocation();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [leaveTypeList, setLeaveTypeList] = useState([]);

  const [formData, setFormData] = useState({
    leaveappid: null,
    empid: null,
    empName: "",
    empCode: "",
    department: "",
    designation: "",
    leaveType: "",
    leavetypeid: null,
    fromDate: null,
    toDate: null,
    totalDays: "",
    halfDay: false,
    reason: "",
    contact: "",
    leaveStatus: "",
    remark: "",
    balanceleave: null,
  });

  useEffect(() => {
    if (location.state?.data) {
      const { leaveId, empCode } = location.state.data;
      fetchLeaveDetails(leaveId, empCode);
      fetchDropdownData();
    }
  }, [location.state]);

  const fetchDropdownData = async () => {
    try {
      const deptRes = await axios.get(
        `${BASE_URL}/api/LeaveApplication/departmentlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (deptRes.data?.data?.data) {
        setDepartmentList(deptRes.data.data.data);
      }

      const desigRes = await axios.get(
        `${BASE_URL}/api/LeaveApplication/designationlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (desigRes.data?.data?.data) {
        setDesignationList(desigRes.data.data.data);
      }

      const leaveTypeRes = await axios.post(
        `${BASE_URL}/api/LeaveApproval/leavetypelist`,
        { ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (leaveTypeRes.data?.data?.data) {
        setLeaveTypeList(leaveTypeRes.data.data.data);
      }
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const fetchLeaveDetails = async (leaveId, empCode) => {
    try {
      setPageLoading(true);

      const response = await axios.post(
        `${BASE_URL}/api/LeaveApproval/leaveapprovaldetails`,
        { ulbId, leaveId, empCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data?.data?.length > 0) {
        const data = response.data.data.data[0];

        const fromDate = data.DATE_LEAVE_FROMDATE
          ? parseDate(data.DATE_LEAVE_FROMDATE)
          : null;
        const toDate = data.DATE_LEAVE_TODATE
          ? parseDate(data.DATE_LEAVE_TODATE)
          : null;

        setFormData({
          leaveappid: parseInt(data.NUM_LEAVE_ID),
          empid: parseInt(data.NUM_LEAVE_EMPID),
          empName: data.VAR_EMPLOYEE_ENGNAME || "",
          empCode: data.NUM_LEAVE_EMPID || "",
          department: data.NUM_EMPLOYEE_DEPTID || "",
          designation: data.NUM_EMPLOYEE_DESIGID || "",
          leaveType: data.VAR_LEAVE_TYPE || "",
          leavetypeid: parseInt(data.VAR_LEAVE_TYPE),
          fromDate: fromDate,
          toDate: toDate,
          totalDays: data.NUM_LEAVE_BALANCELEAVE || "",
          halfDay: data.VAR_LEAVE_ISHALFDAYLEAVE === "Y",
          reason: data.VAR_LEAVE_LEAVEREASON || "",
          contact: data.VAR_LEAVE_LEAVECONTACT || "",
          leaveStatus: data.VAR_LEAVE_LEAVESTATUS || "",
          remark: "",
          balanceleave: parseInt(data.NUM_LEAVE_BALANCELEAVE),
        });
      } else {
        Swal.fire({
          text: "Record Not Found",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          navigate("/Masters/FrmLeaveApprovalList");
        });
      }
    } catch (err) {
      console.error("Error fetching leave details:", err);
      Swal.fire({
        text: err.response?.data?.message || "Failed to load leave details",
        confirmButtonColor: "#1e3a8a",
      }).then(() => {
        navigate("/Masters/FrmLeaveApprovalList");
      });
    } finally {
      setPageLoading(false);
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
      }
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const validationResult = FrmLeaveApprovalValidationSchema.safeParse(formData);

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        Swal.fire({
          text: firstError.message,
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      setLoading(true);

      const payload = {
        userId: userId,
        leaveappid: formData.leaveappid,
        empid: formData.empid,
        leavetypeid: formData.leavetypeid,
        balanceleave: formData.balanceleave,
        frmdate: formData.fromDate,
        todate: formData.toDate,
        halfday: formData.halfDay ? "Y" : "N",
        reason: formData.reason,
        contact: formData.contact,
        leavestatus: formData.leaveStatus,
        remark: formData.remark,
        ulbid: parseInt(ulbId),
      };

      const response = await axios.post(
        `${BASE_URL}/api/LeaveApproval/save`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ok) {
        await Swal.fire({
          text: response.data.data?.message || "Leave application processed successfully",
          confirmButtonColor: "#1e3a8a",
        });
        navigate("/Masters/FrmLeaveApprovalList");
      } else {
        Swal.fire({
          text: response.data.message || "Failed to process leave application",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire({
        text: err.response?.data?.message || "Failed to process leave application",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/Masters/FrmLeaveApprovalList");
  };

  const getDepartmentDisplay = () => {
    const dept = departmentList.find(
      (d) => d.ID_VALUE === parseInt(formData.department)
    );
    return dept ? dept.DISPLAY_TEXT : formData.department || "";
  };

  const getDesignationDisplay = () => {
    const desig = designationList.find(
      (d) => d.ID_VALUE === parseInt(formData.designation)
    );
    return desig ? desig.DISPLAY_TEXT : formData.designation || "";
  };

  const getLeaveTypeDisplay = () => {
    const type = leaveTypeList.find(
      (t) => t.LEAVEID === parseInt(formData.leaveType)
    );
    return type ? type.LEAVENAME : formData.leaveType || "";
  };

  // if (pageLoading) {
  //   return (
  //     <div className="flex justify-center items-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  //       <span className="ml-3 text-gray-600 text-lg">
  //         Loading leave details...
  //       </span>
  //     </div>
  //   );
  // }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-3 sm:p-4 md:p-5 min-h-screen"
    >
      <Card className="shadow-sm border">
        <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="text-lg font-semibold">
            Leave Application Approval
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-center mb-6">
              Employee Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Employee Name" />
                  <span>:</span>
                </div>
                <Input
                  value={formData.empName}
                  readOnly
                  disabled
                  className="w-full! h-9 overflow-hidden"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Employee Code" />
                  <span>:</span>
                </div>
                <Input
                  value={formData.empCode}
                  readOnly
                  disabled
                  className="w-full! h-9 overflow-hidden"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Department" />
                  <span>:</span>
                </div>
                <Input
                  value={getDepartmentDisplay()}
                  readOnly
                  disabled
                  className="w-full! h-9 overflow-hidden"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Designation" />
                  <span>:</span>
                </div>
                <Input
                  value={getDesignationDisplay()}
                  readOnly
                  disabled
                  className="w-full! h-9 overflow-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-center mb-6">
              Leave Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Leave Type" />
                  <span>:</span>
                </div>
                <Input
                  value={getLeaveTypeDisplay()}
                  readOnly
                  disabled
                  className="w-full! h-9 overflow-hidden"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="From Date" />
                  <span>:</span>
                </div>
                <DatePicker
                  value={formData.fromDate}
                  onChange={(date) => handleFieldChange("fromDate", date)}
                  className="w-full"
                  disabled
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="To Date" />
                  <span>:</span>
                </div>
                <DatePicker
                  value={formData.toDate}
                  onChange={(date) => handleFieldChange("toDate", date)}
                  className="w-full"
                  disabled
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Total No. Days" />
                  <span>:</span>
                </div>
                <Input
                  value={formData.totalDays}
                  readOnly
                  disabled
                  className="w-full! h-9 overflow-hidden"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Half Day" />
                  <span>:</span>
                </div>
                <Input
                  type="checkbox"
                  checked={formData.halfDay}
                  onChange={(e) => handleFieldChange("halfDay", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Reason" />
                  <span>:</span>
                </div>
                <Input
                  value={formData.reason}
                  readOnly
                  disabled
                  className="w-full! h-9 overflow-hidden"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Contact" />
                  <span>:</span>
                </div>
                <Input
                  value={formData.contact}
                  readOnly
                  disabled
                  className="w-full! h-9 overflow-hidden"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Leave Status" />
                  <span>:</span>
                </div>
                <Select
                  value={formData.leaveStatus}
                  onValueChange={(value) =>
                    handleFieldChange("leaveStatus", value)
                  }
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="-- Select Option --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Approve</SelectItem>
                    <SelectItem value="R">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Remark" />
                  <span>:</span>
                </div>
                <Input
                  value={formData.remark}
                  onChange={(e) => handleFieldChange("remark", e.target.value)}
                  placeholder="Enter Remark"
                  className="w-full! h-9"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-800 hover:bg-blue-900 px-8"
              >
                {loading ? "Processing..." : "Submit"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 px-8"
              >
                Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmLeaveApprove;