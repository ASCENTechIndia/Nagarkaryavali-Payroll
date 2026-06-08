import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShadCNTable from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FrmAttendanceEntry = () => {
  const [showTable, setShowTable] = useState(false);

  const [tableData, setTableData] = useState([]);

  const headers = [
    "Sr No.",
    "Emp ID",
    "Name",
    "Select",
    "Bio-Metric",
    "Attendance",
    "Medical Leave",
    "Earned Leave",
    "HP",
    "LWP",
    "Present",
    "Remark",
  ];

  const keyMapping = {
    "Sr No.": "srNo",
    "Emp ID": "empId",
    Name: "empName",
    Select: "checked",
    "Bio-Metric": "biometric",
    Attendance: "attendance",
    "Medical Leave": "medicalLeave",
    "Earned Leave": "earnedLeave",
    HP: "hp",
    LWP: "lwp",
    Present: "present",
    Remark: "remark",
  };

  const handleSearch = () => {
    const data = [
      {
        srNo: 1,
        empId: 715,
        empName: "राजु बाळकृष्ण चव्हाण",
        checked: true,

        biometric: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        attendance: (
          <Input
            type="number"
            defaultValue="31"
            className="h-8 min-w-[80px]"
          />
        ),

        medicalLeave: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        earnedLeave: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        hp: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        lwp: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        present: (
          <Input
            type="number"
            defaultValue="31"
            className="h-8 min-w-[80px]"
          />
        ),

        remark: <Input className="h-8 min-w-[180px]" />,
      },

      {
        srNo: 2,
        empId: 2519,
        empName: "संदीप रामचंद्र कोळी",
        checked: true,

        biometric: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        attendance: (
          <Input
            type="number"
            defaultValue="31"
            className="h-8 min-w-[80px]"
          />
        ),

        medicalLeave: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        earnedLeave: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        hp: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        lwp: (
          <Input
            type="number"
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        present: (
          <Input
            type="number"
            defaultValue="31"
            className="h-8 min-w-[80px]"
          />
        ),

        remark: <Input className="h-8 min-w-[180px]" />,
      },
    ];

    setTableData(data);
    setShowTable(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5"
    >
      <Card className="shadow-sm">
        {/* Header */}
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold">
            Attendance Entry
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label text="Category" required />
              <Select defaultValue="regular">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label text="Zone" required />
              <Select defaultValue="headoffice">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="headoffice">
                    Head Office
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label text="Department" required />
              <Select defaultValue="dept1">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dept1">
                    महानगरपालिका अतिरिक्त आयुक्त कार्यालय-1
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label text="Year" required />
              <Select defaultValue="2026">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label text="Month" required />
              <Select defaultValue="january">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="january">
                    January
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label text="Employee ID" />
              <Input placeholder="Enter Employee Code" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-3">
            <Button type="button" onClick={handleSearch}>
              Search
            </Button>

            <Button type="button" variant="outline">
              Close
            </Button>
          </div>

          {/* Table */}
          {showTable && (
            <>
              <div className="overflow-x-auto">
                <ShadCNTable
                  headers={headers}
                  data={tableData}
                  keyMapping={keyMapping}
                  pagination={false}
               
                  onSelectAllChange={(checked) => {
                    setTableData((prev) =>
                      prev.map((row) => ({
                        ...row,
                        checked: checked === true,
                      }))
                    );
                  }}
                  onRowCheckChange={(row, checked) => {
                    setTableData((prev) =>
                      prev.map((item) =>
                        item.empId === row.empId
                          ? {
                              ...item,
                              checked,
                            }
                          : item
                      )
                    );
                  }}
                />
              </div>

              <div className="flex justify-center pt-4">
                <Button type="button">
                  Submit
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmAttendanceEntry;