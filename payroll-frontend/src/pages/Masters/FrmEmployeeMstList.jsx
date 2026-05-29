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

const FrmEmployeeMstList = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const initialFormValues = {
    category: "-1",
    zone: "-1",
    department: "-1",
    employeeCode: "",
    employeeName: "",
    subDepartment: "-1",
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

  const fetchSubDepartment = async (deptId) => {
    try {
      if (!ulbId || !deptId || deptId === "-1") {
        setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
        return;
      }
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/subdepartment-list`,
        { 
          ulbid: Number(ulbId),
          deptId: Number(deptId)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_DEPTSUB_SDEPTNAMEE,
          value: String(item.NUM_DEPTSUB_ID),
        }));
        setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
      } else {
        setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
      }
    } catch (err) {
      console.error("Error fetching sub-departments:", err);
      setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
    }
  };

  const handleSearch = async (values) => {
    setHasSearched(true);
    setLoading(true);
    try {
      if (!ulbId) {
        Swal.fire({ text: "ULB ID not found", confirmButtonColor: "#1e3a8a" });
        return;
      }

      const payload = {
        ulbid: Number(ulbId),
        paysheetType: values.category && values.category !== "-1" ? Number(values.category) : null,
        zoneId: values.zone && values.zone !== "-1" ? Number(values.zone) : null,
        deptId: values.department && values.department !== "-1" ? Number(values.department) : null,
        subDeptId: values.subDepartment && values.subDepartment !== "-1" ? Number(values.subDepartment) : null,
        employeeCode: values.employeeCode || null,
        employeeName: values.employeeName || null,
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/employee-search`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        setFilteredData(apiData);
      } else {
        setFilteredData([]);
        Swal.fire({
          text: "No records found",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Search Error:", error);
      setFilteredData([]);
      Swal.fire({
        text: error.response?.data?.message || "Error searching employees",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setHasSearched(false);
      setLoading(false);
    }
  };

  const handleDepartmentChange = (value, setFieldValue) => {
    setFieldValue("department", value);
    setFieldValue("subDepartment", "");
    if (value && value !== "-1") {
      fetchSubDepartment(value);
    } else {
      setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
    }
  };

  useEffect(() => {
    if (ulbId) {
      fetchCategories();
      fetchZones();
      fetchDepartment();
      setSubDepartmentOptions([{ value: "-1", label: "-- ALL --" }]);
    }
  }, [ulbId]);

  const headers = [
    "Select",
    "Employee Id",
    "Employee Name",
    "Category",
    "Designation",
    "Zone",
    "Department",
    "Present Address",
    "Join Date",
    "Confirm Date",
    "Retirement Date",
  ];

  const keyMapping = {
    Select: "select",
    "Employee Id": "employeeId",
    "Employee Name": "employeeName",
    Category: "category",
    Designation: "designation",
    Zone: "zone",
    Department: "department",
    "Present Address": "presentAddress",
    "Join Date": "joinDate",
    "Confirm Date": "confirmDate",
    "Retirement Date": "retirementDate"
  };

  const handleSelectEmployee = (row) => {
    navigate("/Masters/FrmEmployeeMstNewTest", {
      state: {
        mode: 2,
        empId: row.NUM_EMPLOYEE_EMPID
      },
    });
  };

  const tableRows = filteredData.map((row) => ({
    select: (
      <Button
        variant="link"
        size="sm"
        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
        onClick={() => handleSelectEmployee(row)}
      >
        Select
      </Button>
    ),
    employeeId: row.NUM_EMPLOYEE_EMPID || "",
    employeeName: row.EMPLOYEENAME || "",
    category: row.VAR_CATEGORY_NAME || "",
    designation: row.DESIGNATION || "",
    zone: row.VAR_ZONE_NAME || "",
    department: row.VAR_DEPTMST_DEPTNAMEE || "",
    presentAddress: row.VAR_EMPLOYEE_PSNTADDRESS || "",
    joinDate: row.DATE_EMPLOYEE_JOINDATE ? new Date(row.DATE_EMPLOYEE_JOINDATE).toLocaleDateString("en-GB") : "",
    confirmDate: row.DATE_EMPLOYEE_CONFIRMDATE ? new Date(row.DATE_EMPLOYEE_CONFIRMDATE).toLocaleDateString("en-GB") : "",
    retirementDate: row.DATE_EMPLOYEE_RETIREMNTDATE ? new Date(row.DATE_EMPLOYEE_RETIREMNTDATE).toLocaleDateString("en-GB") : "",
  }));

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize={true}
      onSubmit={handleSearch}
    >
      {({ values, setFieldValue, isSubmitting, resetForm }) => {
        return (
          <Form>
            <Card className="shadow-sm border">
              <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Employee Master
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Category" />
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
                      onValueChange={(v) => handleDepartmentChange(v, setFieldValue)}
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

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Employee Code" />
                      <span>:</span>
                    </div>
                    <Input
                      name="employeeCode"
                      value={values.employeeCode}
                      onChange={(e) => setFieldValue("employeeCode", e.target.value)}
                      type="text"
                      className="w-full h-9"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Employee Name" className={"sm: whitespace-nowrap"} />
                      <span>:</span>
                    </div>
                    <Input
                      name="employeeName"
                      value={values.employeeName}
                      onChange={(e) => setFieldValue("employeeName", e.target.value)}
                      type="text"
                      className="w-full h-9"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Sub Department" className={"sm: whitespace-nowrap"} />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.subDepartment}
                      onValueChange={(v) => setFieldValue("subDepartment", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- विकल्प निवडा --" />
                      </SelectTrigger>
                      <SelectContent>
                        {subDepartmentOptions.length > 0 ? (
                          subDepartmentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="-1">-- ALL --</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button type="submit" disabled={isSubmitting || loading}>
                    {loading ? "Searching..." : "Search"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate("/Masters/FrmEmployeeMstNewTest", { state: { mode: 1 } })}
                    className="bg-blue-900 hover:bg-blue-800 text-white hover:text-white w-full sm:w-auto"
                  >
                    Add New
                  </Button>
                </div>

                <div>
                  {loading && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      Loading...
                    </div>
                  )}

                  {!loading && filteredData.length > 0 && (
                    <ShadCNTable
                      headers={headers}
                      data={tableRows}
                      keyMapping={keyMapping}
                      pagination={true}
                      rowsPerPage={5}
                      className="max-md:min-w-380"
                    />
                  )}

                  {hasSearched && !loading && filteredData.length === 0 && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No records found.
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

export default FrmEmployeeMstList;