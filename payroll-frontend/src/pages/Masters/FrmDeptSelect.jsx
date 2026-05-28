"use client";

import React, {
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import ShadCNTable from "@/components/ui/table";

const departmentList = [
  {
    deptId: 412,
    deptName:
      "महापालिका अतिरिक्त आयुक्त कार्यालय - 1",
  },

  {
    deptId: 619,
    deptName:
      "ब - महापालिका विभाग (क्षेत्रीय) कार्यालय - 2",
  },

  {
    deptId: 438,
    deptName:
      "महापालिका शिक्षण, क्रीडा व सांस्कृतिक कार्य विभाग",
  },

  {
    deptId: 439,
    deptName:
      "महापालिका सामान्य प्रशासन विभाग (मुख्यालय)",
  },

  {
    deptId: 440,
    deptName: "महापालिका सुरक्षा विभाग",
  },
];

const FrmDeptList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  // ✅ Search Filter
  const filteredData = useMemo(() => {
    return departmentList.filter(
      (item) =>
        item.deptName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        String(item.deptId).includes(search)
    );
  }, [search]);

  // ✅ Table Headers
  const headers = [
    "Action",
    "Department ID",
    "Department Name",
  ];

  // ✅ Key Mapping
  const keyMapping = {
    Action: "action",
    "Department ID": "deptId",
    "Department Name": "deptName",
  };

  // ✅ Table Data
  const tableData = filteredData.map((item) => ({
    deptId: item.deptId,

    deptName: item.deptName,

    action: (
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          navigate(
            "/Masters/FrmDeptMaster",
            {
              state: item,
            }
          )
        }
      >
        Select
      </Button>
    ),
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">
          Select Department
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label
              text="Department List"
              required
              className="min-w-[180px]"
            />

            <Input
              placeholder="Search here..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="h-10"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <Button path="/Masters/FrmDeptMaster">
            Add New
          </Button>

          <Button variant="secondary">
            Close
          </Button>
        </div>

        {/* Table */}
        <div className="mt-2">
          <ShadCNTable
            headers={headers}
            data={tableData}
            keyMapping={keyMapping}
            pagination
            rowsPerPage={5}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FrmDeptList;