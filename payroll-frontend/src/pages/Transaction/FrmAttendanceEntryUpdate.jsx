import React, { useState } from "react";
import { motion } from "framer-motion";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import ShadCNTable from "@/components/ui/table";

const FrmAttendanceEntry = () => {
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const headers = [
    "Emp ID",
    "Employee Name",
    "Present Days",
    "Absent Days",
    "OT Hours",
  ];

  const keyMapping = {
    "Emp ID": "empId",
    "Employee Name": "empName",
    "Present Days": "presentDays",
    "Absent Days": "absentDays",
    "OT Hours": "otHours",
  };

  const handleSearch = () => {
    // API Call Here

    setTableData([
      {
        empId: "1001",
        empName: "Ramesh Patil",
        presentDays: 25,
        absentDays: 1,
        otHours: 12,
      },
      {
        empId: "1002",
        empName: "Suresh Jadhav",
        presentDays: 24,
        absentDays: 2,
        otHours: 8,
      },
    ]);

    setShowTable(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5"
    >
      <Card className="shadow-lg border">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold">Attendance Entry</CardTitle>
        </CardHeader>

        <CardContent className="pt-8 space-y-8">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <Label text="Category" required />

              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zone */}
            <div className="space-y-2">
              <Label text="Zone" required />

              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ho">Head Office</SelectItem>
                  <SelectItem value="miraj">Miraj</SelectItem>
                  <SelectItem value="kupwad">Kupwad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label text="Department" required />

              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">Department 1</SelectItem>
                  <SelectItem value="2">Department 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label required>Year</Label>
              <Label text="Year" required />

              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div className="space-y-2">
              <Label text="Month" required />
              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="12">December</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employee Code */}
            <div className="space-y-2">
              <Label text="Employee ID" />

              <Input placeholder="Enter Employee Code" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
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
              {tableData.length > 0 ? (
                <>
                  <ShadCNTable
                    headers={headers}
                    data={tableData}
                    keyMapping={keyMapping}
                    pagination
                    rowsPerPage={10}
                  />

                  <div className="flex justify-center mt-4">
                    <div className="flex justify-center">
                      <Button type="button">Submit</Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="border border-slate-300 p-3 text-sm bg-white">
                  No Records Found
                </div>
              )}
            </>
          )}

          {/* Submit */}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmAttendanceEntry;
