import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import ShadCNTable from "@/components/ui/table";

const FrmOtherEarningList = () => {
  const navigate = useNavigate();

  const [tableData] = useState([
    {
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigate("/Transactions/FrmOtherEarningMst", {
              state: {
                mode: 2,
                id: 5,
              },
            })
          }
        >
          Select
        </Button>
      ),
      id: 5,
      empName: "आकाराम चंदर घाडगे",
      payHead: "Prize Money",
      department: "महापालिका सुरक्षा विभाग",
      designation: "चौकीदार (वॉचमन)",
      amount: 1500,
      date: "14/05/2025",
      remark: "TEST",
    },
  ]);

  const headers = [
    "Action",
    "Id",
    "Employee Name",
    "Pay Head Name",
    "Department",
    "Designation",
    "Amount",
    "Date",
    "Remark",
  ];

  const keyMapping = {
    Action: "action",
    Id: "id",
    "Employee Name": "empName",
    "Pay Head Name": "payHead",
    Department: "department",
    Designation: "designation",
    Amount: "amount",
    Date: "date",
    Remark: "remark",
  };

  const columnStyles = {
    Action: { width: "120px" },
    Id: { width: "70px" },
    "Employee Name": { width: "250px" },
    "Pay Head Name": { width: "180px" },
    Department: { width: "450px" },
    Designation: { width: "220px" },
    Amount: { width: "120px" },
    Date: { width: "180px" },
    Remark: { width: "180px" },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5"
    >
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Other Earning Entry
            </CardTitle>

            <Button path="/Transactions/FrmOtherEarningEnrty">Add New</Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <ShadCNTable
            headers={headers}
            data={tableData}
            keyMapping={keyMapping}
            columnStyles={columnStyles}
            pagination={true}
            rowsPerPage={10}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmOtherEarningList;
