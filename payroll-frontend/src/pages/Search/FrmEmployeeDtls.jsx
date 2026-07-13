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
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
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
  const mode = state?.mode || 2;
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
    homeAcquisition: ""
  });

  const [images, setImages] = useState({
    photo: null,
    signature: null,
    thumb: null
  });

  const [officeGradeOptions, setOfficeGradeOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gradeLoading, setGradeLoading] = useState(false);

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
    const v = String(value).toUpperCase();
    if (v === "YES" || v === "Y" || v === "1") return "Y";
    if (v === "NO" || v === "N" || v === "0") return "N";
    return "";
  };

  const safeGetValue = (data, fieldNames, defaultValue = "") => {
    if (!data) return defaultValue;
    
    const names = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
    
    for (const name of names) {
      if (data[name] !== undefined && data[name] !== null) {
        return data[name];
      }
    }
    
    return defaultValue;
  };

  // Debug function to inspect API response
  const debugApiResponse = (data) => {
    console.group(" API Response Debug");
    console.log("Full Response:", data);
    console.log("All Keys:", Object.keys(data || {}));
    
    // Search for specific fields
    const searchFields = ['gender', 'GENDER', 'society', 'SOCIETY', 'handicap', 'HANDICAP'];
    searchFields.forEach(field => {
      const found = Object.keys(data || {}).filter(key => 
        key.toLowerCase().includes(field.toLowerCase())
      );
      if (found.length > 0) {
        console.log(` Found fields containing "${field}":`, found);
        found.forEach(key => {
          console.log(`   ${key}:`, data[key]);
        });
      }
    });
    
    console.groupEnd();
  };

  useEffect(() => {
    if (!empId) {
      Swal.fire({
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
        if (passedEmployeeData) {
          // Debug the incoming data
          debugApiResponse(passedEmployeeData);
          populateFormData(passedEmployeeData);
        } else {
          await fetchEmployeeData();
        }
        
      } catch (error) {
        console.error("Error loading data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load employee details. Please try again."
        });
      } finally {
        setIsLoading(false);
        Swal.close();
      }
    };

    loadData();
  }, [empId]);

  const fetchEmployeeData = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/get-employee-details`, {
        empId: empId,
        ulbId: ulbId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        debugApiResponse(data);
        populateFormData(data);
      } else {
        console.warn("No data in API response");
        Swal.fire({
          icon: "warning",
          title: "No Data",
          text: "No employee data found for the given ID."
        });
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      throw error;
    }
  };

  const populateFormData = (data) => {
    if (!data) {
      console.warn("No data provided to populateFormData");
      return;
    }
    
    const genderValue = safeGetValue(data, [
      'VAR_EMPLOYEE_GENDER', 
      'GENDER', 
      'EMPLOYEE_GENDER', 
      'gender',
      'var_employee_gender'
    ]);
    
    const societyValue = safeGetValue(data, [
      'NUM_EMPLOYEE_SOCIETYAMT',
      'SOCIETYAMT',
      'EMPLOYEE_SOCIETYAMT',
      'societyAmt',
      'num_employee_societyamt',
      'SOCIETY_AMT'
    ]);
    
    const handicapValue = safeGetValue(data, [
      'VAR_EMPLOYEE_HANDICAP',
      'HANDICAP',
      'EMPLOYEE_HANDICAP',
      'handicap',
      'var_employee_handicap',
      'IS_HANDICAP'
    ]);
    console.groupEnd();

    const mappedGender = mapGender(genderValue);
    const mappedSociety = mapYesNo(societyValue);
    const mappedHandicap = mapYesNo(handicapValue);

    setEmployeeData({
      employeeName: data.VAR_EMPLOYEE_ENGNAME || data.EMPLOYEE_NAME || data.NAME || "",
      joiningDate: parseDate(data.DATE_EMPLOYEE_JOINDATE || data.JOINING_DATE),
      dateOfBirth: parseDate(data.DATE_EMPLOYEE_DOB || data.DOB),
      confirmationDate: parseDate(data.DATE_EMPLOYEE_CONFIRMDATE || data.CONFIRMATION_DATE),
      retirementDate: parseDate(data.DATE_EMPLOYEE_RETIREMNTDATE || data.RETIREMENT_DATE),
      currentAddress: data.VAR_EMPLOYEE_PSNTADDRESS || data.CURRENT_ADDRESS || "",
      accountNo: (data.NUM_EMPLOYEE_BANKACCNO || data.ACCOUNT_NO || "").toString(),
      
      gender: mappedGender,
      emailId: data.VAR_EMPLOYEE_EMAILID || data.EMAIL || "",
      mobileNo: (data.NUM_EMPLOYEE_MOBILENO || data.MOBILE_NO || "").toString(),
      aadharNo: (data.NUM_EMPLOYEE_AADHARNO || data.AADHAR_NO || "").toString(),
      panNo: data.VAR_EMPLOYEE_PANNO || data.PAN_NO || "",
      permanentAddress: data.VAR_EMPLOYEE_PMNTADDRESS || data.PERMANENT_ADDRESS || "",
      
      handicap: mappedHandicap,
      musterSheet: (data.NUM_EMPLOYEE_PAYSHEETTYPE || data.MUSTER_SHEET || "").toString(),
      societyMember: mappedSociety,
      employeeStatus: data.EMPSTATUS || data.EMPLOYEE_STATUS || "",
      serviceDate: parseDate(data.DATESERVICE || data.SERVICE_DATE),  
      
      departmentName: data.VAR_DEPTMST_DEPTNAMEE || data.DEPARTMENT_NAME || "",
      designationName: data.VAR_DESIGNATION_ENAME || data.DESIGNATION_NAME || "",
      officeGrade: (data.NUM_EMPLOYEE_GRADEID || data.GRADE_ID || "").toString(),
      officeDeptName: data.VAR_DEPTMST_DEPTNAMEE || data.DEPARTMENT_NAME || "",
      officeDesignationName: data.VAR_DESIGNATION_ENAME || data.DESIGNATION_NAME || "",
      
      bankName: data.VAR_BANKMST_BANKNAME || data.BANK_NAME || "",
      branch: (data.NUM_EMPLOYEE_BANKBRID || data.BRANCH_ID || "").toString(),
      pfNo: data.VAR_EMPLOYEE_PFNO || data.PF_NO || "",
      
      payScale: data.VAR_PAYSCALEMST_PAYSCALENAME || data.PAY_SCALE || "",
      basicSalary: (data.NUM_EMPLOYEE_BASIC || data.BASIC_SALARY || "").toString(),
      gradePay: (data.NUM_EMPLOYEE_GRADEPAY || data.GRADE_PAY || "").toString(),
      
      vehicleAcquisition: mapYesNo(data.VAR_EMPLOYEE_VEHICLE || data.VEHICLE_ACQUISITION),
      homeAcquisition: mapYesNo(data.HOMEAQUASITION || data.HOME_ACQUISITION),
      
      zoneName: data.VAR_ZONE_NAME || data.ZONE_NAME || "",
      categoryName: data.VAR_CATEGORY_NAME || data.CATEGORY_NAME || ""
    });
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

  // Section Header
  const SectionHeader = ({ title }) => (
    <div className="col-span-full flex justify-center my-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b-2 border-gray-300 pb-2 px-8">
        {title}
      </h3>
    </div>
  );

  // Image Display
  const ImageDisplay = ({ label, imageUrl, altText }) => (
    <div className="flex flex-col items-center">
      <Label className="font-medium text-sm mb-1 whitespace-nowrap">{label}</Label>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={altText}
          className="w-32 h-32 object-contain rounded"
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

  // Radio options
  const genderOptions = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" }
  ];

  const yesNoOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" }
  ];

  const statusOptions = [
    { value: "Active", label: "Permanent" },
    { value: "Inactive", label: "Temporary" }
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

              {/* Office Details Section */}
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

                <FormField label="Grade">
                  <Select
                    value={employeeData.officeGrade}
                    disabled
                  >
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLoading ? (
                        <SelectItem value="loading" disabled>Loading grades...</SelectItem>
                      ) : officeGradeOptions.length > 0 ? (
                        officeGradeOptions.map(item => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-grades" disabled>No grades available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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

                <FormField label="PF Number">
                  <Input
                    value={employeeData.pfNo}
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