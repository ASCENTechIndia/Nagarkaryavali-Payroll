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
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { DatePicker } from "@/components/ui/calendar";
import { FrmEmployeeRetireValidationSchema } from "@/validations/global.validation";
import SearchableSelect from "@/components/SearchableSelect";

const FrmEmployeeRetire = () => {
  const { authUser } = useAuth();
  const authToken = authUser?.token;
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const token = storedToken || authToken;
  const user = storedUser || authUser;
  const ulbId = user?.orgId || user?.ulbId;
  const userId = user?.userId;

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [retirementReasonOptions, setRetirementReasonOptions] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const initialFormValues = {
    department: "",
    subDepartment: "",
    employeeId: "",
    retirementReason: "",
    otherReason: "",
    retireDate: null,
    remark: "",
  };

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchRetirementReasons = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeRetire/retirement-reasons`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.VAR_RETRES_NAME,
        value: String(item.NUM_RETRES_ID),
      }));
      setRetirementReasonOptions(formatted);
    } catch (err) {
      console.error("Error fetching retirement reasons:", err);
      setRetirementReasonOptions([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeRetire/departments`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
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

  const fetchSubDepartments = async (deptId) => {
    try {
      if (!ulbId || !deptId || deptId === "0") {
        setSubDepartmentOptions([]);
        return;
      }

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeRetire/sub-departments`,
        {
          ulbid: Number(ulbId),
          deptId: Number(deptId),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.VAR_DEPTSUB_SDEPTNAMEE,
        value: String(item.NUM_DEPTSUB_ID),
      }));
      setSubDepartmentOptions(formatted);
    } catch (err) {
      console.error("Error fetching sub-departments:", err);
      setSubDepartmentOptions([]);
    }
  };

  const fetchEmployees = async (deptId = null, subDeptId = null) => {
    try {
      if (!ulbId) return;

      setLoadingEmployees(true);

      const payload = {
        ulbid: Number(ulbId),
      };

      if (deptId && deptId !== "0" && deptId !== "-1") {
        payload.deptId = deptId;
      }

      if (subDeptId && subDeptId !== "0" && subDeptId !== "-1") {
        payload.subDeptId = subDeptId;
      }

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeRetire/employees`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
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

  const handleDepartmentChange = async (value, setFieldValue) => {
    setFieldValue("department", value);
    setFieldValue("subDepartment", "");
    setFieldValue("employeeId", "");
    await fetchSubDepartments(value);
    await fetchEmployees(value, null);
  };

  const handleSubDepartmentChange = async (value, setFieldValue, values) => {
    setFieldValue("subDepartment", value);
    setFieldValue("employeeId", "");
    await fetchEmployees(values.department, value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setFileName("");
      return;
    }

    // Validate file size (300 KB max as per C# code)
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > 300) {
      Swal.fire({
        text: "File size cannot exceed 300 KB",
        confirmButtonColor: "#1e3a8a",
      });
      event.target.value = "";
      setSelectedFile(null);
      setFileName("");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        text: "Only JPG, PNG, PDF, and Word files are allowed",
        confirmButtonColor: "#1e3a8a",
      });
      event.target.value = "";
      setSelectedFile(null);
      setFileName("");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
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

  const handleSubmit = async (values, { setSubmitting }) => {
    const validationResult = FrmEmployeeRetireValidationSchema.safeParse(values);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      await Swal.fire({
        text: firstError.message,
        confirmButtonColor: "#1e3a8a",
      });
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    setLoading(true);

    const loaderSwal = Swal.fire({
      title: "Submitting...",
      text: "Please wait while submitting",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const payload = {
        userId: userId,
        empId: Number(values.employeeId),
        deptId: Number(values.department),
        subDeptId: values.subDepartment ? Number(values.subDepartment) : 0,
        reasonId: Number(values.retirementReason),
        othReason: values.otherReason || "",
        retireDate: formatDateForAPI(values.retireDate),
        ulbid: Number(ulbId),
        remark: values.remark || "",
      };

      const formData = new FormData();
      
      Object.keys(payload).forEach(key => {
        formData.append(key, String(payload[key]));
      });

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeRetire/save`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      loaderSwal.close();

      if (res.data?.success) {
        await Swal.fire({
          text: res.data?.message || "Employee retired successfully",
          confirmButtonColor: "#1e3a8a",
        });
        navigate("/Transactions/FrmEmployeeRetireList");
      } else {
        await Swal.fire({
          text: res.data?.message || "Failed to save entry",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      loaderSwal.close();
      await Swal.fire({
        text:
          err.response?.data?.error || err.error || "Something went wrong",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  useEffect(() => {
    const loadInitial = async () => {
      if (!ulbId || !token) return;

      setPageLoading(true);

      try {
        await Promise.allSettled([
          fetchDepartments(),
          fetchRetirementReasons(),
          fetchEmployees(),
        ]);
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        setPageLoading(false);
      }
    };

    loadInitial();
  }, [ulbId, token]);

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
      {({ values, setFieldValue, isSubmitting }) => (
        <Form>
          <Card className="shadow-sm border">
            <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                Employee Retirement Form
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
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
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Sub-Department" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.subDepartment}
                    onValueChange={(v) =>
                      handleSubDepartmentChange(v, setFieldValue, values)
                    }
                    disabled={!values.department}
                  >
                    <SelectTrigger className="w-full! h-9 overflow-hidden">
                      <SelectValue placeholder="-- Select Sub-Department --" />
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

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Employee Name" />
                        <span>:</span>
                    </div>
                    <SearchableSelect
                        value={values.employeeId}
                        options={employeeOptions}
                        loading={loadingEmployees}
                        placeholder="-- Select Employee --"
                        onChange={(value) => {
                        setFieldValue("employeeId", value);
                        }}
                        className="w-full! h-9 overflow-hidden"
                    />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Retirement Reason" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.retirementReason}
                    onValueChange={(v) => {
                      setFieldValue("retirementReason", v);
                      if (v !== "4") {
                        setFieldValue("otherReason", "");
                      }
                    }}
                  >
                    <SelectTrigger className="w-full! h-9 overflow-hidden">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {retirementReasonOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {values.retirementReason === "4" && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="If other, please specify" />
                        <span>:</span>
                    </div>
                    <Input
                      id="otherReason"
                      type="text"
                      value={values.otherReason}
                      onChange={(e) =>
                        setFieldValue("otherReason", e.target.value)
                      }
                      placeholder="Please specify other reason"
                      className="w-full! h-9 overflow-hidden"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Retire Date" />
                    <span>:</span>
                  </div>
                  <DatePicker
                    value={values.retireDate}
                    onChange={(date) => setFieldValue("retireDate", date)}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Upload Order" />
                    <span>:</span>
                   </div>
                  <div className="flex flex-col space-y-2">
                    <Input
                      id="uploadOrder"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="w-full h-10 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold"
                      accept=".pdf,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>

                {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Remark" />
                    <span>:</span>
                   </div>
                  <Input
                    id="remark"
                    type="text"
                    value={values.remark}
                    onChange={(e) => setFieldValue("remark", e.target.value)}
                    placeholder="Enter remark (if any)"
                    className="w-full! h-9 overflow-hidden"
                  />
                </div> */}
              </div>

              <div className="flex justify-center gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="bg-blue-800 hover:bg-blue-900 text-white px-8"
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="px-8"
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

export default FrmEmployeeRetire;