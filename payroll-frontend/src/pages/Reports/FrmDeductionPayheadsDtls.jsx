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

const FrmDeductionPayheadsDtls = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const [departments, setDepartments] = useState([]);
  const [payheads, setPayheads] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Month options
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

  // Initial form values
  const initialFormValues = {
    deptId: "",
    payheadId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };

  const validateForm = (values) => {
    const errors = {};
    if (!values.deptId || values.deptId === "0" || values.deptId === "-1") {
      errors.deptId = "Department is required";
    }
    if (!values.payheadId || values.payheadId === "0" || values.payheadId === "-1") {
      errors.payheadId = "Deduction Payhead is required";
    }
    return errors;
  };

  useEffect(() => {
    loadYears();
    loadDepartments();
    loadPayheads();
  }, []);

  const loadYears = () => {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let i = 0; i < 10; i++) {
      yearOptions.push(currentYear - i);
    }
    setYears(yearOptions);
  };

  const loadDepartments = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmDeductionPayheadsDtls/departments`,
        { ulbId: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.data.success) {
        setDepartments(response.data.data.data);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const loadPayheads = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmDeductionPayheadsDtls/payheads-list`,
        { ulbId: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.data.success) {
        setPayheads(response.data.data.data);
      }
    } catch (error) {
      console.error("Error loading payheads:", error);
    }
  };

  const handleSearch = async (values, { setSubmitting, setErrors }) => {
    const errors = validateForm(values);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      setLoading(true);
      const lastDate = new Date(values.year, values.month, 0);
      const salDate = lastDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).toUpperCase();

      const response = await axios.post(
        `${BASE_URL}/api/FrmDeductionheadsDtls/search-deductions`,
        {
          ulbId: ulbId || user?.ulbId,
          deptId: values.deptId,
          payheadId: values.payheadId,
          salDate: salDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReportData(response.data);
        setHasSearched(true);
        {/*Swal.fire({
          icon: "success",
          title: "Success",
          text: `Found ${response.data.count} records`,
          timer: 2000,
          showConfirmButton: false,
        });*/}
      }
    } catch (error) {
      console.error("Error processing report:", error);
      Swal.fire({
        icon: "error",
        title: "No Records Found",
        text: error.response?.data?.message,
      });
      setReportData(null);
      setHasSearched(true);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleReset = (resetForm) => {
    resetForm();
    setReportData(null);
    setHasSearched(false);
  };

  const generatePDF = async (values) => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Please search for records first",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/FrmDeductionPayheadsDtls/generate-pdf`,
        {
          ulbId: ulbId || user?.ulbId,
          deptId: values.deptId,
          payheadId: values.payheadId,
          month: values.month,
          year: values.year,
          reportData: reportData.data,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        window.open(response.data.pdfUrl, "_blank");
        Swal.fire({
          icon: "success",
          title: "PDF Generated",
          text: "PDF generated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate PDF",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return months[month - 1];
  };

  const calculateGrandTotal = () => {
    if (!reportData || !reportData.data) return 0;
    return reportData.data.reduce(
      (sum, record) => sum + parseFloat(record.AMOUNT || 0),
      0
    );
  };

  // Table headers
  const getHeaders = () => {
    return [
      "Sr No",
      "EMP ID",
      "Employee Name",
      "Deduction No",
      "Amount (₹)",
      "Salary Date",
      "Department",
    ];
  };

  // Key mapping for table
  const keyMapping = {
    "Sr No": "srNo",
    "EMP ID": "empid",
    "Employee Name": "engname",
    "Deduction No": "deductionno",
    "Amount (₹)": "amount",
    "Salary Date": "saldate",
    "Department": "deptnamee",
  };

  // Prepare table rows
  const tableRows = reportData?.data?.map((record, index) => ({
    srNo: index + 1,
    empid: record.EMPID,
    engname: record.ENGNAME,
    deductionno: record.DEDUCTIONNO || "-",
    amount: parseFloat(record.AMOUNT || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    saldate: record.SALDATE,
    deptnamee: record.DEPTNAMEE,
  }));

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
                    Deduction Payheads Details Report
                  </CardTitle>
                  {reportData && reportData.data && reportData.data.length > 0 && (
                    <Button 
                      type="button" 
                      onClick={() => generatePDF(values)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      Download PDF
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Month" />
                      </div>
                      <Select
                        value={values.month.toString()}
                        onValueChange={(v) => setFieldValue("month", parseInt(v))}
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

                    {/* Year */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Year" />
                      </div>
                      <Select
                        value={values.year.toString()}
                        onValueChange={(v) => setFieldValue("year", parseInt(v))}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Year --" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Department" />
                      </div>
                      <Select
                        value={String(values.deptId || "")}
                        onValueChange={(v) => 
                          setFieldValue("deptId", v)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Department --" />
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

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Deduction Payhead" />
                      </div>
                      <Select
                        value={values.payheadId || ""}
                        onValueChange={(v) => setFieldValue("payheadId", v)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Payhead --" />
                        </SelectTrigger>
                        <SelectContent>
                          {payheads.map((payhead) => (
                            <SelectItem key={payhead.NUM_PAYHEADS_ID} value={String(payhead.NUM_PAYHEADS_ID)}>
                              {payhead.VAR_PAYHEADS_ENAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button type="submit" disabled={isSubmitting || loading}>
                      {loading ? "Processing..." : "Process"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => handleReset(resetForm)}
                    >
                      Reset
                    </Button>
                  </div>

                  <div>
                    {loading && (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <div className="mt-2">Loading...</div>
                      </div>
                    )}

                    {!loading && reportData && reportData.data && reportData.data.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                          <div className="text-sm">
                            <span className="font-semibold">Total Records:</span> {reportData.data.length}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold">Month:</span> {getMonthName(values.month)} - {values.year}
                          </div>
                          <div className="text-sm font-semibold">
                            <span className="font-semibold">Grand Total:</span> ₹ {calculateGrandTotal().toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
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
                      </div>
                    )}

                    {hasSearched && !loading && (!reportData || !reportData.data || reportData.data.length === 0) && (
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

export default FrmDeductionPayheadsDtls;