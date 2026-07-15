import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShadCNTable from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";

const FrmLeaveApprovalList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [leaveList, setLeaveList] = useState([]);

  const headers = [
    "Employee Code",
    "Employee Name",
    "Department",
    "Leave Type",
    "Total Days Of Leave",
    "Leave Status",
    "Action",
  ];

  const keyMapping = {
    "Employee Code": "empCode",
    "Employee Name": "empName",
    Department: "department",
    "Leave Type": "leaveType",
    "Total Days Of Leave": "totalDays",
    "Leave Status": "leaveStatus",
    Action: "action",
  };

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/LeaveApproval/pendingleavelist`,
        { ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data?.data) {
        setLeaveList(response.data.data.data);
      } else {
        setLeaveList([]);
      }
    } catch (err) {
      console.error("Error fetching pending leaves:", err);
      Swal.fire({
        text: err.response?.data?.message || "Failed to load pending leave list",
        confirmButtonColor: "#1e3a8a",
      });
      setLeaveList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ulbId) {
      fetchPendingLeaves();
    }
  }, [ulbId]);

  const handleSelectLeave = (item) => {
    navigate("/Masters/FrmLeaveApprove", {
      state: {
        data: {
          leaveId: item.LEAVEID,
          empCode: item.EMPCODE,
        },
      },
    });
  };

  const formattedTableData = leaveList.map((item) => ({
    empCode: item.EMPCODE || "",
    empName: item.EMPNAME || "",
    department: item.DEPARTMENT || "",
    leaveType: item.LEAVENAME || item.LEAVETYPE || "",
    totalDays: item.TOTALDAYS || "",
    leaveStatus: item.LEAVESTATUS || "Pending",
    action: (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleSelectLeave(item)}
        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
      >
        Select
      </Button>
    ),
  }));

  return (
    <Card className="mt-5 shadow-sm border">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">
          Leave Approval List
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Loading pending leaves...</span>
          </div>
        ) : (
          <ShadCNTable
            headers={headers}
            data={formattedTableData}
            keyMapping={keyMapping}
            pagination
            rowsPerPage={10}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FrmLeaveApprovalList;