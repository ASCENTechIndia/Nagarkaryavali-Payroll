
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import ShadCNTable from "@/components/ui/table";


const FrmMonthlyBankDeductionAuthorizationList = () => {

  const { user } = useAuth();

const token = user?.token;
const BASE_URL = import.meta.env.VITE_BASE_URL;

const [tableData, setTableData] = useState([]);

const fetchAuthorizationList = async () => {
  try {
    Swal.fire({
      title: "Loading...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const res = await axios.get(
      `${BASE_URL}/api/FrmMonthlyBankDeductionUploadAuth/list`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const rows =
      res.data?.data?.map((item) => ({
        select: (
          <Button
            variant="outline"
            path="/Transactions/FrmMonthlyBankDeductionUploadAuthMst"
            state={{ mainId: item.MAINID }}
          >
            Select
          </Button>
        ),

        departmentName: item.DEPARTMENT,
        salaryDate: item.SALARYDATE,
        employeeCount: item.EMPLOYEECOUNT,
        deductionAmount: item.BANKDEDUCTIONAMOUNT,

        mainid: item.MAINID,
        deptnamee: item.DEPARTMENT,
        saldate: item.SALARYDATE,
        empcount: item.EMPLOYEECOUNT,
        bankdeductionamt: item.BANKDEDUCTIONAMOUNT,
      })) || [];

    setTableData(rows);
  } catch (err) {
    Swal.fire({
      icon: "error",
      text: "Failed to load list.",
    });
  } finally {
    Swal.close();
  }
};


useEffect(() => {
  if (token) {
    fetchAuthorizationList();
  }
}, [token]);

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