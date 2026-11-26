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
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const initialValues = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear().toString(),
  empType: "NEW",
  fileFormat: "PDF",
};

const pad = (n) => n.toString().padStart(2, "0");

const buildDateRange = (year, month) => {
  const y = parseInt(year);
  const m = parseInt(month);
  const fromDate = `01-${pad(m)}-${y}`;
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  const toDate = `01-${pad(nextMonth)}-${nextYear}`;
  return { fromDate, toDate };
};

const EXCEL_COLUMNS = [
  { key: "SUMHEAD",           label: "विभाग" },
  { key: "BASICPAY",          label: "Basic Pay" },
  { key: "GRADEPAY",          label: "Grade_Pay" },
  { key: "GHARBHADE",         label: "HRA" },
  { key: "DEARNESSALLOWANCE", label: "DA" },
  { key: "DADIFF",            label: "DA_Diff" },
  { key: "SIXPAYDIFF",        label: "7 वा वेतन थकबाकी_4/48_Inst" },
  { key: "WASHINGALLOWANCE",  label: "Wash_Allow" },
  { key: "SWEEPERALLOWANCE",  label: "Sweeper_Allow" },
  { key: "TPTAALOWANCE",      label: "Tpt_Allow" },
  { key: "PETROLALLOWANCE",   label: "Petrol_Allow" },
  { key: "DCPSE",             label: "DCPS 14% Earning" },
  { key: "CASHALLOWANCE",     label: "Cash_Allow" },
  { key: "OTHERALLOWANCE",    label: "Other" },
  { key: "NPA",               label: "NPA" },
  { key: "EARNING",           label: "Gross" },
  { key: "FUNDWARGANI",       label: "PF_Subs" },
  { key: "FUNDKARJ",          label: "PF_Ref" },
  { key: "VYAVSAYKAR",        label: "Prf_Tax" },
  { key: "INCOMETAX",         label: "I_TAX" },
  { key: "GIS",               label: "G.I.S." },
  { key: "GASASOSA",          label: "Coop_Soc" },
  { key: "CONSUMERSOCIETY",   label: "Cons_Soc" },
  { key: "FOURSOCIETY",       label: "CL_4_Soc" },
  { key: "DCPSD",             label: "DCPS 14% Deduction" },
  { key: "LIC",               label: "LIC" },
  { key: "MRUTYUNIDHI",       label: "Mrutyu_Nidhi" },
  { key: "PANIGHARPATTI",     label: "Pani / Ghar" },
  { key: "COURT",             label: "Court_Rec" },
  { key: "BANGLABHADE",       label: "Hsg_Rent" },
  { key: "BANKHAFTA",         label: "Bank_Rec" },
  { key: "DCPS10",            label: "Mudrank_Kapat" },
  { key: "DHWAJNIDHI",        label: "Flag_Nidhi" },
  { key: "PENSIONANSHDAN",    label: "PF_Subs_7th_Pay_Diff_4 / 48_Inst" },
  { key: "OTHER",             label: "Other_Pay" },
  { key: "GRANTHALAY",        label: "Granth_Rec" },
  { key: "APAGHATVIMA",       label: "AccidentPolicy" },
  { key: "SANVASULI",         label: "Fest_Adv" },
  { key: "AUDIT_REC",         label: "Audit_Rec" },
  { key: "DEDUCTION",         label: "Total_Deduct" },
  { key: "netpay",            label: "NETPAY" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];


const downloadExcel = (rows, { corporationName, monthName, year }) => {
  if (!rows?.length) return;

  const headers = EXCEL_COLUMNS.map((c) => c.label);

  const dataRows = rows.map((r) =>
    EXCEL_COLUMNS.map((c) => {
      const v = r[c.key];
      if (c.key === "SUMHEAD") return v ?? "";
      return Number(v) || 0;
    }),
  );

  const firstIsString = true;
  const totalRow = ["Total"];
  for (let i = 1; i < EXCEL_COLUMNS.length; i++) {
    const sum = dataRows.reduce((acc, row) => acc + (Number(row[i]) || 0), 0);
    totalRow.push(sum);
  }

  const titleLine = `${corporationName || ""} माहे ${monthName}, ${year} अंतिम पगार बिल समरी क्र. १`;
  const subtitleLine = "(7th Pay)";

  const aoa = [
    [titleLine],
    [subtitleLine],
    [],
    headers,
    ...dataRows,
    totalRow,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const lastCol = headers.length - 1;
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
  ];

  ws["!cols"] = headers.map((_, i) => ({ wch: i === 0 ? 22 : 14 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DeptBillSummary");

  const stamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[:T-]/g, "");
  XLSX.writeFile(wb, `Department_Bill_Summary_${stamp}.xlsx`);
};

const FrmDepartmentBillSummary = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const corporationName = user?.corporationName || user?.ulbName || "";
  const navigate = useNavigate();
  
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const showEmpType = ["770", "1750"].includes(String(ulbId));

  const monthOptions = MONTH_NAMES.map((label, i) => ({
    value: String(i + 1),
    label,
  }));

  const yearOptions = [
    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
    { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
    { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() },
  ];

  const handleSubmit = async (values) => {
    try {
      Swal.fire({
        title: `Generating ${values.fileFormat}...`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const { fromDate, toDate } = buildDateRange(values.year, values.month);

      const payload = {
        ulbId: Number(ulbId),
        fromDate,
        toDate,
        employeeStatus: showEmpType ? values.empType : "NEW",
        month: Number(values.month),
        year: values.year,
      };

      // ---------- EXCEL ----------
      if (values.fileFormat === "EXCEL") {
        const res = await axios.post(
          `${BASE_URL}/api/FrmDeptsummrpt/summary-head-wise-salary`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        Swal.close();

        const data = res.data?.data?.data ?? res.data?.data ?? [];
        if (!Array.isArray(data) || data.length === 0) {
          Swal.fire({
            text: "Record not Found",
            confirmButtonColor: "#1e3a8a",
          });
          return;
        }

        downloadExcel(data, {
          corporationName,
          monthName: MONTH_NAMES[Number(values.month) - 1],
          year: values.year,
        });

        Swal.fire({
          text: "Excel generated successfully!",
          confirmButtonColor: "#1e3a8a",
          timer: 2000,
        });
        return;
      }

      // ---------- PDF ----------
      const res = await axios.post(
        `${BASE_URL}/api/FrmDeptsummrpt/generate-pdf`,
        { ...payload, month: Number(values.month) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.close();

      if (res.data?.success && res.data?.pdfUrl) {
        window.open(res.data.pdfUrl, "_blank");
        Swal.fire({
          text: res.data.message || "Report generated successfully!",
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
        error.response?.data?.message || "Failed to generate report";
      Swal.fire({ text: errorMessage, confirmButtonColor: "#1e3a8a" });
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card className="shadow-sm border">
            <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                Department Bill Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Month / Year */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Date" required />
                    <span>:</span>
                  </div>
                  <div className="flex gap-2 flex-1">
                    <Select
                      value={values.month.toString()}
                      onValueChange={(v) => setFieldValue("month", parseInt(v))}
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

                {/* Employee Type */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
                    <Label text="Employee Type" required />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.empType}
                    onValueChange={(value) => setFieldValue("empType", value)}
                  >
                    <SelectTrigger className="w-full h-9 overflow-hidden">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OLD">OLD</SelectItem>
                      <SelectItem value="NEW">NEW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Format */}
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
      )}
    </Formik>
  );
};

export default FrmDepartmentBillSummary;