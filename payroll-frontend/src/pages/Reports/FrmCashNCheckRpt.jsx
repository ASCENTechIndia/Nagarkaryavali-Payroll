import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Form, Formik } from "formik";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";


const initialValues = {
  reportType: "Cash",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear().toString(),
  department: "-1",
  paymode: "-1",
  empType: "NEW",   
  fileFormat: "PDF",
};

const FrmCashNCheckRpt = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [paymodeOptions, setPaymodeOptions] = useState([]);

  const isSpecialUlb = ["770", "1750"].includes(String(ulbId));
  const showEmpType = isSpecialUlb;
  const showFileFormat = isSpecialUlb;

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

  const reportTypeOptions = [
    { value: "Cash", label: "Cash & Cheque" },
    { value: "DCPS", label: "DCPS Addition & Deduction" },
    { value: "Payslip", label: "Manual payslip" },
  ];

  const empTypeOptions = [
    { value: "OLD", label: "OLD" },
    { value: "NEW", label: "NEW" },
  ];

  const getVisibility = (reportType) => {
    switch (reportType) {
      case "Cash":
        return { paymode: true, department: true, fileFormat: showFileFormat };
      case "DCPS":
        return { paymode: false, department: false, fileFormat: showFileFormat };
      case "Payslip":
        return { paymode: false, department: true, fileFormat: false };
      default:
        return { paymode: true, department: true, fileFormat: showFileFormat };
    }
  };

  // ---- Fetchers ----
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmCashNCheckRpt/department-list`,
        { ulbid: ulbId },
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
  }, [BASE_URL, token, ulbId]);

  const fetchPaymodes = useCallback(async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmCashNCheckRpt/paymode-list`,
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPaymodeOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error("Paymode fetch error:", error);
    }
  }, [BASE_URL, token, ulbId]);

  useEffect(() => {
    if (!token || !ulbId) return;

    const loadDropdowns = async () => {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await Promise.allSettled([
          fetchDepartments(),
          fetchPaymodes(),
        ]);
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
    try {
      Swal.fire({
        title: "Generating Report...",
        allowOutsideClick: false,
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
        empType: showEmpType ? values.empType : "NEW",
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
        Swal.fire({
          text: "Report generated successfully!",
          confirmButtonColor: "#1e3a8a",
          timer: 2000,
        });
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
            <Card className="shadow-sm border">
              <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-xl font-semibold">
                  Salary Reports
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Date (Month + Year) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Salary Date" required />
                      <span>:</span>
                    </div>
                    <div className="flex gap-2 flex-1">
                      <Select
                        value={values.month.toString()}
                        onValueChange={(v) =>
                          setFieldValue("month", parseInt(v))
                        }
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select Month" />
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
                        <SelectTrigger className="w-28 h-9">
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

                  {/* Department  */}
                  {vis.department && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Department" required />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.department}
                        onValueChange={(v) => setFieldValue("department", v)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select Department" />
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
                  )}

                  {/* Paymode  */}
                  {vis.paymode && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Pay Mode" required />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.paymode}
                        onValueChange={(v) => setFieldValue("paymode", v)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select Pay Mode" />
                        </SelectTrigger>
                        <SelectContent showDefaultOption={false}>
                          <SelectItem value="-1">-- ALL --</SelectItem>
                          {paymodeOptions.map((pm) => (
                            <SelectItem
                              key={pm.paymodeid ?? pm.paymodeId}
                              value={String(pm.paymodeid ?? pm.paymodeId)}
                            >
                              {pm.paymode ?? pm.paymodeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Employee Type */}
                  {showEmpType && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
                        <Label text="Employee Type" required />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.empType}
                        onValueChange={(v) => setFieldValue("empType", v)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>
                        <SelectContent showDefaultOption={false}>
                          {empTypeOptions.map((et) => (
                            <SelectItem key={et.value} value={et.value}>
                              {et.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* File Format */}
                  {vis.fileFormat && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="File Format" required />
                        <span>:</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Input
                            type="radio"
                            name="fileFormat"
                            value="PDF"
                            checked={values.fileFormat === "PDF"}
                            onChange={() => setFieldValue("fileFormat", "PDF")}
                          />
                          <span className="text-sm">PDF</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Input
                            type="radio"
                            name="fileFormat"
                            value="EXCEL"
                            checked={values.fileFormat === "EXCEL"}
                            onChange={() => setFieldValue("fileFormat", "EXCEL")}
                          />
                          <span className="text-sm">EXCEL</span>
                        </label>
                      </div>
                    </div>
                  )}

                  
                </div>

                {/* Report Type */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6 pt-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center pt-1">
                      <Label text="Report Type" required />
                      <span>:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 pt-1">
                      {reportTypeOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Input
                            type="radio"
                            name="reportType"
                            value={option.value}
                            checked={values.reportType === option.value}
                            onChange={() =>
                              setFieldValue("reportType", option.value)
                            }
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <Button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white px-8"
                  >
                    Process
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
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmCashNCheckRpt;