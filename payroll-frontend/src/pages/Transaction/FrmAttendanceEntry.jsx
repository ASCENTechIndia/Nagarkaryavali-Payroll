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

  const columnStyles = {
    "Sr No.": { width: "80px" },
    "Emp ID": { width: "90px" },
    Name: { width: "330px" },
    Select: { width: "50px" },
    "Bio-Metric": { width: "120px" },
    Attendance: { width: "120px" },
    "Medical Leave": { width: "140px" },
    "Earned Leave": { width: "140px" },
    HP: { width: "120px" },
    LWP: { width: "120px" },
    Present: { width: "120px" },
    Remark: { width: "220px" },
  };

  const handleSearch = async () => {
    const data = [
      {
        srNo: 1,
        empId: 715,
        empName: "राजु बाळकृष्ण चव्हाण",
        checked: true,

        biometric: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        attendance: (
          <Input
            defaultValue="31"
            className="h-8 min-w-[80px]"
          />
        ),

        medicalLeave: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        earnedLeave: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        hp: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        lwp: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        present: (
          <Input
            defaultValue="31"
            className="h-8 min-w-[80px]"
          />
        ),

        remark: (
          <Input className="h-8 min-w-[180px]" />
        ),
      },

      {
        srNo: 2,
        empId: 2519,
        empName: "संदीप रामचंद्र कोळी",
        checked: true,

        biometric: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        attendance: (
          <Input
            defaultValue="31"
            className="h-8 min-w-[80px]"
          />
        ),

        medicalLeave: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        earnedLeave: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        hp: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        lwp: (
          <Input
            defaultValue="0"
            className="h-8 min-w-[80px]"
          />
        ),

        present: (
          <Input
            defaultValue="31"
            className="h-8 min-w-[80px]"
          />
        ),

        remark: (
          <Input className="h-8 min-w-[180px]" />
        ),
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
            <div>
              <Label required>Category</Label>

              <select className="w-full h-9 border border-gray-400 rounded-md px-3">
                <option>Regular</option>
              </select>
            </div>

            <div>
              <Label required>Zone</Label>

              <select className="w-full h-9 border border-gray-400 rounded-md px-3">
                <option>Head Office</option>
              </select>
            </div>

            <div>
              <Label required>Department</Label>

              <select className="w-full h-9 border border-gray-400 rounded-md px-3">
                <option>
                  महानगरपालिका अतिरिक्त आयुक्त कार्यालय-1
                </option>
              </select>
            </div>

            <div>
              <Label required>Year</Label>

              <select className="w-full h-9 border border-gray-400 rounded-md px-3">
                <option>2026</option>
              </select>
            </div>

            <div>
              <Label required>Month</Label>

              <select className="w-full h-9 border border-gray-400 rounded-md px-3">
                <option>January</option>
              </select>
            </div>

            <div>
              <Label>Employee ID</Label>

              <Input placeholder="Enter Employee Code" />
            </div>
          </div>

          {/* Buttons */}

          <div className="flex justify-center gap-3">
            <Button
              type="button"
              onClick={handleSearch}
            >
              Search
            </Button>

            <Button
              type="button"
              variant="outline"
            >
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
                  columnStyles={columnStyles}
                  pagination={false}
                  className="min-w-[1700px]"
                  onSelectAllChange={(checked) => {
                    setTableData((prev) =>
                      prev.map((row) => ({
                        ...row,
                        checked,
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
                <Button
                  type="button"
                  variant="default"
                >
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