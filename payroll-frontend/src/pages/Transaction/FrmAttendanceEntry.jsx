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
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FrmDepSalBillValidationSchema } from "../../validations/global.validation";
import * as XLSX from "xlsx";

const FrmAttendanceEntry = () => {
  const { authUser } = useAuth();
  const authToken = authUser?.token;
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const token = storedToken || authToken;
  const user = storedUser || authUser;
  const ulbId = user?.orgId || user?.ulbId;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [billNoOptions, setBillNoOptions] = useState([]);
  const [showSubDept, setShowSubDept] = useState(false);
  const [showBillNo, setShowBillNo] = useState(false);
  const [showFileFormat, setShowFileFormat] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  
  const monthOptions = [
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
  
  const yearOptions = [
    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
    { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
    { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() },
  ];

  const reportTypeOptions = [
    { value: "E", label: "Earnings" },
    { value: "D", label: "Deduction" },
    { value: "A", label: "All" },
  ];

  const fileFormatOptions = [
    { value: "PDF", label: "PDF" },
    { value: "EXCEL", label: "EXCEL" },
  ];

  const initialFormValues = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear().toString(),
    zone: "",
    department: "-1",
    subDepartment: "",
    billNo: "0",
    category: "",
    grade: "",
    reportType: "A",
    fileFormat: "PDF",
    employeeCode: "",
    employeeName: "",
  };

  const formatDateForAPI = (year, month) => {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const date = new Date(yearNum, monthNum - 1, lastDay);
    
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthAbbr = monthNames[monthNum - 1];
    
    return `${day}-${monthAbbr}-${yearNum}`;
  };

  const fetchZones = async () => {
    if (!ulbId) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/zone`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.ZONENAME,
          value: String(item.ZONEID),
        }));
        setZoneOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching zones:", err);
    }
  };

  const fetchCategories = async () => {
    if (!ulbId) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/category`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_CATEGORY_NAME,
          value: String(item.NUM_CATEGORY_ID),
        }));
        setCategoryOptions([formatted]);
      } else {
        setCategoryOptions([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchDepartment = async () => {
    try {
      if (!ulbId) return;
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/department`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.DEPTNAME,
          value: String(item.DEPTID),
        }));
        setDepartmentOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
      } else {
        setDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchGrades = async () => {
    try {
      if (!ulbId) return;
      
      const res = await axios.get(
        `${BASE_URL}/api/FrmEmployeeMstNewTest/grade-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_GRADEMST_GRADENAME,
          value: String(item.NUM_GRADEMST_GRADEID),
        }));
        setGradeOptions([formatted]);
      } else {
        setGradeOptions([]);
      }
    } catch (err) {
      console.error("Error fetching grades:", err);
    }
  };

  const fetchSubDepartment = async (deptId) => {
    try {
      if (!ulbId || !deptId || deptId === "-1") {
        setSubDepartmentOptions([]);
        return;
      }
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/subdepartment`,
        { 
          ulbid: Number(ulbId),
          deptId: Number(deptId)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_DEPTSUB_SDEPTNAMEE,
          value: String(item.NUM_DEPTSUB_ID),
        }));
        setSubDepartmentOptions([formatted]);
      } else {
        setSubDepartmentOptions([]);
      }
    } catch (err) {
      console.error("Error fetching sub-departments:", err);
      setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
    }
  };

  const fetchBillNo = async (deptId, subDeptId) => {
    try {
      if (!ulbId) return;
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/billno`,
        {
          ulbid: Number(ulbId),
          deptId: deptId && deptId !== "-1" ? deptId : null,
          subdeptId: subDeptId && subDeptId !== "-1" ? subDeptId : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.BILLCODE || item.billno,
          value: String(item.BILLCODE || item.billno),
        }));
        setBillNoOptions([formatted]);
      } else {
        setBillNoOptions([]);
      }
    } catch (err) {
      console.error("Error fetching bill numbers:", err);
      setBillNoOptions([]);
    }
  };

  const generateReport = async (values) => {
    debugger;
    let loaderSwal;
    
    try {
      const validationResult = FrmDepSalBillValidationSchema.safeParse(values);
      console.log("validationResult", validationResult);

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        await Swal.fire({
            text: firstError.message,
            confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      setLoading(true);
      setHasSearched(true);
      
      loaderSwal = Swal.fire({
        title: "Generating...",
        text: "Please wait for monthly salary sheet generation",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      
      const formattedSalaryDate = formatDateForAPI(values.year, values.month);
      
      const payload = {
        ulbId: Number(ulbId),
        month: Number(values.month),
        year: Number(values.year),
        salaryDate: formattedSalaryDate,
        zoneId: values.zone,
        deptId: values.department !== "-1" ? values.department : null,
        subDeptId: values.subDepartment !== "-1" ? values.subDepartment : null,
        billNo: values.billNo !== "0" ? values.billNo : null,
        categoryId: values.category !== "0" ? values.category : null,
        gradeId: values.grade !== "0" ? values.grade : null,
        reportType: values.reportType, 
        fileFormat: values.fileFormat, 
        searchEmpId: values.employeeCode || null,
        searchEmpName: values.employeeName || null,
      };
      
      const response = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/generate-salary-sheet`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'json'
        }
      );
      
      loaderSwal.close();
      
      if (response.data?.success) {
        if (values.fileFormat === "PDF" && response.data?.pdfUrl) {
          window.open(response.data.pdfUrl, '_blank');
          Swal.fire({
            text: "PDF generated successfully!",
            confirmButtonColor: "#1e3a8a",
            timer: 2000,
            showConfirmButton: false
          });
        } else if (values.fileFormat === "EXCEL" && response.data?.excelData) {
          generateExcelFromData(response.data.excelData, values);
        } else {
          Swal.fire({
            text: "Report generated successfully!",
            confirmButtonColor: "#1e3a8a",
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else {
        Swal.fire({
          text: response.data?.message || "Failed to generate report",
          confirmButtonColor: "#1e3a8a"
        });
      }
    } catch (error) {
      console.error("Report Generation Error:", error);
      loaderSwal?.close();
      Swal.fire({
        text: error.response?.data?.message || "Error generating salary sheet",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setLoading(false);
      setHasSearched(false);
    }
  };

  const generateExcelFromData = (excelData, values) => {
    try {
      if (!excelData || excelData.length === 0) {
        Swal.fire({
          text: "No data available for Excel export",
          confirmButtonColor: "#1e3a8a"
        });
        return;
      }

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-size columns
      const colWidths = [];
      if (excelData.length > 0) {
        Object.keys(excelData[0]).forEach((key, idx) => {
          let maxLength = key.length;
          excelData.forEach((row) => {
            const cellValue = row[key]?.toString() || "";
            maxLength = Math.max(maxLength, cellValue.length);
          });
          colWidths[idx] = { wch: Math.min(maxLength + 2, 50) };
        });
      }
      ws['!cols'] = colWidths;
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SalarySheet");
      
      const fileName = `Salary_Sheet_${values.month}_${values.year}.xls`;
      XLSX.writeFile(wb, fileName);
      
      Swal.fire({
        text: "Excel exported successfully!",
        confirmButtonColor: "#1e3a8a",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Excel Generation Error:", error);
      Swal.fire({
        text: "Error generating Excel file",
        confirmButtonColor: "#1e3a8a"
      });
    }
  };

  const handleDepartmentChange = (value, setFieldValue) => {
    setFieldValue("department", value);
    setFieldValue("subDepartment", "-1");
    if (value && value !== "-1") {
      fetchSubDepartment(value);
      if (showBillNo) {
        fetchBillNo(value, "-1");
      }
    } else {
      setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
      if (showBillNo) {
        fetchBillNo(null, null);
      }
    }
  };

  const handleSubDepartmentChange = (value, setFieldValue, deptId) => {
    setFieldValue("subDepartment", value);
    if (showBillNo && deptId && deptId !== "-1") {
      fetchBillNo(deptId, value);
    }
  };

  useEffect(() => {
    if (ulbId) {
      if (ulbId === "590") {
        setShowSubDept(true);
        setShowBillNo(false);
        setShowFileFormat(true);
      } 
      else if (ulbId === "770" || ulbId === "1750") {
        setShowSubDept(true);
        setShowBillNo(true);
        setShowFileFormat(false);
      }
      else if (ulbId === "2") {
        setShowSubDept(false);
        setShowBillNo(false);
        setShowFileFormat(true);
      }
      else if (ulbId === "1630") {
        setShowSubDept(true);
        setShowBillNo(false);
        setShowFileFormat(false);
      }
      else {
        setShowSubDept(false);
        setShowBillNo(false);
        setShowFileFormat(false);
      }
    }
  }, [ulbId]);

  useEffect(() => {
    if (ulbId) {
      fetchZones();
      fetchCategories();
      fetchDepartment();
      fetchGrades();
      setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
      setBillNoOptions([{ value: "0", label: "-- Select Bill No --" }]);
    }
  }, [ulbId]);

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize={true}
      onSubmit={generateReport}
    >
      {({ values, setFieldValue, errors, touched, isSubmitting }) => {
        return (
          <Form>
            <Card className="shadow-sm border">
              <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Attendance Entry
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Category" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.category}
                      onValueChange={(v) => setFieldValue("category", v)}
                    >
                      <SelectTrigger className="w-full! h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Category --" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Zone" required />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.zone}
                      onValueChange={(v) => setFieldValue("zone", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- Select Zone --" />
                      </SelectTrigger>
                      <SelectContent>
                        {zoneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.zone && touched.zone && (
                      <span className="text-red-500 text-sm">{errors.zone}</span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Department" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.department}
                      onValueChange={(v) => handleDepartmentChange(v, setFieldValue)}
                    >
                      <SelectTrigger className="w-full! h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Department --" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Department" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.department}
                      onValueChange={(v) => handleDepartmentChange(v, setFieldValue)}
                    >
                      <SelectTrigger className="w-full! h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Department --" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                        <SelectContent>
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
                        <SelectContent>
                          {yearOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  

                  {showSubDept && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Sub Department" />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.subDepartment}
                        onValueChange={(v) => handleSubDepartmentChange(v, setFieldValue, values.department)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Sub Department --" />
                        </SelectTrigger>
                        <SelectContent>
                          {subDepartmentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {showBillNo && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Bill No." />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.billNo}
                        onValueChange={(v) => setFieldValue("billNo", v)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Bill No --" />
                        </SelectTrigger>
                        <SelectContent>
                          {billNoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Grade" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.grade}
                      onValueChange={(v) => setFieldValue("grade", v)}
                    >
                      <SelectTrigger className="w-full! h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Grade --" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {showFileFormat && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="File Format" />
                        <span>:</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {fileFormatOptions.map((option) => (
                          <div key={option.value} className="flex items-center gap-1">
                            <Input
                              type="radio"
                              name="fileFormat"
                              value={option.value}
                              checked={values.fileFormat === option.value}
                              onChange={() => setFieldValue("fileFormat", option.value)}
                              className="w-4 h-4 accent-purple-600"
                            />
                            <span className="font-medium text-gray-700 text-sm cursor-pointer">
                              {option.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Report Type" />
                      <span>:</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {reportTypeOptions.map((option) => (
                        <div key={option.value} className="flex items-center gap-1">
                          <Input
                            type="radio"
                            name="reportType"
                            value={option.value}
                            checked={values.reportType === option.value}
                            onChange={() => setFieldValue("reportType", option.value)}
                            className="w-4 h-4 accent-purple-600"
                          />
                          <span className="font-medium text-gray-700 text-sm cursor-pointer">
                            {option.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Employee ID" />
                      <span>:</span>
                    </div>
                    <Input
                      name="employeeCode"
                      value={values.employeeCode}
                      onChange={(e) => setFieldValue("employeeCode", e.target.value)}
                      type="text"
                      className="w-full h-9"
                      placeholder="Enter Employee ID"
                    />
                  </div> */}

                  {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Employee Name" className="whitespace-nowrap" />
                      <span>:</span>
                    </div>
                    <Input
                      name="employeeName"
                      value={values.employeeName}
                      onChange={(e) => setFieldValue("employeeName", e.target.value)}
                      type="text"
                      className="w-full h-9"
                      placeholder="Enter Employee Name"
                    />
                  </div> */}
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || loading}
                    className="bg-blue-800 hover:bg-blue-900"
                  >
                    {loading ? "Processing..." : "Process"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
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

export default FrmAttendanceEntry;