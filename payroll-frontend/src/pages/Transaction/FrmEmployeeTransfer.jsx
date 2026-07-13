// FrmEmployeeTransfer.jsx - Updated with SweetAlert2 and no grid
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmEmployeeTransfer = () => {
  const [formValues, setFormValues] = useState({
    employeeId: "",
    employeeNo: "",
    oldDept: "",
    oldDesig: "",
    oldGrade: "",
    doj: "",
    yearsOfService: "",
    jobChart: "",
    jobTableNo: "",
    newDept: "",
    newDesig: "",
    newGrade: "",
    transType: "",
    newJobChart: "",
    newJobTableNo: "",
    orderNo: "",
    orderDate: new Date().toISOString().split('T')[0]
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [transferTypeOptions, setTransferTypeOptions] = useState([]);
  
  const [transferDepartmentOptions, setTransferDepartmentOptions] = useState([]);
  const [transferDesignationOptions, setTransferDesignationOptions] = useState([]);
  const [transferGradeOptions, setTransferGradeOptions] = useState([]);
  
  const [employeeData, setEmployeeData] = useState(null);
  const [showNewDetails, setShowNewDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;

  useEffect(() => {
    if (ulbId && token) {
      fetchDepartments();
      fetchDesignations();
      fetchGrades();
      fetchTransferTypes();
    }
  }, []);

  //fetch dept by emp id
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/FrmEmployeeTransfer/department-list?ulbId=${ulbId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data) {
        const options = res.data.data.map(item => ({
          label: item.DEPTNAME || item.deptname,
          value: String(item.DEPTID || item.deptid)
        }));
        setDepartmentOptions(options);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  //fetch designation by emp id
  const fetchDesignations = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/FrmEmployeeTransfer/designation-list?ulbId=${ulbId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data) {
        const options = res.data.data.map(item => ({
          label: item.DESIG_ENAME || item.desig_ename,
          value: String(item.DESIG_ID || item.desig_id)
        }));
        setDesignationOptions(options);
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };

  //fetch pay band by emp id
  const fetchGrades = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/FrmEmployeeTransfer/grade-list?ulbId=${ulbId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data) {
        const options = res.data.data.map(item => ({
          label: item.VAR_GRADEMST_GRADENAME || item.var_grademst_gradename,
          value: String(item.NUM_GRADEMST_GRADEID || item.num_grademst_gradeid)
        }));
        setGradeOptions(options);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  //fetch transfer type to transfer
  const fetchTransferTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/FrmEmployeeTransfer/transfer-types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data) {
        const options = res.data.data.map(item => ({
          label: item.VAR_TRANSFERTYPE_TRANSFERNAME || item.var_transfertype_transfername,
          value: String(item.NUM_TRANSFERTYPE_TRANSID || item.num_transfertype_transid)
        }));
        setTransferTypeOptions(options);
      }
    } catch (error) {
      console.error("Error fetching transfer types:", error);
    }
  };

  //fetch to transfer dept, designation, pay band
  const fetchTransferDropdowns = async () => {
    try {
      //console.log("🔄 Fetching transfer dropdown data...");
      
      //dept
      const deptRes = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const deptData = deptRes.data?.data?.data || deptRes.data?.data || [];
      if (deptData.length > 0) {
        setTransferDepartmentOptions(
          deptData.map(item => ({
            label: item.DEPTNAME || item.deptname,
            value: String(item.DEPTID || item.deptid)
          }))
        );
      }

      //designation
      const desigRes = await axios.post(
        `${BASE_URL}/api/FrmIncreamentPramotionMst/designation-list`,
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const desigData = desigRes.data?.data?.data || desigRes.data?.data || [];
      if (desigData.length > 0) {
        setTransferDesignationOptions(
          desigData.map(item => ({
            label: item.DESIG_ENAME || item.desig_ename,
            value: String(item.DESIG_ID || item.desig_id)
          }))
        );
      }

      //pay band 
      const gradeRes = await axios.get(
        `${BASE_URL}/api/FrmIncreamentPramotionMst/grade-list`,
        { 
          params: { ulbid: ulbId },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      const gradeData = gradeRes.data?.data?.data || gradeRes.data?.data || [];
      if (gradeData.length > 0) {
        setTransferGradeOptions(
          gradeData.map(item => ({
            label: item.VAR_GRADEMST_GRADENAME || item.var_grademst_gradename || item.GRADENAME,
            value: String(item.NUM_GRADEMST_GRADEID || item.num_grademst_gradeid || item.GRADEID)
          }))
        );
      }

    } catch (error) {
      console.error("❌ Error fetching transfer dropdowns:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load transfer options. Please try again."
      });
    }
  };

  //search emp by id
  const handleSearchEmployee = async () => {
    const empId = formValues.employeeId;
    if (!empId) {
      await Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please Enter Employee ID"
      });
      return;
    }

    setSearchLoading(true);
    setEmployeeData(null);
    setShowNewDetails(false);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeTransfer/search-employee`,
        { empId, ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setEmployeeData(data);
        
        const empIdValue = data.EMPID || data.empId || data.num_employee_empid || "";
        const deptId = data.DEPTID || data.deptId || data.num_deptmst_deptid || "";
        const desigId = data.DESIGNATIONID || data.designationId || data.num_desigmst_designationid || "";
        const gradeId = data.GRADEID || data.gradeId || data.num_grademst_gradeid || "";
        const doj = data.DATEOFJOINING || data.dateOfJoining || data.dateofjoining || "";
        const yearsService = data.YEARSOFSERVICE || data.yearsOfService || data.years_of_service || "";
        const jobChart = data.JOBCHART || data.jobChart || data.var_employee_jobchart || "";
        const jobTableNo = data.JOBTABLENO || data.jobTableNo || data.var_employee_jobtableno || "";
        const empName = data.EMPNAME || data.empName || data.var_employee_marname || "";
        
        setFormValues(prev => ({
          ...prev,
          employeeNo: String(empIdValue),
          oldDept: String(deptId),
          oldDesig: String(desigId),
          oldGrade: String(gradeId),
          doj: String(doj),
          yearsOfService: String(yearsService),
          jobChart: String(jobChart || ""),
          jobTableNo: String(jobTableNo || "")
        }));
        
      } else {
        await Swal.fire({
          icon: "error",
          title: "Not Found",
          text: res.data?.message || "Record Not Found"
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Record Not Found"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTransfer = async () => {
    
    await fetchTransferDropdowns();
    
    setFormValues(prev => ({
      ...prev,
      newDept: "",
      newDesig: "",
      newGrade: "",
      transType: "",
      newJobChart: "",
      newJobTableNo: ""
    }));
    
    setShowNewDetails(true);
  };

  const handleSubmit = async () => {
    if (!formValues.newDept || formValues.newDept === "0") {
      await Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please Select New Department"
      });
      return;
    }
    if (!formValues.newDesig || formValues.newDesig === "0") {
      await Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please Select New Designation"
      });
      return;
    }
    if (!formValues.transType || formValues.transType === "0") {
      await Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please Select Transfer Type"
      });
      return;
    }
    if (!formValues.newGrade || formValues.newGrade === "0") {
      await Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please Select Pay Band"
      });
      return;
    }
    if (!formValues.orderNo) {
      await Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please Enter Order Number"
      });
      return;
    }

    setLoading(true);

    try {
      const empId = employeeData?.EMPID || employeeData?.empId || employeeData?.num_employee_empid;
      
      const payload = {
        userId: userId,
        empId: empId,
        deptId: formValues.oldDept,
        designId: formValues.oldDesig,
        gradeId: formValues.oldGrade,
        doj: formValues.doj,
        yearsOfService: formValues.yearsOfService,
        newDeptId: formValues.newDept,
        newDesignId: formValues.newDesig,
        transTypeId: formValues.transType,
        newGradeId: formValues.newGrade,
        orderDate: formValues.orderDate,
        orderNo: formValues.orderNo,
        status: "P",
        ulbId: ulbId,
        jobChartOld: formValues.jobChart || "",
        jobTableNoOld: formValues.jobTableNo || "",
        jobChartNew: formValues.newJobChart || "",
        jobTableNoNew: formValues.newJobTableNo || "",
        mode: 1
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeTransfer/save-transfer`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const isSuccess = 
        res.data?.success === true || 
        res.data?.data?.success === true ||
        res.data?.errorCode === 9999 ||
        res.data?.errorCode === 0 ||
        res.data?.status === "success";

      if (isSuccess) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Transfer saved successfully!",
          timer: 2000,
          showConfirmButton: false
        });
        
        setShowNewDetails(false);
        
      } else {
        const errorMsg = res.data?.message || 
                         res.data?.data?.message || 
                         res.data?.errorMsg || 
                         res.data?.error || 
                         "Failed to save transfer";
        
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg
        });
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      console.error("Error response:", error.response);
      
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.error || 
                       error.response?.data?.errorMsg ||
                       error.message || 
                       "Failed to save transfer";
      
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-2xl font-semibold">Employee Transfer Form</CardTitle>
      </CardHeader>

      <CardContent className="p-6">

        {/* Search Employee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="space-y-2">
            <Label className="font-semibold whitespace-nowrap">Employee ID</Label>
            <div className="flex gap-2">
              <Input
                value={formValues.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
                className="h-9 flex-1"
                placeholder="Enter Employee ID"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchEmployee()}
              />
              <Button
                type="button"
                onClick={handleSearchEmployee}
                disabled={searchLoading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {searchLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </div>

        {/* Employee Details */}
        {employeeData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Employee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">Employee Number</Label>
                <Input 
                  value={formValues.employeeNo} 
                  className="h-9 bg-gray-100" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">Department</Label>
                <Input 
                  value={employeeData?.DEPTNAME || employeeData?.deptName || ""} 
                  className="h-9 bg-gray-100" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">Designation</Label>
                <Input 
                  value={employeeData?.DESIGNATIONNAME || employeeData?.designationName || ""} 
                  className="h-9 bg-gray-100" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">Pay Band</Label>
                <Input 
                  value={employeeData?.GRADENAME || employeeData?.gradeName || ""} 
                  className="h-9 bg-gray-100" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">Date of Joining</Label>
                <Input 
                  value={formValues.doj} 
                  className="h-9 bg-gray-100" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">Period With Department</Label>
                <Input 
                  value={formValues.yearsOfService} 
                  className="h-9 bg-gray-100" 
                  disabled
                />
              </div>
              
              <div className="space-y-2 md:col-span-1">
                <Label className="font-semibold whitespace-nowrap">Job Chart</Label>
                <Input
                  value={formValues.jobChart || ""}
                  className="h-9 bg-gray-100"
                  disabled
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label className="font-semibold whitespace-nowrap">Job Table No</Label>
                <Input
                  value={formValues.jobTableNo || ""}
                  className="h-9 bg-gray-100"
                  disabled
                />
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <Button type="button" onClick={handleTransfer} className="bg-blue-600 text-white hover:bg-blue-700">
                Transfer
              </Button>
            </div>
          </div>
        )}

        {/* New Details Panel */}
        {showNewDetails && employeeData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Transfer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">New Department</Label>
                <Select value={formValues.newDept} onValueChange={(value) => handleInputChange("newDept", value)}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="-- Select Department --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">-- Select --</SelectItem>
                    {transferDepartmentOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">New Designation</Label>
                <Select value={formValues.newDesig} onValueChange={(value) => handleInputChange("newDesig", value)}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="-- Select Designation --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">-- Select --</SelectItem>
                    {transferDesignationOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">Transfer Type</Label>
                <Select value={formValues.transType} onValueChange={(value) => handleInputChange("transType", value)}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="-- Select Transfer Type --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">-- Select --</SelectItem>
                    {transferTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">New Pay Band</Label>
                <Select value={formValues.newGrade} onValueChange={(value) => handleInputChange("newGrade", value)}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="-- Select Pay Band --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">-- Select --</SelectItem>
                    {transferGradeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">Order Date</Label>
                <Input 
                  type="date" 
                  value={formValues.orderDate} 
                  onChange={(e) => handleInputChange("orderDate", e.target.value)} 
                  className="h-9" 
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold whitespace-nowrap">Order Number</Label>
                <Input 
                  value={formValues.orderNo} 
                  onChange={(e) => handleInputChange("orderNo", e.target.value)} 
                  className="h-9" 
                  placeholder="Enter order number" 
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label className="font-semibold whitespace-nowrap">New Job Chart</Label>
                <Input
                  value={formValues.newJobChart}
                  onChange={(e) => handleInputChange("newJobChart", e.target.value)}
                  className="h-9"
                  placeholder="Enter new job chart"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label className="font-semibold whitespace-nowrap">New Job Table No</Label>
                <Input
                  value={formValues.newJobTableNo}
                  onChange={(e) => handleInputChange("newJobTableNo", e.target.value)}
                  className="h-9"
                  placeholder="Enter new job table no"
                />
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <Button type="button" onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
                {loading ? "Submitting..." : "Submit"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                path={"/"}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FrmEmployeeTransfer;