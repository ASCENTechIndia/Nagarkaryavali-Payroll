import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import EarningDeductionTab from "./EarningDeductionTab.jsx";
import OfficeDetailsTab from "./OfficeDetailsTab.jsx";
import PersonalInformationTab from "./PersonalInformationTab.jsx";
import SignaturePhotoTab from "./SignaturePhotoTab.jsx";
import { personalInformationValidationSchema, officeDetailsValidationSchema, validateDateComparison } from "@/validations/global.validation.js";


const FrmEmployeeMstNewTest = () => {
  const { authUser } = useAuth();
  const authToken = authUser?.token;
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const token = storedToken || authToken;
  console.log("Token: ", token);
  const user = storedUser || authUser;
  console.log("User: ", user)
  console.log("storedUser: " , storedUser)

  const ulbId = user?.orgId || user?.ulbId;

  const navigate = useNavigate();
  const location = useLocation();
  const { mode, empId } = location.state || {};

  console.log("location.state", location.state);
  console.log("mode", mode);
  console.log("EmpId", empId);

  const [activeTab, setActiveTab] = useState("tab-1");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  
  const [bankList, setBankList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [gradeList, setGradeList] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [subDeptList, setSubDeptList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [payScaleList, setPayScaleList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [zoneList, setZoneList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [casteList, setCasteList] = useState([]);
  const [subCasteList, setSubCasteList] = useState([]);
  const [casteCatList, setCasteCatList] = useState([]);
  const [festivalAdvanceList, setFestivalAdvanceList] = useState([]);
  const [recruitmentTypeList, setRecruitmentTypeList] = useState([]);
  const [karyaratVibhagList, setKaryaratVibhagList] = useState([]);
  const [karyaratZoneList, setKaryaratZoneList] = useState([]);
  
  const [licRecords, setLicRecords] = useState([]);
  const [bankRecords, setBankRecords] = useState([]);
  const [earningList, setEarningList] = useState([]);
  const [deductionList, setDeductionList] = useState([]);
  
  const [signatureImage, setSignatureImage] = useState(null);
  const [photoImage, setPhotoImage] = useState(null);
  const [thumbImage, setThumbImage] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const initialPersonalValues = useMemo(() => ({
    empId: "",
    empNameM: "",
    empNameE: "",
    dob: new Date(),
    gender: "M",
    emailId: "",
    mobileNo: "",
    altMobNo: "",
    panNo: "",
    aadharNo: "",
    handicapped: "N",
    disabilityDesc: "",
    disabilityPerc: "",
    presentAddress: "",
    permanentAddress: "",
    societyMember: "N",
    societyAmt: "",
    musterSheet: "",
    education: "",
    sevaNivruti: "N",
    sevaNivrutiDate: null,
    oldEmpNo: "",
    voterId: "",
    partNo: "",
    jobChart: "",
    jobTableNo: "",
    assemConNoName: "",
  }), []);

  const initialOfficeValues = useMemo(() => ({
    empStatus: "P",
    zone: "",
    category: "",
    dcpsValue: "",
    dateInService: new Date(),
    confirmationDate: null,
    transferDate: null,
    appointmentNo: "",
    retiredDate: null,
    maritalStatus: "N",
    bank: "",
    branch: "",
    religion: "",
    caste: "",
    subCaste: "",
    casteCat: "",
    accountNo: "",
    ifscCode: "",
    department: "",
    subDepartment: "",
    designation: "",
    karyaratVibhag: "",
    karyaratZone: "",
    recruitmentType: "",
    grade: "",
    payScale: "",
    pfNo: "",
    basicSalary: "",
    gradePay: "",
    pranNo: "",
    vehicleAcquisition: "Y",
    homeAcquisition: "N",
    pfPercent: "",
    pfAmount: "",
    additionalPfPercent: "",
    additionalPfAmount: "",
    festivalAdvance: "",
    deductionType: "PF",
    empType: "NEW",
    dhulaiBhatta: false,
    billNo: "",
  }), []);

  const fetchDropdownData = async () => {
    try {
      const bankRes = await axios.post(`${BASE_URL}/api/Branchlist/banklistBnh`, 
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (bankRes.data?.data?.data) {
        const formattedBanks = bankRes.data.data.data.map(item => ({
          value: item.BANKID?.toString(),
          label: item.BANKNAME
        }));
        setBankList(formattedBanks);
      }

      const gradeRes = await axios.get(`${BASE_URL}/api/FrmEmployeeMstNewTest/grade-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (gradeRes.data?.data?.data) {
        const formattedGrades = gradeRes.data.data.data.map(item => ({
          value: item.NUM_GRADEMST_GRADEID?.toString(),
          label: item.VAR_GRADEMST_GRADENAME
        }));
        setGradeList(formattedGrades);
      }

      const deptRes = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`, 
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (deptRes.data?.data?.data) {
        const formattedDepts = deptRes.data.data.data.map(item => ({
          value: item.DEPTID?.toString(),
          label: item.DEPTNAME
        }));
        setDeptList(formattedDepts);
        setKaryaratVibhagList(formattedDepts);
      }

      const desigRes = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/designation-list`, 
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (desigRes.data?.data?.data) {
        const formattedDesignations = desigRes.data.data.data.map(item => ({
          value: item.DESIG_ID?.toString(),
          label: item.DESIG_ENAME
        }));
        setDesignationList(formattedDesignations);
      }

      const payScaleRes = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/payscale-list`, 
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (payScaleRes.data?.data?.data) {
        const formattedPayScales = payScaleRes.data.data.data.map(item => ({
          value: item.PAYSCALEID?.toString(),
          label: item.PAYSCALENAME
        }));
        setPayScaleList(formattedPayScales);
      }

      const categoryRes = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/employee-category-list`, 
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (categoryRes.data?.data?.data) {
        const formattedCategories = categoryRes.data.data.data.map(item => ({
          value: item.NUM_CATEGORY_ID?.toString(),
          label: item.VAR_CATEGORY_NAME
        }));
        setCategoryList(formattedCategories);
      }

      const zoneRes = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/zone-list`, 
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (zoneRes.data?.data?.data) {
        const formattedZones = zoneRes.data.data.data.map(item => ({
          value: item.ZONEID?.toString(),
          label: item.ZONENAME
        }));
        setZoneList(formattedZones);
        setKaryaratZoneList(formattedZones);
      }

      const religionRes = await axios.get(`${BASE_URL}/api/FrmEmployeeMstNewTest/religion-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (religionRes.data?.data?.data) {
        const formattedReligions = religionRes.data.data.data.map(item => ({
          value: item.NUM_RELIGION_ID?.toString(),
          label: item.VAR_RELIGION_ENAME
        }));
        setReligionList(formattedReligions);
      }

      const casteCatRes = await axios.get(`${BASE_URL}/api/FrmEmployeeMstNewTest/cast-category-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (casteCatRes.data?.data?.data) {
        const formattedCasteCats = casteCatRes.data.data.data.map(item => ({
          value: item.NUM_CASTCATEGORY_ID?.toString(),
          label: item.VAR_CASTCATEGORY_NAME?.trim()
        }));
        setCasteCatList(formattedCasteCats);
      }

      const festivalRes = await axios.get(`${BASE_URL}/api/FrmEmployeeMstNewTest/festival-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (festivalRes.data?.data?.data) {
        const formattedFestivals = festivalRes.data.data.data.map(item => ({
          value: item.NUM_FESTIVAL_ID?.toString(),
          label: item.VAR_FESTIVAL_NAME
        }));
        setFestivalAdvanceList(formattedFestivals);
      }

      const recTypeRes = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/selection-post-list`, 
        { ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (recTypeRes.data?.data?.data) {
        const formattedRecTypes = recTypeRes.data.data.data.map(item => ({
          value: item.POSTID?.toString(),
          label: item.POST
        }));
        setRecruitmentTypeList(formattedRecTypes);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }finally {
      setPageLoading(false);
    }
  };

  const fetchEmployeeData = async () => {
    if (mode !== 2 || !empId) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/employee-autofill`,
        { empid: empId, ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.data?.data && response.data.data.data.length > 0) {
        const data = response.data.data.data[0];
        setEmployeeData(data);
        
        await fetchEmployeeImages(empId);
        
        if (data.NUM_EMPLOYEE_BANKID) {
          await fetchBranches(data.NUM_EMPLOYEE_BANKID.toString());
        }
        if (data.NUM_EMPLOYEE_DEPTID) {
          await fetchSubDepartments(data.NUM_EMPLOYEE_DEPTID.toString());
        }
        if (data.NUM_EMPLOYEE_RELIGION) {
          await fetchCastes(data.NUM_EMPLOYEE_RELIGION.toString());
        }
        if (data.VAR_EMPLOYEE_CAST) {
          await fetchSubCastes(data.VAR_EMPLOYEE_CAST.toString());
        }
        
        await fetchEarningData(empId, ulbId);
        await fetchDeductionData(empId, ulbId);
        await fetchBankGridData(empId, ulbId);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      Swal.fire({ text: "Failed to load employee data", confirmButtonColor: "#1e3a8a" });
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningData = async (empId, ulbId) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/salary-earning-list`,
        { empid: empId, ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.data?.data) {
        const formattedEarnings = response.data.data.data.map(item => ({
          id: item.NUM_PAYHEADS_ID,
          name: item.VAR_PAYHEADS_ENAME,
          amount: item.NUM_EMPALLOWDED_AMOUNT?.toString() || "0"
        }));
        setEarningList(formattedEarnings);
      }
    } catch (error) {
      console.error("Error fetching earning data:", error);
    }
  };

  const fetchDeductionData = async (empId, ulbId) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/salary-deduction-list`,
        { empid: empId, ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.data?.data) {
        const formattedDeductions = response.data.data.data.map(item => ({
          id: item.NUM_PAYHEADS_ID,
          name: item.VAR_PAYHEADS_ENAME,
          amount: item.NUM_EMPALLOWDED_AMOUNT?.toString() || "0"
        }));
        setDeductionList(formattedDeductions);
      }
    } catch (error) {
      console.error("Error fetching deduction data:", error);
    }
  };

  const fetchBankGridData = async (empId, ulbId) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/employee-bank-list`,
        { empid: empId, ulbid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.data?.data) {
        const formattedBankGrid = response.data.data.data.map(item => ({
          BANKID: item.BANKID,
          BANKNAME: item.BANKNAME,
          AMOUNT: item.AMOUNT,
          ISCHECKED: item.ISCHECKED === 1
        }));
      }
    } catch (error) {
      console.error("Error fetching bank grid data:", error);
    }
  };

  const fetchLicData = async (empId, ulbId) => {

  };

  const fetchSubDepartments = async (deptId) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/subdepartment-list`,
        { ulbid: ulbId, deptId: deptId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.data?.data) {
        const formattedSubDepts = res.data.data.data.map(item => ({
          value: item.NUM_DEPTSUB_ID?.toString(),
          label: item.VAR_DEPTSUB_SDEPTNAMEE
        }));
        setSubDeptList(formattedSubDepts);
      }
    } catch (error) {
      console.error("Error fetching sub departments:", error);
    }
  };

  const fetchBranches = async (bankId) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/bank-branch-list`,
        { ulbid: ulbId, bankid: bankId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.data?.data) {
        const formattedBranches = res.data.data.data.map(item => ({
          value: item.BRANCHID?.toString(),
          label: item.BRANCHNAME
        }));
        setBranchList(formattedBranches);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchCastes = async (religionId) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/get-caste-list`,
        { ulbid: ulbId, religionid: religionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.data?.data) {
        const formattedCastes = res.data.data.data.map(item => ({
          value: item.CASTEID?.toString(),
          label: item.CASTENAMEM
        }));
        setCasteList(formattedCastes);
        return formattedCastes;
      }
      return [];
    } catch (error) {
      console.error("Error fetching castes:", error);
      return [];
    }
  };

  const fetchSubCastes = async (casteId) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/get-subcaste-list`,
        { ulbid: ulbId, casteid: casteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.data?.data) {
        const formattedSubCastes = res.data.data.data.map(item => ({
          value: item.SUBCASTEID?.toString(),
          label: item.SUBCASTEMNAME
        }));
        setSubCasteList(formattedSubCastes);
        return formattedSubCastes;
      }
      return [];
    } catch (error) {
      console.error("Error fetching sub castes:", error);
      return [];
    }
  };

  const fetchEmployeeImages = async (empId) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/employee-images`,
        { empid: empId, corpid: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.data?.data && response.data.data.data.length > 0) {
        const images = response.data.data.data[0];
        
        if (images.BLOB_EMPDOC_SIGNIMAGE && typeof images.BLOB_EMPDOC_SIGNIMAGE === 'string') {
          let base64String = images.BLOB_EMPDOC_SIGNIMAGE;
          if (!base64String.startsWith('data:image')) {
            base64String = `data:image/jpeg;base64,${base64String}`;
          }
          setSignatureImage(base64String);
        }
        
        if (images.BLOB_EMPDOC_PHOTOIMAGE && typeof images.BLOB_EMPDOC_PHOTOIMAGE === 'string') {
          let base64String = images.BLOB_EMPDOC_PHOTOIMAGE;
          if (!base64String.startsWith('data:image')) {
            base64String = `data:image/jpeg;base64,${base64String}`;
          }
          setPhotoImage(base64String);
        }
        
        if (images.BLOB_EMPDOC_THUMBIMAGE && typeof images.BLOB_EMPDOC_THUMBIMAGE === 'string') {
          let base64String = images.BLOB_EMPDOC_THUMBIMAGE;
          if (!base64String.startsWith('data:image')) {
            base64String = `data:image/jpeg;base64,${base64String}`;
          }
          setThumbImage(base64String);
        }
      }
    } catch (error) {
      console.error("Error fetching employee images:", error);
    }
  };

  const validateForm = async (personalValues, officeValues) => {
    const isMarathi = ulbId === "751" || ulbId === "870";
    
    const personalSchema = personalInformationValidationSchema(isMarathi);
    const personalResult = await personalSchema.safeParseAsync(personalValues);
    console.log("Validation Result:", personalResult);
    
    if (!personalResult.success) {
      console.log("Validation Error:", personalResult.error);
      if (
        personalResult.error &&
        personalResult.error.issues &&
        personalResult.error.issues.length > 0
      ) {
        const firstError = personalResult.error.issues[0];
        let errorMessage = firstError.message;
        
        if (isMarathi) {
          const fieldLabels = {
            empNameM: "कर्मचारी नाव (मराठी)",
            empNameE: "कर्मचारी नाव (इंग्रजी)",
            dob: "जन्मतारीख",
            gender: "लिंग",
            emailId: "ई-मेल आयडी",
            mobileNo: "मोबाईल नंबर",
            panNo: "पॅन क्रमांक",
            aadharNo: "आधार क्रमांक",
            presentAddress: "सध्याचा पत्ता",
            permanentAddress: "कायमचा पत्ता"
          };
          if (fieldLabels[firstError.path[0]]) {
            errorMessage = errorMessage.replace(firstError.path[0], fieldLabels[firstError.path[0]]);
          }
        } else {
          const fieldLabels = {
            empNameM: "Employee Marathi Name",
            empNameE: "Employee English Name",
            dob: "Date of Birth",
            gender: "Gender",
            emailId: "Email ID",
            mobileNo: "Mobile Number",
            panNo: "PAN Number",
            aadharNo: "Aadhar Number",
            presentAddress: "Current Address",
            permanentAddress: "Permanent Address"
          };
          if (fieldLabels[firstError.path[0]]) {
            errorMessage = errorMessage.replace(firstError.path[0], fieldLabels[firstError.path[0]]);
          }
        }
        
        await Swal.fire({
          text: errorMessage,
          confirmButtonColor: '#1e3a8a'
        });
        setActiveTab("tab-1");
        return false;
      }
      
      await Swal.fire({
        text: isMarathi ? "कृपया वैयक्तिक माहिती योग्यरित्या भरा" : "Please fill personal information correctly",
        confirmButtonColor: '#1e3a8a'
      });
      setActiveTab("tab-1");
      return false;
    }
    
    const officeSchema = officeDetailsValidationSchema(isMarathi, ulbId);
    const officeResult = await officeSchema.safeParseAsync(officeValues);
    
    if (!officeResult.success) {
      if (
        officeResult.error &&
        officeResult.error.issues &&
        officeResult.error.issues.length > 0
      ) {
        const firstError = officeResult.error.issues[0];
        let errorMessage = firstError.message;
        
        if (isMarathi) {
          const fieldLabels = {
            dateInService: "सेवेत रुजू तारीख",
            department: "विभाग",
            designation: "पदनाम",
            grade: "श्रेणी",
            payScale: "वेतन श्रेणी",
            basicSalary: "मूळ वेतन",
            gradePay: "ग्रेड वेतन",
            category: "कर्मचारी प्रकार",
            empStatus: "कर्मचारी स्थिती"
          };
          if (fieldLabels[firstError.path[0]]) {
            errorMessage = errorMessage.replace(firstError.path[0], fieldLabels[firstError.path[0]]);
          }
        } else {
          const fieldLabels = {
            dateInService: "Date in Service",
            department: "Department",
            designation: "Designation",
            grade: "Grade",
            payScale: "Pay Scale",
            basicSalary: "Basic Salary",
            gradePay: "Grade Pay",
            category: "Category",
            empStatus: "Employee Status"
          };
          if (fieldLabels[firstError.path[0]]) {
            errorMessage = errorMessage.replace(firstError.path[0], fieldLabels[firstError.path[0]]);
          }
        }
        
        await Swal.fire({
          text: errorMessage,
          confirmButtonColor: '#1e3a8a'
        });
        setActiveTab("tab-2");
        return false;
      }
      
      await Swal.fire({
        text: isMarathi ? "कृपया कार्यालयीन माहिती योग्यरित्या भरा" : "Please fill office details correctly",
        confirmButtonColor: '#1e3a8a'
      });
      setActiveTab("tab-2");
      return false;
    }
    
    if (officeValues.confirmationDate && officeValues.dateInService) {
      const confirmationDate = new Date(officeValues.confirmationDate);
      const dateInService = new Date(officeValues.dateInService);
      if (confirmationDate < dateInService) {
        await Swal.fire({
          text: isMarathi ? "नियुक्ती निश्चिती तारीख ही सेवेत रुजू तारखेपेक्षा मोठी असावी" : "Confirmation date must be greater than date in service",
          confirmButtonColor: '#1e3a8a'
        });
        setActiveTab("tab-2");
        return false;
      }
    }
    
    if (officeValues.retiredDate && officeValues.dateInService) {
      const retiredDate = new Date(officeValues.retiredDate);
      const dateInService = new Date(officeValues.dateInService);
      if (retiredDate < dateInService) {
        await Swal.fire({
          text: isMarathi ? "सेवानिवृत्ती तारीख ही सेवेत रुजू तारखेपेक्षा मोठी असावी" : "Retired date must be greater than date in service",
          confirmButtonColor: '#1e3a8a'
        });
        setActiveTab("tab-2");
        return false;
      }
    }
    
    const today = new Date();
    const birthDate = new Date(personalValues.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      await Swal.fire({
        text: isMarathi ? "कर्मचाऱ्याचे वय 18 वर्षांपेक्षा कमी असू शकत नाही" : "Employee age cannot be less than 18 years",
        confirmButtonColor: '#1e3a8a'
      });
      setActiveTab("tab-1");
      return false;
    }
    
    return true;
  };

  const handleSave = async (personalValues, officeValues, earningData, deductionData) => {
    const isMarathi = ulbId === "751" || ulbId === "870";
    
    const isValid = await validateForm(personalValues, officeValues);
    if (!isValid) return;
    
    setLoading(true);
    
    Swal.fire({
      title: isMarathi ? "कृपया प्रतीक्षा करा..." : "Please wait...",
      text: isMarathi ? "कर्मचारी माहिती जतन केली जात आहे" : "Saving employee information",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    const formatDateForProcedure = (date) => {
      if (!date) return null;
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };
    
    const formattedLicRecords = licRecords.map(record => ({
      ...record,
      fromDate: record.fromDate ? formatDateForProcedure(record.fromDate) : null,
      toDate: record.toDate ? formatDateForProcedure(record.toDate) : null
    }));
    
    const formattedBankRecords = bankRecords.map(record => ({
      ...record,
      fromDate: record.fromDate ? formatDateForProcedure(record.fromDate) : null,
      toDate: record.toDate ? formatDateForProcedure(record.toDate) : null
    }));
    
    
    const payload = {
      userId: user?.userId,
      empId: personalValues.empId || 0,
      empNameE: personalValues.empNameE,
      empNameM: personalValues.empNameM,
      dob: personalValues.dob ? formatDateForProcedure(personalValues.dob) : null,
      gender: personalValues.gender,
      mobileNo: personalValues.mobileNo ? parseInt(personalValues.mobileNo) : null,
      tempAddress: personalValues.presentAddress,
      permAddress: personalValues.permanentAddress,
      machiAtten: personalValues.musterSheet,
      emailId: personalValues.emailId,
      handicap: personalValues.handicapped,
      panNo: personalValues.panNo,
      aadharNo: personalValues.aadharNo ? parseInt(personalValues.aadharNo) : 0,
      empStatus: officeValues.empStatus,
      joinDate: officeValues.dateInService ? formatDateForProcedure(officeValues.dateInService) : null,
      confirmDate: officeValues.confirmationDate ? formatDateForProcedure(officeValues.confirmationDate) : null,
      retireDate: officeValues.retiredDate ? formatDateForProcedure(officeValues.retiredDate) : null,
      transferDate: officeValues.transferDate ? formatDateForProcedure(officeValues.transferDate) : null,
      bankId: officeValues.bank ? parseInt(officeValues.bank) : null,
      branchId: officeValues.branch ? parseInt(officeValues.branch) : null,
      accNo: officeValues.accountNo,
      gradeId: officeValues.grade ? parseInt(officeValues.grade) : null,
      deptId: officeValues.department ? parseInt(officeValues.department) : null,
      desigId: officeValues.designation ? parseInt(officeValues.designation) : null,
      payscaleId: officeValues.payScale ? parseInt(officeValues.payScale) : null,
      pfNo: officeValues.pfNo,
      basicSal: officeValues.basicSalary ? parseInt(officeValues.basicSalary) : 0,
      gradePay: officeValues.gradePay ? parseInt(officeValues.gradePay) : 0,
      vehicleOccup: officeValues.vehicleAcquisition,
      socMem: personalValues.societyMember,
      homeOccup: officeValues.homeAcquisition,
      pfpercent: officeValues.pfPercent ? parseFloat(officeValues.pfPercent) : 0,
      pffixamt: officeValues.pfAmount ? parseFloat(officeValues.pfAmount) : 0,
      defpfpercent: officeValues.additionalPfPercent ? parseFloat(officeValues.additionalPfPercent) : 0,
      defpffixamt: officeValues.additionalPfAmount ? parseFloat(officeValues.additionalPfAmount) : 0,
      corpId: parseInt(ulbId),
      paysheettype: officeValues.category ? parseInt(officeValues.category) : null,
      zone: officeValues.zone ? parseInt(officeValues.zone) : null,
      mode: mode,
      societyAmt: personalValues.societyAmt ? parseInt(personalValues.societyAmt) : 0,
      // empEarDudStr: "",
      empEarDudStr: null,
      currbasic: 0,
      currgradepay: 0,
      ic: null,
      mop: null,
      bkMicr: 0,
      managementlevel: null,
      dcpsRate: officeValues.dcpsValue ? parseFloat(officeValues.dcpsValue) : 0,
      ulbId: parseInt(ulbId),
      pranNo: officeValues.pranNo,
      education: personalValues.education,
      sevaNivrutiFlag: personalValues.sevaNivruti,
      sevaNivrutiDate: personalValues.sevaNivrutiDate ? formatDateForProcedure(personalValues.sevaNivrutiDate) : null,
      cast: officeValues.caste ? parseInt(officeValues.caste) : 0,
      subcast: officeValues.subCaste,
      festivalAdvanceId: officeValues.festivalAdvance ? parseInt(officeValues.festivalAdvance) : 0,
      str: formattedLicRecords.length === 0 ? null : JSON.stringify(formattedLicRecords),
      subdeptId: officeValues.subDepartment ? parseInt(officeValues.subDepartment) : 0,
      deductionType: officeValues.deductionType,
      billno: officeValues.billNo,
      emptype: officeValues.empType,
      jobchart: personalValues.jobChart,
      jobtableno: personalValues.jobTableNo,
      oldempno: personalValues.oldEmpNo,
      hsgRent: 0,
      bankRec: 0,
      karyavibhag: officeValues.karyaratVibhag ? parseInt(officeValues.karyaratVibhag) : 0,
      empappno: officeValues.appointmentNo,
      washallow: officeValues.dhulaiBhatta ? "Y" : "N",
      bankstr: null,
      disabldesc: personalValues.disabilityDesc,
      disablperc: personalValues.disabilityPerc,
      altmobno: personalValues.altMobNo ? parseInt(personalValues.altMobNo) : null,
      marstatus: officeValues.maritalStatus,
      rectype: officeValues.recruitmentType ? parseInt(officeValues.recruitmentType) : null,
      ifsc: officeValues.ifscCode,
      voterid: personalValues.voterId,
      assemcondet: personalValues.assemConNoName,
      partno: personalValues.partNo,
      religion: officeValues.religion ? parseInt(officeValues.religion) : null,
      castcat: officeValues.casteCat ? parseInt(officeValues.casteCat) : null,
      karyazone: officeValues.karyaratZone ? parseInt(officeValues.karyaratZone) : 0,
      bankstramc: formattedBankRecords.length === 0 ? null : JSON.stringify(formattedBankRecords)
    };

    console.log("Formatted Payload:", payload);
    
    try {
        const response = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/save-employee`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        Swal.close();
        
        console.log("Save Response:", response.data);
        
        if (response.data?.data?.success === true) {
            const newEmpId = response.data.data.empId;
            
            if (signatureFile || photoFile || thumbFile) {
                const imageFormData = new FormData();
                imageFormData.append("empid", newEmpId || personalValues.empId);
                imageFormData.append("corpid", ulbId);
                if (signatureFile) imageFormData.append("BLOBSign", signatureFile);
                if (photoFile) imageFormData.append("BLOBPhoto", photoFile);
                if (thumbFile) imageFormData.append("BLOBThumb", thumbFile);
                
                await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/update-employee-images`, imageFormData, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
                });
            }
            
            Swal.fire({ 
                text: response.data.data.message || "Employee saved successfully", 
                confirmButtonColor: "#1e3a8a" 
            });
            navigate("/Masters/FrmEmployeeMstList");
        } else {
            Swal.fire({ 
                text: response.data?.data?.message || response.data?.message || "Failed to save employee", 
                confirmButtonColor: "#1e3a8a" 
            });
        }
    } catch (error) {
        console.error("Error saving employee:", error);
        // Try to extract error message from response
        const errorMsg = error.response?.data?.data?.message || 
                        error.response?.data?.message || 
                        error.message || 
                        "An error occurred while saving";
        Swal.fire({ text: errorMsg, confirmButtonColor: "#1e3a8a" });
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (personalValues, officeValues) => {
    const isMarathi = ulbId === "751" || ulbId === "870";
    
    Swal.fire({
      title: isMarathi ? "आपण खात्रीशीर आहात?" : "Are you sure?",
      text: isMarathi ? "हा कर्मचारी कायमचा हटविला जाईल!" : "This employee will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1e3a8a",
      confirmButtonText: isMarathi ? "होय, हटवा!" : "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        
        Swal.fire({
          title: isMarathi ? "कृपया प्रतीक्षा करा..." : "Please wait...",
          text: isMarathi ? "कर्मचारी माहिती हटविली जात आहे" : "Deleting employee information",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        try {
          const formatDateForProcedure = (date) => {
            if (!date) return null;
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
          };
          
          // Prepare payload with actual employee data (same as update) but mode = 3
          const deletePayload = {
            userId: user?.userId,
            empId: personalValues.empId || 0,
            empNameE: personalValues.empNameE,
            empNameM: personalValues.empNameM,
            dob: personalValues.dob ? formatDateForProcedure(personalValues.dob) : null,
            gender: personalValues.gender,
            mobileNo: personalValues.mobileNo ? parseInt(personalValues.mobileNo) : null,
            tempAddress: personalValues.presentAddress,
            permAddress: personalValues.permanentAddress,
            machiAtten: personalValues.musterSheet,
            emailId: personalValues.emailId,
            handicap: personalValues.handicapped,
            panNo: personalValues.panNo,
            aadharNo: personalValues.aadharNo ? parseInt(personalValues.aadharNo) : 0,
            empStatus: officeValues.empStatus,
            joinDate: officeValues.dateInService ? formatDateForProcedure(officeValues.dateInService) : null,
            confirmDate: officeValues.confirmationDate ? formatDateForProcedure(officeValues.confirmationDate) : null,
            retireDate: officeValues.retiredDate ? formatDateForProcedure(officeValues.retiredDate) : null,
            transferDate: officeValues.transferDate ? formatDateForProcedure(officeValues.transferDate) : null,
            bankId: officeValues.bank ? parseInt(officeValues.bank) : null,
            branchId: officeValues.branch ? parseInt(officeValues.branch) : null,
            accNo: officeValues.accountNo,
            gradeId: officeValues.grade ? parseInt(officeValues.grade) : null,
            deptId: officeValues.department ? parseInt(officeValues.department) : null,
            desigId: officeValues.designation ? parseInt(officeValues.designation) : null,
            payscaleId: officeValues.payScale ? parseInt(officeValues.payScale) : null,
            pfNo: officeValues.pfNo,
            basicSal: officeValues.basicSalary ? parseInt(officeValues.basicSalary) : 0,
            gradePay: officeValues.gradePay ? parseInt(officeValues.gradePay) : 0,
            vehicleOccup: officeValues.vehicleAcquisition,
            socMem: personalValues.societyMember,
            homeOccup: officeValues.homeAcquisition,
            pfpercent: officeValues.pfPercent ? parseFloat(officeValues.pfPercent) : 0,
            pffixamt: officeValues.pfAmount ? parseFloat(officeValues.pfAmount) : 0,
            defpfpercent: officeValues.additionalPfPercent ? parseFloat(officeValues.additionalPfPercent) : 0,
            defpffixamt: officeValues.additionalPfAmount ? parseFloat(officeValues.additionalPfAmount) : 0,
            corpId: parseInt(ulbId),
            paysheettype: officeValues.category ? parseInt(officeValues.category) : null,
            zone: officeValues.zone ? parseInt(officeValues.zone) : null,
            mode: 3,  // Key: Mode 3 for Delete
            societyAmt: personalValues.societyAmt ? parseInt(personalValues.societyAmt) : 0,
            empEarDudStr: null,
            currbasic: 0,
            currgradepay: 0,
            ic: null,
            mop: null,
            bkMicr: 0,
            managementlevel: null,
            dcpsRate: officeValues.dcpsValue ? parseFloat(officeValues.dcpsValue) : 0,
            ulbId: parseInt(ulbId),
            pranNo: officeValues.pranNo,
            education: personalValues.education,
            sevaNivrutiFlag: personalValues.sevaNivruti,
            sevaNivrutiDate: personalValues.sevaNivrutiDate ? formatDateForProcedure(personalValues.sevaNivrutiDate) : null,
            cast: officeValues.caste ? parseInt(officeValues.caste) : 0,
            subcast: officeValues.subCaste,
            festivalAdvanceId: officeValues.festivalAdvance ? parseInt(officeValues.festivalAdvance) : 0,
            str: null,  // No need to send LIC records for delete
            subdeptId: officeValues.subDepartment ? parseInt(officeValues.subDepartment) : 0,
            deductionType: officeValues.deductionType,
            billno: officeValues.billNo,
            emptype: officeValues.empType,
            jobchart: personalValues.jobChart,
            jobtableno: personalValues.jobTableNo,
            oldempno: personalValues.oldEmpNo,
            hsgRent: 0,
            bankRec: 0,
            karyavibhag: officeValues.karyaratVibhag ? parseInt(officeValues.karyaratVibhag) : 0,
            empappno: officeValues.appointmentNo,
            washallow: officeValues.dhulaiBhatta ? "Y" : "N",
            bankstr: null,
            disabldesc: personalValues.disabilityDesc,
            disablperc: personalValues.disabilityPerc,
            altmobno: personalValues.altMobNo ? parseInt(personalValues.altMobNo) : null,
            marstatus: officeValues.maritalStatus,
            rectype: officeValues.recruitmentType ? parseInt(officeValues.recruitmentType) : null,
            ifsc: officeValues.ifscCode,
            voterid: personalValues.voterId,
            assemcondet: personalValues.assemConNoName,
            partno: personalValues.partNo,
            religion: officeValues.religion ? parseInt(officeValues.religion) : null,
            castcat: officeValues.casteCat ? parseInt(officeValues.casteCat) : null,
            karyazone: officeValues.karyaratZone ? parseInt(officeValues.karyaratZone) : 0,
            bankstramc: null,
          };
          
          const response = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/save-employee`, deletePayload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          Swal.close();
          
          console.log("Delete Response:", response.data);
          
          if (response.data?.data?.success === true && response.data?.data?.errorCode === -100) {
            Swal.fire({ 
              text: response.data.data.message || (isMarathi ? "कर्मचारी यशस्वीरित्या हटविला" : "Employee deleted successfully"), 
              confirmButtonColor: "#1e3a8a" 
            });
            navigate("/Masters/FrmEmployeeMstList");
          } else {
            Swal.fire({ 
              text: response.data?.data?.message || response.data?.message || (isMarathi ? "कर्मचारी हटविण्यात अयशस्वी" : "Failed to delete employee"), 
              confirmButtonColor: "#1e3a8a" 
            });
          }
        } catch (error) {
          console.error("Error deleting employee:", error);
          Swal.close();
          Swal.fire({ 
            text: error.response?.data?.data?.message || error.response?.data?.message || (isMarathi ? "हटवताना त्रुटी आली" : "An error occurred while deleting"), 
            confirmButtonColor: "#1e3a8a" 
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  useEffect(() => {
    fetchDropdownData();
    if (mode === 2 && empId) {
      fetchEmployeeData();
    } else {
      setEarningList([]);
      setDeductionList([]);
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (signatureImage && signatureImage.startsWith('blob:')) {
        URL.revokeObjectURL(signatureImage);
      }
      if (photoImage && photoImage.startsWith('blob:')) {
        URL.revokeObjectURL(photoImage);
      }
      if (thumbImage && thumbImage.startsWith('blob:')) {
        URL.revokeObjectURL(thumbImage);
      }
    };
  }, [signatureImage, photoImage, thumbImage]);

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }  

  return (
    <div className="p-4 sm:p-6">
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold">
            {ulbId === "751" || ulbId === "870" ? "कर्मचारी मास्टर" : "Employee Master"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mb-6">
              <TabsTrigger value="tab-1" className="py-2 data-[state=active]:bg-[#2F6FB2] data-[state=active]:text-white">
                {ulbId === "751" || ulbId === "870" ? "वैयक्तिक माहिती" : "Personal Information"}
              </TabsTrigger>
              <TabsTrigger value="tab-2" className="py-2 data-[state=active]:bg-[#2F6FB2] data-[state=active]:text-white">
                {ulbId === "751" || ulbId === "870" ? "कार्यालयीन माहिती" : "Office Details"}
              </TabsTrigger>
              <TabsTrigger value="tab-3" className="py-2 data-[state=active]:bg-[#2F6FB2] data-[state=active]:text-white">
                {ulbId === "751" || ulbId === "870" ? "स्वाक्षरी व छायाचित्र" : "Signature and Photo"}
              </TabsTrigger>
              <TabsTrigger value="tab-4" className="py-2 data-[state=active]:bg-[#2F6FB2] data-[state=active]:text-white">
                {ulbId === "751" || ulbId === "870" ? "मिळकत व कटाई" : "Earning and Deductions"}
              </TabsTrigger>
            </TabsList>

            <Formik
              initialValues={initialPersonalValues}
              onSubmit={() => {}}
              enableReinitialize
            >
              {({ values: personalValues, setFieldValue: setPersonalFieldValue }) => (
                <Formik
                  initialValues={initialOfficeValues}
                  onSubmit={() => {}}
                  enableReinitialize
                >
                  {({ values: officeValues, setFieldValue: setOfficeFieldValue }) => (
                    <>
                      <TabsContent value="tab-1">
                        <PersonalInformationTab
                          values={personalValues}
                          setFieldValue={setPersonalFieldValue}
                          ulbId={ulbId}
                          employeeData={employeeData}
                          mode={mode}
                        />
                      </TabsContent>

                      <TabsContent value="tab-2">
                        <OfficeDetailsTab
                          values={officeValues}
                          setFieldValue={setOfficeFieldValue}
                          ulbId={ulbId}
                          employeeData={employeeData}
                          mode={mode}
                          bankList={bankList}
                          branchList={branchList}
                          gradeList={gradeList}
                          deptList={deptList}
                          subDeptList={subDeptList}
                          designationList={designationList}
                          payScaleList={payScaleList}
                          categoryList={categoryList}
                          zoneList={zoneList}
                          religionList={religionList}
                          casteList={casteList}
                          subCasteList={subCasteList}
                          casteCatList={casteCatList}
                          festivalAdvanceList={festivalAdvanceList}
                          recruitmentTypeList={recruitmentTypeList}
                          karyaratVibhagList={karyaratVibhagList}
                          karyaratZoneList={karyaratZoneList}
                          fetchSubDepartments={fetchSubDepartments}
                          fetchBranches={fetchBranches}
                          fetchCastes={fetchCastes}
                          fetchSubCastes={fetchSubCastes}
                          licRecords={licRecords}
                          setLicRecords={setLicRecords}
                          bankRecords={bankRecords}
                          setBankRecords={setBankRecords}
                        />
                      </TabsContent>

                      <TabsContent value="tab-3">
                        <SignaturePhotoTab
                          signatureImage={signatureImage}
                          photoImage={photoImage}
                          thumbImage={thumbImage}
                          setSignatureFile={setSignatureFile}
                          setPhotoFile={setPhotoFile}
                          setThumbFile={setThumbFile}
                          ulbId={ulbId}
                          mode={mode}
                        />
                      </TabsContent>

                      <TabsContent value="tab-4">
                        <EarningDeductionTab
                          earningList={earningList}
                          deductionList={deductionList}
                          setEarningList={setEarningList}
                          setDeductionList={setDeductionList}
                          ulbId={ulbId}
                          basicSalary={officeValues.basicSalary}
                          setBasicSalary={(val) => setOfficeFieldValue("basicSalary", val)}
                          mode={mode}
                        />
                      </TabsContent>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-6 mt-4 border-t">
                        <Button 
                          onClick={() => handleSave(personalValues, officeValues, earningList, deductionList)}
                          className="bg-blue-900 hover:bg-blue-800 text-white"
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => navigate("/Masters/FrmEmployeeMstList")}
                        >
                          Cancel
                        </Button>
                        {mode === 2 && (
                          <Button 
                            type="button" 
                            variant="destructive" 
                            onClick={() => handleDelete(personalValues, officeValues)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </Formik>
              )}
            </Formik>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrmEmployeeMstNewTest;