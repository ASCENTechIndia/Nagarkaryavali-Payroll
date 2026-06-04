import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import ShadCNTable from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

const FrmMonthlyBankDeductionAuthorizationList = () => {
  const navigate = useNavigate();

  const tableHeaders = [
    "Select",
    "Department Name",
    "Salary Date",
    "Employee Count",
    "Deduction Amount",
    "MAINID",
    "DEPTNAMEE",
    "SALDATE",
    "EMPCOUNT",
    "BANKDEDUCTIONAMT",
  ];

  const keyMapping = {
    Select: "select",
    "Department Name": "departmentName",
    "Salary Date": "salaryDate",
    "Employee Count": "employeeCount",
    "Deduction Amount": "deductionAmount",
    MAINID: "mainid",
    DEPTNAMEE: "deptnamee",
    SALDATE: "saldate",
    EMPCOUNT: "empcount",
    BANKDEDUCTIONAMT: "bankdeductionamt",
  };

  const tableData = [
    {
      select: (
        <Button
          variant="outline"
          path="/Transactions/FrmMonthlyBankDeductionUploadAuthMst"
        >
          Select
        </Button>
      ),
      departmentName: "महापालिका आयुक्त कार्यालय",
      salaryDate: "31/12/2025",
      employeeCount: 3,
      deductionAmount: 53010,
      mainid: 350,
      deptnamee: "महापालिका आयुक्त कार्यालय",
      saldate: "31/12/2025",
      empcount: 3,
      bankdeductionamt: 53010,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5"
    >
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold">
            Monthly Bank Deduction Authorization List
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <ShadCNTable
            headers={tableHeaders}
            data={tableData}
            keyMapping={keyMapping}
            pagination={false}
            className="min-w-[1600px]"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmMonthlyBankDeductionAuthorizationList;