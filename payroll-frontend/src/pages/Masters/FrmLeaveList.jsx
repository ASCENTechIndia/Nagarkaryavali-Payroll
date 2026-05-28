"use client";

import React from "react";

import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import ShadCNTable from "@/components/ui/table";

const FrmLeaveList = () => {
  const navigate = useNavigate();

  // ✅ Table Headers
  const headers = ["Action", "Leave Name"];

  // ✅ Key Mapping
  const keyMapping = {
    Action: "action",
    "Leave Name": "leaveName",
  };

  // ✅ Leave List
  const leaveList = [
    {
      id: 1,
      leaveName: "किरकोळ रजा",
    },

    {
      id: 2,
      leaveName: "अर्जित रजा",
    },

    {
      id: 3,
      leaveName: "वैद्यकीय रजा",
    },

    {
      id: 4,
      leaveName: "प्रसूती रजा",
    },

    {
      id: 5,
      leaveName: "गर्भपात रजा",
    },

    {
      id: 6,
      leaveName: "विशेष रजा",
    },

    {
      id: 7,
      leaveName: "पर्यायी रजा",
    },

    {
      id: 8,
      leaveName: "अध्ययन रजा",
    },
  ];

  // ✅ Table Data
  const tableData = leaveList.map((item) => ({
    leaveName: item.leaveName,

    action: (
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          navigate("/Masters/FrmLeaveMaster", {
            state: item,
          })
        }
      >
        Select
      </Button>
    ),
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Leave List</CardTitle>

          <Button path="/Masters/FrmLeaveMst">Add New</Button>
        </div>
      </CardHeader>

      <CardContent>
        <ShadCNTable
          headers={headers}
          data={tableData}
          keyMapping={keyMapping}
          pagination
          rowsPerPage={10}
        />
      </CardContent>
    </Card>
  );
};

export default FrmLeaveList;
