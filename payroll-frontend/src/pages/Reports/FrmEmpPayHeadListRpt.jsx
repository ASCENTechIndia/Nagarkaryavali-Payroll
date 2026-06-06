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
import ShadCNTable from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { FrmEmpPayHeadListValidationSchema } from "@/validations/global.validation";

const FrmEmpPayHeadListRpt = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
  const [payHeadOptions, setPayHeadOptions] = useState([]);
  const [employeeCodeOptions, setEmployeeCodeOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const initialFormValues = {
    category: "-1",
    zone: "-1",
    department: "-1",
    employeeCode: "",
    payHead: "",
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmEmployeeMstList/employee-category-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_CATEGORY_NAME,
          value: String(item.NUM_CATEGORY_ID),
        }));
        setCategoryOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchZones = async () => {
    try {
      if (!ulbId) return;
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.ZONENAME,
          value: String(item.ZONEID),
        }));
        setZoneOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
      }
    } catch (err) {
      console.error("Error fetching zones:", err);
    }
  };

  const fetchDepartment = async () => {
    try {
      if (!ulbId) return;
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.DEPTNAME,
          value: String(item.DEPTID),
        }));
        setDepartmentOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchPayHead = async () => {
      try {
        if (!ulbId) return;
        
        const res = await axios.post(
          `${BASE_URL}/api/FrmPayHeadConfigList/payheaddll`,
          { ulbId: Number(ulbId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const apiData = res?.data || res.data?.data || [];
        
        if (apiData.length > 0) {
          const formatted = apiData.map((item) => ({
            label: item.VAR_PAYHEADS_ENAME,
            value: String(item.NUM_PAYHEADS_ID),
          }));
          setPayHeadOptions(formatted);
        }
      } catch (err) {
        console.error("Error fetching zones:", err);
      }
  };

  const fetchEmployeeCodeOptions = async () => {
      try {
        if (!ulbId) return;
        
        const res = await axios.post(
          `${BASE_URL}/api/FrmEmpPayHeadListRpt/employee-list`,
          { ulbid: Number(ulbId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const apiData = res?.data.data || res.data?.data.data || [];
        
        if (apiData.length > 0) {
          const formatted = apiData.map((item) => ({
            label: item.EMPNAME,
            value: String(item.NUM_EMPLOYEE_EMPID),
          }));
          setEmployeeCodeOptions(formatted);
        }
      } catch (err) {
        console.error("Error fetching zones:", err);
      }
  };

  const generatePDF = async (values) => {
    let loaderSwal;
    
    try {
      const validationResult = FrmEmpPayHeadListValidationSchema.safeParse(values);

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
        title: "Generating PDF...",
        text: "Please wait while we generate the report",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      
      const payload = {
        ulbid: Number(ulbId),
        categoryId: values.category !== "-1" ? values.category : null,
        zoneId: values.zone !== "-1" ? values.zone : null,
        deptId: values.department !== "-1" ? values.department : null,
        employeeId: values.employeeCode !== "0" ? values.employeeCode : null,
        payHeadId: values.payHead,
      };
      
      const response = await axios.post(
        `${BASE_URL}/api/FrmEmpPayHeadListRpt/generate-payhead-report`,
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'json'
        }
      );
      
      loaderSwal.close();
      
      if (response.data?.success && response.data?.pdfUrl) {
        window.open(response.data.pdfUrl, '_blank');
        Swal.fire({
          text: "PDF generated successfully!",
          confirmButtonColor: "#1e3a8a",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          text: response.data?.message || "Failed to generate PDF",
          confirmButtonColor: "#1e3a8a"
        });
      }
    } catch (error) {
      console.error("PDF Generation Error:", error);
      loaderSwal?.close();
      Swal.fire({
        text: error.response?.data?.message || "Error generating PDF report",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    if (ulbId) {
      fetchCategories();
      fetchZones();
      fetchDepartment();
      fetchPayHead();
      fetchEmployeeCodeOptions();
    }
  }, [ulbId]);

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize={true}
      onSubmit={generatePDF}
    >
      {({ values, setFieldValue, isSubmitting, resetForm }) => {
        return (
          <Form>
            <Card className="shadow-sm border">
              <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Employee wise Payhead Report
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Category" required />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.category}
                      onValueChange={(v) => setFieldValue("category", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- विकल्प निवडा --" />
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

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Zone" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.zone}
                      onValueChange={(v) => setFieldValue("zone", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- विकल्प निवडा --" />
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
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Department" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.department}
                      onValueChange={(v) => setFieldValue("department", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- विकल्प निवडा --" />
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
                        <Label text="Employee Code" />
                        <span>:</span>
                    </div>
                    <Select
                        value={values.payHead}
                        onValueChange={(v) => setFieldValue("payHead", v)}
                    >
                        <SelectTrigger className="w-full! h-9 overflow-hidden">
                        <SelectValue placeholder="-- विकल्प निवडा --" />
                        </SelectTrigger>
                        <SelectContent>
                        {employeeCodeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                            {option.label}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="PayHead" required />
                        <span>:</span>
                    </div>
                    <Select
                        value={values.payHead}
                        onValueChange={(v) => setFieldValue("payHead", v)}
                    >
                        <SelectTrigger className="w-full! h-9 overflow-hidden">
                        <SelectValue placeholder="-- विकल्प निवडा --" />
                        </SelectTrigger>
                        <SelectContent>
                        {payHeadOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                            {option.label}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button type="submit" disabled={isSubmitting || loading}>
                    {loading ? "Printing..." : "Print"}
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

export default FrmEmpPayHeadListRpt;