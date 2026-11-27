import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Formik } from "formik";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const REPORT_TYPE_OPTIONS = [
  { value: "Cash", label: "Cash & Cheque" },
  { value: "DCPS", label: "DCPS Addition & Deduction" },
  { value: "Payslip", label: "Manual payslip" },
];

const EMP_TYPE_OPTIONS = [
  { value: "OLD", label: "OLD" },
  { value: "NEW", label: "NEW" },
];

const FILE_FORMAT_OPTIONS = [
  { value: "PDF", label: "PDF" },
  { value: "EXCEL", label: "EXCEL" },
];

const FrmCashNCheckRpt = () => {
  const { user, token: authToken } = useAuth();
  const token = authToken || user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [paymodeOptions, setPaymodeOptions] = useState([]);

  const initialValues = {
    reportType: "Cash",
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    department: "-1",
    paymode: "-1",
    empType: "NEW",
    fileFormat: "PDF",
  };

  const monthOptions = useMemo(() => {
    const fmt = new Intl.DateTimeFormat("en", { month: "long" });
    return Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: fmt.format(new Date(2000, i, 1)),
    }));
  }, []);

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2].map((v) => ({
      value: String(v),
      label: String(v),
    }));
  }, []);

  const getVisibility = (reportType) => {
    switch (reportType) {
      case "Cash":
        return { paymode: true, department: true, fileFormat: true };
      case "DCPS":
        return { paymode: false, department: false, fileFormat: true };
      case "Payslip":
        return { paymode: false, department: true, fileFormat: false };
      default:
        return { paymode: true, department: true, fileFormat: true };
    }
  };

  const handleReportTypeChange = (selectedValue, setFieldValue) => {
    setFieldValue("reportType", selectedValue);
    if (selectedValue === "Payslip") {
      setFieldValue("fileFormat", "PDF");
    }
  };

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmCashNCheckRpt/department-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const raw = res.data?.data?.data ?? [];
      const normalized = (Array.isArray(raw) ? raw : [])
        .map((d) => ({
          value: String(d.DEPTID ?? d.deptid ?? d.deptId ?? ""),
          label: d.DEPTNAME ?? d.deptname ?? d.deptName ?? "",
        }))
        .filter((d) => d.value !== "");

      setDepartmentOptions(normalized);
    } catch (error) {
      console.error("Department fetch error:", error);
    }
  }, [token, ulbId]);

  const fetchPaymodes = useCallback(async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmCashNCheckRpt/paymode-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPaymodeOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Paymode fetch error:", error);
    }
  }, [token, ulbId]);

  useEffect(() => {
    if (!token || !ulbId) return;

    const loadDropdowns = async () => {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await Promise.allSettled([fetchDepartments(), fetchPaymodes()]);
      } catch (error) {
        console.error(error);
      } finally {
        Swal.close();
      }
    };

    loadDropdowns();
  }, [token, ulbId, fetchDepartments, fetchPaymodes]);

  const exportToExcel = (resData, values) => {
    const rows = resData?.data || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      Swal.fire({ text: "No Record Found", confirmButtonColor: "#1e3a8a" });
      return;
    }

    let formattedRows = [];
    let fileName = `Report_${values.month}_${values.year}.xlsx`;
    let sheetName = "Report";

    if (values.reportType === "Cash") {
      let totalAmt = 0;
      formattedRows = rows.map((row, idx) => {
        const amt = Number(row.PAYABLEAMT || 0);
        totalAmt += amt;
        return {
          "SR.NO.": idx + 1,
          BILLNO: row.BILLNO || "",
          SLIPNO: row.SLIPNO || "",
          EMPLOYEE_NAME: row.EMPNAME || "",
          AXISACCNO: row.AXISACCNO || "",
          INDIANACCNO: row.INDACCNO || "",
          PAYABLE_AMOUNT: amt,
        };
      });
      formattedRows.push({
        "SR.NO.": "",
        BILLNO: "",
        SLIPNO: "",
        EMPLOYEE_NAME: "",
        AXISACCNO: "",
        INDIANACCNO: "Total",
        PAYABLE_AMOUNT: totalAmt,
      });
      fileName = `CASH_AND_CHECK_REPORT_${values.month}_${values.year}.xlsx`;
      sheetName = "Cash & Cheque";
    } else if (values.reportType === "DCPS") {
      const totals = {
        basic: 0, gp: 0, da: 0, daDiff: 0,
        eDcps14: 0, eDcps14Diff: 0,
        dDcps10: 0, dDcps14: 0, dDcps10Diff: 0, dDcps14Diff: 0,
        total: 0,
      };
      formattedRows = rows.map((row, idx) => {
        const basic = Number(row.E_BASIC || 0);
        const gp = Number(row.E_GP || 0);
        const da = Number(row.E_DA || 0);
        const daDiff = Number(row.E_DADIFF || 0);
        const eDcps14 = Number(row.E_DCPS14 || 0);
        const eDcps14Diff = Number(row.E_DCPSDIFF14 || 0);
        const dDcps10 = Number(row.D_DCPS10 || 0);
        const dDcps14 = Number(row.D_DCPS14 || 0);
        const dDcps10Diff = Number(row.D_DCPSDIFF10 || 0);
        const dDcps14Diff = Number(row.D_DCPSDIFF14 || 0);
        const total = Number(row.TOTAL || 0);

        totals.basic += basic;
        totals.gp += gp;
        totals.da += da;
        totals.daDiff += daDiff;
        totals.eDcps14 += eDcps14;
        totals.eDcps14Diff += eDcps14Diff;
        totals.dDcps10 += dDcps10;
        totals.dDcps14 += dDcps14;
        totals.dDcps10Diff += dDcps10Diff;
        totals.dDcps14Diff += dDcps14Diff;
        totals.total += total;

        return {
          "SR.NO.": idx + 1,
          "बिल नं.": row.BILLNO || "",
          "स्लिप नं.": row.SLIPNO || "",
          "कर्मचारी नाव": row.EMPNAME || "",
          BASIC: basic,
          GRADEPAY: gp,
          DA: da,
          DA_Diff: daDiff,
          "E_DCPS14% रक्कम": eDcps14,
          "DCPS 14% Diff रक्कम": eDcps14Diff,
          "DCPS10% रक्कम": dDcps10,
          "D_DCPS14% रक्कम": dDcps14,
          "DCPS 10% Diff. रक्कम": dDcps10Diff,
          "DCPS 14% Diff. रक्कम": dDcps14Diff,
          "एकूण रक्कम": total,
        };
      });
      formattedRows.push({
        "SR.NO.": "",
        "बिल नं.": "",
        "स्लिप नं.": "",
        "कर्मचारी नाव": "Total",
        BASIC: totals.basic,
        GRADEPAY: totals.gp,
        DA: totals.da,
        DA_Diff: totals.daDiff,
        "E_DCPS14% रक्कम": totals.eDcps14,
        "DCPS 14% Diff रक्कम": totals.eDcps14Diff,
        "DCPS10% रक्कम": totals.dDcps10,
        "D_DCPS14% रक्कम": totals.dDcps14,
        "DCPS 10% Diff. रक्कम": totals.dDcps10Diff,
        "DCPS 14% Diff. रक्कम": totals.dDcps14Diff,
        "एकूण रक्कम": totals.total,
      });
      fileName = `DCPS_REPORT_${values.month}_${values.year}.xlsx`;
      sheetName = "DCPS Report";
    }

    const worksheet = XLSX.utils.json_to_sheet(formattedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, fileName);
  };

  const handleSubmit = async (values) => {
    if (!values.month) {
      Swal.fire({ text: "Please select Month.", confirmButtonColor: "#1e3a8a" });
      return;
    }
    if (!values.year) {
      Swal.fire({ text: "Please select Year.", confirmButtonColor: "#1e3a8a" });
      return;
    }

    try {
      Swal.fire({
        title: "Generating Report...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const vis = getVisibility(values.reportType);
      const selectedDept = departmentOptions.find(
        (d) => String(d.value) === String(values.department),
      );
      const selectedPaymode = paymodeOptions.find(
        (pm) => String(pm.paymodeid ?? pm.paymodeId) === String(values.paymode),
      );

      const resolvedFormat =
        values.reportType === "Payslip"
          ? "PDF"
          : vis.fileFormat
            ? values.fileFormat
            : "PDF";

      const payload = {
        ulbid: Number(ulbId),
        reportType: values.reportType,
        month: Number(values.month),
        year: values.year,
        deptId: vis.department ? values.department || "-1" : "-1",
        deptName: vis.department && selectedDept ? selectedDept.label : "All",
        paymode: vis.paymode ? values.paymode || "-1" : "-1",
        paymodeName:
          vis.paymode && selectedPaymode
            ? (selectedPaymode.paymode ?? selectedPaymode.paymodeName)
            : "All",
        empType: values.empType || "NEW",
        fileFormat: resolvedFormat,
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmCashNCheckRpt/generate-report`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.close();

      if (res.data?.count == 0 || res.data?.data?.length === 0) {
        Swal.fire({
          text: res.data?.message || "No Record Found",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      if (resolvedFormat === "EXCEL" && res.data?.success && res.data?.data) {
        exportToExcel(res.data, values);
        Swal.fire({
          text: "Excel exported successfully!",
          confirmButtonColor: "#1e3a8a",
          timer: 2000,
        });
      } else if (res.data?.success && res.data?.pdfUrl) {
        window.open(res.data.pdfUrl, "_blank");
      } else {
        Swal.fire({
          text: res.data?.message || "Failed to generate report",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Report Generation Error:", error);
      Swal.close();

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to generate report";

      Swal.fire({
        text: errorMessage,
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => {
        const vis = getVisibility(values.reportType);

        return (
          <Form>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 md:p-5 min-h-screen"
            >
              <Card className="border shadow-sm">
                <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                  <CardTitle className="text-xl font-bold">
                    Salary Reports
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Salary Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
                        <Label
                          required
                          text="Salary Date"
                          className="w-auto sm:w-auto text-[13px] font-semibold text-gray-700"
                        />
                        <span>:</span>
                      </div>
                      <div className="flex gap-2 flex-1 min-w-0">
                        <Select
                          value={String(values.month)}
                          onValueChange={(v) => setFieldValue("month", v)}
                        >
                          <SelectTrigger className="h-9 flex-1 min-w-0 overflow-hidden">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent showDefaultOption={false}>
                            {monthOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={values.year}
                          onValueChange={(v) => setFieldValue("year", v)}
                        >
                          <SelectTrigger className="h-9 w-24 shrink-0">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent showDefaultOption={false}>
                            {yearOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Department */}
                    {vis.department && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
                          <Label
                            required
                            text="Department"
                            className="w-auto sm:w-auto text-[13px] font-semibold text-gray-700"
                          />
                          <span>:</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Select
                            value={values.department}
                            onValueChange={(v) => setFieldValue("department", v)}
                          >
                            <SelectTrigger className="w-full h-9 overflow-hidden">
                              <SelectValue placeholder="-- ALL --" />
                            </SelectTrigger>
                            <SelectContent showDefaultOption={false}>
                              <SelectItem value="-1">-- ALL --</SelectItem>
                              {departmentOptions.map((dept) => (
                                <SelectItem key={dept.value} value={dept.value}>
                                  {dept.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Paymode */}
                    {vis.paymode && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
                          <Label
                            text="Paymode"
                            className="w-auto sm:w-auto text-[13px] font-semibold text-gray-700"
                          />
                          <span>:</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Select
                            value={values.paymode}
                            onValueChange={(v) => setFieldValue("paymode", v)}
                          >
                            <SelectTrigger className="w-full h-9 overflow-hidden">
                              <SelectValue placeholder="-- ALL --" />
                            </SelectTrigger>
                            <SelectContent showDefaultOption={false}>
                              <SelectItem value="-1">-- ALL --</SelectItem>
                              {paymodeOptions.map((pm) => {
                                const id = String(pm.paymodeid ?? pm.paymodeId ?? "");
                                if (!id) return null;
                                return (
                                  <SelectItem key={id} value={id}>
                                    {pm.paymode ?? pm.paymodeName}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Employee Type */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
                        <Label
                          text="Employee Type"
                          className="w-auto sm:w-auto text-[13px] font-semibold text-gray-700"
                        />
                        <span>:</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Select
                          value={values.empType}
                          onValueChange={(v) => setFieldValue("empType", v)}
                        >
                          <SelectTrigger className="w-full h-9 overflow-hidden">
                            <SelectValue placeholder="Select Employee Type" />
                          </SelectTrigger>
                          <SelectContent showDefaultOption={false}>
                            {EMP_TYPE_OPTIONS.map((et) => (
                              <SelectItem key={et.value} value={et.value}>
                                {et.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* File Format (PDF / EXCEL) */}
                    {vis.fileFormat && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
                          <Label
                            text="File Format"
                            className="w-auto sm:w-auto text-[13px] font-semibold text-gray-700"
                          />
                          <span>:</span>
                        </div>
                        <div className="flex items-center gap-6 h-9 flex-1 min-w-0">
                          {FILE_FORMAT_OPTIONS.map((fmt) => (
                            <label
                              key={fmt.value}
                              className="flex items-center gap-2 cursor-pointer text-sm text-gray-800"
                            >
                              <Input
                                type="radio"
                                name="fileFormat"
                                value={fmt.value}
                                checked={values.fileFormat === fmt.value}
                                onChange={(e) =>
                                  setFieldValue("fileFormat", e.target.value)
                                }
                              />
                              <span>{fmt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Report Type */}
                    <div className="md:col-span-2 xl:col-span-3 flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
                        <Label
                          text="Report Type"
                          className="w-auto sm:w-auto text-[13px] font-semibold text-gray-700"
                        />
                        <span>:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 min-h-9 flex-1 min-w-0">
                        {REPORT_TYPE_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer text-sm text-gray-800"
                          >
                            <Input
                              type="radio"
                              name="reportType"
                              value={option.value}
                              checked={values.reportType === option.value}
                              onChange={(e) =>
                                handleReportTypeChange(e.target.value, setFieldValue)
                              }
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button type="submit" className="px-8">
                      Print
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="px-8"
                      onClick={() => navigate("/HomePage/FrmHomePage")}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmCashNCheckRpt;
