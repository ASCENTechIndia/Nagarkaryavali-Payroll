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
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FrmPayHeadListValidationSchema } from "../../validations/global.validation";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";

const initialValues = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear().toString(),
  zone: "",
  department: "-1",
  payHead: "",
  category: "",
  empType: "NEW",
  reportType: "pdf",
};

const reportTypeOptions = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
];

const FrmPayHeadList = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode;
  const headId = location.state?.headId;

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [zoneOptions, setZoneOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [payHeadOptions, setPayHeadOptions] = useState([]);

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
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
        { ulbid: ulbId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setZoneOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: ulbId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDepartmentOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/category`,
        { ulbid: ulbId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCategoryOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // const fetchPayHeads = async () => {
  //   try {
  //     const res = await axios.post(
  //       `${BASE_URL}/api/FrmPayHeadConfigList/payheadmst-dropdown`,
  //       {
  //         ulbId: ulbId,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       },
  //     );

  //     console.log("Pay Head Response: ", res);

  //     setPayHeadOptions(res.data || []);
  //   } catch (error) {
  //     console.error("Pay Head API Error:", error);
  //   }
  // };

  const fetchPayHeads = async () => {
    try {
      const res = await axios.post(
          `${BASE_URL}/api/FrmPayHeadList/payhead-dropdown`,
          {
              ulbId: ulbId,
          },
          {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          },
      );
      console.log("Pay Head Response: ", res);
      if (res.data && Array.isArray(res.data)) {
          setPayHeadOptions(res.data);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
          setPayHeadOptions(res.data.data);
      } else {
          setPayHeadOptions([]);
      }
    } catch (error) {
      console.error("Pay Head API Error:", error);
      setPayHeadOptions([]);
      Swal.fire({
          text: "Failed to load payheads. Please try again.",
          confirmButtonColor: "#1e3a8a",
      });
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadDropdowns = async () => {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await Promise.allSettled([
          fetchZones(),
          fetchDepartments(),
          fetchCategories(),
          fetchPayHeads(),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        Swal.close();
      }
    };

    loadDropdowns();
  }, [token]);

  const handleDownloadExcel = async (values) => {
    try {
        Swal.fire({
            title: "Generating Excel...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const showEmpType = [930, 770, 1750].includes(Number(ulbId));

        const payload = {
            ulbid: Number(ulbId),
            month: Number(values.month),
            year: values.year,
            categoryId: values.category,
            zoneId: values.zone,
            payHeadId: values.payHead,
            deptId: values.department || "-1",
            empStatus: showEmpType ? values.empType : "",
            departmentName: departmentOptions.find(d => d.DEPTID.toString() === values.department)?.DEPTNAME || "सर्व विभाग",
            payHeadName: payHeadOptions.find(p => p.NUM_PAYHEADS_ID.toString() === values.payHead)?.VAR_PAYHEADS_ENAME || "विविध कपात"
        };

        const res = await axios.post(
            `${BASE_URL}/api/FrmPayHeadList/process-excel-data`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.close();

        if (!res.data?.success || !res.data?.data?.length) {
            Swal.fire({
                text: res.data?.message || "No records found",
                confirmButtonColor: "#1e3a8a",
            });
            return;
        }

        const { data, reportType, monthNameMarathi, departmentName, payHeadName, corporationName } = res.data;
        const isUlb930PFFund = reportType === "ULB_930_PF_FUND";
        const isUlb930Standard = ulbId == 930 && !isUlb930PFFund;

        const deptMap = new Map();
        data.forEach(item => {
            const dept = item.deptName || "इतर";
            if (!deptMap.has(dept)) {
                deptMap.set(dept, { deptName: dept, employees: [], deptTotal: 0 });
            }
            const group = deptMap.get(dept);
            group.employees.push(item);
            group.deptTotal += item.total !== undefined ? Number(item.total) : Number(item.amount || 0);
        });

        const departmentGroups = Array.from(deptMap.values());
        const currentYear = new Date().getFullYear();
        const monthYearText = `${monthNameMarathi} ${currentYear}`;

        const dataForSheet = [];

        // Headers
        dataForSheet.push([corporationName || ""]);
        if (isUlb930PFFund) {
            dataForSheet.push([`फंड वर्गणी आणि फंड कर्ज मासिक कपात अहवाल माहे ${monthYearText}`]);
            dataForSheet.push(["(7th pay)"]);
        } else {
            dataForSheet.push([`List Of ${payHeadName} for the Month of ${monthYearText}`]);
            dataForSheet.push([`विभागाचे नाव - ${departmentName}`]);
        }
        dataForSheet.push([]);

        departmentGroups.forEach(group => {
            dataForSheet.push([`विभागाचे नाव - ${group.deptName}`]);

            if (isUlb930PFFund) {
                dataForSheet.push(["अ.क्र.", "बिल नं.", "सिल नं.", "कर्मचारी नाव", "बेसिक", "फंड वर्गणी", "फंड कर्ज", "PF_Subs_7th Pay_Diff_2/48_Inst", "एकूण रक्कम"]);
                group.employees.forEach(emp => {
                    dataForSheet.push([emp.srNo, emp.billno, emp.slipno, emp.employeeName, emp.basic, emp.pfSubs, emp.pfRef, emp.pfSubs7th, emp.total]);
                });
                dataForSheet.push(["", "", "", "एकूण", 
                    group.employees.reduce((s, e) => s + Number(e.basic || 0), 0),
                    group.employees.reduce((s, e) => s + Number(e.pfSubs || 0), 0),
                    group.employees.reduce((s, e) => s + Number(e.pfRef || 0), 0),
                    group.employees.reduce((s, e) => s + Number(e.pfSubs7th || 0), 0),
                    group.employees.reduce((s, e) => s + Number(e.total || 0), 0)
                ]);
            } else if (isUlb930Standard) {
                dataForSheet.push(["अ.क्र.", "बिल नं.", "सिल नं.", "कर्मचारी नाव", "PF No", "पॅन नं.", "रक्कम"]);
                group.employees.forEach(emp => {
                    dataForSheet.push([emp.srNo, emp.billno || "", emp.slipno || "", emp.employeeName, emp.pfNo || "", emp.panNo || "", emp.amount]);
                });
                dataForSheet.push(["", "", "", "एकूण", "", "", group.deptTotal]);
            } else {
                dataForSheet.push(["अ.क्र.", "कर्मचारी क्र.", "कर्मचारी नाव", "पॅन नं.", "कपात केलेली रक्कम"]);
                group.employees.forEach(emp => {
                    dataForSheet.push([emp.srNo, emp.empId, emp.employeeName, emp.panNo || "", emp.amount]);
                });
                dataForSheet.push(["", "", "विभागाची एकूण रक्कम", "", group.deptTotal]);
            }

            dataForSheet.push([]); 
        });

        const grandTotal = data.reduce((sum, emp) => sum + Number(emp.total !== undefined ? emp.total : (emp.amount || 0)), 0);
        dataForSheet.push(["", "एकूण रक्कम", grandTotal]);

        const worksheet = XLSX.utils.aoa_to_sheet(dataForSheet);
        worksheet['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }];
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PayHead List");
        XLSX.writeFile(workbook, `PayHeadList_${values.payHead}_${Date.now()}.xlsx`);

        Swal.fire({ text: "Excel downloaded successfully!", confirmButtonColor: "#1e3a8a", timer: 2000 });

    } catch (error) {
        console.error("Excel Generation Error:", error);
        Swal.close();
        Swal.fire({ text: error.response?.data?.message || "Failed to generate Excel", confirmButtonColor: "#1e3a8a" });
    }
  };

  const handleSubmit = async (values) => {
    const validationResult = FrmPayHeadListValidationSchema.safeParse(values);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      await Swal.fire({
        text: firstError.message,
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (values.reportType === "excel") {
        return handleDownloadExcel(values);
    }

    try {
        Swal.fire({
            title: "Generating PDF...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const showEmpType = [930, 770, 1750].includes(Number(ulbId));

        const payload = {
            ulbid: Number(ulbId),
            month: Number(values.month),
            year: values.year,
            categoryId: values.category,
            zoneId: values.zone,
            payHeadId: values.payHead,
            deptId: values.department || "-1",
            empStatus: showEmpType ? values.empType : "",
            departmentName: departmentOptions.find(d => d.DEPTID.toString() === values.department)?.DEPTNAME || "सर्व विभाग",
            payHeadName: payHeadOptions.find(p => p.NUM_PAYHEADS_ID.toString() === values.payHead)?.VAR_PAYHEADS_ENAME || "विविध कपात"
        };

        const res = await axios.post(
            `${BASE_URL}/api/FrmPayHeadList/generate-pdf`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        Swal.close();


        if (res.data?.count == 0 || res.data?.data?.length === 0) {
            Swal.fire({
                text: res.data?.message || "No records found",
                confirmButtonColor: "#1e3a8a",
            });
            return;
        }

        if (res.data?.success && res.data?.pdfUrl) {
            window.open(res.data.pdfUrl, "_blank");
          
            
            Swal.fire({
                text: "PDF generated successfully!",
                confirmButtonColor: "#1e3a8a",
                timer: 2000,
            });
        } else {
            Swal.fire({
              text: res.data?.message || "Failed to generate PDF",
              confirmButtonColor: "#1e3a8a",
            });
        }

    } catch (error) {
        console.error("PDF Generation Error:", error);
        Swal.close();
        
        const errorMessage = error.response?.data?.message || "Failed to generate PDF";
        
        Swal.fire({
            text: errorMessage,
            confirmButtonColor: "#1e3a8a",
        });
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue }) => {
        return (
          <Form>
            <Card className="shadow-sm border">
              <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Pay Head wise List
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                          <SelectContent showDefaultOption={false}>
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
                          <SelectContent showDefaultOption={false}>
                              {yearOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                              </SelectItem>
                              ))}
                          </SelectContent>
                          </Select>
                      </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Zone" required />
                      <span>:</span>
                    </div>

                    <Select
                      value={values.zone}
                      onValueChange={(value) => setFieldValue("zone", value)}
                    >
                      <SelectTrigger className="w-full h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        {zoneOptions.map((item) => (
                          <SelectItem
                            key={item.ZONEID}
                            value={item.ZONEID.toString()}
                          >
                            {item.ZONENAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Department" required />
                      <span>:</span>
                    </div>

                    <Select
                      value={values.department}
                      onValueChange={(value) =>
                        setFieldValue("department", value)
                      }
                    >
                      <SelectTrigger className="w-full h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="-1">-- ALL --</SelectItem>

                        {departmentOptions.map((item) => (
                          <SelectItem
                            key={item.DEPTID}
                            value={item.DEPTID.toString()}
                          >
                            {item.DEPTNAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                          <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                              <Label
                                                  text="Sub Department"
                                                  className="text-[15px] font-semibold text-black "
                                                  required
                                              />
                                              <span>:</span>
                                          </div>

                                          <Select
                                              value={values.subDepartment}
                                              onValueChange={(value) =>
                                                  setFieldValue("subDepartment", value)
                                              }
                                          >
                                              <SelectTrigger className="w-full h-9">
                                                  <SelectValue placeholder="-- Select Option --" />
                                              </SelectTrigger>

                                              <SelectContent> */}
                  {/* {subDepartmentOptions?.map((item) => (
                                                      <SelectItem
                                                          key={item.id}
                                                          value={item.id.toString()}
                                                      >
                                                          {item.name}
                                                      </SelectItem>
                                                  ))} */}
                  {/* </SelectContent>
                                          </Select>
                                      </div> */}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="PayHead" required />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.payHead}
                      onValueChange={(value) =>
                        setFieldValue("payHead", value)
                      }
                    >
                      <SelectTrigger className="w-full h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        {payHeadOptions.map((item) => (
                          <SelectItem
                            key={item.NUM_PAYHEADS_ID}
                            value={item.NUM_PAYHEADS_ID.toString()}
                          >
                            {item.VAR_PAYHEADS_ENAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Category" required />
                      <span>:</span>
                    </div>

                    <Select
                      value={values.category}
                      onValueChange={(value) =>
                        setFieldValue("category", value)
                      }
                    >
                      <SelectTrigger className="w-full h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent> 

                        {categoryOptions.map((item) => (
                          <SelectItem
                            key={item.NUM_CATEGORY_ID}
                            value={item.NUM_CATEGORY_ID.toString()}
                          >
                            {item.VAR_CATEGORY_NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {ulbId == 930 && (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Employee Type" required />
                          <span>:</span>
                        </div>

                        <Select
                            value={values.empType}
                            onValueChange={(value) => setFieldValue("empType", value)}
                        >
                            <SelectTrigger className="w-full h-9">
                                <SelectValue placeholder="-- Select Option --" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="OLD">OLD</SelectItem>
                                <SelectItem value="NEW">NEW</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
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
                                className="w-4 h-4 "
                              />
                              <span className="font-medium text-gray-700 text-sm cursor-pointer">
                                {option.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <Button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white px-8"
                  >
                    Process
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="px-8"
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

export default FrmPayHeadList;
