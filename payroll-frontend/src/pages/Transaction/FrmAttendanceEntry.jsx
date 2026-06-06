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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { FrmAttendanceEntryValidationSchema } from "@/validations/global.validation";

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
  const [submitting, setSubmitting] = useState(false);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
  const [billNoOptions, setBillNoOptions] = useState([]);
  const [showSubDept, setShowSubDept] = useState(false);
  const [showBillNo, setShowBillNo] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

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
    {
      value: new Date().getFullYear().toString(),
      label: new Date().getFullYear().toString(),
    },
    {
      value: (new Date().getFullYear() - 1).toString(),
      label: (new Date().getFullYear() - 1).toString(),
    },
    {
      value: (new Date().getFullYear() - 2).toString(),
      label: (new Date().getFullYear() - 2).toString(),
    },
  ];

  const initialFormValues = {
    month: "-1",
    year: "-1",
    category: "",
    zone: "",
    department: "",
    subDepartment: "",
    billNo: "0",
    employeeCode: "",
  };

  const calculatePresent = (
    attendance,
    medicalLeave,
    earnedLeave,
    lwp,
    halfDay,
  ) => {
    const att = parseFloat(attendance) || 0;
    const ml = parseFloat(medicalLeave) || 0;
    const el = parseFloat(earnedLeave) || 0;
    const lwpVal = parseFloat(lwp) || 0;
    const hp = parseFloat(halfDay) || 0;

    return att - (ml + el + lwpVal + hp / 2);
  };

  const handleLeaveFieldChange = (rowIndex, field, value, setData) => {
    setData((prevData) => {
      const newData = [...prevData];
      const row = { ...newData[rowIndex] };
      row[field] = value;

      row.present = calculatePresent(
        row.attendance,
        field === "medicalLeave" ? value : row.medicalLeave,
        field === "earnedLeave" ? value : row.earnedLeave,
        field === "lwp" ? value : row.lwp,
        field === "halfDay" ? value : row.halfDay,
      );

      newData[rowIndex] = row;
      return newData;
    });
  };

  const handleRowCheck = (rowIndex, checked, setData) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], checked };
      return newData;
    });
  };

  const formatDateForAPI = (year, month) => {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const date = new Date(yearNum, monthNum - 1, lastDay);

    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthAbbr = monthNames[monthNum - 1];

    return `${day}-${monthAbbr}-${yearNum}`;
  };

  const fetchZones = async () => {
    if (!ulbId) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmpPayHeadListRpt/zone-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.ZONENAME,
          value: String(item.ZONEID),
        }));
        setZoneOptions(formatted);
      } else {
        setZoneOptions([]);
      }
    } catch (err) {
      console.error("Error fetching zones:", err);
      setZoneOptions([]);
    }
  };

  const fetchCategories = async () => {
    if (!ulbId) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/category`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_CATEGORY_NAME,
          value: String(item.NUM_CATEGORY_ID),
        }));
        setCategoryOptions(formatted);
      } else {
        setCategoryOptions([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategoryOptions([]);
    }
  };

  const fetchDepartment = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/department`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.DEPTNAME,
          value: String(item.DEPTID),
        }));
        setDepartmentOptions(formatted);
      } else {
        setDepartmentOptions([]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartmentOptions([]);
    }
  };

  const fetchSubDepartment = async (deptId) => {
    try {
      if (!ulbId || !deptId || deptId === "") {
        setSubDepartmentOptions([]);
        return;
      }

      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/subdepartment`,
        {
          ulbid: Number(ulbId),
          deptId: Number(deptId),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_DEPTSUB_SDEPTNAMEE,
          value: String(item.NUM_DEPTSUB_ID),
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

  const fetchBillNo = async (deptId, subDeptId) => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/billno`,
        {
          ulbid: Number(ulbId),
          deptId: deptId && deptId !== "" ? deptId : null,
          subdeptId: subDeptId && subDeptId !== "" ? subDeptId : null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.BILLCODE || item.billno,
          value: String(item.BILLCODE || item.billno),
        }));
        setBillNoOptions(formatted);
      } else {
        setBillNoOptions([]);
      }
    } catch (err) {
      console.error("Error fetching bill numbers:", err);
      setBillNoOptions([]);
    }
  };

  const handleSearch = async (values) => {
    const validationResult = FrmAttendanceEntryValidationSchema.safeParse(values);

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
    setSearchParams(values);

    try {
      const formattedLastDate = formatDateForAPI(values.year, values.month);

      const payload = {
        ulbid: Number(ulbId),
        categoryId: values.category,
        zoneId: values.zone,
        deptId: values.department,
        subdeptId:
          values.subDepartment && values.subDepartment !== ""
            ? values.subDepartment
            : null,
        billNo: values.billNo !== "0" ? values.billNo : null,
        empId: values.employeeCode || null,
        month: values.month,
        year: values.year,
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmAttendanceEntry/attendance-list`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const mappedData = apiData.map((item, index) => ({
          srNo: index + 1,
          empId: item.NUM_EMPLOYEE_EMPID,
          empName: item.EMPNAME,
          biometric: "0",
          attendance: item.monthattend_workingdays ?? 0,
          medicalLeave: item.MONTHATTEND_MEDICALLEAVE ?? 0,
          earnedLeave: item.MONTHATTEND_EARNEDLEAVE ?? 0,
          halfDay: item.MONTHATTEND_HALFDAY ?? 0,
          lwp: item.MONTHATTEND_WITHOUTPAY ?? 0,
          present: item.monthattend_present ?? 0,
          remark: item.MONTHATTEND_REMARK ?? "",
          attendentryId: item.ATTENDENTRY_ID,
          checked: false,
          isDisabled: item.ATTENDENTRY_ID !== null,
        }));

        setAttendanceData(mappedData);
      } else {
        setAttendanceData([]);
        Swal.fire({
          text: "No records found",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Search Error:", error);
      setAttendanceData([]);
      Swal.fire({
        text: error.response?.data?.message || "Error searching attendance",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const checkedRows = attendanceData.filter(
      (row) => row.checked && !row.isDisabled,
    );

    if (checkedRows.length === 0) {
      Swal.fire({
        text: "Please select at least one record to proceed",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setSubmitting(true);

    try {
      let attendanceStr = "";

      const year = parseInt(searchParams.year);
      const month = parseInt(searchParams.month);
      const daysInMonth = new Date(year, month, 0).getDate();
      const lastDateObj = new Date(year, month - 1, daysInMonth);
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const attDate = `${lastDateObj.getDate()}-${monthNames[month - 1]}-${year}`;

      checkedRows.forEach((row) => {
        attendanceStr += `${row.empId}$${row.empName}$${row.biometric}$${row.attendance}$${row.present}$${row.medicalLeave}$${row.earnedLeave}$${row.halfDay}$${row.lwp}$${row.remark || ""}$${attDate}#`;
      });

      // Remove trailing #
      if (attendanceStr.endsWith("#")) {
        attendanceStr = attendanceStr.slice(0, -1);
      }

      const payload = {
        userId: user?.userId || user?.id || "ADMIN",
        categoryId: parseInt(searchParams.category),
        zoneId: parseInt(searchParams.zone),
        departmentId: parseInt(searchParams.department),
        subdepartmentId:
          searchParams.subDepartment && searchParams.subDepartment !== ""
            ? parseInt(searchParams.subDepartment)
            : 0,
        month: parseInt(searchParams.month),
        year: parseInt(searchParams.year),
        attendanceStr: attendanceStr,
        ulbId: Number(ulbId),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmAttendanceEntry/save-attendance`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data?.ok) {
        Swal.fire({
          text: res.data?.data?.message || "Attendance saved successfully!",
          icon: "success",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          // Refresh the search results
          handleSearch(searchParams);
        });
      } else {
        Swal.fire({
          text:
            res.data?.error ||
            res.data?.data?.message ||
            "Error saving attendance",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire({
        text: error.response?.data?.error || "Error saving attendance",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepartmentChange = (value, setFieldValue) => {
    setFieldValue("department", value);
    setFieldValue("subDepartment", "");
    if (value && value !== "") {
      fetchSubDepartment(value);
      if (showBillNo) {
        fetchBillNo(value, "");
      }
    } else {
      setSubDepartmentOptions([]);
      if (showBillNo) {
        fetchBillNo(null, null);
      }
    }
  };

  const handleSubDepartmentChange = (value, setFieldValue, deptId) => {
    setFieldValue("subDepartment", value);
    if (showBillNo && deptId && deptId !== "") {
      fetchBillNo(deptId, value);
    }
  };

  const isAllChecked =
    attendanceData.length > 0 &&
    attendanceData.every((row) => row.checked || row.isDisabled);
  const isSomeChecked = attendanceData.some(
    (row) => row.checked && !row.isDisabled,
  );

  const handleHeaderCheckboxChange = (checked) => {
    setAttendanceData((prevData) =>
      prevData.map((row) => ({
        ...row,
        checked: checked === true && !row.isDisabled,
      })),
    );
  };

  useEffect(() => {
    if (ulbId) {
      if (ulbId === "590") {
        setShowSubDept(true);
        setShowBillNo(false);
      } else if (ulbId === "770" || ulbId === "1750") {
        setShowSubDept(true);
        setShowBillNo(true);
      } else if (ulbId === "2") {
        setShowSubDept(false);
        setShowBillNo(false);
      } else if (ulbId === "1630") {
        setShowSubDept(true);
        setShowBillNo(false);
      } else {
        setShowSubDept(false);
        setShowBillNo(false);
      }
    }
  }, [ulbId]);

  useEffect(() => {
    if (ulbId) {
      fetchZones();
      fetchCategories();
      fetchDepartment();
    }
  }, [ulbId]);

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
                  Attendance Entry
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Category" required />
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
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Zone" required />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.zone}
                      onValueChange={(v) => setFieldValue("zone", v)}
                    >
                      <SelectTrigger className="w-full! h-9 overflow-hidden">
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
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Department" required />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.department}
                      onValueChange={(v) =>
                        handleDepartmentChange(v, setFieldValue)
                      }
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

                  {showSubDept && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Sub Department" />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.subDepartment}
                        onValueChange={(v) =>
                          handleSubDepartmentChange(
                            v,
                            setFieldValue,
                            values.department,
                          )
                        }
                      >
                        <SelectTrigger className="w-full! h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Sub Department --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- ALL --</SelectItem>
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
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Bill No." />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.billNo}
                        onValueChange={(v) => setFieldValue("billNo", v)}
                      >
                        <SelectTrigger className="w-full! h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Bill No --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">
                            -- Select Bill No --
                          </SelectItem>
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
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Year" required />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.year}
                      onValueChange={(v) => setFieldValue("year", v)}
                    >
                      <SelectTrigger className="w-full! h-9 overflow-hidden">
                        <SelectValue placeholder="Select Year" />
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

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Month" required />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.month}
                      onValueChange={(v) => setFieldValue("month", v)}
                    >
                      <SelectTrigger className="w-full! h-9 overflow-hidden">
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
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Employee ID" />
                      <span>:</span>
                    </div>
                    <Input
                      name="employeeCode"
                      value={values.employeeCode}
                      onChange={(e) =>
                        setFieldValue("employeeCode", e.target.value)
                      }
                      type="text"
                      className="w-full h-9"
                      placeholder="Enter Employee Code"
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="bg-blue-800 hover:bg-blue-900"
                  >
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

                  {!loading && attendanceData.length > 0 && (
                    <AttendanceTable
                        attendanceData={attendanceData}
                        handleRowCheck={handleRowCheck}
                        handleLeaveFieldChange={handleLeaveFieldChange}
                        setAttendanceData={setAttendanceData}
                        isAllChecked={isAllChecked}
                        handleHeaderCheckboxChange={handleHeaderCheckboxChange}
                    />
                  )}

                  {!loading && attendanceData.length > 0 && (
                    <div className="flex justify-center gap-4 pt-6">
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-blue-800 hover:bg-blue-900"
                      >
                        {submitting ? "Submitting..." : "Submit"}
                      </Button>
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

export default FrmAttendanceEntry;


const AttendanceTable = ({
    attendanceData,
    handleRowCheck,
    handleLeaveFieldChange,
    setAttendanceData,
    isAllChecked,
    handleHeaderCheckboxChange,
  }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const totalPages = Math.ceil(attendanceData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = attendanceData.slice(
      startIndex,
      startIndex + rowsPerPage,
    );

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full [&_thead_tr:hover]:bg-[#083c76]">
            <TableHeader>
              <TableRow className="bg-[#083c76]">
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  Sr No.
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  Emp ID
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  Name
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap w-16">
                  <div className="flex justify-center items-center">
                    <Checkbox
                      checked={isAllChecked}
                      onCheckedChange={handleHeaderCheckboxChange}
                      className="border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-900"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  Bio-Metric
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  Attendance
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  Medical Leave
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  Earned Leave
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  HP
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  LWP
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  Present
                </TableHead>
                <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap">
                  Remark
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row, idx) => {
                const actualIndex = startIndex + idx;
                return (
                  <TableRow key={actualIndex} className="hover:bg-gray-50">
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      {actualIndex + 1}
                    </TableCell>
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      {row.empId}
                    </TableCell>
                    <TableCell className="p-2 text-left whitespace-nowrap">
                      {row.empName}
                    </TableCell>
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={row.checked}
                          onCheckedChange={(checked) =>
                            handleRowCheck(
                              actualIndex,
                              checked === true,
                              setAttendanceData,
                            )
                          }
                          disabled={row.isDisabled}
                          className={`border-2 border-gray-500 ${
                            row.isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.biometric}
                        onChange={(e) => {
                          const newData = [...attendanceData];
                          newData[actualIndex].biometric = e.target.value;
                          setAttendanceData(newData);
                        }}
                        className="w-20 h-8 text-center"
                        disabled={row.isDisabled}
                      />
                    </TableCell>
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.attendance}
                        readOnly
                        className="w-20 h-8 text-center bg-gray-100"
                      />
                    </TableCell>
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.medicalLeave}
                        onChange={(e) =>
                          handleLeaveFieldChange(
                            actualIndex,
                            "medicalLeave",
                            e.target.value,
                            setAttendanceData,
                          )
                        }
                        className="w-20 h-8 text-center"
                        disabled={row.isDisabled}
                      />
                    </TableCell>
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.earnedLeave}
                        onChange={(e) =>
                          handleLeaveFieldChange(
                            actualIndex,
                            "earnedLeave",
                            e.target.value,
                            setAttendanceData,
                          )
                        }
                        className="w-20 h-8 text-center"
                        disabled={row.isDisabled}
                      />
                    </TableCell>
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.halfDay}
                        onChange={(e) =>
                          handleLeaveFieldChange(
                            actualIndex,
                            "halfDay",
                            e.target.value,
                            setAttendanceData,
                          )
                        }
                        className="w-20 h-8 text-center"
                        disabled={row.isDisabled}
                      />
                    </TableCell>
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.lwp}
                        onChange={(e) =>
                          handleLeaveFieldChange(
                            actualIndex,
                            "lwp",
                            e.target.value,
                            setAttendanceData,
                          )
                        }
                        className="w-20 h-8 text-center"
                        disabled={row.isDisabled}
                      />
                    </TableCell>
                    <TableCell className="p-2 text-center whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.present}
                        readOnly
                        className="w-20 h-8 text-center bg-gray-100"
                      />
                    </TableCell>
                    <TableCell className="p-2 text-left whitespace-nowrap">
                      <Input
                        type="text"
                        value={row.remark}
                        onChange={(e) => {
                          const newData = [...attendanceData];
                          newData[actualIndex].remark = e.target.value;
                          setAttendanceData(newData);
                        }}
                        className="w-40 h-8"
                        disabled={row.isDisabled}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {totalPages > 1 && (
                <TableRow>
                  <TableCell colSpan={12} className="p-4">
                    <div className="flex justify-center items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-1"
                      >
                        Previous
                      </Button>
                      <span className="font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-1"
                      >
                        Next
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
};