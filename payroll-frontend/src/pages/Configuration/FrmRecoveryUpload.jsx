import React, { useEffect, useState, useRef } from "react";
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

const SearchableSelect = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Search and select...",
  label = "",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <Label className="font-semibold whitespace-nowrap block mb-2">
          {label}
        </Label>
      )}
      
      <div
        className="w-full h-9 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between hover:border-blue-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-black" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="ml-2">
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              className="w-full h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              placeholder="--Select Option--"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                    value === option.value ? "bg-blue-100 text-blue-700" : ""
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FrmRecoveryUpload = () => {
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const token = user?.token;

  const [corporationOptions, setCorporationOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [deductionTypeOptions, setDeductionTypeOptions] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [defaultCorporationId, setDefaultCorporationId] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (ulbId && token) {
      showLoader();
      fetchAllData();
    } else {
      setIsPageLoading(false);
    }
  }, [ulbId, token]);
      
  const showLoader = () => {
    Swal.fire({
      title: 'Loading...',
      text: 'Please wait while data is being loaded',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };
  
  const hideLoader = () => {
    Swal.close();
    setIsPageLoading(false);
  };

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchCorporation(),
        fetchDepartments(),
        fetchEmployees(),
        fetchDeductionTypes(),
        fetchMonths(),
        fetchYears()
      ]);
      
      hideLoader();
    } catch (error) {
      console.error("Error loading initial data:", error);
      hideLoader();
      Swal.fire({
        title: 'Error',
        text: 'Failed to load initial data. Please refresh the page.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

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

        const defaultCorp = formatted.find(
          (item) => item.value === String(ulbId)
        );
        
        if (defaultCorp) {
          setDefaultCorporationId(defaultCorp.value);
        } else if (formatted.length > 0) {
          setDefaultCorporationId(formatted[0].value);
        }
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

  const fetchDeductionTypes = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmRecoveryUpload/deduction-type-list`,
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
          label: item.VAR_DEDUCTIONTYPE_NAME || item.var_deductiontype_name || item.deductionTypeName || `Deduction ${item.NUM_DEDUCTIONTYPE_ID || item.num_deductiontype_id}`,
          value: String(item.NUM_DEDUCTIONTYPE_ID || item.num_deductiontype_id || item.deductionTypeId),
        }));
        setDeductionTypeOptions(formatted);
      } else {
        console.log("No deduction type data received");
        setDeductionTypeOptions([]);
      }
    } catch (err) {
      console.error("Error fetching deduction types:", err);
      setDeductionTypeOptions([]);
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

  const initialValues = {
    corporation: "",
    department: "",
    subDepartment: "",
    employee: "",
    deductionType: "",
    recoveryAmount: "",
    isWorking: true,
    fromYear: "",
    toYear: "",
    fromMonth: "",
    toMonth: "",
    remark: "",
  };

  const handleSubmit = async (values, { resetForm, setFieldValue }) => {
    if (!values.department) {
      Swal.fire({
        title: 'Required Field',
        text: "Please select Department",
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.employee) {
      Swal.fire({
        title: 'Required Field',
        text: "Please select Employee",
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.recoveryAmount) {
      Swal.fire({
        title: 'Required Field',
        text: "Please enter Recovery Amount",
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.fromYear) {
      Swal.fire({
        title: 'Required Field',
        text: "Please select From Year",
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.toYear) {
      Swal.fire({
        title: 'Required Field',
        text: "Please select To Year",
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.fromMonth) {
      Swal.fire({
        title: 'Required Field',
        text: "Please select From Month",
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!values.toMonth) {
      Swal.fire({
        title: 'Required Field',
        text: "Please select To Month",
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      title: 'Saving Recovery Data...',
      text: 'Please wait while we save the recovery data',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      setLoading(true);

      const payload = {
        userId: user?.userId || localStorage.getItem("UserId"),
        empId: Number(values.employee),
        deptId: Number(values.department),
        subDeptId: values.subDepartment ? Number(values.subDepartment) : null,
        deductionId: values.deductionType ? Number(values.deductionType) : null,
        isWorking: values.isWorking ? 'Y' : 'N',
        recovAmount: Number(values.recoveryAmount),
        fromYear: values.fromYear,
        fromMonth: values.fromMonth,
        toYear: values.toYear,
        toMonth: values.toMonth,
        remark: values.remark || '',
        ulbId: Number(ulbId),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmRecoveryUpload/insert-recovery`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.close();

      const { success, errorCode, errorMsg } = res.data || {};
      const isSuccess = success === true || 
                        errorCode === -100 || 
                        errorCode === 9999 || 
                        errorCode === 0 ||
                        (errorMsg && (
                          errorMsg.includes("Inserted Successfully") ||
                          errorMsg.includes("Successfully") ||
                          errorMsg.includes("success") ||
                          errorMsg.includes("saved")
                        ));

      if (isSuccess) {
        Swal.fire({
          title: 'Success',
          text: errorMsg || "Recovery data saved successfully!",
          icon: 'success',
          confirmButtonText: 'OK'
        });

        const currentCorporation = values.corporation;
        resetForm();
        setFieldValue("corporation", currentCorporation);
        
      } else {
        throw new Error(errorMsg || res.data?.error || "Failed to save data");
      }
    } catch (error) {
      Swal.close();
      
      console.error("Submit Error", error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || error.message || "Failed to save recovery data",
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isPageLoading ? null : (
        <Formik 
          initialValues={initialValues} 
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ values, setFieldValue, resetForm }) => {
            useEffect(() => {
              if (defaultCorporationId && !values.corporation) {
                setFieldValue("corporation", defaultCorporationId);
              }
            }, [defaultCorporationId, values.corporation, setFieldValue]);

            return (
              <Form>
                <Card className="shadow-sm border">
                  <CardHeader className="border-b pb-3">
                    <CardTitle className="text-2xl font-semibold">
                      Recovery Upload
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
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

                      <div className="space-y-2">
                        <SearchableSelect
                          label="Employee Name"
                          options={employeeOptions}
                          value={values.employee}
                          onChange={(value) => {
                            setFieldValue("employee", value);
                          }}
                          placeholder="-- Select Option --"
                        />
                      </div>

                      
                      <div className="space-y-2">
                        <Label className="font-semibold whitespace-nowrap">
                          Deduction Type
                        </Label>
                        <Select
                          value={values.deductionType}
                          onValueChange={(value) => setFieldValue("deductionType", value)}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select Option --" />
                          </SelectTrigger>
                          <SelectContent>
                            {deductionTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

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
                          //placeholder="Enter recovery amount"
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

                      <div className="space-y-2">
                        <Label className="font-semibold whitespace-nowrap">
                          From Year
                        </Label>
                        <Select
                          value={values.fromYear}
                          onValueChange={(value) => setFieldValue("fromYear", value)}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select Option --" />
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

                      <div className="space-y-2">
                        <Label className="font-semibold whitespace-nowrap">
                          To Year
                        </Label>
                        <Select
                          value={values.toYear}
                          onValueChange={(value) => setFieldValue("toYear", value)}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select Option --" />
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

                      <div className="space-y-2">
                        <Label className="font-semibold whitespace-nowrap">
                          From Month
                        </Label>
                        <Select
                          value={values.fromMonth}
                          onValueChange={(value) => setFieldValue("fromMonth", value)}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select Option --" />
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

                      <div className="space-y-2">
                        <Label className="font-semibold whitespace-nowrap">
                          To Month
                        </Label>
                        <Select
                          value={values.toMonth}
                          onValueChange={(value) => setFieldValue("toMonth", value)}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select Option --" />
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

                      <div className="space-y-2">
                        <Label className="font-semibold whitespace-nowrap">
                          Remark
                        </Label>
                        <Input
                          name="remark"
                          value={values.remark || ''}
                          onChange={(e) => setFieldValue("remark", e.target.value)}
                          className="h-9"
                          //placeholder="Enter remark"
                        />
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
                          setFieldValue("corporation", defaultCorporationId);
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
                        onClick={() => window.location.href = "/HomePage/FrmHomePage"}
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
      )}
    </>
  );
};

export default FrmRecoveryUpload;