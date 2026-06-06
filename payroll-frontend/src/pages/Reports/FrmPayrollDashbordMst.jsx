import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShadCNTable from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const FrmPayrollDashbordMst = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDesig, setSelectedDesig] = useState(null);
  
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      if (!ulbId) {
        Swal.fire({ text: "ULB ID not found", confirmButtonColor: "#1e3a8a" });
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/api/FrmPayrollDashbordMst/departments`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = response?.data?.data?.data || response?.data?.data || [];
      
      if (apiData.length > 0) {
        setDepartments(apiData);
        setCurrentLevel(1);
      } else {
        setDepartments([]);
        Swal.fire({
          text: "No departments found",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
      Swal.fire({
        text: error.response?.data?.message || "Error fetching departments",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignations = async (deptId, deptName) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmPayrollDashbordMst/designations`,
        { 
          ulbid: Number(ulbId), 
          deptid: deptId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = response?.data?.data?.data || response?.data?.data || [];
      
      if (apiData.length > 0) {
        setDesignations(apiData);
        setSelectedDept({ id: deptId, name: deptName });
        setCurrentLevel(2);
      } else {
        setDesignations([]);
        Swal.fire({
          text: "No designations found for this department",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
      setDesignations([]);
      Swal.fire({
        text: error.response?.data?.message || "Error fetching designations",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEmployees = async (desigId, desigName) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmPayrollDashbordMst/employees`,
        { 
          ulbid: Number(ulbId), 
          corpId: String(ulbId),
          deptid: selectedDept.id,
          designationid: desigId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = response?.data?.data?.data || response?.data?.data || [];
      
      if (apiData.length > 0) {
        setEmployees(apiData);
        setSelectedDesig({ id: desigId, name: desigName });
        setCurrentLevel(3);
      } else {
        setEmployees([]);
        Swal.fire({
          text: "No employees found for this designation",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      Swal.fire({
        text: error.response?.data?.message || "Error fetching employees",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentLevel === 3) {
      setCurrentLevel(2);
      setEmployees([]);
      setSelectedDesig(null);
    } else if (currentLevel === 2) {
      setCurrentLevel(1);
      setDesignations([]);
      setSelectedDept(null);
    }
  };

  const handleSelectDepartment = (row) => {
    fetchDesignations(row.DEPTID, row.DEPTNAMEE);
  };

  const handleSelectDesignation = (row) => {
    fetchEmployees(row.DESIGNATIONID, row.DESIGNATIONNAME);
  };

  useEffect(() => {
    if (ulbId) {
      fetchDepartments();
    }
  }, [ulbId]);

  const departmentHeaders = ["Select", "Department", "Employee Count"];
  const departmentKeyMapping = {
    Select: "select",
    Department: "department",
    "Employee Count": "empCount",
  };

  const departmentRows = departments.map((row) => ({
    select: (
      <Button
        variant="link"
        size="sm"
        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
        onClick={() => handleSelectDepartment(row)}
      >
        Select
      </Button>
    ),
    department: row.DEPTNAMEE ?? "",
    empCount: row.EMPCOUNT ?? 0,
  }));

  const designationHeaders = ["Select", "Designation", "Employee Count"];
  const designationKeyMapping = {
    Select: "select",
    Designation: "designation",
    "Employee Count": "empCount",
  };

  const designationRows = designations.map((row) => ({
    select: (
      <Button
        variant="link"
        size="sm"
        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
        onClick={() => handleSelectDesignation(row)}
      >
        Select
      </Button>
    ),
    designation: row.DESIGNATIONNAME ?? "",
    empCount: row.EMPCOUNT ?? 0,
  }));

  const employeeHeaders = [
    "Employee Name",
    "Present Address",
    "Mobile No",
    "D-O-B",
    "Joining Date"
  ];
  
  const employeeKeyMapping = {
    "Employee Name": "employeeName",
    "Present Address": "address",
    "Mobile No": "mobileNo",
    "D-O-B": "dob",
    "Joining Date": "joiningDate",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = match[1];
      const month = match[2];
      const day = match[3];
      return `${day}/${month}/${year}`;
    }
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };

  const employeeRows = employees.map((row) => ({
    employeeName: row.VAR_EMPLOYEE_ENGNAME ?? "",
    address: row.PSNTADDRESS ?? "",
    mobileNo: row.MOBILENO ?? 0,
    dob: row.DOB ? formatDate(row.DOB) : "",
    joiningDate: row.JOINDATE ? formatDate(row.JOINDATE) : "-",
  }));

  const renderNavigationHeader = () => {
    if (currentLevel === 1) {
      return <div className="mb-4"></div>
    }
    else if (currentLevel === 2) {
      return (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-1"
            >
              Back
            </Button>
            <span className="text-md font-medium text-black ml-2">
              Department Name &gt;&gt; {selectedDept?.name}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-1"
            >
              Back
            </Button>
            <span className="text-md font-medium text-black ml-2">
              Department Name &gt;&gt; {selectedDept?.name} &gt;&gt; Designation Name &gt;&gt; {selectedDesig?.name}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold">
          Payroll Dashboard
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        {renderNavigationHeader()}

        {loading && (
          <div className="flex justify-center items-center py-8 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            <span className="ml-2 text-gray-600">Loading Data...</span>
          </div>
        )}

        {!loading && currentLevel === 1 && departments.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <ShadCNTable
              headers={departmentHeaders}
              data={departmentRows}
              keyMapping={departmentKeyMapping}
              pagination={true}
              rowsPerPage={5}
              className="w-full"
            />
          </div>
        )}

        {!loading && currentLevel === 2 && designations.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <ShadCNTable
              headers={designationHeaders}
              data={designationRows}
              keyMapping={designationKeyMapping}
              pagination={true}
              rowsPerPage={5}
              className="w-full"
            />
          </div>
        )}

        {!loading && currentLevel === 3 && employees.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <ShadCNTable
              headers={employeeHeaders}
              data={employeeRows}
              keyMapping={employeeKeyMapping}
              pagination={true}
              rowsPerPage={5}
              className="w-full"
            />
          </div>
        )}

        {!loading && currentLevel === 1 && departments.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No departments found</p>
          </div>
        )}
        
        {!loading && currentLevel === 2 && designations.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No designations found for this department</p>
          </div>
        )}
        
        {!loading && currentLevel === 3 && employees.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No employees found for this designation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FrmPayrollDashbordMst;