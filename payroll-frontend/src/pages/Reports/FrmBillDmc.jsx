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
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FrmBillDmcValidationSchema } from "../../validations/global.validation";

const FrmBillDmc = () => {
  const { authUser } = useAuth();
  const authToken = authUser?.token;
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const token = storedToken || authToken;
  const user = storedUser || authUser;
  const ulbId = user?.orgId || user?.ulbId;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [showGender, setShowGender] = useState(false);

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

  const yearOptions = [
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

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  const initialFormValues = {
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    department: "",
    gender: "Male",
  };

  const formatDateForAPI = (year, month) => {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
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
    return `${String(lastDay).padStart(2, "0")}-${monthAbbr}-${yearNum}`;
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
    }
  };

  useEffect(() => {
    if (ulbId) {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });
      fetchDepartment().then(() => Swal.close());
    }
  }, [ulbId]);

  const generateReport = async (values) => {
    let loaderSwal;

    try {
      const validationResult = FrmBillDmcValidationSchema.safeParse(values);

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];

        await Swal.fire({
          text: firstError.message,
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }

      setLoading(true);

      loaderSwal = Swal.fire({
        title: "Generating...",
        text: "Please wait while the reports are being generated",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const formattedSalaryDate = formatDateForAPI(values.year, values.month);

      const deptName =
        departmentOptions.find((d) => d.value === values.department)?.label ||
        "";

      const monthName =
        monthOptions.find((m) => m.value === values.month)?.label || "";

      const payload = {
        ulbid: Number(ulbId),
        deptId: values.department,
        deptName: deptName,
        gender: values.department === "406" ? values.gender : null,
        lstdate: formattedSalaryDate,
        monthName,
        yearName: values.year,
      };

      const billDmcResponse = await axios.post(
        `${BASE_URL}/api/FrmEmpLstRpt/bill-dmc-pdf`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "json",
        },
      );

      console.log("📄 Bill DMC Response:", billDmcResponse.data);

      if (!billDmcResponse.data?.success || !billDmcResponse.data?.pdfUrl) {
        throw new Error(
          billDmcResponse.data?.message || "Failed to generate Bill DMC report",
        );
      }

      const billDmcPdfUrl = billDmcResponse.data.pdfUrl;

      const summaryResponse = await axios.post(
        `${BASE_URL}/api/FrmEmpLstRpt/summary-report-pdf`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "json",
        },
      );


      if (!summaryResponse.data?.success || !summaryResponse.data?.pdfUrl) {
        throw new Error(
          summaryResponse.data?.message || "Failed to generate Summary Report",
        );
      }

      const summaryPdfUrl = summaryResponse.data.pdfUrl;

      loaderSwal?.close();

      window.open(billDmcPdfUrl, "_blank");
      window.open(summaryPdfUrl, "_blank");

      await Swal.fire({
        text: "Both reports generated successfully!",
        confirmButtonColor: "#1e3a8a",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Report Generation Error:", error);

      loaderSwal?.close();

      Swal.fire({
        text:
          error.response?.data?.message ||
          error.message ||
          "Error generating reports",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (value, setFieldValue) => {
    setFieldValue("department", value);
    setFieldValue("gender", "Male");
    setShowGender(value === "406");
  };

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize
      onSubmit={generateReport}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form>
          <Card className="shadow-sm border">
            <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                तेरीज पत्रक
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
                {/* DATE */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Date" required />
                    <span>:</span>
                  </div>
                  <div className="flex gap-2 flex-1">
                    <Select
                      value={values.month}
                      onValueChange={(v) => setFieldValue("month", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
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
                      <SelectContent>
                        {yearOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Department" required />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.department}
                    onValueChange={(v) =>
                      handleDepartmentChange(v, setFieldValue)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Department --" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showGender && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Gender" required />
                      <span>:</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {genderOptions.map((o) => (
                        <div key={o.value} className="flex items-center gap-1">
                          <Input
                            type="radio"
                            name="gender"
                            value={o.value}
                            checked={values.gender === o.value}
                            onChange={() => setFieldValue("gender", o.value)}
                            className="w-4 h-4 "
                          />
                          <span className="font-medium text-gray-700 text-sm cursor-pointer">
                            {o.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="bg-blue-800 hover:bg-blue-900"
                >
                  {loading ? "Processing..." : "Print"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/HomePage/FrmHomePage")}
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmBillDmc;
