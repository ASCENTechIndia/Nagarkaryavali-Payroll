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
import ShadCNTable from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

const FrmLoansAndAdvancesRpt = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeCodeOptions, setEmployeeCodeOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const initialFormValues = {
    category: "",
    zone: "",
    department: "",
    employeeCode: "",
    employeeName: "",
  };

  // CATEGORY
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmEmployeeMstList/employee-category-list`,
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.VAR_CATEGORY_NAME,
        value: String(item.NUM_CATEGORY_ID),
      }));

      setCategoryOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
    } catch (err) {
      console.error(err);
    }
  };

  // ZONE
  const fetchZones = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.ZONENAME,
        value: String(item.ZONEID),
      }));

      setZoneOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
    } catch (err) {
      console.error(err);
    }
  };

  // DEPARTMENT
  const fetchDepartment = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.DEPTNAME,
        value: String(item.DEPTID),
      }));

      setDepartmentOptions([{ value: "-1", label: "-- ALL --" }, ...formatted]);
    } catch (err) {
      console.error(err);
    }
  };

  // EMPLOYEE CODE LIST
  const fetchEmployeeCodes = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/employee-code-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      const formatted = apiData.map((item) => ({
        label: item.EMPLOYEECODE,
        value: String(item.EMPLOYEECODE),
      }));

      setEmployeeCodeOptions([{ value: "-1", label: "-- Select Option --" }, ...formatted]);
    } catch (err) {
      console.error(err);
    }
  };

  // SEARCH
  const handleSearch = async (values) => {
    setHasSearched(true);
    setLoading(true);

    try {
      const payload = {
        ulbid: Number(ulbId),
        paysheetType: values.category !== "-1" ? Number(values.category) : null,
        zoneId: values.zone !== "-1" ? Number(values.zone) : null,
        deptId: values.department !== "-1" ? Number(values.department) : null,
        employeeCode: values.employeeCode !== "-1" ? values.employeeCode : null,
        employeeName: values.employeeName || null,
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/employee-search`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      setFilteredData(apiData || []);

      if (apiData.length === 0) {
        Swal.fire({ text: "No records found" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ulbId) {
      fetchCategories();
      fetchZones();
      fetchDepartment();
      fetchEmployeeCodes();
    }
  }, [ulbId]);

  const handleSelectEmployee = (row) => {
    navigate("/", {
      state: {
        mode: 2,
        empId: row.NUM_EMPLOYEE_EMPID,
      },
    });
  };

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

  const tableRows = filteredData.map((row) => ({
    select: (
      <Button
        variant="link"
        onClick={() => handleSelectEmployee(row)}
      >
        Select
      </Button>
    ),
    employeeId: row.NUM_EMPLOYEE_EMPID,
    employeeName: row.EMPLOYEENAME,
    category: row.VAR_CATEGORY_NAME,
    designation: row.DESIGNATION,
    zone: row.VAR_ZONE_NAME,
    department: row.VAR_DEPTMST_DEPTNAMEE,
    presentAddress: row.VAR_EMPLOYEE_PSNTADDRESS,
    joinDate: row.DATE_EMPLOYEE_JOINDATE
      ? new Date(row.DATE_EMPLOYEE_JOINDATE).toLocaleDateString("en-GB")
      : "",
    confirmDate: row.DATE_EMPLOYEE_CONFIRMDATE
      ? new Date(row.DATE_EMPLOYEE_CONFIRMDATE).toLocaleDateString("en-GB")
      : "",
    retirementDate: row.DATE_EMPLOYEE_RETIREMNTDATE
      ? new Date(row.DATE_EMPLOYEE_RETIREMNTDATE).toLocaleDateString("en-GB")
      : "",
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
                  Loans And Advances List
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Category" />
                    </div>
                    <Select
                      value={values.category}
                      onValueChange={(v) => setFieldValue("category", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- ALL --" />
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
                       
                    </div>
                    <Select
                      value={values.zone}
                      onValueChange={(v) => setFieldValue("zone", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- ALL --" />
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
                       
                    </div>
                    <Select
                      value={values.department}
                      onValueChange={(v) => handleDepartmentChange(v, setFieldValue)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- ALL --" />
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

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Employee" />
                       
                    </div>
                    <Select
                      value={values.employee}
                      onValueChange={(v) => setFieldValue("employee", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- ALL --" />
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

                </div>

                <div className="flex justify-center gap-4">
                  <Button type="submit" disabled={isSubmitting || loading}>
                    {loading ? "Searching..." : "Search"}
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

export default FrmLoansAndAdvancesRpt;