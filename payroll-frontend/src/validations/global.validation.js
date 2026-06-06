import { z } from "zod";

const panCardRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const aadharRegex = /^\d{12}$/;

const mobileRegex = /^\d{10}$/;

const nameSchema = z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters");

const dateSchema = z.date().refine(date => date instanceof Date && !isNaN(date), "Valid date is required");

export const personalInformationValidationSchema = (isMarathi = false) => z.object({
  empNameM: nameSchema,
  empNameE: nameSchema,
  dob: dateSchema.refine(date => {
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= 18;
  }, isMarathi ? "कर्मचाऱ्याचे वय 18 पेक्षा कमी असू शकत नाही" : "Employee age cannot be less than 18"),
  gender: z.string().min(1, "Gender is required"),
  emailId: z.string().email(isMarathi ? "वैध ईमेल आयडी प्रविष्ट करा" : "Enter valid email id").optional().or(z.literal("")),
  mobileNo: z.string().regex(mobileRegex, isMarathi ? "10 अंकांचा वैध मोबाईल क्रमांक प्रविष्ट करा" : "Enter valid 10 digit mobile number"),
  panNo: z.string().regex(panCardRegex, isMarathi ? "अवैध पॅन कार्ड क्रमांक" : "Invalid PAN Card Number").optional().or(z.literal("")),
  aadharNo: z.string().regex(aadharRegex, isMarathi ? "12 अंकांचा वैध आधार क्रमांक प्रविष्ट करा" : "Enter valid 12 digit Aadhar number").optional().or(z.literal("")),
  presentAddress: z.string().min(1, isMarathi ? "सध्याचा पत्ता आवश्यक आहे" : "Current address is required"),
  permanentAddress: z.string().min(1, isMarathi ? "कायमचा पत्ता आवश्यक आहे" : "Permanent address is required"),
  musterSheet: z.string().optional(),
  education: z.string().optional(),
  sevaNivruti: z.string().optional(),
  sevaNivrutiDate: z.date().nullable().optional(),
  oldEmpNo: z.string().optional(),
  voterId: z.string().optional(),
  partNo: z.string().optional(),
  jobChart: z.string().optional(),
  jobTableNo: z.string().optional(),
  assemConNoName: z.string().optional(),
  societyMember: z.string().optional(),
  societyAmt: z.string().optional(),
  handicapped: z.string().optional(),
  disabilityDesc: z.string().optional(),
  disabilityPerc: z.string().optional(),
  altMobNo: z.string().regex(mobileRegex, isMarathi ? "10 अंकांचा वैध पर्यायी मोबाईल क्रमांक प्रविष्ट करा" : "Enter valid 10 digit alternate mobile number").optional().or(z.literal("")),
});

export const officeDetailsValidationSchema = (isMarathi = false, ulbId = null) => {
  const baseSchema = {
    dateInService: dateSchema.refine(date => date <= new Date(), isMarathi ? "सेवेत रुजू तारीख भविष्यातील असू शकत नाही" : "Date in service cannot be future date"),
    confirmationDate: z.date().nullable().optional(),
    transferDate: z.date().nullable().optional(),
    retiredDate: z.date().nullable().optional(),
    department: z.string().min(1, isMarathi ? "विभाग निवडा" : "Select department"),
    designation: z.string().min(1, isMarathi ? "पदनाम निवडा" : "Select designation"),
    grade: z.string().min(1, isMarathi ? "श्रेणी निवडा" : "Select grade"),
    payScale: z.string().min(1, isMarathi ? "वेतन श्रेणी निवडा" : "Select pay scale"),
    basicSalary: z.string().min(1, isMarathi ? "मूळ वेतन आवश्यक आहे" : "Basic salary is required"),
    gradePay: z.string().min(1, isMarathi ? "ग्रेड वेतन आवश्यक आहे" : "Grade pay is required"),
    category: z.string().min(1, isMarathi ? "कर्मचारी प्रकार निवडा" : "Select category"),
  };

  if (ulbId === "751" || ulbId === "870") {
    return z.object({
      ...baseSchema,
      empStatus: z.string().min(1, isMarathi ? "कर्मचारी स्थिती निवडा" : "Select employee status"),
      zone: z.string().optional(),
      bank: z.string().optional(),
      branch: z.string().optional(),
      accountNo: z.string().optional(),
      pfNo: z.string().optional(),
      pranNo: z.string().optional(),
      pfPercent: z.string().optional(),
      pfAmount: z.string().optional(),
      additionalPfPercent: z.string().optional(),
      additionalPfAmount: z.string().optional(),
      festivalAdvance: z.string().optional(),
      deductionType: z.string().optional(),
      vehicleAcquisition: z.string().optional(),
      homeAcquisition: z.string().optional(),
      maritalStatus: z.string().optional(),
      religion: z.string().optional(),
      caste: z.string().optional(),
      subCaste: z.string().optional(),
      casteCat: z.string().optional(),
      ifscCode: z.string().optional(),
    });
  }

  return z.object({
    ...baseSchema,
    empStatus: z.string().optional(),
    zone: z.string().optional(),
    bank: z.string().optional(),
    branch: z.string().optional(),
    accountNo: z.string().optional(),
    pfNo: z.string().optional(),
    pranNo: z.string().optional(),
    pfPercent: z.string().optional(),
    pfAmount: z.string().optional(),
    additionalPfPercent: z.string().optional(),
    additionalPfAmount: z.string().optional(),
    festivalAdvance: z.string().optional(),
    deductionType: z.string().optional(),
    vehicleAcquisition: z.string().optional(),
    homeAcquisition: z.string().optional(),
  });
};

export const validateDateComparison = (data) => {
  if (data.confirmationDate && data.dateInService) {
    if (data.confirmationDate < data.dateInService) {
      return {
        isValid: false,
        message: "Confirmation date must be greater than or equal to date in service"
      };
    }
  }
  if (data.retiredDate && data.dateInService) {
    if (data.retiredDate < data.dateInService) {
      return {
        isValid: false,
        message: "Retired date must be greater than date in service"
      };
    }
  }
  return { isValid: true };
};

export const FrmDepSalBillValidationSchema = z.object({
    month: z.number().min(1, "Month is required").refine((val) => val !== "-1", {
      message: "Please select a month",
    }),
    year: z.string().min(1, "Year is required").refine((val) => val !== "-1", {
      message: "Please select a year",
    }),
    category: z.string().min(1, "Category is required").refine((val) => val !== "-1", {
      message: "Please select a category",
    }),
    department: z.string().optional(),
    subDepartment: z.string().optional(),
    billNo: z.string().optional(),
    employeeCode: z.string().optional(),
    employeeName: z.string().optional(),
  })
  .refine(
    (data) => {
      const year = parseInt(data.year);
      const month = parseInt(data.month);
      if (isNaN(year) || isNaN(month)) return false;
      if (year < 1900 || year > 2100) return false;
      if (month < 1 || month > 12) return false;
      return true;
    },
    {
      message: "Invalid date selection",
      path: ["month"],
    }
  );

export const FrmEmpPayHeadListValidationSchema = z.object({
    category: z.string()
        .min(1, "Category is required")
        .refine((val) => val !== undefined && val !== null && val !== "", {
            message: "Please select a category",
        }),
    zone: z.string().optional(),
    department: z.string().optional(),
    employeeCode: z.string().optional(),
    payHead: z.string()
        .min(1, "PayHead is required")
        .refine((val) => val !== undefined && val !== null && val !== "", {
            message: "Please select a PayHead",
        }),
});
