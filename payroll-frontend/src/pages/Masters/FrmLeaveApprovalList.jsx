import React from "react";

import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import ShadCNTable from "@/components/ui/table";

const FrmLeaveApprovalList = () => {
  const navigate = useNavigate();

  // ✅ Table Headers
  const headers = [
    "Employee Code",
    "Employee Name",
    "Department",
    "Leave Type",
    "Total Days Of Leave",
    "Leave Status",
    "Action",
  ];

  // ✅ Key Mapping
  const keyMapping = {
    "Employee Code": "empCode",
    "Employee Name": "empName",
    Department: "department",
    "Leave Type": "leaveType",
    "Total Days Of Leave": "totalDays",
    "Leave Status": "leaveStatus",
    Action: "action",
  };

  // ✅ Hardcoded Leave Data
  const leaveList = [
    {
      id: 1,
      empCode: "3126",
      empName: "प्रद्युम्न प्रसाद जोशी",
      department:
        "महानगरपालिका माहिती व तंत्रज्ञान विभाग",
      designation: "वरिष्ठ लिपिक",
      leaveType: "अर्जित रजा",
      fromDate: new Date("2026-04-06"),
      toDate: new Date("2026-04-06"),
      totalDays: "1",
      halfDay: false,
      reason: "Casual Leave",
      contact: "8055164143",
      leaveStatus: "Pending",
      remark: "",
    },

    {
      id: 2,
      empCode: "4102",
      empName: "संदीप पाटील",
      department: "लेखा विभाग",
      designation: "कनिष्ठ लिपिक",
      leaveType: "Casual Leave",
      fromDate: new Date("2026-05-10"),
      toDate: new Date("2026-05-12"),
      totalDays: "3",
      halfDay: true,
      reason: "Family Function",
      contact: "9876543210",
      leaveStatus: "Pending",
      remark: "",
    },
  ];

  // ✅ Table Data
  const formattedTableData = leaveList.map(
    (item) => ({
      empCode: item.empCode,

      empName: item.empName,

      department: item.department,

      leaveType: item.leaveType,

      totalDays: item.totalDays,

      leaveStatus: item.leaveStatus,

      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            localStorage.setItem(
              "selectedLeaveData",
              JSON.stringify(item)
            );

            navigate(
              "/Masters/FrmLeaveApprove"
            );
          }}
        >
          Select
        </Button>
      ),
    })
  );

  return (
    <Card className="mt-5 shadow-sm border">
     <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xl font-bold">
          Leave Approval List
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ShadCNTable
          headers={headers}
          data={formattedTableData}
          keyMapping={keyMapping}
          pagination
          rowsPerPage={10}
        />
      </CardContent>
    </Card>
  );
};

export default FrmLeaveApprovalList;