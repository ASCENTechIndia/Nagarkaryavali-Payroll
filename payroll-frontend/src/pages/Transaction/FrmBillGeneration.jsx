import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Formik, Form } from "formik";
import axios from "axios";
import Swal from "sweetalert2";

import { useAuth } from "@/context/AuthContext";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const FrmBillGeneration = () => {
  const { user } = useAuth();

  const token = user?.token;
  const ulbId = user?.ulbId;

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [departmentList, setDepartmentList] = useState([]);
  const [yearList, setYearList] = useState([]);

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
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

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

      setDepartmentList(departmentRes.data?.data || []);
      setYearList(yearRes.data?.data || []);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        text: "Failed to load master data.",
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

  const handleBillProcess = async (values) => {
    debugger;
    try {
      Swal.fire({
        title: "Please Wait...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const month = Number(values.month);
      const year = Number(values.year);

      const lastDay = new Date(year, month, 0).getDate();

      const monthName = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][month - 1];

      const salaryDate = `${String(lastDay).padStart(2, "0")}-${monthName}-${year}`;

      const generatePayload = {
        userId: user.userId,
        salDate: salaryDate,
        deptid: Number(values.department),
        ulbid: Number(ulbId),
      };

      const reportPayload = {
        userId: user.userId,
        salDate: salaryDate,
        deptid: Number(values.department),
        ulbid: Number(ulbId),
      };
console.log("pdf payload:", reportPayload)
      // Generate Bill
      if (values.type === "generate") {
        const generateRes = await axios.post(
          `${BASE_URL}/api/FrmBillGeneration/generate-bill`,
          generatePayload,
          config,
        );

        Swal.close();

        await Swal.fire({
          icon: "success",
          title: "Success",
          text:
            generateRes.data?.data?.message || "Bill Generated Successfully",
          confirmButtonText: "OK",
        });
      }

      // Show loader again while generating PDFs
      Swal.fire({
        title: "Generating Reports...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Detail Report
      const detailRes = await axios.post(
        `${BASE_URL}/api/FrmBillGeneration/detail-report`,
        reportPayload,
        config,
      );

      // Summary Report
      const summaryRes = await axios.post(
        `${BASE_URL}/api/FrmBillGeneration/summary-report`,
        reportPayload,
        config,
      );

      Swal.close();

      // Open PDFs
      if (detailRes.data?.pdfUrl) {
        window.open(detailRes.data.pdfUrl, "_blank");
      }

      if (summaryRes.data?.pdfUrl) {
        window.open(summaryRes.data.pdfUrl, "_blank");
      }
    } catch (error) {
      Swal.close();

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.data?.message ||
        error.message ||
        "Something went wrong.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  return (
    <Formik
      initialValues={{
        month: "",
        year: "",
        department: "",
        type: "print",
      }}
      onSubmit={handleBillProcess}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-5"
          >
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-3xl font-bold">
                  Bill Generation
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Month & Year */}

                  <div className="space-y-2">
                    <Label required text="Date" />

                    <div className="flex gap-3">
                      <Select
                        value={values.month}
                        onValueChange={(value) => setFieldValue("month", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>

                        <SelectContent>
                          {months.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={values.year}
                        onValueChange={(value) => setFieldValue("year", value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>

                        <SelectContent>
                          {yearList.map((item) => (
                            <SelectItem
                              key={item.VALUE}
                              value={item.LABEL} // <-- use LABEL instead of VALUE
                            >
                              {item.LABEL}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Department */}

                  <div className="space-y-2">
                    <Label required text="Department" />

                    <Select
                      value={values.department}
                      onValueChange={(value) =>
                        setFieldValue("department", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">-- ALL --</SelectItem>

                        {departmentList.map((item) => (
                          <SelectItem
                            key={item.VALUE}
                            value={String(item.VALUE)}
                          >
                            {item.LABEL}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}

                  <div className="space-y-2">
                    <Label text="Type" />

                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Input
                          type="radio"
                          checked={values.type === "generate"}
                          onChange={() => setFieldValue("type", "generate")}
                        />
                        <span>Generate</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <Input
                          type="radio"
                          checked={values.type === "print"}
                          onChange={() => setFieldValue("type", "print")}
                        />
                        <span>Print</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Buttons */}

                <div className="flex justify-center gap-4 mt-12">
                  <Button type="submit">Print</Button>

                  <Button type="button" variant="outline">
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

export default FrmBillGeneration;
