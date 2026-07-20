import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import * as XLSX from "xlsx";

const FrmSalaryConsolidationReport = () => {
  const { user } = useAuth();

  const token = user?.token;
  const ulbid = user?.ulbId;

  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("-1");
  const [reportType, setReportType] = useState("D");
  const [yearList, setYearList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    if (token && ulbid) {
      fetchMasters();
    }
  }, [token, ulbid]);

  const fetchMasters = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const departmentPayload = {
        ulbid: Number(ulbid),
      };

      const [departmentRes, yearRes] = await Promise.all([
        axios.post(
          `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
          departmentPayload,
          config,
        ),

        axios.get(
          `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/year-list`,
          config,
        ),
      ]);

      const departmentData =
        departmentRes?.data?.data?.data ||
        departmentRes?.data?.data?.rows ||
        [];

      setDepartments([
        {
          DEPTID: -1,
          DEPTNAME: "-- ALL --",
        },
        ...departmentData,
      ]);
      setYearList(yearRes.data?.data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || "Failed to load master data",
      });
    } finally {
      Swal.close();
    }
  };

  const generateExcel = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      Swal.fire({
        icon: "warning",
        text: "No data found.",
      });
      return;
    }

    const headerMap = {
      DEPTMST_CODE: "विभाग कोड",
      DEPTNAME: "विभागाचे नाव",
      PENSIONFUND: "पेंशन फ़ंड",

      COL1: "मूळ वेतन",
      COL2: "ग्रेड वेतन",
      COL3: "महागाई भत्ता",
      COL4: "घरभाडे",
      COL5: "वाहन भत्ता",
      COL6: "मनपा डि.सी.पी.एस.",
      COL7: "धुलाई भत्ता",
      COL8: "सफाई भत्ता",
      COL12: "टाइपिंग भत्ता",
      COL13: "रोख भत्ता",

      COL102: "शिक्षण भत्ता",
      COL103: "एनपीए (नॉन-प्रॅक्टिसिंग अलाउन्स)",
      COL104: "विशेष भत्ता",
      COL109: "प्रवास भत्ता",
      COL110: "इतर भत्ते",

      NUM_SALARY_TOTALEARNING: "एकूण मिळकत",

      COL216: "भ.नि.निधी",
      COL217: "भ.नि.नि.परतावा (PF)",
      COL218: "व्यवसाय कर",

      COL267: "आयकर(IT)",
      COL268: "TDS",
      COL269: "आयुर्विमा",

      COL280: "सोसायटी १",
      COL281: "सोसायटी २",
      COL282: "सोसायटी ३",
      COL283: "सोसायटी ४",

      BANK: "बँक",

      COL287: "परत जमा",
      COL291: "तसलमात",

      COL353: "ई.एस.आय",
      COL355: "गट विमा",
      COL356: "डि.सी.पी.एस 10%",
      COL357: "मनपा डि.सी.पी.एस",
      COL358: "मु. शुल्क",
      COL360: "जे.एम.एफ.सी.",
      COL362: "घरभाडे वसुली",
      COL363: "घरभाडे अनु. शुल्क",
      COL364: "पाणीपट्टी",
      COL365: "घरपट्टी",
      COL366: "दिवाळी अ‍ॅडव्हान्स",
      COL368: "ईद अ‍ॅडव्हान्स",
      COL369: "सण ॲडव्हान्स",
      COL370: "संगणक कर्ज",

      COL408: "फरक आणि इतर",
      COL481: "EXTRA OVER HEAD",

      COL651: "मोबाईल बील - मर्यादेपेक्षा जास्त वापर",
      COL653: "इतर वजावट",
      COL654: "माहिती अधिकार दंड",
      COL655: "Taxable",
      COL656: "आगऊ दिलेल्या रक्कमा",
      COL657: "जमीन कब्जा",
      COL658: "दंड रक्कम",
      COL659: "सीटीडी",
      COL660: "कौटुंबिक न्यायालय",
      COL661: "ऑडीट वसुली",
      COL662: "दंड वसुली",
      COL663: "अंध निधी",
      COL664: "एमएलडब्ल्यू फंड",
      COL665: "एक दिवसाचा पगार कपात",
      COL666: "दुष्काळं निधी",
      COL672: "ध्वज निधी",
      COL673: "विशेष निधी",

      NUM_SALARY_TOTALDEDUCT: "एकूण कपात",
      NETPAY: "देय वेतन",
    };

    const excelRows = rows.map((row, index) => {
      const obj = {
        "अ.क्र.": index + 1,
      };

      Object.entries(headerMap).forEach(([key, title]) => {
        obj[title] = row[key] === null || row[key] === undefined ? 0 : row[key];
      });

      return obj;
    });

    const headers = Object.keys(excelRows[0]);

    const worksheet = XLSX.utils.json_to_sheet(excelRows, {
      header: headers,
    });

    worksheet["!cols"] = headers.map((header) => {
      const max = Math.max(
        header.length,
        ...excelRows.map((row) => String(row[header]).length),
      );

      return {
        wch: Math.min(max + 5, 35),
      };
    });

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Consolidation");

    XLSX.writeFile(
      workbook,
      `Salary_Consolidation_${selectedMonth}_${selectedYear}.xlsx`,
    );

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Excel generated successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handlePrint = async () => {
    try {
      Swal.fire({
        title: "Generating...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const monthNames = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];

      const lastDate = new Date(
        Number(selectedYear),
        Number(selectedMonth),
        0,
      ).getDate();

      const salaryDate = `${selectedYear}-${monthNames[Number(selectedMonth) - 1]}-${lastDate}`;

      const payload = {
        ulbid: Number(ulbid),
        salaryDate,
        reportType,
        deptid: Number(departmentId),
      };

      console.log(payload);

      const response = await axios.post(
        `${BASE_URL}/api/FrmSalaryConsolidationRpt/salary-consolidation-report`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Swal.close();

      console.log(response.data);

      const result = response.data?.data;

      if (result?.success && Array.isArray(result.data)) {
        generateExcel(result.data);
        return;
      }

      Swal.fire({
        icon: "warning",
        text: response.data?.message || "No data found.",
      });
    } catch (err) {
      Swal.close();

      console.error(err);

      Swal.fire({
        icon: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Unable to generate report.",
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        {/* Header */}
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold ">
            Salary Consolidation (पगार एकत्रीकरण) Report
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-8">
          <div className="flex flex-wrap items-center gap-8">
            {/* Salary Date */}
            <div className="flex items-center gap-2">
              <Label required text="Salary Date" />
              <span>:</span>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>

                <SelectContent>
                  {yearList.map((item) => (
                    <SelectItem key={item.VALUE} value={item.LABEL}>
                      {item.LABEL}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="flex items-center gap-2">
              <Label required text="Department" />
              <span>:</span>

              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>

                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.DEPTID} value={String(dept.DEPTID)}>
                      {dept.DEPTNAME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Report Type */}
            <div className="flex items-center gap-2">
              <Label text="Report Type" />
              <span>:</span>

              <label className="flex items-center gap-2">
                <Input
                  type="radio"
                  name="reportType"
                  value="D"
                  checked={reportType === "D"}
                  onChange={(e) => setReportType(e.target.value)}
                />
                Department Wise
              </label>

              <label className="flex items-center gap-2">
                <Input
                  type="radio"
                  name="reportType"
                  value="E"
                  checked={reportType === "E"}
                  onChange={(e) => setReportType(e.target.value)}
                />
                Employee Wise
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <Button type="button" onClick={handlePrint}>
              Print
            </Button>

            <Button type="button" variant="outline" path="/HomePage/FrmHomePage">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmSalaryConsolidationReport;
