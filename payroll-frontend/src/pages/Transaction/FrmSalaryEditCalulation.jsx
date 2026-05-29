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
import ShadCNTable from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

const FrmSalaryEditCalulation = () => {
  const { authUser } = useAuth();
  const authToken = authUser?.token;
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const token = storedToken || authToken;
  const user = storedUser || authUser;
  const ulbId = user?.orgId || user?.ulbId;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
  const [billNoOptions, setBillNoOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSubDept, setShowSubDept] = useState(false);
  const [showBillNo, setShowBillNo] = useState(false);
  
  const [showSalaryEdit, setShowSalaryEdit] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [salaryEditLoading, setSalaryEditLoading] = useState(false);

  const [earningList, setEarningList] = useState([]);
  const [deductionList, setDeductionList] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({
    empId: "",
    empSequence: "",
    empName: "",
    designation: "",
    department: "",
    grade: "",
    totalDays: "",
    presentDays: "",
    withoutPay: "",
    medicalLeave: "",
    earnedLeave: "",
    halfDay: "",
    salaryDate: "",
  });
  const [currentSearchValues, setCurrentSearchValues] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  
  const monthOptions = [
    { value: "-1", label: "Select Month" },
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
    { value: "-1", label: "Select Year" },
    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
    { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
    { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() },
  ];

  const initialFormValues = {
    month: "-1",
    year: "-1",
    category: "-1",
    department: "-1",
    subDepartment: "-1",
    billNo: "0",
    employeeCode: "",
    employeeName: "",
  };
  
  const searchHeaders = [
    "Select",
    "Emp ID",
    "Name",
    "Grade",
    "Zone",
    "Department",
    "Basic",
    "Grade Pay",
    "Present Days",
  ];

  const searchKeyMapping = {
    Select: "select",
    "Emp ID": "employeeId",
    "Name": "employeeName",
    Grade: "grade",
    Zone: "zone",
    Department: "department",
    Basic: "basic",
    "Grade Pay": "gradePay",
    "Present Days": "presentDays",
  };

  const earningHeaders = ["Earning", "Amount"];
  const deductionHeaders = ["Deduction", "Amount"];
  
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
        setCategoryOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
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
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchSubDepartment = async (deptId) => {
    try {
      if (!ulbId || !deptId || deptId === "-1") {
        setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
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
        setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
      } else {
        setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
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
        setBillNoOptions([{ value: "0", label: "-- Select Bill No --" }, ...formatted]);
      } else {
        setBillNoOptions([{ value: "0", label: "-- Select Bill No --" }]);
      }
    } catch (err) {
      console.error("Error fetching bill numbers:", err);
      setBillNoOptions([{ value: "0", label: "-- Select Bill No --" }]);
    }
  };

  const formatDateForAPI = (year, month) => {
    const date = new Date(parseInt(year), parseInt(month), 0);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthAbbr = monthNames[parseInt(month) - 1];
    const formattedDate = `${day}-${monthAbbr}-${year}`;
    return formattedDate;
  };

  const handleSearch = async (values) => {
    if (values.category === "-1") {
      Swal.fire({ text: "Please Select Category.", confirmButtonColor: "#1e3a8a" });
      return;
    }
    if (values.year === "-1") {
      Swal.fire({ text: "Please Select Year.", confirmButtonColor: "#1e3a8a" });
      return;
    }
    if (values.month === "-1") {
      Swal.fire({ text: "Please Select Month.", confirmButtonColor: "#1e3a8a" });
      return;
    }

    setCurrentSearchValues({
        month: values.month,
        year: values.year,
        category: values.category,
        department: values.department,
        subDepartment: values.subDepartment,
        billNo: values.billNo,
        employeeCode: values.employeeCode,
        employeeName: values.employeeName,
    });

    setHasSearched(true);
    setLoading(true);
    try {
      if (!ulbId) {
        Swal.fire({ text: "ULB ID not found", confirmButtonColor: "#1e3a8a" });
        return;
      }

      const year = parseInt(values.year);
      const month = parseInt(values.month);
      const lastDate = new Date(year, month, 0);
      const formattedLastDate = formatDateForAPI(values.year, values.month);

      const payload = {
        categoryId: values.category !== "-1" ? values.category : null,
        deptId: values.department !== "-1" ? values.department : null,
        subdeptId: values.subDepartment !== "-1" ? values.subDepartment : null,
        billNo: values.billNo !== "0" ? values.billNo : null,
        searchEmpId: values.employeeCode || null,
        searchEmpName: values.employeeName || null,
        salaryDate: formattedLastDate,
        ulbid: Number(ulbId),
        month: Number(values.month),
        year: Number(values.year),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/employee-salary-list`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const mappedData = apiData.map((item) => ({
          NUM_SALARY_EMPID: item.NUM_SALARY_EMPID,
          VAR_EMPLOYEE_ENGNAME: item.VAR_EMPLOYEE_ENGNAME,
          VAR_GRADEMST_GRADENAME: item.VAR_GRADEMST_GRADENAME,
          ZONENAME: item.ZONENAME,
          VAR_DEPTMST_DEPTNAMEE: item.VAR_DEPTMST_DEPTNAMEE,
          NUM_SALARY_BASIC: item.NUM_SALARY_BASIC,
          NUM_SALARY_GRADEPAY: item.NUM_SALARY_GRADEPAY,
          NUM_SALARY_PRESENTDAYS: item.NUM_SALARY_PRESENTDAYS,
          EMPSEQUENCE: item.EMPSEQUENCE,
        }));

        console.log("mappedData :",mappedData)
        setFilteredData(mappedData);
      } else {
        setFilteredData([]);
        Swal.fire({
          text: "No records found",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Search Error:", error);
      setFilteredData([]);
      Swal.fire({
        text: error.response?.data?.message || "Error searching employees",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setHasSearched(false);
      setLoading(false);
    }
  };

  const fetchEmployeeSalaryData = async (empId, month, year, empSequence) => {
    setSalaryEditLoading(true);
    try {
        console.log("year  :", year);
        console.log("month  :", month);

      const formattedLastDate = formatDateForAPI(year, month);
      
      const empDetailRes = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/employee-salary-detail`,
        {
          empId: Number(empId),
          salaryDate: formattedLastDate,
          ulbid: Number(ulbId),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const empData = empDetailRes.data?.data?.data?.[0] || empDetailRes.data?.data?.[0] || {};
      
      setEmployeeDetails({
        empId: empData.NUM_SALARY_EMPID || empId,
        empSequence: empData.EMPSEQUENCE || empSequence || "",
        empName: empData.VAR_EMPLOYEE_ENGNAME || "",
        designation: empData.VAR_DESIGMST_DESIGNATIONNAME || "",
        department: empData.VAR_DEPTMST_DEPTNAMEE || "",
        grade: empData.VAR_GRADEMST_GRADENAME || "",
        totalDays: empData.TOTAL_DAYS || "",
        presentDays: empData.NUM_SALARY_PRESENTDAYS || "0",
        withoutPay: empData.WITHOUTPAY || "0",
        medicalLeave: empData.MEDICALLEAVE || "0",
        earnedLeave: empData.EARNEDLEAVE || "0",
        halfDay: empData.HALFDAY || "0",
        salaryDate: empData.SALDATE || formattedLastDate,
      });

      const earningRes = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/salary-earning`,
        {
          empId: Number(empId),
          salaryDate: formattedLastDate,
          ulbid: Number(ulbId),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const earnings = earningRes.data?.data?.data || earningRes.data?.data || [];
      setEarningList(earnings);

      const deductionRes = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/salary-deduction`,
        {
          empId: Number(empId),
          salaryDate: formattedLastDate,
          ulbid: Number(ulbId),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const deductions = deductionRes.data?.data?.data || deductionRes.data?.data || [];
      setDeductionList(deductions);

    } catch (error) {
      console.error("Error fetching salary details:", error);
      Swal.fire({
        text: error.response?.data?.message || "Error fetching employee salary details",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setSalaryEditLoading(false);
    }
  };

  const handleSelectEmployee = (row, searchValues) => {

    const month = currentSearchValues?.month;
    const year = currentSearchValues?.year;
    
    if (!month || month === "-1" || !year || year === "-1") {
        Swal.fire({
        text: "Please select valid Month and Year before editing salary",
        confirmButtonColor: "#1e3a8a",
        });
        return;
    }

    setSelectedEmployee(row);
    setSearchParams(searchValues);
    setShowSalaryEdit(true);
    fetchEmployeeSalaryData(
      row.NUM_SALARY_EMPID,
      searchValues.month,
      searchValues.year,
      row.EMPSEQUENCE
    );
  };

  const handleBackToSearch = () => {
    setShowSalaryEdit(false);
    setSelectedEmployee(null);
    setSearchParams(null);
    setEarningList([]);
    setDeductionList([]);
  };

  const calculateTotalEarnings = () => {
    let total = 0;
    earningList.forEach((item) => {
      total += parseFloat(item.NUM_SALARYDTL_AMOUNT) || 0;
    });
    return total;
  };

  const calculateTotalDeductions = () => {
    let total = 0;
    deductionList.forEach((item) => {
      total += parseFloat(item.NUM_SALARYDTL_AMOUNT) || 0;
    });
    return total;
  };

  const handleAmountChange = (index, value, type) => {
    if (type === "earning") {
      const updatedList = [...earningList];
      updatedList[index].NUM_SALARYDTL_AMOUNT = value;
      setEarningList(updatedList);
    } else {
      const updatedList = [...deductionList];
      updatedList[index].NUM_SALARYDTL_AMOUNT = value;
      setDeductionList(updatedList);
    }
  };

  const handleSaveSalary = async () => {
    setSalaryEditLoading(true);
    try {
      let paramStr = "";
      
      earningList.forEach((item) => {
        const amount = parseFloat(item.NUM_SALARYDTL_AMOUNT) || 0;
        if (amount > 0) {
          paramStr += `${amount}#${item.NUM_PAYHEADS_ID}$`;
        }
      });
      
      deductionList.forEach((item) => {
        const amount = parseFloat(item.NUM_SALARYDTL_AMOUNT) || 0;
        if (amount > 0) {
          paramStr += `${amount}#${item.NUM_PAYHEADS_ID}$`;
        }
      });
      
      if (paramStr.endsWith("$")) {
        paramStr = paramStr.slice(0, -1);
      }

      const saveData = {
        userId: user?.userId || user?.id || "ADMIN",
        date: employeeDetails.salaryDate,
        empid: Number(employeeDetails.empId),
        paramStr: paramStr,
        earnings: calculateTotalEarnings(),
        deduction: calculateTotalDeductions(),
        presentDays: parseInt(employeeDetails.presentDays) || 0,
        withoutPay: parseInt(employeeDetails.withoutPay) || 0,
        medicalLeave: parseInt(employeeDetails.medicalLeave) || 0,
        earnedLeave: parseInt(employeeDetails.earnedLeave) || 0,
        halfDay: parseInt(employeeDetails.halfDay) || 0,
        ulbId: Number(ulbId),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/save-salary`,
        saveData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success || res.data?.status === "success" || res.data?.data?.success) {
        Swal.fire({
          text: "Salary updated successfully!",
          icon: "success",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          handleBackToSearch();
          if (searchParams) {
            handleSearch(searchParams);
          }
        });
      } else {
        Swal.fire({
          text: res.data?.message || res.data?.data?.message || "Error saving salary",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Error saving salary:", error);
      Swal.fire({
        text: error.response?.data?.message || "Error saving salary details",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setSalaryEditLoading(false);
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
  
  const transformedSearchData = filteredData.map((row) => ({
    select: (
        <Button
        variant="link"
        size="sm"
        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
        onClick={() => handleSelectEmployee(row, currentSearchValues)}
        >
        Select
        </Button>
    ),
    employeeId: row.NUM_SALARY_EMPID || row.EMPSEQUENCE || "",
    employeeName: row.VAR_EMPLOYEE_ENGNAME || "",
    grade: row.VAR_GRADEMST_GRADENAME || "",
    zone: row.ZONENAME || "",
    department: row.VAR_DEPTMST_DEPTNAMEE || "",
    basic: row.NUM_SALARY_BASIC || "",
    gradePay: row.NUM_SALARY_GRADEPAY || "",
    presentDays: row.NUM_SALARY_PRESENTDAYS || "",
  }));

  const transformedEarningData = earningList.map((item, index) => ({
    earning: item.VAR_PAYHEADS_ENAME,
    amount: (
      <Input
        type="text"
        value={item.NUM_SALARYDTL_AMOUNT}
        onChange={(e) => handleAmountChange(index, e.target.value, "earning")}
        className="w-full text-right h-8"
        style={{ textAlign: "right" }}
      />
    ),
  }));

  const transformedDeductionData = deductionList.map((item, index) => ({
    deduction: item.VAR_PAYHEADS_ENAME,
    amount: (
      <Input
        type="text"
        value={item.NUM_SALARYDTL_AMOUNT}
        onChange={(e) => handleAmountChange(index, e.target.value, "deduction")}
        className="w-full text-right h-8"
        style={{ textAlign: "right" }}
      />
    ),
  }));

  useEffect(() => {
    if (ulbId) {
      if (ulbId === "590") {
        setShowSubDept(true);
        setShowBillNo(false);
      } 
      else if (ulbId === "770" || ulbId === "1750") {
        setShowSubDept(true);
        setShowBillNo(true);
      }
      else {
        setShowSubDept(false);
        setShowBillNo(false);
      }
    }
  }, [ulbId]);

  useEffect(() => {
    if (ulbId) {
      fetchCategories();
      fetchDepartment();
      setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
      setBillNoOptions([{ value: "0", label: "-- Select Bill No --" }]);
    }
  }, [ulbId]);

  if (showSalaryEdit) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="row">
          <div className="col-lg-12">
            <Card className="shadow-sm border">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Salary Edit
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4">
                {salaryEditLoading && !employeeDetails.empName ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Emp ID" />
                          <span>:</span>
                        </div>
                        <Input
                          value={employeeDetails.empId}
                          readOnly
                          className="w-full h-9 "
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Name" />
                          <span>:</span>
                        </div>
                        <Input
                          value={employeeDetails.empName}
                          readOnly
                          className="w-full h-9 "
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Designation" />
                          <span>:</span>
                        </div>
                        <Input
                          value={employeeDetails.designation}
                          readOnly
                          className="w-full h-9 "
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Department" />
                          <span>:</span>
                        </div>
                        <Input
                          value={employeeDetails.department}
                          readOnly
                          className="w-full h-9 "
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Grade" />
                          <span>:</span>
                        </div>
                        <Input
                          value={employeeDetails.grade}
                          readOnly
                          className="w-full h-9 "
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Total Days" />
                          <span>:</span>
                        </div>
                        <Input
                          value={employeeDetails.totalDays}
                          readOnly
                          className="w-full h-9 "
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Present Days" />
                          <span>:</span>
                        </div>
                        <Input
                          type="number"
                          value={employeeDetails.presentDays}
                          onChange={(e) =>
                            setEmployeeDetails({
                              ...employeeDetails,
                              presentDays: e.target.value,
                            })
                          }
                          className="w-full h-9"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Without Pay" />
                          <span>:</span>
                        </div>
                        <Input
                          type="number"
                          value={employeeDetails.withoutPay}
                          onChange={(e) =>
                            setEmployeeDetails({
                              ...employeeDetails,
                              withoutPay: e.target.value,
                            })
                          }
                          className="w-full h-9"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Medical Leave" />
                          <span>:</span>
                        </div>
                        <Input
                          type="number"
                          value={employeeDetails.medicalLeave}
                          onChange={(e) =>
                            setEmployeeDetails({
                              ...employeeDetails,
                              medicalLeave: e.target.value,
                            })
                          }
                          className="w-full h-9"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Earned Leave" />
                          <span>:</span>
                        </div>
                        <Input
                          type="number"
                          value={employeeDetails.earnedLeave}
                          onChange={(e) =>
                            setEmployeeDetails({
                              ...employeeDetails,
                              earnedLeave: e.target.value,
                            })
                          }
                          className="w-full h-9"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Half Day" />
                          <span>:</span>
                        </div>
                        <Input
                          type="number"
                          value={employeeDetails.halfDay}
                          onChange={(e) =>
                            setEmployeeDetails({
                              ...employeeDetails,
                              halfDay: e.target.value,
                            })
                          }
                          className="w-full h-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-md">Earnings</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <ShadCNTable
                            headers={earningHeaders}
                            data={transformedEarningData}
                            keyMapping={{
                              Earning: "earning",
                              Amount: "amount"
                            }}
                            pagination={false}
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-md">Deductions</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <ShadCNTable
                            headers={deductionHeaders}
                            data={transformedDeductionData}
                            keyMapping={{
                              Deduction: "deduction",
                              Amount: "amount"
                            }}
                            pagination={false}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Total Earning" />
                          <span>:</span>
                        </div>
                        <Input
                          value={calculateTotalEarnings().toFixed(2)}
                          readOnly
                          className="w-full h-9  text-right font-semibold"
                          style={{ textAlign: "right" }}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Total Deduction" />
                          <span>:</span>
                        </div>
                        <Input
                          value={calculateTotalDeductions().toFixed(2)}
                          readOnly
                          className="w-full h-9  text-right font-semibold"
                          style={{ textAlign: "right" }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                      <Button
                        onClick={handleSaveSalary}
                        disabled={salaryEditLoading}
                        className="bg-blue-800 hover:bg-blue-900"
                      >
                        {salaryEditLoading ? "Saving..." : "Submit"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToSearch}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize={true}
      onSubmit={handleSearch}
    >
      {({ values, setFieldValue, isSubmitting }) => {
        return (
          <Form>
            <Card className="shadow-sm border">
              <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Salary Edit
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Date" required />
                      <span>:</span>
                    </div>
                    <div className="flex gap-2 flex-1">
                      <Select
                        value={values.month}
                        onValueChange={(v) => setFieldValue("month", v)}
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

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Category" required />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.category}
                      onValueChange={(v) => setFieldValue("category", v)}
                    >
                      <SelectTrigger className="w-full h-9">
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

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Department" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.department}
                      onValueChange={(v) => handleDepartmentChange(v, setFieldValue)}
                    >
                      <SelectTrigger className="w-full h-9">
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

                  {showSubDept && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Bill No." />
                        <span className="text-red-500">*</span>
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

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
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
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Employee Name" className="sm: whitespace-nowrap" />
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
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-2">
                  <Button type="submit" disabled={isSubmitting || loading}>
                    {loading ? "Searching..." : "Search"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/HomePage/FrmHomePage")}
                  >
                    Close
                  </Button>
                </div>

                <div className="pt-4">
                  {loading && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      Loading...
                    </div>
                  )}

                  {!loading && filteredData.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <ShadCNTable
                        headers={searchHeaders}
                        data={transformedSearchData}
                        keyMapping={searchKeyMapping}
                        pagination={true}
                        rowsPerPage={10}
                      />
                    </div>
                  )}

                  {hasSearched && !loading && filteredData.length === 0 && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No records found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmSalaryEditCalulation;