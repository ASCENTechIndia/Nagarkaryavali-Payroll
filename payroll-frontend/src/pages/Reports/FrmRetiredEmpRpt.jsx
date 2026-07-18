import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmRetiredEmpRpt = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ulbId = user?.ulbId;

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [billNoOptions, setBillNoOptions] = useState([]);
  const [showSubDept, setShowSubDept] = useState(false);
  const [showBillNo, setShowBillNo] = useState(false);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  const initialFormValues = {
    department: "-1",
    subDepartment: "0",
    zone: "",
    billNo: "0",
    fileFormat: "PDF",
  };

  useEffect(() => {
    if (ulbId) {
      const ulbIdStr = String(ulbId);
      setShowSubDept(ulbIdStr === "670" || ulbIdStr === "930" || ulbIdStr === "1750");
      setShowBillNo(ulbIdStr === "930" || ulbIdStr === "1750");
    }
  }, [ulbId]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        Swal.fire({
          title: "Loading Data...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        await Promise.all([
          getDepartments(),
          getZones()
        ]);

        Swal.close();
      } catch (error) {
        Swal.close();
        console.error("Error loading initial data:", error);
        Swal.fire("Error loading data");
      }
    };
    loadInitialData();
  }, []);

  const getDepartments = async () => {
    try {
      if (!ulbId) return;
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.DEPTNAME,
        value: String(item.DEPTID),
      }));
      setDepartmentOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
    } catch (err) {
      console.error("Error fetching departments:", err);
      throw err;
    }
  };

  const getZones = async () => {
    try {
      if (!ulbId) return;
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.ZONENAME,
        value: String(item.ZONEID),
      }));
      setZoneOptions([{ value: "0", label: "-- Select Option --" }, ...formatted]);
    } catch (err) {
      console.error("Error fetching zones:", err);
      throw err;
    }
  };

  const getSubDepartments = async (deptId) => {
    try {
      if (!ulbId) return;
      
      Swal.fire({
        title: "Loading Sub Departments...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/subdepartment-list`,
        { ulbid: Number(ulbId), deptid: deptId },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      
      Swal.close();
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.VAR_DEPTSUB_SDEPTNAMEE,
        value: String(item.NUM_DEPTSUB_ID),
      }));
      setSubDepartmentOptions([{ value: "0", label: "-- Select Option --" }, ...formatted]);
    } catch (err) {
      Swal.close();
      console.error("Error fetching sub-departments:", err);
      Swal.fire("Error loading sub departments");
    }
  };

  const getBillNos = async (deptId, subDeptId) => {
    try {
      if (!ulbId) return;
      
      Swal.fire({
        title: "Loading Bill Numbers...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/billno-list`,
        { ulbid: Number(ulbId), deptid: deptId, subdeptid: subDeptId },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      
      Swal.close();
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.BILLCODE,
        value: String(item.BILLNO),
      }));
      setBillNoOptions([{ value: "0", label: "-- Select Option --" }, ...formatted]);
    } catch (err) {
      Swal.close();
      console.error("Error fetching bill numbers:", err);
      Swal.fire("Error loading bill numbers");
    }
  };

  const handleDepartmentChange = async (deptId, setFieldValue) => {
    setFieldValue("department", deptId);
    setFieldValue("subDepartment", "0");
    setFieldValue("billNo", "0");

    if (showSubDept && deptId && deptId !== "-1") {
      await getSubDepartments(deptId);
    } else {
      setSubDepartmentOptions([{ value: "0", label: "-- Select Option --" }]);
    }

    if (showBillNo) {
      await getBillNos(deptId, "0");
    }
  };

  const handleSubDepartmentChange = async (subDeptId, values, setFieldValue) => {
    setFieldValue("subDepartment", subDeptId);
    setFieldValue("billNo", "0");
    if (showBillNo) {
      await getBillNos(values.department, subDeptId);
    }
  };

  const downloadFile = (url, fileName) => {
    axios({
      url: url,
      method: "GET",
      responseType: "blob",
      headers: { Authorization: `Bearer ${user?.token}` },
    }).then((response) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([response.data]));
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  };

  const handleProcess = async (values) => {
    if (!values.zone || values.zone === "0") {
      Swal.fire("Please select Zone");
      return;
    }

    try {
      Swal.fire({
        title: `Generating ${values.fileFormat}...`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        ulbid: Number(ulbId),
        zoneId: values.zone,
        deptId: values.department || "-1",
        subDeptId: values.subDepartment || "0",
        billNo: values.billNo || "0",
        month: selectedMonth,
        year: selectedYear,
      };

      if (values.fileFormat === "PDF") {
        const endpoint = `${BASE_URL}/api/FrmRetiredEmpRpt/generate-retired-employee-pdf`;
        const res = await axios.post(endpoint, payload, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        
        Swal.close();
        
        if (res.data.success) {
          window.open(res.data.pdfUrl, "_blank");
        } else {
          Swal.fire(res.data.message || "Failed to generate PDF");
        }
      } else {
        // Excel - Direct download
        const endpoint = `${BASE_URL}/api/FrmRetiredEmpRpt/generate-retired-employee-excel`;
        const response = await axios.post(endpoint, payload, {
          headers: { 
            Authorization: `Bearer ${user?.token}`,
          },
          responseType: 'blob',
        });

        Swal.close();

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        const contentDisposition = response.headers['content-disposition'];
        let filename = `RetiredEmployee_${Date.now()}.xlsx`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '');
          }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      Swal.close();
      console.error(error);
      Swal.fire(error.response?.data?.message || "An error occurred");
    }
  };

  const handleCancel = () => navigate("/");

  const months = [
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  return (
    <Formik initialValues={initialFormValues} enableReinitialize onSubmit={handleProcess}>
      {({ values, setFieldValue }) => (
        <Form>
          <Card className="shadow-sm border">
            <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-2xl font-semibold">
                Retired Employee Report
              </CardTitle>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {/* Date Section */}
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Date</Label>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 w-1/2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Month --" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 w-1/2">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Year --" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y.value} value={y.value}>
                            {y.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Zone */}
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Zone</Label>
                <Select
                  value={values.zone}
                  onValueChange={(value) => setFieldValue("zone", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Option --" />
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
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Department</Label>
                <Select
                  value={values.department}
                  onValueChange={(value) => handleDepartmentChange(value, setFieldValue)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- All --" />
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

              {/* Sub Department - Conditional */}
              {showSubDept && (
                <div className="flex flex-col gap-2">
                  <Label className="font-semibold">Sub Department</Label>
                  <Select
                    value={values.subDepartment}
                    onValueChange={(value) =>
                      handleSubDepartmentChange(value, values, setFieldValue)
                    }
                  >
                    <SelectTrigger className="w-full">
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
              )}

              {/* Bill No - Conditional */}
              {showBillNo && (
                <div className="flex flex-col gap-2">
                  <Label className="font-semibold">Bill No</Label>
                  <Select
                    value={values.billNo}
                    onValueChange={(value) => setFieldValue("billNo", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
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

              {/* File Format */}
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">File Format</Label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Input
                      type="radio"
                      name="fileFormat"
                      value="PDF"
                      checked={values.fileFormat === "PDF"}
                      onChange={() => setFieldValue("fileFormat", "PDF")}
                      className="w-4 h-4"
                    />
                    <span>PDF</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Input
                      type="radio"
                      name="fileFormat"
                      value="EXCEL"
                      checked={values.fileFormat === "EXCEL"}
                      onChange={() => setFieldValue("fileFormat", "EXCEL")}
                      className="w-4 h-4"
                    />
                    <span>EXCEL</span>
                  </label>
                </div>
              </div>
            </div>

            <CardContent className="p-6 pt-0">
              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  onClick={() => handleProcess(values)}
                  className="bg-blue-600 text-white hover:bg-blue-700 min-w-[100px]"
                >
                  Print
                </Button>

                <Button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 text-black hover:bg-gray-300 min-w-[100px]"
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

export default FrmRetiredEmpRpt;