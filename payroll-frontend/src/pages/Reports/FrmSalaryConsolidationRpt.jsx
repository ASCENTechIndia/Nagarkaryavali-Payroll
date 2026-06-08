import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const FrmSalaryConsolidationReport = () => {
  const [reportType, setReportType] = useState("department");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    
    >
      <Card >
        {/* Header */}
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold ">
            Salary Consolidation (पगार एकत्रीकरण) Report
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Salary Date */}
            <div className="space-y-2">
              <Label required>Salary Date</Label>

              <div className="flex gap-3">
                <Select defaultValue="6">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="2026">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label required>Department</Label>

              <Select defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">-- ALL --</SelectItem>
                  <SelectItem value="1">
                    Administration Department
                  </SelectItem>
                  <SelectItem value="2">
                    Health Department
                  </SelectItem>
                  <SelectItem value="3">
                    Water Department
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="reportType"
                    value="department"
                    checked={reportType === "department"}
                    onChange={(e) =>
                      setReportType(e.target.value)
                    }
              
                  />
                  <span>Department Wise</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="reportType"
                    value="employee"
                    checked={reportType === "employee"}
                    onChange={(e) =>
                      setReportType(e.target.value)
                    }
                
                  />
                  <span>Employee Wise</span>
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <Button
              type="button"
              
            >
              Print
            </Button>

            <Button
              type="button"
              variant="outline"
             
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmSalaryConsolidationReport;