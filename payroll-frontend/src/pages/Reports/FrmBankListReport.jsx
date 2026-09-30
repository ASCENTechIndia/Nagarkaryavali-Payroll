import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const monthNames = [
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

const FrmBankListReport = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(currentDate.getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(
    String(currentDate.getFullYear())
  );
  const [departmentId, setDepartmentId] = useState("-1");
  const [bankId, setBankId] = useState("-1");

  const [departments, setDepartments] = useState([]);
  const [banks, setBanks] = useState([]);
  const [yearList, setYearList] = useState([]);

  useEffect(() => {
    if (token && ulbId) {
      fetchMasters();
    }
  }, [token, ulbId]);

  const fetchMasters = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { ulbid: Number(ulbId) };

      const [departmentRes, bankRes, yearRes] = await Promise.allSettled([
        axios.post(
          `${BASE_URL}/api/FrmBankListReport/department-list`,
          payload,
          config
        ),
        axios.post(
          `${BASE_URL}/api/FrmBankListReport/bank-list`,
          payload,
          config
        ),
        axios.post(`${BASE_URL}/api/FrmPayrollReport/year-list`, {}, config),
      ]);

      if (departmentRes.status === "fulfilled") {
        const data =
          departmentRes.value?.data?.data?.data ||
          departmentRes.value?.data?.data?.rows ||
          [];
        setDepartments(data);
      }

      if (bankRes.status === "fulfilled") {
        const data =
          bankRes.value?.data?.data?.data ||
          bankRes.value?.data?.data ||
          bankRes.value?.data?.data?.rows ||
          [];
        setBanks(data);
      }

      if (yearRes.status === "fulfilled") {
        const data = yearRes.value?.data?.data?.data || [];
        setYearList(data);
      }

      Swal.close();
    } catch (err) {
      Swal.close();
      Swal.fire({
        text: err.response?.data?.message || "Failed to load master data.",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const handlePrint = async () => {
    if (!selectedMonth) {
      Swal.fire({ icon: "warning", text: "Please select Month." });
      return;
    }
    if (!selectedYear) {
      Swal.fire({ icon: "warning", text: "Please select Year." });
      return;
    }

    try {
      Swal.fire({
        title: "Generating...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const selectedDept = departments.find((d) => String(d.DEPTID) === departmentId);
      const selectedBank = banks.find(
        (b) => String(b.BANKID ?? b.BANK_ID) === bankId
      );

      const payload = {
        ulbId: Number(ulbId),
        month: Number(selectedMonth),
        year: Number(selectedYear),
        departmentId: Number(departmentId),
        bankId: Number(bankId),
        deptName: selectedDept ? selectedDept.DEPTNAME : null,
        bankName: selectedBank ? (selectedBank.BANKNAME ?? selectedBank.BANK_NAME) : null,
      };

      const response = await axios.post(
        `${BASE_URL}/api/FrmBankListReport/generate-bank-list-pdf`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.close();

      if (response.data?.success) {
        window.open(response.data.pdfUrl, "_blank");
      } else {
        Swal.fire({
          text: response.data?.message || "Failed to generate report.",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (err) {
      Swal.close();
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to generate report.";
      Swal.fire({
        text: errorMessage,
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const handleCancel = () => {
    navigate("/HomePage/FrmHomePage");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-5 min-h-screen"
    >
      <Card className="border shadow-sm">
        <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
          <CardTitle className="text-xl font-bold">Bank List Report</CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* Salary Date */}
            <div className="flex flex-col gap-1.5">
              <Label
                required
                text="Salary Date"
                className="w-auto text-[13px] font-semibold text-gray-700"
              />
              <div className="flex gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-9 overflow-hidden flex-1 min-w-0">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-9 overflow-hidden w-24 shrink-0">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearList.length > 0
                      ? yearList.map((item) => (
                          <SelectItem
                            key={item.NUM_YEAR_ID}
                            value={item.NUM_YEAR_ID.toString()}
                          >
                            {item.VAR_YEAR}
                          </SelectItem>
                        ))
                      : Array.from({ length: 10 }, (_, i) => {
                          const y = currentDate.getFullYear() - i;
                          return (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          );
                        })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1.5">
              <Label
                required
                text="Department"
                className="w-auto text-[13px] font-semibold text-gray-700"
              />
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-full h-9 overflow-hidden">
                  <SelectValue placeholder="-- ALL --" />
                </SelectTrigger>
                <SelectContent showDefaultOption={false}>
                  <SelectItem value="-1">-- ALL --</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.DEPTID} value={String(dept.DEPTID)}>
                      {dept.DEPTNAME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bank */}
            <div className="flex flex-col gap-1.5">
              <Label
                text="Bank"
                className="w-auto text-[13px] font-semibold text-gray-700"
              />
              <Select value={bankId} onValueChange={setBankId}>
                <SelectTrigger className="w-full h-9 overflow-hidden">
                  <SelectValue placeholder="-- ALL --" />
                </SelectTrigger>
                <SelectContent showDefaultOption={false}>
                  <SelectItem value="-1">-- ALL --</SelectItem>
                  {banks.map((bank) => (
                    <SelectItem
                      key={bank.BANKID ?? bank.BANK_ID}
                      value={String(bank.BANKID ?? bank.BANK_ID)}
                    >
                      {bank.BANKNAME ?? bank.BANK_NAME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              type="button"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8"
              onClick={handlePrint}
            >
              Print
            </Button>

            <Button
              type="button"
              variant="outline"
              className="px-8"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmBankListReport;
