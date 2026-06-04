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

import ShadCNTable from "@/components/ui/table";

const FrmMonthlyBankDeductionAuthorization = () => {
  const [tableData] = useState([
    {
      employeeCode: 2084,
      employeeName: "",
      department: "महापालिका आयुक्त कार्यालय",
      salaryMonth: "December",
      deductionHead: "सोसायटी २",
      deductionAmount: 11416,
      remarks: "",
      monthId: 6,
    },
    {
      employeeCode: 3516,
      employeeName: "",
      department: "महापालिका आयुक्त कार्यालय",
      salaryMonth: "December",
      deductionHead: "सोसायटी २",
      deductionAmount: 20575,
      remarks: "",
      monthId: 6,
    },
  ]);

  const headers = [
    "EMPLOYEE_CODE",
    "EMPLOYEE_NAME",
    "DEPARTMENT",
    "SALARY_MONTH_YEAR",
    "DEDUCTION_PAYHEAD",
    "DEDUCTION_AMOUNT",
    "REMARKS",
    "MONTH_ID",
  ];

  const keyMapping = {
    EMPLOYEE_CODE: "employeeCode",
    EMPLOYEE_NAME: "employeeName",
    DEPARTMENT: "department",
    SALARY_MONTH_YEAR: "salaryMonth",
    DEDUCTION_PAYHEAD: "deductionHead",
    DEDUCTION_AMOUNT: "deductionAmount",
    REMARKS: "remarks",
    MONTH_ID: "monthId",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5"
    >
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold">
            Monthly Bank Deduction Authorization
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          {/* Filters */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div>
              <Label>
                <span className="text-red-500">*</span>
                Department
              </Label>

              <select className="w-full h-10 border rounded-md px-3">
                <option>
                  महापालिका आयुक्त कार्यालय
                </option>
              </select>
            </div>

            <div>
              <Label>
                <span className="text-red-500">*</span>
                Year
              </Label>

              <select className="w-full h-10 border rounded-md px-3">
                <option>-- Select Option --</option>
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>

            <div>
              <Label>
                <span className="text-red-500">*</span>
                Month
              </Label>

              <select className="w-full h-10 border rounded-md px-3">
                <option>December</option>
              </select>
            </div>
          </div>

          {/* Table */}

          <div className="overflow-x-auto">
            <ShadCNTable
              headers={headers}
              data={tableData}
              keyMapping={keyMapping}
              pagination={false}
              className="min-w-[1600px]"
            />
          </div>

          {/* Buttons */}

          <div className="flex justify-center gap-4">
            <Button >
              Authorize
            </Button>

            <Button variant="destructive">
              Reject
            </Button>

            <Button variant="outline" path="/Transactions/FrmMonthlyBankDeductionUpload">
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmMonthlyBankDeductionAuthorization;