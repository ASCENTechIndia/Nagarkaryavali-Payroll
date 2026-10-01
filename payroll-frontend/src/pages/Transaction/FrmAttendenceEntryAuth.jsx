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
import { useLocation, useNavigate } from "react-router-dom";
import ShadCNTable from "@/components/ui/table";

const FrmAttendenceEntryAuth = () => {
  const { authUser } = useAuth();
  const authToken = authUser?.token;
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const token = storedToken || authToken;
  const user = storedUser || authUser;
  const ulbId = user?.orgId || user?.ulbId;
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = location.state || {};

  console.log("Attendance Authorization State:", stateData);

  const [loading, setLoading] = useState(false);
  const [isDropdownLoading, setIsDropdownLoading] = useState(true);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

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

  const initialFormValues = {
    month: stateData.month
      ? Number(stateData.month)
      : new Date().getMonth() + 1,
    year: stateData.year ? String(stateData.year) : "",
    zone: stateData.zone ? String(stateData.zone) : "",
    department: stateData.department ? String(stateData.department) : "-1",
    category: stateData.category ? String(stateData.category) : "",
  };


  const fetchZones = async () => {
    if (!ulbId) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
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
      }
      return true;
    } catch (err) {
      console.error("Error fetching zones:", err);
      return false;
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
      console.log("apiData :", apiData);

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_CATEGORY_NAME,
          value: String(item.NUM_CATEGORY_ID),
        }));
        setCategoryOptions(formatted);
      } else {
        setCategoryOptions([]);
      }
      return true;
    } catch (err) {
      console.error("Error fetching categories:", err);
      return false;
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
        setDepartmentOptions([
          { value: "-1", label: "-- ALL --" },
          ...formatted,
        ]);
      } else {
        setDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
      }
      return true;
    } catch (err) {
      console.error("Error fetching departments:", err);
      return false;
    }
  };

  const fetchYears = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmMonthlyBankDeductionUpload/year-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiData = res.data?.data || [];

      const formatted = apiData.map((item) => ({
        value: String(item.VALUE),
        label: String(item.LABEL),
      }));

      setYearOptions(formatted);

      return true;
    } catch (err) {
      console.error("Error fetching years:", err);
      setYearOptions([]);
      return false;
    }
  };

  const getAttendanceDate = (year, month) => {
    const y = Number(year);
    const m = Number(month);

    const lastDay = new Date(y, m, 0).getDate();

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

    const day = String(lastDay).padStart(2, "0");
    const monthAbbr = monthNames[m - 1];

    return `${day}-${monthAbbr}-${y}`;
  };

  const fetchAttendanceDetails = async (values) => {
    try {
      setTableLoading(true);

      const yearLabel =
        yearOptions.find((y) => y.value === String(values.year))?.label ||
        values.year;

      const attendDate = getAttendanceDate(yearLabel, values.month);

      const payload = {
        categoryId: Number(values.category),
        zoneId: Number(values.zone),
        departmentId: Number(values.department),
        month: Number(values.month),
        year: stateData.year ? String(stateData.year) : "",
        attendDate: attendDate,
        ulbId: Number(ulbId),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmAttendenceExcellAuthListMst/attendance-detail`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiData = res.data?.data?.rows || [];

      setAttendanceData(apiData);
    } catch (error) {
      console.error("Attendance Detail Error:", error);
      setAttendanceData([]);
    } finally {
      setTableLoading(false);
    }
  };

  const tableHeaders = [
    "Emp ID",
    "Name",
    "Bio-Metric",
    "Attendance",
    "Medical Leave",
    "Earned Leave",
    "HP",
    "LWP",
    "Present",
    "Remark",
  ];

  const keyMapping = {
    "Emp ID": "empId",
    Name: "name",
    "Bio-Metric": "bioMetric",
    Attendance: "attendance",
    "Medical Leave": "medicalLeave",
    "Earned Leave": "earnedLeave",
    HP: "hp",
    LWP: "lwp",
    Present: "present",
    Remark: "remark",
  };

  const tableData = attendanceData.map((item) => ({
    empId: item.NUM_EMPLOYEE_EMPID,
    name: item.VAR_EMPLOYEE_ENGNAME,
    bioMetric: item.NUM_ATTENDENTRY_BIOMETRIC,
    attendance: item.NUM_ATTENDENTRY_ATTANDENSE,
    medicalLeave: item.NUM_ATTENDENTRY_MLDAYS,
    earnedLeave: item.NUM_ATTENDENTRY_ELDAYS,
    hp: item.NUM_ATTENDENTRY_HPDAYS,
    lwp: item.NUM_ATTENDENTRY_LWPDAYS,
    present: item.NUM_ATTENDENTRY_PRESENT,
    remark: item.VAR_ATTENDENTRY_MLREMRK || "-",
  }));

  useEffect(() => {
    if (ulbId) {
      const loadAllDropdowns = async () => {
        try {
          Swal.fire({
            title: "Loading Data...",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await Promise.all([
            fetchZones(),
            fetchCategories(),
            fetchDepartment(),
            fetchYears(),
          ]);

          Swal.close();
          setIsDropdownLoading(false);
        } catch (error) {
          console.error("Error loading dropdowns:", error);
          Swal.fire({
            text: "Error loading dropdown data. Please refresh the page.",
            confirmButtonColor: "#1e3a8a",
          });
          setIsDropdownLoading(false);
        }
      };

      loadAllDropdowns();
    }
  }, [ulbId]);


  useEffect(() => {
  const shouldFetch =
    yearOptions.length > 0 &&
    stateData?.category &&
    stateData?.zone &&
    stateData?.department &&
    stateData?.month &&
    stateData?.year;

  if (!shouldFetch) return;

  let isMounted = true;

  const load = async () => {
    Swal.fire({
      title: "Loading Data...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await fetchAttendanceDetails({
        category: stateData.category,
        zone: stateData.zone,
        department: stateData.department,
        month: stateData.month,
        year: stateData.year,
      });
    } finally {
      if (isMounted) Swal.close();
    }
  };

  load();
  
  return () => {
    isMounted = false;
    Swal.close();
  };
}, [yearOptions]);

  const handleDepartmentChange = (value, setFieldValue) => {
    setFieldValue("department", value);
  };

  const handleAttendanceAction = async (mode, values) => {
  if (!attendanceData || attendanceData.length === 0) {
    Swal.fire({
      text: "No attendance records available for action.",
    });
    return;
  }

  const actionName = mode === 2 ? "Approve" : "Reject";

  try {
    setLoading(true);

    const yearOption = yearOptions.find(
      (item) => item.value === String(values.year),
    );
    const selectedYear = Number(yearOption?.label || values.year);
    const selectedMonth = Number(values.month);
      const actionDate = getAttendanceDate(selectedYear, selectedMonth);
    const str = attendanceData
      .map((item) =>
        [
          item.NUM_EMPLOYEE_EMPID,
          item.VAR_EMPLOYEE_ENGNAME,
          item.NUM_ATTENDENTRY_BIOMETRIC,
          item.NUM_ATTENDENTRY_ATTANDENSE,
          item.NUM_ATTENDENTRY_MLDAYS,
          item.NUM_ATTENDENTRY_ELDAYS,
          item.NUM_ATTENDENTRY_HPDAYS,
          item.NUM_ATTENDENTRY_LWPDAYS,
          item.NUM_ATTENDENTRY_PRESENT,
          item.VAR_ATTENDENTRY_MLREMRK || "-",
          actionDate,
        ].join("$"),
      )
      .join("#"); 

    const payload = {
      userId: String(user?.userId || user?.USERID || ""),
      id: 0,
      category: Number(values.category),
      zone: Number(values.zone),
      department: Number(values.department),
      month: selectedMonth,
      year: selectedYear,
      str: str,       
      mode: mode,  
    };

    const response = await axios.post(
      `${BASE_URL}/api/FrmAttendenceExcellAuthListMst/attendance-action`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = response.data?.data;

    const isSuccess = result?.errorCode === 9999;

    if (isSuccess) {
      await Swal.fire({
        text: result?.message,
        confirmButtonColor: "#1e3a8a",
      });

      setAttendanceData([]);
      navigate("/Transactions/FrmAttendenceExcellAuthList");
    } else {
      await Swal.fire({
        text: result?.message || `${actionName} operation failed.`,
        confirmButtonColor: "#1e3a8a",
      });
    }
  } catch (error) {
    console.error(`${actionName} Attendance Error:`, error);

    Swal.fire({
      text:
        error?.response?.data?.message ||
        `Failed to ${actionName.toLowerCase()} attendance.`,
      confirmButtonColor: "#1e3a8a",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Formik initialValues={initialFormValues} enableReinitialize={true}>
      {({ values, setFieldValue, errors, touched, isSubmitting }) => {
        return (
          <Form>
            <Card className="shadow-sm border">
              <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Attendance Entry Authorization
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Category" />
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
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Zone" required />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.zone}
                      onValueChange={(v) => setFieldValue("zone", v)}
                    >
                      <SelectTrigger className="w-full h-9">
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
                    {errors.zone && touched.zone && (
                      <span className="text-red-500 text-sm">
                        {errors.zone}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Department" />
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Year" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.year}
                      onValueChange={(v) => setFieldValue("year", v)}
                    >
                      <SelectTrigger className="w-full h-9">
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Month" />
                      <span>:</span>
                    </div>
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
                  </div>
                </div>

                {attendanceData.length > 0 && (
                  <div className="mt-6 rounded-xl border overflow-hidden">
                    <ShadCNTable
                      headers={tableHeaders}
                      data={tableData}
                      keyMapping={keyMapping}
                      pagination={true}
                      rowsPerPage={10}
                      className="min-w-[1200px]"
                    />
                  </div>
                )}

                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    type="button"
                    disabled={
                      isSubmitting || loading || attendanceData.length === 0
                    }
                    className="bg-blue-800 hover:bg-blue-900"
                    onClick={() => handleAttendanceAction(2, values)}
                  >
                    {loading ? "Processing..." : "Approve"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      isSubmitting || loading || attendanceData.length === 0
                    }
                    onClick={() => handleAttendanceAction(3, values)}
                  >
                    {loading ? "Processing..." : "Reject"}
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

export default FrmAttendenceEntryAuth;
