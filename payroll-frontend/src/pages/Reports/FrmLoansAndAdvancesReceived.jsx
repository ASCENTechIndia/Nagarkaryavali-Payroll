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
import { DatePicker } from "@/components/ui/calendar";

const FrmLoansAndAdvancesReceived = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [payHeadsOptions, setPayHeadsOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const isSpecialUlb = () => {
    return ulbId === "770" || ulbId === "1750";
  };
  
  const formatDateToDDMMYYYY = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Get today's date at start of day to avoid time issues
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const initialFormValues = {
    fromDate: getTodayDate(),
    payHeadId: "0",
    empStatus: "-1",
  };

  // Fetch Pay Heads
  const fetchPayHeads = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmLoansAndAdvancesReceived/payheads-list`,
        { ulbId: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.VAR_PAYHEADS_ENAME,
        value: String(item.NUM_PAYHEADS_ID),
      }));

      setPayHeadsOptions([{ value: "0", label: "-- SELECT PAYHEAD --" }, ...formatted]);
    } catch (err) {
      console.error("Error fetching payheads:", err);
      Swal.fire({
        icon: "error",
        text: "Error fetching payheads list",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  // Search Loans and Advances AND Generate PDF
  const handleSearchAndGeneratePDF = async (values) => {
    if (values.payHeadId === "0") {
      Swal.fire({
        icon: "warning",
        text: "Please select a PayHead",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setHasSearched(true);
    setLoading(true);
    setPdfLoading(true);

    try {
      const formattedDate = formatDateToDDMMYYYY(values.fromDate);
      
      const payload = {
        ulbId: Number(ulbId),
        payHeadId: values.payHeadId !== "0" ? Number(values.payHeadId) : null,
        empStatus: isSpecialUlb() && values.empStatus !== "-1" ? values.empStatus : null,
        fromDate: formattedDate,
      };

      // First, search for data
      const searchRes = await axios.post(
        `${BASE_URL}/api/FrmLoansAndAdvancesReceived/search-loans-advances`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = searchRes.data?.data?.data || searchRes.data?.data || [];
      setFilteredData(apiData || []);

      if (apiData.length === 0) {
        Swal.fire({
          icon: "info",
          text: "No records found",
          confirmButtonColor: "#3085d6",
        });
        setLoading(false);
        setPdfLoading(false);
        return;
      }

      // Then generate PDF
      const pdfRes = await axios.post(
        `${BASE_URL}/api/FrmLoansAndAdvancesReceived/generate-pdf`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (pdfRes.data.success && pdfRes.data.pdfUrl) {
        // Open PDF in new tab
        window.open(pdfRes.data.pdfUrl, "_blank");
        
        Swal.fire({
          icon: "success",
          text: `Found ${apiData.length} records. PDF generated successfully!`,
          confirmButtonColor: "#3085d6",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: "error",
        text: err.response?.data?.message || "Error processing request. Please try again.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
      setPdfLoading(false);
    }
  };

  const handleCancel = (resetForm) => {
    resetForm();
    setFilteredData([]);
    setHasSearched(false);
    Swal.fire({
      icon: "info",
      text: "Form has been reset",
      confirmButtonColor: "#3085d6",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    if (ulbId) {
      fetchPayHeads();
    }
  }, [ulbId]);

  // Prepare table rows
  const tableRows = filteredData.map((row, index) => ({
    srNo: index + 1,
    empId: row.EMPID,
    employeeName: row.ENGNAME,
    bankName: row.BANKNAME || "-",
    branchName: row.BRANCHNAME || "-",
    ifscCode: row.IFSCCODE || "-",
    bankAccountNo: row.BANKACCNO || "-",
    deductionAmount: row.DEDUCTION_AMT?.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || "0.00",
    billNo: row.BILLNO || "-",
  }));

  // Key mapping for ShadCNTable
  const keyMapping = {
    srNo: "Sr No",
    empId: "Emp ID",
    employeeName: "Employee Name",
    bankName: "Bank Name",
    branchName: "Branch Name",
    ifscCode: "IFSC Code",
    bankAccountNo: "Bank Account No",
    deductionAmount: "Deduction Amount (₹)",
    billNo: "Bill No",
  };

  // Calculate grand total
  const grandTotal = filteredData.reduce(
    (sum, row) => sum + (Number(row.DEDUCTION_AMT) || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Formik
        initialValues={initialFormValues}
        enableReinitialize={true}
        onSubmit={handleSearchAndGeneratePDF}
      >
        {({ values, setFieldValue, isSubmitting, resetForm }) => {
          return (
            <Form>
              <Card className="shadow-sm border">
                <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <CardTitle className="text-2xl font-semibold">
                    Loans And Advances Received Report
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold">
                        Select Date
                      </Label>
                      <DatePicker
                        value={values.fromDate}
                        onChange={(date) => {
                          if (date) {
                            setFieldValue("fromDate", date);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold">
                        Pay Head
                      </Label>
                      <Select
                        value={values.payHeadId}
                        onValueChange={(v) => setFieldValue("payHeadId", v)}
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select Pay Head" />
                        </SelectTrigger>
                        <SelectContent>
                          {payHeadsOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                
                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || loading || pdfLoading}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {loading || pdfLoading ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        "Search & Generate PDF"
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCancel(resetForm)}
                      className="bg-gray-200 text-black hover:bg-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="mt-6">
                    {loading && (
                      <div className="py-10 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <div className="mt-2 text-gray-600">Searching for records...</div>
                      </div>
                    )}

                    {pdfLoading && !loading && (
                      <div className="py-10 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <div className="mt-2 text-gray-600">Generating PDF...</div>
                      </div>
                    )}

                    {!loading && !pdfLoading && filteredData.length > 0 && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg flex justify-between items-center border">
                          <div className="flex gap-6">
                            <div>
                              <span className="font-semibold text-gray-600">Total Records:</span>{" "}
                              <span className="text-lg font-bold text-blue-600">{filteredData.length}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">Pay Head:</span>{" "}
                              <span className="text-gray-800">
                                {payHeadsOptions.find(opt => opt.value === values.payHeadId)?.label || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">Date:</span>{" "}
                              <span className="text-gray-800">{formatDateToDDMMYYYY(values.fromDate)}</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600">Grand Total:</span>{" "}
                            <span className="text-xl font-bold text-green-600">
                              ₹{grandTotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="overflow-x-auto border rounded-lg">
                          <ShadCNTable
                            headers={Object.values(keyMapping)}
                            data={tableRows}
                            keyMapping={keyMapping}
                            pagination={true}
                            rowsPerPage={10}
                            className="min-w-full"
                          />
                        </div>
                      </div>
                    )}

                    {hasSearched && !loading && !pdfLoading && filteredData.length === 0 && (
                      <div className="py-10 text-center bg-gray-50 rounded-lg">
                        <div className="text-gray-500 text-lg">No records found.</div>
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

export default FrmLoansAndAdvancesReceived;