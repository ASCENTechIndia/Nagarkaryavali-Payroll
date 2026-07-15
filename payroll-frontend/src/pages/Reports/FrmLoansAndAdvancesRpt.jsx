import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { motion } from "framer-motion";

const FrmLoansAndAdvancesRpt = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;

  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const initialFormValues = {
    category: "-1",
    zone: "-1",
    department: "-1",
    employeeId: "0",
  };

  const isSpecialUlb = () => {
    return ulbId === "770" || ulbId === "1750";
  };

  // CATEGORY
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmEmployeeMstList/employee-category-list`,
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.VAR_CATEGORY_NAME,
        value: String(item.NUM_CATEGORY_ID),
      }));

      setCategoryOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // ZONE
  const fetchZones = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.ZONENAME,
        value: String(item.ZONEID),
      }));

      setZoneOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
    } catch (err) {
      console.error("Error fetching zones:", err);
    }
  };

  // DEPARTMENT
  const fetchDepartment = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.DEPTNAME,
        value: String(item.DEPTID),
      }));

      setDepartmentOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // EMPLOYEE LIST (with department filter)
  const fetchEmployees = async (deptId = null) => {
    try {
      if (!ulbId) return;

      const payload = {
        ulbid: Number(ulbId),
        deptId: deptId && deptId !== "-1" ? deptId : null,
      };

      const res = await axios.post(
       `${BASE_URL}/api/FrmEmployeeMstList/employee-search`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.EMPNAME,
        value: String(item.NUM_EMPLOYEE_EMPID),
      }));

      setEmployeeOptions([{ value: "0", label: "-- ALL --" }, ...formatted]);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Handle department change to filter employees
  const handleDepartmentChange = async (deptId, setFieldValue) => {
    setFieldValue("department", deptId);
    setFieldValue("employeeId", "0"); // Reset employee selection
    
    if (deptId && deptId !== "-1") {
      await fetchEmployees(deptId);
    } else {
      await fetchEmployees(null);
    }
  };

  // SEARCH
  const handleSearch = async (values) => {
    setHasSearched(true);
    setLoading(true);

    try {
      const payload = {
        ulbid: Number(ulbId),
        categoryId: values.category !== "-1" ? Number(values.category) : null,
        zoneId: values.zone !== "-1" ? Number(values.zone) : null,
        deptId: values.department !== "-1" ? Number(values.department) : null,
        employeeId: values.employeeId !== "0" ? Number(values.employeeId) : null,
      };

      const res = await axios.post(
        `${BASE_URL}/api/LoansAndAdvancesRpt/loans-advances-search`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      setFilteredData(apiData || []);

      if (apiData.length === 0) {
        Swal.fire({
          icon: "info",
          text: "No records found",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (err) {
      console.error("Error searching loans:", err);
      Swal.fire({
        icon: "error",
        text: "Error fetching data. Please try again.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ulbId) {
      fetchCategories();
      fetchZones();
      fetchDepartment();
      fetchEmployees(null);
    }
  }, [ulbId]);

  const getHeaders = () => {
    const baseHeaders = [
      "Bank Loan ID",
      "Emp ID",
      "Employee Name",
      "Pay Head",
      "Bank Acc No",
      "Loan Amount",
      "Installment Amt",
      "Interest Rate",
      "Active",
      "Remark",
      "Interest Amount",
      "Loan Start Date",
      "Loan End Date",
      "Category",
      "Zone",
      "Department",
      "Branch ID",
      "Branch Name",
      "Bank Name",
      "Slip No",
      "Bill No",
    ];

    if (isSpecialUlb()) {
      return baseHeaders;
    } else {
      return baseHeaders;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-GB");
    } catch {
      return dateString;
    }
  };

  const tableRows = filteredData.map((row) => ({
    bankLoanId: row.BANKLOANID,
    empId: row.EMPID,
    employeeName: row.EMPNAME,
    payHead: row.PAYHEADSNAME,
    bankAccNo: row.BANKACCNO,
    loanAmount: row.LOANAMT?.toLocaleString(),
    installmentAmt: row.INSTALLAMT?.toLocaleString(),
    interestRate: row.BANKITRSTRATE,
    active: row.ACTIVE === "Y" ? "Active" : row.ACTIVE === "N" ? "Inactive" : row.ACTIVE,
    remark: row.BREMARK,
    interestAmount: row.BANKINTERESTAMT?.toLocaleString(),
    loanStartDate: formatDate(row.LOANSTARTDATE),
    loanEndDate: formatDate(row.LOANENDDATE),
    category: row.VAR_CATEGORY_NAME,
    zone: row.VAR_ZONE_NAME,
    department: row.VAR_DEPTMST_DEPTNAMEE,
    branchId: row.BRANCHID,
    branchName: row.BRANCHNAME,
    bankName: row.BANKNAME,
    slipNo: row.SLIPNO,
    billNo: row.BILLNO,
  }));

  const keyMapping = {
    bankLoanId: "Bank Loan ID",
    empId: "Emp ID",
    employeeName: "Employee Name",
    payHead: "Pay Head",
    bankAccNo: "Bank Acc No",
    loanAmount: "Loan Amount",
    installmentAmt: "Installment Amt",
    interestRate: "Interest Rate",
    active: "Active",
    remark: "Remark",
    interestAmount: "Interest Amount",
    loanStartDate: "Loan Start Date",
    loanEndDate: "Loan End Date",
    category: "Category",
    zone: "Zone",
    department: "Department",
    branchId: "Branch ID",
    branchName: "Branch Name",
    bankName: "Bank Name",
    slipNo: "Slip No",
    billNo: "Bill No",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Formik
        initialValues={initialFormValues}
        enableReinitialize={true}
        onSubmit={handleSearch}
      >
        {({ values, setFieldValue, isSubmitting, resetForm }) => {
          return (
            <Form>
              <Card className="shadow-sm border">
                <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <CardTitle className="text-lg font-semibold">
                    Loans And Advances Report
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Category */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Category" />
                      </div>
                      <Select
                        value={values.category}
                        onValueChange={(v) => setFieldValue("category", v)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- ALL --" />
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

                    {/* Zone */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Zone" />
                      </div>
                      <Select
                        value={values.zone}
                        onValueChange={(v) => setFieldValue("zone", v)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- ALL --" />
                        </SelectTrigger>
                        <SelectContent>
                          {zoneOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Department" />
                      </div>
                      <Select
                        value={values.department}
                        onValueChange={(v) => handleDepartmentChange(v, setFieldValue)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- ALL --" />
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

                    {/* Employee */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Employee" />
                      </div>
                      <Select
                        value={values.employeeId}
                        onValueChange={(v) => setFieldValue("employeeId", v)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- ALL --" />
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
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button type="submit" disabled={isSubmitting || loading}>
                      {loading ? "Searching..." : "Search"}
                    </Button>
                    {/*
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setFilteredData([]);
                        setHasSearched(false);
                        fetchEmployees(null);
                      }}
                    >
                      Reset
                    </Button>*/}
                  </div>

                  <div>
                    {loading && (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <div className="mt-2">Loading...</div>
                      </div>
                    )}

                    {!loading && filteredData.length > 0 && (
                      <div className="overflow-x-auto">
                        <ShadCNTable
                          headers={getHeaders()}
                          data={tableRows}
                          keyMapping={keyMapping}
                          pagination={true}
                          rowsPerPage={10}
                          className="min-w-full"
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
    </motion.div>
  );
};

export default FrmLoansAndAdvancesRpt;