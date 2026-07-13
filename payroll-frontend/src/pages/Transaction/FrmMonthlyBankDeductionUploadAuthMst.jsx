import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import ShadCNTable from "@/components/ui/table";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const FrmMonthlyBankDeductionAuthorization = () => {
  const { state } = useLocation();

  const mainId = state?.mainId;

  const { user } = useAuth();

  const token = user?.token;
  const ulbId = user?.ulbId;

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [tableData, setTableData] = useState([]);

  const [departmentList, setDepartmentList] = useState([]);
  const [yearList, setYearList] = useState([]);

  const [department, setDepartment] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const fetchMasters = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        ulbId,
      };

      const [departmentRes, yearRes] = await Promise.all([
        axios.post(
          `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/department-list`,
          payload,
          config,
        ),
        axios.get(
          `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/year-list`,
          config,
        ),
      ]);

      const departments = departmentRes.data?.data || [];

      setDepartmentList(departments);
      setYearList(yearRes.data?.data || []);

      if (departmentName) {
        const dept = departments.find((item) => item.LABEL === departmentName);

        if (dept) {
          setDepartment(String(dept.VALUE));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuthorizationDetails = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const { data } = await axios.post(
        `${BASE_URL}/api/FrmMonthlyBankDeductionUploadAuth/authdetails`,
        {
          mainId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const rows =
        data?.data?.map((item) => ({
          employeeCode: item.EMPLOYEE_CODE,
          employeeName: item.EMPLOYEE_NAME || "",
          department: item.DEPARTMENT,
          salaryMonth: item.SALARY_MONTH_YEAR,
          deductionHead: item.DEDUCTION_PAYHEAD,
          deductionAmount: item.DEDUCTION_AMOUNT,
          remarks: item.REMARKS || "",
          monthId: item.MONTH_NUM,
        })) || [];

      setTableData(rows);

      if (data?.data?.length > 0) {
        const first = data.data[0];

        setDepartmentName(first.DEPARTMENT || "");
        setMonth(String(first.MONTH_NUM));
        setYear(String(first.YEAR_NUM));
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        text:
          err.response?.data?.message ||
          "Failed to load authorization details.",
      });
    } finally {
      Swal.close();
    }
  };

  useEffect(() => {
    if (token && ulbId) {
      fetchMasters();
    }
  }, [token, ulbId]);

  useEffect(() => {
    if (mainId && token) {
      fetchAuthorizationDetails();
    }
  }, [mainId, token]);

  useEffect(() => {
    if (departmentList.length && departmentName) {
      const dept = departmentList.find((item) => item.LABEL === departmentName);

      if (dept) {
        setDepartment(String(dept.VALUE));
      }
    }
  }, [departmentList, departmentName]);

  const handleSubmit = async (mode) => {
    try {
      Swal.fire({
        title: "Please Wait...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const in_str =
        tableData
          .map(
            (row) =>
              `${row.employeeCode}$${row.employeeName || ""}$${row.department}$${row.salaryMonth}$${row.deductionHead}$${row.deductionAmount}$${row.remarks || ""}$`,
          )
          .join("#") + "#";

      const payload = {
        userId: user.userId,
        month: Number(month),
        year: Number(
          yearList.find((x) => String(x.LABEL) === String(year))?.VALUE || year,
        ),
        mode,
        id: mainId,
        in_str,
      };

      const { data } = await axios.post(
        `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Swal.close();

      if (data.success && data.errorCode === 9999) {
        Swal.fire({
          icon: "success",
          text: data.errorMsg,
        });
        return;
      }

      Swal.fire({
        icon: data.success ? "warning" : "error",
        text: data.errorMsg,
      });
    } catch (err) {
      Swal.close();

      Swal.fire({
        icon: "error",
        text:
          err.response?.data?.errorMsg ||
          err.response?.data?.message ||
          "Something went wrong.",
      });
    }
  };

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
            {/* Department */}

            <div>
              <Label text="Department" required />

              <Select value={department} disabled>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>

                <SelectContent>
                  {departmentList.map((item) => (
                    <SelectItem key={item.VALUE} value={String(item.VALUE)}>
                      {item.LABEL}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}

            <div>
              <Label text="Year" required />

              <Select value={year} disabled>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>

                <SelectContent>
                  {yearList.map((item) => (
                    <SelectItem key={item.VALUE} value={String(item.LABEL)}>
                      {item.LABEL}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month */}

            <div>
              <Label text="Month" required />

              <Select value={month} disabled>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>

                <SelectContent>
                  {months.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="button" onClick={() => handleSubmit(2)}>
              Authorize
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() => handleSubmit(1)}
            >
              Reject
            </Button>

            <Button
              type="button"
              variant="outline"
              path="/Transactions/FrmMonthlyBankDeductionUploadAuthList"
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmMonthlyBankDeductionAuthorization;
