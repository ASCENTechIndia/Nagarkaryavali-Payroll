import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

const FrmEmployeeDtls = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const empId = state?.empId;
  const passedEmployeeData = state?.employeeData;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [employeeData, setEmployeeData] = useState({
    employeeName: "",
    joiningDate: null,
    departmentName: "",
    designationName: "",
    dateOfBirth: null,
    gender: "",
    handicap: "",
    emailId: "",
    mobileNo: "",
    aadharNo: "",
    panNo: "",
    musterSheet: "",
    societyMember: "",
    currentAddress: "",
    permanentAddress: "",
    employeeStatus: "",
    serviceDate: null,
    confirmationDate: null,
    retirementDate: null,
    officeGrade: "",
    officeDeptName: "",
    officeDesignationName: "",
    zoneName: "",
    categoryName: "",
    bankName: "",
    branch: "",
    accountNo: "",
    pfNo: "",
    payScale: "",
    basicSalary: "",
    gradePay: "",
    vehicleAcquisition: "",
    homeAcquisition: "",
    empType: "",
    empId: ""
  });

  const [images, setImages] = useState({
    photo: null,
    signature: null,
    thumb: null
  });

  const [isLoading, setIsLoading] = useState(true);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  };

  const mapGender = (gender) => {
    if (!gender) return "";
    const g = String(gender).toUpperCase();
    if (g === "MALE" || g === "M") return "M";
    if (g === "FEMALE" || g === "F") return "F";
    return "";
  };

  const mapYesNo = (value) => {
    if (value === null || value === undefined) return "";
    const v = String(value).toUpperCase().trim();
    if (v === "YES" || v === "Y" || v === "1" || v === "TRUE") return "Y";
    if (v === "NO" || v === "N" || v === "0" || v === "FALSE") return "N";
    return "";
  };

  const mapEmployeeStatus = (value) => {
    if (!value) return "";
    const v = String(value).toUpperCase().trim();
    if (v === "P" || v === "PERMANENT" || v === "PERM") return "Permanent";
    if (v === "T" || v === "TEMPORARY" || v === "TEMP" || v === "A") return "Temporary";
    return "";
  };

  useEffect(() => {
    if (!empId) {
      Swal.fire({
        icon: "warning",
        title: "No Employee ID",
        text: "Employee ID is required. Redirecting to search...",
      }).then(() => {
        navigate("/Transactions/FrmGenericSearch");
      });
      return;
    }
     
    const loadData = async () => {
      setIsLoading(true);
      
      Swal.fire({
        text: "Loading employee details...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        if (passedEmployeeData && Object.keys(passedEmployeeData).length > 0) {
          populateFormData(passedEmployeeData);
        }
        
        await fetchEmployeeDetails();
        await fetchEmployeeImages();
        
      } catch (error) {
        console.error("Error loading data:", error);
        if (!passedEmployeeData || Object.keys(passedEmployeeData).length === 0) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error?.response?.data?.message || error?.message || "Failed to load employee details. Please try again."
          });
        }
      } finally {
        setIsLoading(false);
        Swal.close();
      }
    };

    loadData();
  }, [empId]);

  const fetchEmployeeDetails = async () => {
    try {
      const url = `${BASE_URL}/api/FrmEmployeeDtls/employee-details`;
      const payload = {
        ulbid: Number(ulbId),
        empid: Number(empId)
      };
      
      console.log("API Request:", { url, payload });
      
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("API Response:", response.data);
      
      if (response.data && response.data.ok === true) {
        const employeeData = response.data?.data?.data;
        
        if (employeeData && Object.keys(employeeData).length > 0) {
          console.log("Employee details fetched successfully");
          populateFormData(employeeData);
        } else {
          console.warn("No employee data found in response");
          if (passedEmployeeData && Object.keys(passedEmployeeData).length > 0) {
            console.log("Using search data as fallback");
            return;
          }
          throw new Error("No employee data found in response");
        }
      } else {
        console.error("API returned error:", response.data);
        const errorMessage = response.data?.message || response.data?.error || "Failed to fetch employee details";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      if (passedEmployeeData && Object.keys(passedEmployeeData).length > 0) {
        console.log("Using search data as fallback");
        return;
      }
      throw error;
    }
  };

  const fetchEmployeeImages = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmEmployeeDtls/employee-images`,
        {
          ulbid: Number(ulbId),
          empid: Number(empId)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.ok === true && response.data.data) {
        const imageData = response.data.data;
        setImages({
          photo: imageData.PHOTO || null,
          signature: imageData.SIGNATURE || null,
          thumb: imageData.THUMB || null
        });
        console.log("Employee images fetched");
      }
    } catch (error) {
      console.warn("Could not fetch employee images:", error.message);
    }
  };

  const populateFormData = (data) => {
    if (!data) {
      console.warn("No data provided to populateFormData");
      return;
    }
    
    console.log("Populating form data...");
    const updatedData = {
      empId: data.NUM_EMPLOYEE_EMPID || "",
      employeeName: data.VAR_EMPLOYEE_ENGNAME || "",
      
      joiningDate: parseDate(data.DATE_EMPLOYEE_JOINDATE),
      dateOfBirth: parseDate(data.DATE_EMPLOYEE_DOB),
      confirmationDate: parseDate(data.DATE_EMPLOYEE_CONFIRMDATE),
      retirementDate: parseDate(data.DATE_EMPLOYEE_RETIREMNTDATE),
      serviceDate: parseDate(data.DATESERVICE),
      
      currentAddress: data.VAR_EMPLOYEE_PSNTADDRESS || "",
      permanentAddress: data.VAR_EMPLOYEE_PMNTADDRESS || "",
      
      mobileNo: data.NUM_EMPLOYEE_MOBILENO ? data.NUM_EMPLOYEE_MOBILENO.toString() : "",
      emailId: data.VAR_EMPLOYEE_EMAILID || "",
      aadharNo: data.NUM_EMPLOYEE_AADHARNO ? data.NUM_EMPLOYEE_AADHARNO.toString() : "",
      panNo: data.VAR_EMPLOYEE_PANNO || "",
      pfNo: data.VAR_EMPLOYEE_PFNO || "",
      
      empType: data.VAR_EMPLOYEE_EMPTYPE || "",
      
      employeeStatus: mapEmployeeStatus(data.EMPSTATUS),
      
      departmentName: data.VAR_DEPTMST_DEPTNAMEE || "",
      designationName: data.VAR_DESIGMST_DESIGNATIONNAME || "",
      categoryName: data.VAR_CATEGORY_NAME || "",
      zoneName: data.VAR_ZONE_NAME || "",
      
      bankName: data.VAR_BANKMST_BANKNAME || "",
      branch: data.NUM_EMPLOYEE_BANKBRID ? data.NUM_EMPLOYEE_BANKBRID.toString() : "",
      accountNo: data.NUM_EMPLOYEE_BANKACCNO ? data.NUM_EMPLOYEE_BANKACCNO.toString() : "",
      
      payScale: data.VAR_PAYSCALEMST_PAYSCALENAME || "",
      basicSalary: data.NUM_EMPLOYEE_BASIC ? data.NUM_EMPLOYEE_BASIC.toString() : "",
      gradePay: data.NUM_EMPLOYEE_GRADEPAY !== null && data.NUM_EMPLOYEE_GRADEPAY !== undefined ? data.NUM_EMPLOYEE_GRADEPAY.toString() : "0",
      musterSheet: data.NUM_EMPLOYEE_PAYSHEETTYPE ? data.NUM_EMPLOYEE_PAYSHEETTYPE.toString() : "",
      
      officeGrade: data.NUM_EMPLOYEE_GRADEID ? data.NUM_EMPLOYEE_GRADEID.toString() : "",
      
      officeDeptName: data.VAR_DEPTMST_DEPTNAMEE || "",
      officeDesignationName: data.VAR_DESIGMST_DESIGNATIONNAME || "",
      
      gender: mapGender(data.VAR_EMPLOYEE_GENDER),
      handicap: mapYesNo(data.VAR_EMPLOYEE_HANDICAP),
      societyMember: mapYesNo(data.VAR_EMPLOYEE_SOCMEM),
      vehicleAcquisition: mapYesNo(data.VAR_EMPLOYEE_VEHICLE),
      homeAcquisition: mapYesNo(data.HOMEAQUASITION)
    };

    setEmployeeData(updatedData);
    console.log("Form data populated:", updatedData);
  };

  const handleBack = () => {
    navigate("/Transactions/FrmGenericSearch");
  };

  const FormField = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <Label className="font-medium text-sm whitespace-nowrap">{label}</Label>
      {children}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div className="col-span-full flex justify-center my-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b-2 border-gray-300 pb-2 px-8">
        {title}
      </h3>
    </div>
  );

  const ImageDisplay = ({ label, imageUrl, altText }) => (
    <div className="flex flex-col items-center">
      <Label className="font-medium text-sm mb-1 whitespace-nowrap">{label}</Label>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={altText}
          className="w-32 h-32 object-contain rounded border"
        />
      ) : (
        <div className="w-32 h-32 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );

  const genderOptions = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" }
  ];

  const yesNoOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" }
  ];

  const statusOptions = [
    { value: "Permanent", label: "Permanent" },
    { value: "Temporary", label: "Temporary" }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="border shadow-sm">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Employee Details
          </CardTitle>
          <span className="text-sm text-gray-500">Employee ID: {employeeData.empId || empId}</span>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-48 shrink-0 flex flex-col items-center">
              <ImageDisplay 
                label="Photo" 
                imageUrl={images.photo} 
                altText="Employee Photo"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Employee Name">
                  <Input
                    value={employeeData.employeeName}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Joining Date">
                  <DatePicker
                    value={employeeData.joiningDate}
                    disabled
                    className="bg-gray-50 w-full"
                  />
                </FormField>

                <FormField label="Department">
                  <Input
                    value={employeeData.departmentName}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Designation">
                  <Input
                    value={employeeData.designationName}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-48 shrink-0 flex flex-col items-center gap-6">
              <ImageDisplay 
                label="Signature" 
                imageUrl={images.signature} 
                altText="Employee Signature"
              />
              <ImageDisplay 
                label="Thumb" 
                imageUrl={images.thumb} 
                altText="Employee Thumb Impression"
              />
            </div>

            <div className="flex-1 min-w-0">
              <SectionHeader title="Personal Information" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <FormField label="Date of Birth">
                  <DatePicker
                    value={employeeData.dateOfBirth}
                    disabled
                    className="bg-gray-50 w-full"
                  />
                </FormField>

                <FormField label="Email ID">
                  <Input
                    value={employeeData.emailId}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Mobile No">
                  <Input
                    value={employeeData.mobileNo}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Aadhar No">
                  <Input
                    value={employeeData.aadharNo}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="PAN No">
                  <Input
                    value={employeeData.panNo}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Muster Sheet">
                  <Input
                    value={employeeData.musterSheet}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Current Address">
                  <Textarea
                    value={employeeData.currentAddress}
                    readOnly
                    className="bg-gray-50 min-h-[60px]"
                  />
                </FormField>

                <FormField label="Permanent Address">
                  <Textarea
                    value={employeeData.permanentAddress}
                    readOnly
                    className="bg-gray-50 min-h-[60px]"
                  />
                </FormField>

                <FormField label="Society Member">
                  <div className="flex gap-6 pt-1 flex-wrap">
                    {yesNoOptions.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Input
                          type="radio"
                          id={`society-${option.value}`}
                          name="societyMember"
                          value={option.value}
                          checked={employeeData.societyMember === option.value}
                          disabled
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`society-${option.value}`} className="cursor-pointer text-sm whitespace-nowrap">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FormField>

                <FormField label="Gender">
                  <div className="flex gap-6 pt-1 flex-wrap">
                    {genderOptions.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Input
                          type="radio"
                          id={`gender-${option.value}`}
                          name="gender"
                          value={option.value}
                          checked={employeeData.gender === option.value}
                          disabled
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`gender-${option.value}`} className="cursor-pointer text-sm whitespace-nowrap">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FormField>

                <FormField label="Handicap">
                  <div className="flex gap-6 pt-1 flex-wrap">
                    {yesNoOptions.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Input
                          type="radio"
                          id={`handicap-${option.value}`}
                          name="handicap"
                          value={option.value}
                          checked={employeeData.handicap === option.value}
                          disabled
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`handicap-${option.value}`} className="cursor-pointer text-sm whitespace-nowrap">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FormField>
              </div>

              <SectionHeader title="Office Details" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <FormField label="Employee Status">
                  <div className="flex gap-6 pt-1 flex-wrap">
                    {statusOptions.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Input
                          type="radio"
                          id={`status-${option.value}`}
                          name="employeeStatus"
                          value={option.value}
                          checked={employeeData.employeeStatus === option.value}
                          disabled
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`status-${option.value}`} className="cursor-pointer text-sm whitespace-nowrap">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FormField>

                <FormField label="Service Date">
                  <DatePicker
                    value={employeeData.serviceDate}
                    disabled
                    className="bg-gray-50 w-full"
                  />
                </FormField>

                <FormField label="Confirmation Date">
                  <DatePicker
                    value={employeeData.confirmationDate}
                    disabled
                    className="bg-gray-50 w-full"
                  />
                </FormField>

                <FormField label="Retirement Date">
                  <DatePicker
                    value={employeeData.retirementDate}
                    disabled
                    className="bg-gray-50 w-full"
                  />
                </FormField>

                <FormField label="Bank Name">
                  <Input
                    value={employeeData.bankName}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Branch">
                  <Input
                    value={employeeData.branch}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Account No">
                  <Input
                    value={employeeData.accountNo}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="PF Number">
                  <Input
                    value={employeeData.pfNo}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Grade">
                  <Input
                    value={employeeData.officeGrade}
                    readOnly
                    className="bg-gray-50"
                    placeholder="No Grade"
                  />
                </FormField>

                <FormField label="Office Department">
                  <Input
                    value={employeeData.officeDeptName}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Office Designation">
                  <Input
                    value={employeeData.officeDesignationName}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Pay Scale">
                  <Input
                    value={employeeData.payScale}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Basic Salary">
                  <Input
                    value={employeeData.basicSalary}
                    readOnly
                    className="bg-gray-50"
                    type="number"
                  />
                </FormField>

                <FormField label="Grade Pay">
                  <Input
                    value={employeeData.gradePay}
                    readOnly
                    className="bg-gray-50"
                    type="number"
                  />
                </FormField>

                <FormField label="Vehicle Acquisition">
                  <div className="flex gap-6 pt-1 flex-wrap">
                    {yesNoOptions.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Input
                          type="radio"
                          id={`vehicle-${option.value}`}
                          name="vehicleAcquisition"
                          value={option.value}
                          checked={employeeData.vehicleAcquisition === option.value}
                          disabled
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`vehicle-${option.value}`} className="cursor-pointer text-sm whitespace-nowrap">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FormField>

                <FormField label="Home Acquisition">
                  <div className="flex gap-6 pt-1 flex-wrap">
                    {yesNoOptions.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Input
                          type="radio"
                          id={`home-${option.value}`}
                          name="homeAcquisition"
                          value={option.value}
                          checked={employeeData.homeAcquisition === option.value}
                          disabled
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`home-${option.value}`} className="cursor-pointer text-sm whitespace-nowrap">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FormField>

                <FormField label="Category">
                  <Input
                    value={employeeData.categoryName}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>

                <FormField label="Zone">
                  <Input
                    value={employeeData.zoneName}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <Button
              variant="secondary"
              onClick={handleBack}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmEmployeeDtls;