import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";

const FrmGenericSearch = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [joiningDate, setJoiningDate] = useState(null);
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState("");
  const [corporationId, setCorporationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [empEnglishName, setEmpEnglishName] = useState("");
  const [empMarathiName, setEmpMarathiName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [corporationOptions, setCorporationOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);


  useEffect(() => {
    if (!token) return;

    const loadMasters = async () => {
      Swal.fire({
        text: "Please wait",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const results = await Promise.allSettled([
          fetchCorporationList(),
          fetchDepartmentList(ulbId),
          fetchDesignationList(ulbId),
          fetchCategoryList(ulbId),
          fetchZoneList(ulbId),
        ]);
        results.forEach((result) => {
          if (result.status === "rejected") {
            console.error(result.reason);
          }
        });
      } finally {
        Swal.close();
      }
    };

    loadMasters();
  }, [token]);

  const fetchCorporationList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/FrmGenericSearch/get-corporation`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rows = res?.data?.data?.data || [];
      if (rows.length === 0) {
        await Swal.fire({
          text: "No data for Corporation Dropdown",
        });
        return;
      }
      // setCorporationOptions(
      //   rows.map((item) => ({
      //     value: item.CORPORATIONID.toString(),
      //     label: item.CORPORATIONNAME,
      //   }))
      // );

      const options = rows.map((item) => ({
        value: item.CORPORATIONID.toString(),
        label: item.CORPORATIONNAME,
      }));

      setCorporationOptions(options);

      const defaultCorp = rows.find(
        (item) => Number(item.CORPORATIONID) === Number(ulbId)
      );
      if (defaultCorp) {
        setCorporationId(defaultCorp.CORPORATIONID.toString());
      }
    } catch (error) {
      await Swal.fire({
        text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong",
      });
    }
  };

  const fetchDepartmentList = async (selectedUlb) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: Number(selectedUlb) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rows = res?.data?.data?.data || [];
      setDepartmentOptions(
        rows.map((item) => ({
          value: item.DEPTID.toString(),
          label: item.DEPTNAME,
        }))
      );
    } catch (error) {
      await Swal.fire({
        text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong",
      });
    }
  };

  const fetchDesignationList = async (selectedUlb) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/designation-list`,
        { ulbid: Number(selectedUlb) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rows = res?.data?.data?.data || [];
      setDesignationOptions(
        rows.map((item) => ({
          value: item.DESIG_ID.toString(),
          label: item.DESIG_ENAME,
        }))
      );
    } catch (error) {
      await Swal.fire({
        text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong",
      });
    }
  };

  const fetchCategoryList = async (selectedUlb) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/employee-category-list`,
        { ulbid: Number(selectedUlb) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rows = res?.data?.data?.data || [];
      setCategoryOptions(
        rows.map((item) => ({
          value: item.NUM_CATEGORY_ID.toString(),
          label: item.VAR_CATEGORY_NAME,
        }))
      );
    } catch (error) {
      await Swal.fire({
        text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong",
      });
    }
  };

  const fetchZoneList = async (selectedUlb) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
        { ulbid: Number(selectedUlb) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rows = res?.data?.data?.data || [];
      setZoneOptions(
        rows.map((item) => ({
          value: item.ZONEID.toString(),
          label: item.ZONENAME,
        }))
      );
    } catch (error) {
      await Swal.fire({
        text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong",
      });
    }
  };

  const handleCorporationChange = async (value) => {
    setCorporationId(value);

    await Promise.all([
      fetchDepartmentList(value),
      fetchDesignationList(value),
      fetchCategoryList(value),
      fetchZoneList(value),
    ]);
  };

  const handleSelect = (row) => {
    navigate("/Transactions/FrmEmployeeDtls", {
      state: {
        mode: 2,
        empId: row.NUM_EMPLOYEE_EMPID,
      },
    });
  };

  const handleSearch = async () => {
    try {
      Swal.fire({
        text: "Searching...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        ulbid: Number(corporationId || ulbId),
        deptid: departmentId || null,
        sequence: null,
        empid: employeeCode || null,
        desigid: designationId || null,
        empName: empEnglishName || null,
        empNameM: empMarathiName || null,
        paysheettype: categoryId || null,
        mobileno: mobileNo || null,
        gender: gender || null,
        zoneid: zoneId || null,
        dob: birthDate || null,
        joinDate: joiningDate || null,
      };

      const res = await axios.post(`${BASE_URL}/api/FrmGenericSearch/employee-search`, payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rows = res?.data?.data?.data || [];

      if (rows.length === 0) {
        setTableData([]);
        setShowTable(true);
        Swal.close();
        await Swal.fire({
          text: "No records found",
        });
        return;
      }

      const formattedRows = rows.map((row) => ({
        ...row,
        SELECT: (
          <Button
            variant="link"
            size="sm"
            className="px-0 text-blue-700"
            onClick={() => handleSelect(row)}
          >
            Select
          </Button>
        ),
      }));

      setTableData(formattedRows);
      setShowTable(true);
      Swal.close();
    } catch (error) {
      Swal.close();

      await Swal.fire({
        text: error?.response?.data?.message || error?.response?.data?.error || error?.message,
      });
    }
  };

  const tableHeaders = [
    "Select",
    "Employee Id",
    "Employee Name",
    "Department",
    "Category",
    "Zone",
  ];

  const keyMapping = {
    Select: "SELECT",
    "Employee Id": "NUM_EMPLOYEE_EMPID",
    "Employee Name": "VAR_EMPLOYEE_ENGNAME",
    Department: "VAR_DEPTMST_DEPTNAMEE",
    Category: "VAR_CATEGORY_NAME",
    Zone: "VAR_ZONE_NAME",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-bold">
            Generic Search
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Corporation" />
                <span>:</span>
              </div>
              <Select
                value={corporationId}
                onValueChange={handleCorporationChange}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="-- Select Corporation --" />
                </SelectTrigger>

                <SelectContent>
                  {corporationOptions.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Employee Name" />
                <span>:</span>
              </div>
              <Input
                value={empEnglishName}
                onChange={(e) =>
                  setEmpEnglishName(e.target.value)
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Employee Marathi" />
                <span>:</span>
              </div>
              <Input
                value={empMarathiName}
                onChange={(e) =>
                  setEmpMarathiName(e.target.value)
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Employee Code" />
                <span>:</span>
              </div>
              <Input
                value={employeeCode}
                onChange={(e) =>
                  setEmployeeCode(e.target.value)
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Department" />
                <span>:</span>
              </div>
              <Select
                value={departmentId}
                onValueChange={setDepartmentId}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="-- All --" />
                </SelectTrigger>

                <SelectContent>
                  {departmentOptions.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Designation" />
                <span>:</span>
              </div>
              <Select
                value={designationId}
                onValueChange={setDesignationId}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="-- All --" />
                </SelectTrigger>

                <SelectContent>
                  {designationOptions.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Mobile No" />
                <span>:</span>
              </div>
              <Input
                value={mobileNo}
                type="number"
                maxLength={10}
                onChange={(e) =>
                  setMobileNo(e.target.value)
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Category" />
                <span>:</span>
              </div>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="-- Select Category --" />
                </SelectTrigger>

                <SelectContent>
                  {categoryOptions.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Date Of Joining" />
                <span>:</span>
              </div>
              <DatePicker
                value={joiningDate}
                onChange={setJoiningDate}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Date Of Birth" />
                <span>:</span>
              </div>
              <DatePicker
                value={birthDate}
                onChange={setBirthDate}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Zone" />
                <span>:</span>
              </div>
              <Select
                value={zoneId}
                onValueChange={setZoneId}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="-- Select Zone --" />
                </SelectTrigger>

                <SelectContent>
                  {zoneOptions.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="sm:w-40 shrink-0 flex justify-between items-center">
                <Label text="Gender" />
                <span>:</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="radio"
                  name="gender"
                  value="M"
                  checked={gender === "M"}
                  onChange={(e) =>
                    setGender(e.target.value)
                  }
                />
                <Label text={"Male"} className="sm:w-16"/>

                <Input
                  type="radio"
                  name="gender"
                  value="F"
                  checked={gender === "F"}
                  onChange={(e) =>
                    setGender(e.target.value)
                  }
                />
                <Label text={"Female"} className="sm:w-16"/>

              </div>
            </div>
          </div>

          <div className="flex justify-center my-2 gap-4">
            <Button onClick={handleSearch}>
              Search
            </Button>

            <Button
              variant="secondary"
              path="/"
            >
              Close
            </Button>
          </div>

          {showTable && (
            <ShadCNTable
              headers={tableHeaders}
              data={tableData}
              keyMapping={keyMapping}
              pagination={true}
              rowsPerPage={10}
              className="min-w-300"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmGenericSearch;