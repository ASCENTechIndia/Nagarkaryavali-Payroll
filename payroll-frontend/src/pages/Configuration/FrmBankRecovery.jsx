import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
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
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmBankRecovery = () => {
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const token = user?.token;

  const [corporationOptions, setCorporationOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recoveryList, setRecoveryList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const DEFAULT_CORPORATION_ID = "870";

  const tableHeaders = [
    "Sr. No", 
    "ID",
    "Employee Name",
    "Bank Name",
    "Branch Name",
    "Amount",
    "Is Working",
    "From Month",
    "To Month",
    "From Year",
    "To Year"
  ];

  useEffect(() => {
    if (ulbId && token) {
      fetchCorporation();
      fetchDepartments();
      setSubDepartmentOptions([]);
      fetchEmployees();
      setBranchOptions([]);
      fetchMonths();
      fetchYears();
      fetchBanks();
    }
  }, [ulbId, token]);

  const fetchCorporation = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/Branchconfi/corporationlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.DISPLAY_TEXT || item.CORPORATION_NAME || item.corporationName || item.name,
          value: String(item.ID_VALUE || item.CORPORATION_ID || item.corporationId || item.id),
        }));
        setCorporationOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching corporation:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/LeaveApplication/departmentlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      let apiData = [];
      if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        apiData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        apiData = res.data.data;
      } else if (Array.isArray(res.data)) {
        apiData = res.data;
      }
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.DISPLAY_TEXT || item.display_text || item.DEPTNAME || item.deptname || `Department ${item.ID_VALUE || item.id_value}`,
          value: String(item.ID_VALUE || item.id_value || item.DEPTID || item.deptid),
        }));
        setDepartmentOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchSubDepartments = async (departmentId) => {
    if (!departmentId) {
      setSubDepartmentOptions([]);
      return;
    }
    
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/subdepartment-list`,
        { 
          deptId: Number(departmentId), 
          ulbid: Number(ulbId)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      let apiData = [];
      if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        apiData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        apiData = res.data.data;
      } else if (Array.isArray(res.data)) {
        apiData = res.data;
      }
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_DEPTSUB_SDEPTNAMEE || item.var_deptsub_sdeptnamee || item.SUB_DEPT_NAME || item.subDeptName || `Sub Dept ${item.NUM_DEPTSUB_ID || item.num_deptsub_id}`,
          value: String(item.NUM_DEPTSUB_ID || item.num_deptsub_id || ""),
        }));
        setSubDepartmentOptions(formatted);
      } else {
        setSubDepartmentOptions([]);
      }
    } catch (err) {
      console.error("Error fetching sub-departments:", err);
      setSubDepartmentOptions([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/LeaveApplication/employeelist`,
        { 
          ulbId: Number(ulbId)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      let apiData = [];
      if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        apiData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        apiData = res.data.data;
      } else if (Array.isArray(res.data)) {
        apiData = res.data;
      }
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.EMPNAME || item.EmpName || `Employee ${item.NUM_EMPLOYEE_EMPID || item.num_employee_empid}`,
          value: String(item.NUM_EMPLOYEE_EMPID || item.num_employee_empid || ""),
        }));
        setEmployeeOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/Branchlist/banklistBnh`,
        { 
          ulbid: Number(ulbId)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      let apiData = [];
      if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        apiData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        apiData = res.data.data;
      } else if (Array.isArray(res.data)) {
        apiData = res.data;
      }
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.BANKNAME || item.bankname || "Unknown Bank",
          value: String(item.BANKID || item.bankid || ""),
        }));
        setBankOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching banks:", err);
    }
  };

  const fetchBranches = async (bankId) => {
    if (!bankId) {
      setBranchOptions([]);
      return;
    }
    
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstNewTest/bank-branch-list`,
        { 
          ulbid: Number(ulbId),
          bankid: Number(bankId)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      let apiData = [];
      if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        apiData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        apiData = res.data.data;
      } else if (Array.isArray(res.data)) {
        apiData = res.data;
      }
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.BRANCHNAME || item.branchname || item.BRANCH_NAME || item.branchName || `Branch ${item.BRANCHID || item.branchid}`,
          value: String(item.BRANCHID || item.branchid || item.BRANCH_ID || item.branchId || ""),
        }));
        setBranchOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchMonths = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmBankRecovery/month-list`,
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      let apiData = [];
      if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        apiData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        apiData = res.data.data;
      } else if (Array.isArray(res.data)) {
        apiData = res.data;
      }
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_MONTH_NAME || item.var_month_name || item.monthName || `Month ${item.NUM_MONTH_ID || item.num_month_id}`,
          value: String(item.NUM_MONTH_ID || item.num_month_id || item.monthId),
        }));
        setMonthOptions(formatted);
      } else {
        console.log("No month data received");
        setMonthOptions([]);
      }
    } catch (err) {
      console.error("Error fetching months:", err);
      setMonthOptions([]);
    }
  };

  const fetchYears = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmBankRecovery/year-list`,
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      let apiData = [];
      if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        apiData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        apiData = res.data.data;
      } else if (Array.isArray(res.data)) {
        apiData = res.data;
      }
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: String(item.VAR_YEAR || item.var_year || item.year || ''),
          value: String(item.NUM_YEAR_ID || item.num_year_id || item.yearId || item.VAR_YEAR || item.var_year || item.year),
        }));
        setYearOptions(formatted);
      } else {
        console.log("No year data received");
        setYearOptions([]);
      }
    } catch (err) {
      console.error("Error fetching years:", err);
      setYearOptions([]);
    }
  };

  const fetchBankRecoveryList = async (empId) => {
    if (!empId) {
      setRecoveryList([]);
      return;
    }

    try {
      setIsLoadingList(true);
      setCurrentPage(1);
      
      const response = await axios.post(
        `${BASE_URL}/api/FrmBankRecovery/bank-recovery-list`,
        {
          empId: Number(empId),
          ulbId: Number(ulbId)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let data = [];
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && typeof response.data.data === 'object') {
        data = Object.values(response.data.data);
      }

      const formattedData = data.map((item, index) => {
        const amount = item.NUM_BANKRECOVER_AMOUNT || 0;
        
        return {
          sno: index + 1,
          NUM_BANKRECOVER_ID: item.NUM_BANKRECOVER_ID || '-',
          EMPLOYEE_NAME: item.EMPLOYEE_NAME || item.VAR_EMPLOYEE_ENGNAME || '-',
          BANK_NAME: item.BANK_NAME || item.VAR_BANKMST_BANKNAME || '-',
          BRANCH_NAME: item.BRANCH_NAME || item.VAR_BRANCHMST_BRANCHNAME || '-',
          NUM_BANKRECOVER_AMOUNT: `₹${Number(amount).toLocaleString('en-IN')}`,
          ISWORKING: item.ISWORKING || item.VAR_BANKRECOVER_ISWORKING||'No',
          FROMMONTH: item.FROMMONTH || '-',
          TOMONTH: item.TOMONTH || '-',
          FROMYEAR: item.FROMYEAR || '-',
          TOYEAR: item.TOYEAR || '-'
        };
      });

      setRecoveryList(formattedData);
      
      if (formattedData.length === 0) {
        Swal.fire({
          title: 'No Records Found',
          text: 'No recovery records found for this employee',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Error fetching bank recovery list:", error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || "Failed to fetch recovery list",
        confirmButtonText: 'OK'
      });
      setRecoveryList([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  const initialValues = {
    corporation: DEFAULT_CORPORATION_ID,
    department: "",
    subDepartment: "",
    employee: "",
    bank: "",
    branch: "",
    recoveryAmount: "",
    isWorking: true,
    fromYear: "",
    toYear: "",
    fromMonth: "",
    toMonth: "",
  };

  const handleSubmit = async (values) => {
    if (!values.department) {
      Swal.fire({
        title: 'Enter the required values',
        text: "Please select Department",
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.employee) {
      Swal.fire({
        title: 'Enter the required values',
        text: "Please select Employee",
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.bank) {
      Swal.fire({
        title: 'Enter the required values',
        text: "Please select Bank",
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.recoveryAmount) {
      Swal.fire({
        title: 'Enter the required values',
        text: "Please enter Recovery Amount",
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.fromYear) {
      Swal.fire({
        title: 'Enter the required values',
        text: "Please select From Year",
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.toYear) {
      Swal.fire({
        title: 'Enter the required values',
        text: "Please select To Year",
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.fromMonth) {
      Swal.fire({
        title: 'Enter the required values',
        text: "Please select From Month",
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.toMonth) {
      Swal.fire({
        title: 'Enter the required values',
        text: "Please select To Month",
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        userId: user?.userId || localStorage.getItem("UserId"),
        empId: Number(values.employee),
        deptId: Number(values.department),
        subDeptId: values.subDepartment ? Number(values.subDepartment) : null,
        isWorking: values.isWorking ? 'Y' : 'N',
        recovAmount: Number(values.recoveryAmount),
        fromYear: values.fromYear,
        fromMonth: values.fromMonth,
        toYear: values.toYear,
        toMonth: values.toMonth,
        bankId: Number(values.bank),
        branchId: values.branch ? Number(values.branch) : null,
        ulbId: Number(ulbId),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmBankRecovery/save-bank-recovery`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.ok === false && res.data?.error) {
        if (res.data.error.includes("Inserted Successfully") || 
            res.data.error.includes("Successfully") ||
            res.data.error.includes("success") ||
            res.data.error.includes("saved")) {
          
          Swal.fire({
            title: 'Success',
            text: res.data.error,
            confirmButtonText: 'OK'
          });
          
          if (values.employee) {
            fetchBankRecoveryList(values.employee);
          }
        } else {
          throw new Error(res.data.error);
        }
      } else if (res.data?.success === true) {
        Swal.fire({
          title: 'Success',
          text: "Bank recovery data saved successfully!",
          confirmButtonText: 'OK'
        });
        
        if (values.employee) {
          fetchBankRecoveryList(values.employee);
        }
      } else {
        throw new Error(res.data?.message || res.data?.error || "Failed to save data");
      }
    } catch (error) {
      console.error("Submit Error", error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || error.message || "Failed to save bank recovery data",
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const shouldShowTable = values => {
    return values.corporation && values.department && values.employee;
  };

  const totalPages = Math.ceil(recoveryList.length / rowsPerPage);
  const paginatedData = recoveryList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue, resetForm }) => (
        <Form>
          <Card className="shadow-sm border">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-2xl font-semibold">
                Employee Policy Form
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Corporation */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    Corporation Name
                  </Label>
                  <Select
                    value={values.corporation}
                    onValueChange={(value) => {
                      setFieldValue("corporation", value);
                      setFieldValue("employee", "");
                      setFieldValue("department", "");
                      setRecoveryList([]);
                    }}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {corporationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    Department
                  </Label>
                  <Select
                    value={values.department}
                    onValueChange={(value) => {
                      setFieldValue("department", value);
                      setFieldValue("subDepartment", "");
                      setFieldValue("employee", "");
                      setFieldValue("bank", "");
                      setFieldValue("branch", "");
                      setBranchOptions([]);
                      setRecoveryList([]);
                      fetchSubDepartments(value);
                    }}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
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

                {/* Sub Department */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    Sub-Department
                  </Label>
                  <Select
                    value={values.subDepartment}
                    onValueChange={(value) => {
                      setFieldValue("subDepartment", value);
                    }}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
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

                {/* Employee */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    Employee Name
                  </Label>
                  <Select
                    value={values.employee}
                    onValueChange={(value) => {
                      setFieldValue("employee", value);
                      setFieldValue("bank", "");
                      setFieldValue("branch", "");
                      setBranchOptions([]);
                      if (value && values.corporation && values.department) {
                        fetchBankRecoveryList(value);
                      } else {
                        setRecoveryList([]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bank */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    Bank Name
                  </Label>
                  <Select
                    value={values.bank}
                    onValueChange={(value) => {
                      setFieldValue("bank", value);
                      setFieldValue("branch", "");
                      if (value) {
                        fetchBranches(value);
                      } else {
                        setBranchOptions([]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    Branch Name
                  </Label>
                  <Select
                    value={values.branch}
                    onValueChange={(value) => setFieldValue("branch", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Recovery Amount */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    Recovery Amount
                  </Label>
                  <Input
                    name="recoveryAmount"
                    value={values.recoveryAmount}
                    onChange={(e) => setFieldValue("recoveryAmount", e.target.value)}
                    type="number"
                    className="h-9"
                    placeholder="Enter recovery amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    Is Working?
                  </Label>
                  <div className="flex items-center h-9">
                    <Input
                      type="checkbox"
                      checked={values.isWorking}
                      onChange={(e) => setFieldValue("isWorking", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                </div>

                {/* From Year */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    From Year
                  </Label>
                  <Select
                    value={values.fromYear}
                    onValueChange={(value) => setFieldValue("fromYear", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Year --" />
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

                {/* To Year */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    To Year
                  </Label>
                  <Select
                    value={values.toYear}
                    onValueChange={(value) => setFieldValue("toYear", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Year --" />
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

                {/* From Month */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    From Month
                  </Label>
                  <Select
                    value={values.fromMonth}
                    onValueChange={(value) => setFieldValue("fromMonth", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Month --" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To Month */}
                <div className="space-y-2">
                  <Label className="font-semibold whitespace-nowrap">
                    To Month
                  </Label>
                  <Select
                    value={values.toMonth}
                    onValueChange={(value) => setFieldValue("toMonth", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Month --" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-8 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Accumulation"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    resetForm();
                    setSubDepartmentOptions([]);
                    setEmployeeOptions([]);
                    setBankOptions([]);
                    setBranchOptions([]);
                    setRecoveryList([]);
                    setFieldValue("corporation", DEFAULT_CORPORATION_ID);
                    fetchBanks();
                    fetchEmployees();
                  }}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Reset
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-200 text-black hover:bg-gray-300"
                  path="/"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {shouldShowTable(values) && recoveryList.length > 0 && (
            <Card className="shadow-sm border mt-6">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-xl font-semibold">Bank Recovery List</CardTitle>
                {isLoadingList && (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-[#083c76] text-white">
                        {tableHeaders.map((header, index) => (
                          <th key={index} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2">{row.sno}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.NUM_BANKRECOVER_ID}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.EMPLOYEE_NAME}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.BANK_NAME}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.BRANCH_NAME}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{row.NUM_BANKRECOVER_AMOUNT}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.ISWORKING}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.FROMMONTH}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.TOMONTH}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.FROMYEAR}</td>
                          <td className="border border-gray-300 px-4 py-2">{row.TOYEAR}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default FrmBankRecovery;