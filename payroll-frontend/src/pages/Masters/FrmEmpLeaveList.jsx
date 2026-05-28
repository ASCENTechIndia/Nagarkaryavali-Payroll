"use client";

import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import ShadCNTable from "@/components/ui/table";

const initialData = [
  {
    srNo: 1,
    empId: 715,
    empName: "राजु बळकृष्ण चव्हाण",
    checked: false,
    earnedLeave: 18,
    medicalLeave: 16,
    halfPayLeave: 10,
    casualLeave: 10,
    total: 60,
  },
  {
    srNo: 2,
    empId: 2519,
    empName: "संदीप रामचंद्र कोळी",
    checked: false,
    earnedLeave: 0,
    medicalLeave: 0,
    halfPayLeave: 0,
    casualLeave: 0,
    total: 0,
  },
  {
    srNo: 3,
    empId: 2969,
    empName: "हुसेन अजीज कोरबु",
    checked: false,
    earnedLeave: 0,
    medicalLeave: 0,
    halfPayLeave: 0,
    casualLeave: 0,
    total: 0,
  },
];

const FrmEmpLeaveList = () => {
  const [tableData, setTableData] =
    useState(initialData);

  const [showTable, setShowTable] =
    useState(false);

  const handleSearch = () => {
    setShowTable(true);
  };

  const calculateTotal = (row) => {
    return (
      Number(row.earnedLeave || 0) +
      Number(row.medicalLeave || 0) +
      Number(row.halfPayLeave || 0) +
      Number(row.casualLeave || 0)
    );
  };

  const handleInputChange = (
    index,
    field,
    value
  ) => {
    const updatedData = [...tableData];

    updatedData[index][field] = value;

    updatedData[index].total =
      calculateTotal(updatedData[index]);

    setTableData(updatedData);
  };

  const headers = [
    "Sr No.",
    "Emp ID",
    "Name",
    "✓",
    "अर्जित रजा",
    "वैद्यकीय रजा",
    "अर्धपगारी वैद्यकीय रजा",
    "किरकोळ रजा",
    "Total",
  ];

  const keyMapping = {
    "Sr No.": "srNo",
    "Emp ID": "empId",
    Name: "empName",
    "✓": "checked",
    "अर्जित रजा": "earnedLeave",
    "वैद्यकीय रजा": "medicalLeave",
    "अर्धपगारी वैद्यकीय रजा":
      "halfPayLeave",
    "किरकोळ रजा": "casualLeave",
    Total: "total",
  };

  const formattedTableData = tableData.map(
    (row, index) => ({
      ...row,

      earnedLeave: (
        <Input
          type="number"
          value={row.earnedLeave}
          className="h-8 text-center"
          onChange={(e) =>
            handleInputChange(
              index,
              "earnedLeave",
              e.target.value
            )
          }
        />
      ),

      medicalLeave: (
        <Input
          type="number"
          value={row.medicalLeave}
          className="h-8 text-center"
          onChange={(e) =>
            handleInputChange(
              index,
              "medicalLeave",
              e.target.value
            )
          }
        />
      ),

      halfPayLeave: (
        <Input
          type="number"
          value={row.halfPayLeave}
          className="h-8 text-center"
          onChange={(e) =>
            handleInputChange(
              index,
              "halfPayLeave",
              e.target.value
            )
          }
        />
      ),

      casualLeave: (
        <Input
          type="number"
          value={row.casualLeave}
          className="h-8 text-center"
          onChange={(e) =>
            handleInputChange(
              index,
              "casualLeave",
              e.target.value
            )
          }
        />
      ),

      total: (
        <Input
          value={row.total}
          className="h-8 text-center"
          disabled
        />
      ),
    })
  );

  return (
    <Card className="mt-5">

      <CardHeader>
        <CardTitle>
          Leave Master
        </CardTitle>
      </CardHeader>

      <CardContent>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Department */}
          <div className="space-y-2">

            <Label
              text="Department Name"
              required
              className="min-w-[180px]"
            />

            <Select>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="-- Select Option --" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">
                  महापालिका अतिरिक्त आयुक्त कार्यालय - 1
                </SelectItem>
              </SelectContent>
            </Select>

          </div>

          {/* Employee Type */}
          <div className="space-y-2">

            <Label
              text="Employee Type"
              required
              className="min-w-[180px]"
            />

            <Select>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="-- Select Option --" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">
                  Regular
                </SelectItem>
              </SelectContent>
            </Select>

          </div>

          {/* Employee ID */}
          <div className="space-y-2">

            <Label text="Employee ID" />

            <Input placeholder="Enter Employee ID" />

          </div>

          {/* Employee Name */}
          <div className="space-y-2">

            <Label text="Employee Name" className="min-w-[180px]"/>

            <Input placeholder="Enter Employee Name" />

          </div>

        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mt-8">

          <Button onClick={handleSearch}>
            Search
          </Button>

          <Button variant="secondary">
            Close
          </Button>

        </div>

        {/* Editable Table */}
        {showTable && (
          <div className="mt-8">

            <ShadCNTable
              headers={headers}
              data={formattedTableData}
              keyMapping={keyMapping}
              pagination
              rowsPerPage={10}
            />

            {/* Submit */}
            <div className="flex justify-center mt-8">

              <Button>
                Submit
              </Button>

            </div>

          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default FrmEmpLeaveList;