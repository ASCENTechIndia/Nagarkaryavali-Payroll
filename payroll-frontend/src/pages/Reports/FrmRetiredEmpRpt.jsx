import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
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
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  const initialFormValues = {
    department: "-1",
    subDepartment: "",
    zone: "",
    billNo: "",
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
          text: "Loading Data...",
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
        Swal.fire({ text: "Error loading data" });
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
      setZoneOptions(formatted);
    } catch (err) {
      console.error("Error fetching zones:", err);
      throw err;
    }
  };

  const getSubDepartments = async (deptId) => {
    try {
      if (!ulbId) return;

      Swal.fire({
        text: "Loading Sub Departments...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/subdepartment-list`,
        { ulbid: Number(ulbId), deptId: deptId },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      Swal.close();

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.VAR_DEPTSUB_SDEPTNAMEE,
        value: String(item.NUM_DEPTSUB_ID),
      }));
      setSubDepartmentOptions(formatted);
    } catch (err) {
      Swal.close();
      console.error("Error fetching sub-departments:", err);
      Swal.fire({ text: "Error loading sub departments" });
    }
  };

  const getBillNos = async (deptId, subDeptId) => {
    try {
      if (!ulbId) return;

      Swal.fire({
        text: "Loading Bill Numbers...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/billno`,
        { ulbid: Number(ulbId), deptId: deptId, subdeptid: subDeptId },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      Swal.close();

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.filter((item) => item.BILLCODE != null && item.BILLCODE !== "").map((item) => ({
        label: item.BILLCODE || item.billno,
        value: String(item.BILLCODE || item.billno),
      }));
      setBillNoOptions(formatted);
    } catch (err) {
      Swal.close();
      console.error("Error fetching bill numbers:", err);
      Swal.fire({ text: "Error loading bill numbers" });
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

  const exportExcel = (data) => {
    if (!data || data.length === 0) {
      Swal.fire({
        text: "No data available to export",
        confirmButtonColor: "#083c76"
      });
      return;
    }

    try {
      const isSpecialUlb = ["930", "1750"].includes(ulbId?.toString());
      const isUlb770 = ulbId?.toString() === "770";

      let headers = [];
      let keys = [];

      if (isSpecialUlb) {
        headers = [
          "Bill No.",
          "Employee Id",
          "Name",
          "Retire Date",
          "Department",
          "Type",
          "GRADE",
          "DOB",
          "DESIGNATION",
          "SUBDEPT",
          "Old Slip No.",
          "New Slip No."
        ];
        keys = [
          "billno",
          "oldslipno",
          "name",
          "retiredate",
          "department",
          "type",
          "grade",
          "dob",
          "designation",
          "subdept",
          "oldslipno",
          "newslipno"
        ];
      } else if (isUlb770) {
        headers = [
          "Employee Id",
          "Name",
          "Retire Date",
          "Department",
          "Type",
          "GRADE",
          "DOB",
          "DESIGNATION",
          "SUBDEPT"
        ];
        keys = [
          "oldempno",
          "name",
          "retiredate",
          "department",
          "type",
          "grade",
          "dob",
          "designation",
          "subdept"
        ];
      } else {
        headers = [
          "Employee Id",
          "Name",
          "Retire Date",
          "Department",
          "Type",
          "GRADE",
          "DOB",
          "DESIGNATION",
          "SUBDEPT"
        ];
        keys = [
          "oldslipno",
          "name",
          "retiredate",
          "department",
          "type",
          "grade",
          "dob",
          "designation",
          "subdept"
        ];
      }

      const excelData = [];
      excelData.push(headers);

      data.forEach(row => {
        const rowData = [];
        keys.forEach(key => {
          let value = row[key] || "";
          if (typeof value === 'string') {
            value = value.trim();
          }
          rowData.push(value);
        });
        excelData.push(rowData);
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      const colWidths = headers.map((header, index) => {
        let maxLength = header.length;
        data.forEach(row => {
          const key = keys[index];
          const value = row[key] ? String(row[key]).length : 0;
          if (value > maxLength) {
            maxLength = Math.min(value, 30);
          }
        });
        return { wch: Math.max(maxLength + 2, 12) };
      });
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Retired Employees");

      const fileName = `RetiredEmployee_${Date.now()}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      Swal.fire({
        text: "Excel file downloaded successfully",
        // icon: "success",
        confirmButtonColor: "#083c76"
      });
    } catch (err) {
      console.error("Excel Export Error:", err);
      Swal.fire({
        text: "Failed to export Excel",
        confirmButtonColor: "#083c76"
      });
    }
  };

  const handleProcess = async (values) => {
    if (!values.zone || values.zone === "0") {
      Swal.fire({ text: "Please select Zone" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ulbid: Number(ulbId),
        zoneId: values.zone,
        deptId: values.department || "-1",
        subDeptId: values.subDepartment || "0",
        billNo: values.billNo || "0",
        month: selectedMonth,
        year: selectedYear,
      };

      Swal.fire({
        text: "Fetching Data...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // const dataEndpoint = `${BASE_URL}/api/FrmRetiredEmpRpt/retired-employee-list`;
      // //console.log("Calling endpoint:", dataEndpoint);

      // const dataRes = await axios.post(dataEndpoint, payload, {
      //   headers: { Authorization: `Bearer ${user?.token}` },
      // });

      // //console.log("Data Response:", dataRes.data);

      // const isSuccess = dataRes.data?.ok === true || dataRes.data?.success === true;

      // if (!isSuccess) {
      //   Swal.close();
      //   Swal.fire({
      //     text: dataRes.data?.message || "Failed to fetch data",
      //     confirmButtonColor: "#083c76"
      //   });
      //   setIsLoading(false);
      //   return;
      // }

      // const reportData = dataRes.data?.data?.data || dataRes.data?.data || [];
      // console.log("Report Data:", reportData);
      // console.log("Report Data Count:", reportData.length);

      // if (!reportData || reportData.length === 0) {
      //   Swal.close();
      //   Swal.fire({
      //     text: "No records found",
      //     // icon: "info",
      //     confirmButtonColor: "#083c76"
      //   });
      //   setIsLoading(false);
      //   return;
      // }

      if (values.fileFormat === "PDF") {
        Swal.fire({
          text: "Generating PDF...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const pdfResponse = await axios.post(
          `${BASE_URL}/api/FrmRetiredEmpRpt/generate-retired-employee-pdf`,
          payload,
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );

        //console.log("PDF Response:", pdfResponse.data);
        Swal.close();

        if (pdfResponse.data.success) {
          window.open(pdfResponse.data.pdfUrl, "_blank");
        } else {
          Swal.fire({ text: pdfResponse.data.message || "Failed to generate PDF" });
        }
      } else {
        Swal.close();
        exportExcel(reportData);
      }

    } catch (error) {
      Swal.close();
      console.error("Error in handleProcess:", error);
      console.error("Error response:", error.response?.data);
      Swal.fire({
        text: error.response?.data?.message || error.message || "An error occurred",
        confirmButtonColor: "#083c76"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate("/HomePage/FrmHomePage");

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
    <Formik
      initialValues={initialFormValues}
      enableReinitialize
      onSubmit={(values) => {
        console.log("Formik onSubmit called with:", values);
        handleProcess(values);
      }}
    >
      {({ values, setFieldValue, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <Card className="border shadow-sm">
            <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
              <CardTitle className="text-xl font-bold">
                Retired Employee Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className=" sm:w-34 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Date" required />
                    <span>:</span>
                  </div>
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

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className=" sm:w-34 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Zone" required />
                    <span>:</span>
                  </div>
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


                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className=" sm:w-34 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Department" required />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.department}
                    onValueChange={(value) => handleDepartmentChange(value, setFieldValue)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- All --" />
                    </SelectTrigger>
                    <SelectContent showDefaultOption={false}>

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
                    <div className="sm:w-34 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Sub Department" required className="min-w-fit" />
                      <span>:</span>
                    </div>
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


                {showBillNo && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className=" sm:w-34 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Bill No" required />
                      <span>:</span>
                    </div>
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


                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className=" sm:w-34 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="File Format" required />
                    <span>:</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      type="radio"
                      name="fileFormat"
                      value="PDF"
                      checked={values.fileFormat === "PDF"}
                      onChange={() => setFieldValue("fileFormat", "PDF")}
                      className="w-4 h-4"
                    />
                    <Label text="PDF" className="flex items-center gap-2 cursor-pointer" />
                    <Input
                      type="radio"
                      name="fileFormat"
                      value="EXCEL"
                      checked={values.fileFormat === "EXCEL"}
                      onChange={() => setFieldValue("fileFormat", "EXCEL")}
                      className="w-4 h-4"
                    />
                    <Label text="EXCEL" className="flex items-center gap-2 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Print"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
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