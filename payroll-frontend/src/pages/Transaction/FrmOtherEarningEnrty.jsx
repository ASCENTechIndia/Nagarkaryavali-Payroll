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
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { DatePicker } from "@/components/ui/calendar";
import { FrmOtherEarningEntryValidationSchema } from "@/validations/global.validation";
import SearchableSelect from "@/components/SearchableSelect";

const FrmOtherEarningEnrty = () => {
  const { authUser } = useAuth();
  const authToken = authUser?.token;
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const token = storedToken || authToken;
  const user = storedUser || authUser;
  const ulbId = user?.orgId || user?.ulbId;
  const userId = user?.userId;

  const navigate = useNavigate();
  const location = useLocation();
  const { mode, empId, detId } = location.state || {};

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [earningHeadOptions, setEarningHeadOptions] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const defaultValues = {
    department: "",
    designation: "",
    employeeId: "",
    earningHead: "",
    amount: "",
    date: new Date(),
    remark: "",
    earnId: "0",
  };

  const [initialFormValues, setInitialFormValues] = useState(defaultValues);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchDepartments = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/department`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.DEPTNAME,
        value: String(item.DEPTID),
      }));
      setDepartmentOptions(formatted);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartmentOptions([]);
    }
  };

  const fetchDesignations = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstNewTest/designation-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.DESIG_ENAME,
        value: String(item.DESIG_ID),
      }));
      setDesignationOptions(formatted);
    } catch (err) {
      console.error("Error fetching designations:", err);
      setDesignationOptions([]);
    }
  };

  const fetchEarningHeads = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmOtherEarnEntryList/earning-head-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.VAR_OTHERPAYHEADS_ENAME,
        value: String(item.NUM_OTHERPAYHEADS_ID),
      }));
      setEarningHeadOptions(formatted);
    } catch (err) {
      console.error("Error fetching earning heads:", err);
      setEarningHeadOptions([]);
    }
  };

  const fetchEmployees = async (deptId = null, desgnId = null) => {
    try {
      if (!ulbId) return;

      setLoadingEmployees(true);

      const payload = {
        ulbid: Number(ulbId),
        deptId: deptId && deptId !== "0" ? Number(deptId) : null,
        desgnId: desgnId && desgnId !== "0" ? Number(desgnId) : null,
      };

      if (deptId && deptId !== "0" && deptId !== "-1") {
        payload.deptId = deptId;
      }

      if (desgnId && desgnId !== "0" && desgnId !== "-1") {
        payload.desgnId = desgnId;
      }

      const res = await axios.post(
        `${BASE_URL}/api/FrmOtherEarnEntryList/employee-list`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.EMPNAME,
        value: String(item.NUM_EMPLOYEE_EMPID),
      }));
      setEmployeeOptions(formatted);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployeeOptions([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchEmployeeDetails = async (empId) => {
    try {
      if (!ulbId || !empId || empId === "0") return null;

      const res = await axios.post(
        `${BASE_URL}/api/FrmOtherEarnEntryList/employee-details`,
        { ulbid: Number(ulbId), empId: empId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = res.data?.data?.data || res.data?.data;

      if (data) {
        return {
          deptId: String(data.NUM_EMPLOYEE_DEPTID),
          desgnId: String(data.NUM_EMPLOYEE_DESIGID),
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching employee details:", err);
      return null;
    }
  };

  const fetchEditRecord = async (empId, detId) => {
    try {
      if (!ulbId || !empId || empId === "0" || !detId || detId === "0")
        return null;

      const res = await axios.post(
        `${BASE_URL}/api/FrmOtherEarnEntryList/get-edit-record`,
        { ulbid: Number(ulbId), empId: empId, detId: detId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = res.data?.data?.data || res.data?.data;

      if (data) {
        const formData = {
          department: String(data.DEPARTMENT || data.department || ""),
          designation: String(data.DESIGNATION || data.designation || ""),
          employeeId: String(data.EMPID || data.empid || ""),
          earningHead: String(data.PAYHEAD_ID || data.payhead_id || ""),
          amount: String(data.AMOUNT || data.amount || ""),
          date:
            data.AMT_DATE || data.amt_date
              ? new Date(data.AMT_DATE || data.amt_date)
              : new Date(),
          remark: data.OTHER_REMARK || data.other_remark || "",
          earnId: String(data.DET_ID || data.det_id || "0"),
        };

        setInitialFormValues(formData);

        await fetchEmployees(formData.department, formData.designation);

        return formData;
      }
      return null;
    } catch (err) {
      console.error("Error fetching edit record:", err);
      return null;
    }
  };

  const formatDateForAPI = (date) => {
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
    const monthAbbr = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${monthAbbr}-${year}`;
  };

  const handleDepartmentChange = async (value, values, setFieldValue) => {
    setFieldValue("department", value);
    setFieldValue("employeeId", "");
    await fetchEmployees(value, values.designation || null);
  };

  const handleDesignationChange = async (value, values, setFieldValue) => {
    setFieldValue("designation", value);
    setFieldValue("employeeId", "");
    await fetchEmployees(values.department || null, value);
  };

  const handleEmployeeChange = async (value, setFieldValue) => {
    setFieldValue("employeeId", value);
    if (!value) return;
    const details = await fetchEmployeeDetails(value);
    if (!details) return;
    setFieldValue("department", String(details.deptId));
    setFieldValue("designation", String(details.desgnId));
    await fetchEmployees(String(details.deptId), String(details.desgnId));
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const validationResult =
      FrmOtherEarningEntryValidationSchema.safeParse(values);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      await Swal.fire({
        text: firstError.message,
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setSubmitting(true);
    setLoading(true);

    const pdfLoaderSwal = Swal.fire({
      title: 'Submitting...',
      text: 'Please wait while submitting',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const payload = {
        userId,
        empId: Number(values.employeeId),
        earnId: Number(values.earnId || 0),
        payheadId: Number(values.earningHead),
        amount: Number(values.amount),
        ulbid: Number(ulbId),
        deptId: Number(values.department),
        desigId: Number(values.designation),
        amtDate: formatDateForAPI(values.date),
        remark: values.remark.trim(),
        mode,
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmOtherEarnEntryList/save-other-earning`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      pdfLoaderSwal.close();

      if (res.data?.ok) {
        Swal.fire({
          text: res.data?.message || "Other earning entry saved successfully",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          navigate("/Transactions/FrmOtherEarnEntryList");
        });
      } else {
        Swal.fire({
          text: res.data?.message || "Failed to save entry",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire({
        text:
          err.response?.data?.message || err.message || "Something went wrong",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      if (!ulbId) return;

      setPageLoading(true);

      await Promise.allSettled([
        fetchDepartments(),
        fetchDesignations(),
        fetchEarningHeads(),
        fetchEmployees(),
      ]);

      setPageLoading(false);
    };

    if (mode !== 2) {
      loadInitial();
    }
  }, [ulbId, mode]);

  useEffect(() => {
    const loadEdit = async () => {
      if (mode !== 2 || !empId || !detId || !ulbId) return;

      setPageLoading(true);

      await Promise.allSettled([
        fetchDepartments(),
        fetchDesignations(),
        fetchEarningHeads(),
      ]);

      await fetchEditRecord(empId, detId);

      setPageLoading(false);
    };
    loadEdit();
  }, [mode, empId, detId, ulbId]);

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize={true}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, isSubmitting }) => {
        return (
          <Form>
            <Card className="shadow-sm border">
              <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Other Earning Entry
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Department" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.department}
                      onValueChange={(v) =>
                        handleDepartmentChange(v, values, setFieldValue)
                      }
                      disabled={mode === 2}
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
                      <Label text="Designation" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.designation}
                      onValueChange={(v) =>
                        handleDesignationChange(v, values, setFieldValue)
                      }
                      disabled={mode === 2}
                    >
                      <SelectTrigger className="w-full! h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Designation --" />
                      </SelectTrigger>
                      <SelectContent>
                        {designationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Employee Id" />
                      <span>:</span>
                    </div>
                    <SearchableSelect
                      value={values.employeeId}
                      options={employeeOptions}
                      loading={loadingEmployees}
                      placeholder="-- Select Employee --"
                      disabled={mode === 2}
                      onChange={(value) =>
                        handleEmployeeChange(value, setFieldValue)
                      }
                      className="w-full! h-9 overflow-hidden"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Earning Head" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.earningHead}
                      onValueChange={(v) => setFieldValue("earningHead", v)}
                    >
                      <SelectTrigger className="w-full! h-9 overflow-hidden">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>
                      <SelectContent>
                        {earningHeadOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Amount Text" />
                      <span>:</span>
                    </div>
                    <div className="w-full">
                      <Input
                        name="amount"
                        value={values.amount}
                        onChange={(e) =>
                          setFieldValue(
                            "amount",
                            e.target.value.replace(/[^0-9.]/g, ""),
                          )
                        }
                        type="text"
                        className="w-full h-9"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Date" />
                      <span>:</span>
                    </div>
                    <div className="w-full">
                      <DatePicker
                        value={values.date}
                        onChange={(date) => setFieldValue("date", date)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Remark" />
                      <span>:</span>
                    </div>
                    <div className="w-full">
                      <Input
                        name="remark"
                        value={values.remark}
                        onChange={(e) =>
                          setFieldValue("remark", e.target.value)
                        }
                        type="text"
                        className="w-full h-9"
                        placeholder="Enter remark"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="bg-blue-800 hover:bg-blue-900"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      navigate("/Transactions/FrmOtherEarnEntryList")
                    }
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

export default FrmOtherEarningEnrty;
