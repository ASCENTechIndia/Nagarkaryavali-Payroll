import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShadCNTable from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const OfficeDetailsTab = ({ 
  values, setFieldValue, ulbId, employeeData, mode,
  bankList, branchList, gradeList, deptList, subDeptList,
  designationList, payScaleList, categoryList, zoneList,
  religionList, casteList, subCasteList, casteCatList,
  festivalAdvanceList, recruitmentTypeList,
  karyaratVibhagList, karyaratZoneList,
  fetchSubDepartments, fetchBranches, fetchCastes, fetchSubCastes,
  licRecords, setLicRecords, bankRecords, setBankRecords
}) => {
  
  const isInitialDataSet = useRef(false);

  console.log(
    "ULBId: ", ulbId
  )
  console.log("Type:", typeof ulbId);

  const isMarathi = ulbId === 870 || ulbId === 751;
  const isAMC = ulbId === 770 || ulbId === 1750 || ulbId === 930;
  const isJalgaon = ulbId === 2;
  const isSMKC = ulbId ===  870 || ulbId === 751 || ulbId === 1690;
  const showKaryaratFields = ulbId === 2;
  const showDhulaiBhatta = ulbId === 2;
  const showBankGrid = isAMC;
  const showBankInstallment = isJalgaon;

  const licHeaders = ["पॉलिसी क्रमांक", "हप्ता रक्कम", "पॉलिसी रक्कम", "कालावधी", "पॉलिसी धारक/कर्मचारी नाव	", "तारीख पासून", "तारीख पर्यंत", "हटवा"];
  const licKeyMapping = {
    "पॉलिसी क्रमांक": "policyNumber",
    "हप्ता रक्कम": "premiumAmount",
    "पॉलिसी रक्कम": "policyAmount",
    "कालावधी": "tenure",
    "पॉलिसी धारक/कर्मचारी नाव	": "policyHolder",
    "तारीख पासून": "fromDate",
    "तारीख पर्यंत": "toDate",
    "हटवा": "delete"
  };

  useEffect(() => {
    const loadEmployeeData = async () => {
      if (employeeData && mode === 2 && !isInitialDataSet.current) {
        isInitialDataSet.current = true;
        
        setFieldValue("empStatus", employeeData.VAR_EMPLOYEE_EMPTYPE || (isMarathi ? "A" : "P"));
        setFieldValue("zone", employeeData.NUM_EMPLOYEE_ZONE?.toString() || "");
        setFieldValue("category", employeeData.NUM_EMPLOYEE_PAYSHEETTYPE?.toString() || "");
        setFieldValue("dcpsValue", employeeData.NUM_EMPLOYEE_DSCPPERCENT?.toString() || "");
        setFieldValue("dateInService", employeeData.DATE_EMPLOYEE_JOINDATE ? new Date(employeeData.DATE_EMPLOYEE_JOINDATE) : new Date());
        setFieldValue("confirmationDate", employeeData.DATE_EMPLOYEE_CONFIRMDATE ? new Date(employeeData.DATE_EMPLOYEE_CONFIRMDATE) : null);
        setFieldValue("transferDate", employeeData.DATE_EMPLOYEE_TRANSFER ? new Date(employeeData.DATE_EMPLOYEE_TRANSFER) : null);
        setFieldValue("appointmentNo", employeeData.VAR_EMPLOYEE_EMPAPPNO || "");
        setFieldValue("retiredDate", employeeData.DATE_EMPLOYEE_RETIREMNTDATE ? new Date(employeeData.DATE_EMPLOYEE_RETIREMNTDATE) : null);
        setFieldValue("maritalStatus", employeeData.VAR_EMPLOYEE_MARSTATUS || "N");
        setFieldValue("bank", employeeData.NUM_EMPLOYEE_BANKID?.toString() || "");
        
        if (employeeData.NUM_EMPLOYEE_BANKID) {
          await fetchBranches(employeeData.NUM_EMPLOYEE_BANKID.toString());
          setTimeout(() => {
            setFieldValue("branch", employeeData.NUM_EMPLOYEE_BANKBRID?.toString() || "");
          }, 100);
        } else {
          setFieldValue("branch", employeeData.NUM_EMPLOYEE_BANKBRID?.toString() || "");
        }
        
        setFieldValue("religion", employeeData.NUM_EMPLOYEE_RELIGION?.toString() || "");
        
        if (employeeData.NUM_EMPLOYEE_RELIGION) {
          await fetchCastes(employeeData.NUM_EMPLOYEE_RELIGION.toString());
          setTimeout(() => {
            setFieldValue("caste", employeeData.VAR_EMPLOYEE_CAST?.toString() || "");
          }, 100);
        } else {
          setFieldValue("caste", employeeData.VAR_EMPLOYEE_CAST?.toString() || "");
        }
        
        if (employeeData.VAR_EMPLOYEE_CAST) {
          await fetchSubCastes(employeeData.VAR_EMPLOYEE_CAST.toString());
          setTimeout(() => {
            setFieldValue("subCaste", employeeData.VAR_EMPLOYEE_SUBCAST || "");
          }, 100);
        } else {
          setFieldValue("subCaste", employeeData.VAR_EMPLOYEE_SUBCAST || "");
        }
        
        setFieldValue("casteCat", employeeData.NUM_EMPLOYEE_CASTCAT?.toString() || "");
        setFieldValue("accountNo", employeeData.NUM_EMPLOYEE_BANKACCNO || "");
        setFieldValue("ifscCode", employeeData.VAR_EMPLOYEE_IFSC || "");
        setFieldValue("department", employeeData.NUM_EMPLOYEE_DEPTID?.toString() || "");
        
        if (employeeData.NUM_EMPLOYEE_DEPTID) {
          await fetchSubDepartments(employeeData.NUM_EMPLOYEE_DEPTID.toString());
          setTimeout(() => {
            setFieldValue("subDepartment", employeeData.NUM_EMPLOYEE_SUBDEPTID?.toString() || "");
          }, 100);
        } else {
          setFieldValue("subDepartment", employeeData.NUM_EMPLOYEE_SUBDEPTID?.toString() || "");
        }
        
        setFieldValue("designation", employeeData.NUM_EMPLOYEE_DESIGID?.toString() || "");
        setFieldValue("karyaratVibhag", employeeData.NUM_EMPLOYEE_KARYAVIBHAG?.toString() || "");
        setFieldValue("karyaratZone", employeeData.NUM_EMPLOYEE_KARYAZONE?.toString() || "");
        setFieldValue("recruitmentType", employeeData.NUM_EMPLOYEE_RECTYPE?.toString() || "");
        setFieldValue("grade", employeeData.NUM_EMPLOYEE_GRADEID?.toString() || "");
        setFieldValue("payScale", employeeData.NUM_EMPLOYEE_PAYSCALEID?.toString() || "");
        setFieldValue("pfNo", employeeData.VAR_EMPLOYEE_PFNO || "");
        setFieldValue("basicSalary", employeeData.NUM_EMPLOYEE_BASIC?.toString() || "");
        setFieldValue("gradePay", employeeData.NUM_EMPLOYEE_GRADEPAY?.toString() || "");
        setFieldValue("pranNo", employeeData.NUM_EMPLOYEE_PRANNO || "");
        setFieldValue("vehicleAcquisition", employeeData.VAR_EMPLOYEE_VEHICLE || "Y");
        setFieldValue("homeAcquisition", employeeData.VAR_EMPLOYEE_ACCOMOD || "N");
        setFieldValue("pfPercent", employeeData.NUM_EMPLOYEE_PFPERCENT?.toString() || "");
        setFieldValue("pfAmount", employeeData.NUM_EMPLOYEE_PFFIXAMT?.toString() || "");
        setFieldValue("additionalPfPercent", employeeData.NUM_EMPLOYEE_DEFPFPERCENT?.toString() || "");
        setFieldValue("additionalPfAmount", employeeData.NUM_EMPLOYEE_DEFPFFIXAMT?.toString() || "");
        setFieldValue("festivalAdvance", employeeData.VAR_EMPLOYEE_FESTID?.toString() || "");
        setFieldValue("deductionType", employeeData.VAR_EMPLOYEE_DEDUCTIONTYPE || "PF");
        setFieldValue("empType", employeeData.VAR_EMPLOYEE_EMPSTATUS || "NEW");
        setFieldValue("dhulaiBhatta", employeeData.VAR_EMPLOYEE_WASHALLOW === "Y");
        setFieldValue("billNo", employeeData.VAR_DEPTSLIP_CODE || "");
      }
    };
    
    loadEmployeeData();
  }, [employeeData, mode, setFieldValue, fetchBranches, fetchCastes, fetchSubCastes, fetchSubDepartments]);

  const handleAddLicRecord = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setFullYear(today.getFullYear() + 10);
    
    const newRecord = {
      id: Date.now(),
      policyNumber: "",
      premiumAmount: "",
      policyAmount: "",
      tenure: "",
      policyHolder: "",
      fromDate: today,
      toDate: futureDate,
      delete: null
    };
    setLicRecords([...licRecords, newRecord]);
  };

  const handleDeleteLicRecord = (id) => {
    setLicRecords(licRecords.filter(record => record.id !== id));
  };

  const handleLicRecordChange = (id, field, value) => {
    setLicRecords(licRecords.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ));
  };

  const handleAddBankInstallment = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setFullYear(today.getFullYear() + 1);
    
    const newRecord = {
      id: Date.now(),
      bankId: "",
      totalAmount: "",
      fromDate: today,
      toDate: futureDate,
      installment: "",
      delete: null
    };
    setBankRecords([...bankRecords, newRecord]);
  };

  const handleDeleteBankInstallment = (id) => {
    setBankRecords(bankRecords.filter(record => record.id !== id));
  };

  const calculateInstallment = (record, setRecord) => {
    if (record.totalAmount && record.fromDate && record.toDate) {
      const from = new Date(record.fromDate);
      const to = new Date(record.toDate);
      const months = ((to.getFullYear() - from.getFullYear()) * 12) + (to.getMonth() - from.getMonth()) + 1;
      const installment = parseFloat(record.totalAmount) / months;
      setRecord({ ...record, installment: installment.toFixed(2) });
    }
  };

  const transformedLicData = licRecords.map(record => ({
    policyNumber: (
      <Input
        value={record.policyNumber}
        onChange={(e) => handleLicRecordChange(record.id, "policyNumber", e.target.value)}
        className="h-8 w-full"
      />
    ),
    premiumAmount: (
      <Input
        value={record.premiumAmount}
        onChange={(e) => handleLicRecordChange(record.id, "premiumAmount", e.target.value.replace(/[^0-9]/g, ""))}
        className="h-8 w-full"
      />
    ),
    policyAmount: (
      <Input
        value={record.policyAmount}
        onChange={(e) => handleLicRecordChange(record.id, "policyAmount", e.target.value.replace(/[^0-9]/g, ""))}
        className="h-8 w-full"
      />
    ),
    tenure: (
      <Input
        value={record.tenure}
        onChange={(e) => handleLicRecordChange(record.id, "tenure", e.target.value)}
        className="h-8 w-full"
      />
    ),
    policyHolder: (
      <Input
        value={record.policyHolder}
        onChange={(e) => handleLicRecordChange(record.id, "policyHolder", e.target.value)}
        className="h-8 w-full"
      />
    ),
    fromDate: (
      <DatePicker
        value={record.fromDate}
        onChange={(date) => handleLicRecordChange(record.id, "fromDate", date)}
        className="w-full h-8"
      />
    ),
    toDate: (
      <DatePicker
        value={record.toDate}
        onChange={(date) => handleLicRecordChange(record.id, "toDate", date)}
        className="w-full h-8"
      />
    ),
    delete: (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => handleDeleteLicRecord(record.id)}
        className="h-8"
      >
        Remove
      </Button>
    )
  }));

  const transformedBankData = bankRecords.map(record => ({
    bankId: (
      <Select value={record.bankId} onValueChange={(val) => handleLicRecordChange(record.id, "bankId", val)}>
        <SelectTrigger className="h-8">
          <SelectValue placeholder="Select Bank" />
        </SelectTrigger>
        <SelectContent>
          {bankList.map(bank => (
            <SelectItem key={bank.value} value={bank.value}>{bank.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    fromDate: (
      <DatePicker
        value={record.fromDate}
        onChange={(date) => {
          handleLicRecordChange(record.id, "fromDate", date);
          calculateInstallment({ ...record, fromDate: date }, (updated) => handleLicRecordChange(record.id, "installment", updated.installment));
        }}
        className="w-full h-8"
      />
    ),
    toDate: (
      <DatePicker
        value={record.toDate}
        onChange={(date) => {
          handleLicRecordChange(record.id, "toDate", date);
          calculateInstallment({ ...record, toDate: date }, (updated) => handleLicRecordChange(record.id, "installment", updated.installment));
        }}
        className="w-full h-8"
      />
    ),
    totalAmount: (
      <Input
        value={record.totalAmount}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, "");
          handleLicRecordChange(record.id, "totalAmount", val);
          calculateInstallment({ ...record, totalAmount: val }, (updated) => handleLicRecordChange(record.id, "installment", updated.installment));
        }}
        className="h-8 w-full"
      />
    ),
    installment: (
      <Input
        value={record.installment}
        readOnly
        className="h-8 w-full bg-gray-100"
      />
    ),
    delete: (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => handleDeleteBankInstallment(record.id)}
        className="h-8"
      >
        Remove
      </Button>
    )
  }));

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "कर्मचारी स्थिती" : "Employee Status"} />
            <span>:</span>
          </div>
          <div className="flex flex-row gap-6 items-center h-9">
            {isMarathi ? (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="empStatus"
                    value="A"
                    checked={values.empStatus === "A"}
                    onChange={(e) => setFieldValue("empStatus", e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-normal">सक्रिय</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="empStatus"
                    value="R"
                    checked={values.empStatus === "R"}
                    onChange={(e) => setFieldValue("empStatus", e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-normal">सेवानिवृत्त</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="empStatus"
                    value="S"
                    checked={values.empStatus === "S"}
                    onChange={(e) => setFieldValue("empStatus", e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-normal">निलंबित</span>
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="empStatus"
                    value="T"
                    checked={values.empStatus === "T"}
                    onChange={(e) => setFieldValue("empStatus", e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-normal">Temporary</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="empStatus"
                    value="P"
                    checked={values.empStatus === "P"}
                    onChange={(e) => setFieldValue("empStatus", e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-normal">Permanent</span>
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "झोन" : "Zone"} />
            <span>:</span>
          </div>
          <Select value={values.zone} onValueChange={(val) => setFieldValue("zone", val)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Zone" />
            </SelectTrigger>
            <SelectContent>
              {zoneList.map(zone => (
                <SelectItem key={zone.value} value={zone.value}>{zone.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "कर्मचारी प्रकार" : "Category"} />
            <span>:</span>
          </div>
          <Select value={values.category} onValueChange={(val) => setFieldValue("category", val)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryList.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "DCPS मूल्य" : "DCPS Value"} />
            <span>:</span>
          </div>
          <Input
            value={values.dcpsValue}
            onChange={(e) => setFieldValue("dcpsValue", e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "सेवेत रुजू झाल्याची तारीख" : "Date in Service"} />
            <span>:</span>
          </div>
          <DatePicker
            value={values.dateInService}
            onChange={(date) => setFieldValue("dateInService", date)}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "नियुक्ती निश्चिती तारीख" : "Confirmation Date"} />
            <span>:</span>
          </div>
          <DatePicker
            value={values.confirmationDate}
            onChange={(date) => setFieldValue("confirmationDate", date)}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "बदलीची तारीख" : "Date Of Transfer"} />
            <span>:</span>
          </div>
          <DatePicker
            value={values.transferDate}
            onChange={(date) => setFieldValue("transferDate", date)}
            className="w-full h-9"
          />
        </div>
        
        {showKaryaratFields && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="EMP Appointment No." />
              <span>:</span>
            </div>
            <Input
              value={values.appointmentNo}
              onChange={(e) => setFieldValue("appointmentNo", e.target.value)}
              className="w-full h-9"
            />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "सेवानिवृत्ती तारीख" : "Retired Date"} />
            <span>:</span>
          </div>
          <DatePicker
            value={values.retiredDate}
            onChange={(date) => setFieldValue("retiredDate", date)}
            className="w-full h-9"
          />
        </div>
        
        {isSMKC && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="वैवाहिक स्थिती" />
              <span>:</span>
            </div>
            <div className="flex flex-row gap-6 items-center h-9">
              <label className="flex items-center gap-2 cursor-pointer">
                <Input
                  type="radio"
                  name="maritalStatus"
                  value="Y"
                  checked={values.maritalStatus === "Y"}
                  onChange={(e) => setFieldValue("maritalStatus", e.target.value)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-normal">{isMarathi ? "होय" : "Yes"}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Input
                  type="radio"
                  name="maritalStatus"
                  value="N"
                  checked={values.maritalStatus === "N"}
                  onChange={(e) => setFieldValue("maritalStatus", e.target.value)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-normal">{isMarathi ? "नाही" : "No"}</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "बँक" : "Bank"} />
            <span>:</span>
          </div>
          <Select 
            value={values.bank} 
            onValueChange={(val) => {
              setFieldValue("bank", val);
              setFieldValue("branch", "");
              fetchBranches(val);
            }}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Bank" />
            </SelectTrigger>
            <SelectContent>
              {bankList.map(bank => (
                <SelectItem key={bank.value} value={bank.value}>{bank.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "शाखा" : "Branch"} />
            <span>:</span>
          </div>
          <Select value={values.branch} onValueChange={(val) => setFieldValue("branch", val)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              {branchList.map(branch => (
                <SelectItem key={branch.value} value={branch.value}>{branch.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isSMKC && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text={isMarathi ? "धर्म" : "Religion"} />
              <span>:</span>
            </div>
            <Select 
              value={values.religion} 
              onValueChange={async (val) => {
                setFieldValue("religion", val);
                setFieldValue("caste", "");
                setFieldValue("subCaste", "");
                if (val) {
                  const castes = await fetchCastes(val);
                  console.log("Castes loaded:", castes);
                }
              }}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Religion" />
              </SelectTrigger>
              <SelectContent>
                {religionList.map(religion => (
                  <SelectItem key={religion.value} value={religion.value}>{religion.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "जात" : "Caste"} />
            <span>:</span>
          </div>
          <Select 
            value={values.caste} 
            onValueChange={async (val) => {
              setFieldValue("caste", val);
              setFieldValue("subCaste", "");
              await fetchSubCastes(val);
            }}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Caste" />
            </SelectTrigger>
            <SelectContent>
              {casteList.map(caste => (
                <SelectItem key={caste.value} value={caste.value}>{caste.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "उपजात" : "Sub Caste"} />
            <span>:</span>
          </div>
          <Select value={values.subCaste} onValueChange={(val) => setFieldValue("subCaste", val)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Sub Caste" />
            </SelectTrigger>
            <SelectContent>
              {subCasteList.map(subCaste => (
                <SelectItem key={subCaste.value} value={subCaste.value}>{subCaste.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isSMKC && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text={isMarathi ? "जात प्रवर्ग" : "Caste Category"} />
              <span>:</span>
            </div>
            <Select value={values.casteCat} onValueChange={(val) => setFieldValue("casteCat", val)}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Caste Category" />
              </SelectTrigger>
              <SelectContent>
                {casteCatList.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "खाते क्रमांक" : "Account Number"} />
            <span>:</span>
          </div>
          <Input
            value={values.accountNo}
            onChange={(e) => setFieldValue("accountNo", e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full h-9"
          />
        </div>
        
        {isSMKC && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="IFSC कोड" />
              <span>:</span>
            </div>
            <Input
              value={values.ifscCode}
              onChange={(e) => setFieldValue("ifscCode", e.target.value.toUpperCase())}
              className="w-full h-9"
              maxLength={11}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "विभाग" : "Department"} />
            <span>:</span>
          </div>
          <Select 
            value={values.department} 
            onValueChange={(val) => {
              setFieldValue("department", val);
              setFieldValue("subDepartment", "");
              fetchSubDepartments(val);
            }}
          >
            <SelectTrigger className="!w-full h-9 overflow-hidden">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {deptList.map(dept => (
                <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "उपविभाग" : "Sub Department"} />
            <span>:</span>
          </div>
          <Select value={values.subDepartment} onValueChange={(val) => setFieldValue("subDepartment", val)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Sub Department" />
            </SelectTrigger>
            <SelectContent>
              {subDeptList.map(subDept => (
                <SelectItem key={subDept.value} value={subDept.value}>{subDept.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "पदनाम" : "Designation"} />
            <span>:</span>
          </div>
          <Select value={values.designation} onValueChange={(val) => setFieldValue("designation", val)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Designation" />
            </SelectTrigger>
            <SelectContent>
              {designationList.map(desig => (
                <SelectItem key={desig.value} value={desig.value}>{desig.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {showKaryaratFields && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="कार्यरत विभाग" />
                <span>:</span>
              </div>
              <Select value={values.karyaratVibhag} onValueChange={(val) => setFieldValue("karyaratVibhag", val)}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Karyarat Vibhag" />
                </SelectTrigger>
                <SelectContent>
                  {karyaratVibhagList.map(vibhag => (
                    <SelectItem key={vibhag.value} value={vibhag.value}>{vibhag.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="कार्यरत झोन" />
                <span>:</span>
              </div>
              <Select value={values.karyaratZone} onValueChange={(val) => setFieldValue("karyaratZone", val)}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Karyarat Zone" />
                </SelectTrigger>
                <SelectContent>
                  {karyaratZoneList.map(zone => (
                    <SelectItem key={zone.value} value={zone.value}>{zone.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        
        {isSMKC && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="नियुक्तीचा प्रकार" />
              <span>:</span>
            </div>
            <Select value={values.recruitmentType} onValueChange={(val) => setFieldValue("recruitmentType", val)}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Recruitment Type" />
              </SelectTrigger>
              <SelectContent>
                {recruitmentTypeList.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "श्रेणी" : "Grade"} />
            <span>:</span>
          </div>
          <Select value={values.grade} onValueChange={(val) => setFieldValue("grade", val)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {gradeList.map(grade => (
                <SelectItem key={grade.value} value={grade.value}>{grade.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "वेतन श्रेणी" : "Pay Scale"} />
            <span>:</span>
          </div>
          <Select value={values.payScale} onValueChange={(val) => setFieldValue("payScale", val)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Pay Scale" />
            </SelectTrigger>
            <SelectContent>
              {payScaleList.map(scale => (
                <SelectItem key={scale.value} value={scale.value}>{scale.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "भविष्य निर्वाह निधी क्रमांक" : "P.F. Number"} />
            <span>:</span>
          </div>
          <Input
            value={values.pfNo}
            onChange={(e) => setFieldValue("pfNo", e.target.value)}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "मूळ वेतन" : "Basic Salary"} />
            <span>:</span>
          </div>
          <Input
            value={values.basicSalary}
            onChange={(e) => setFieldValue("basicSalary", e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "ग्रेड वेतन" : "Grade Pay"} />
            <span>:</span>
          </div>
          <Input
            value={values.gradePay}
            onChange={(e) => setFieldValue("gradePay", e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "PRAN क्रमांक" : "PRAN Number"} />
            <span>:</span>
          </div>
          <Input
            value={values.pranNo}
            onChange={(e) => setFieldValue("pranNo", e.target.value)}
            className="w-full h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "वाहन अधिग्रहण" : "Vehicle Acquisition"} />
            <span>:</span>
          </div>
          <div className="flex flex-row gap-6 items-center h-9">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="vehicleAcquisition"
                value="Y"
                checked={values.vehicleAcquisition === "Y"}
                onChange={(e) => setFieldValue("vehicleAcquisition", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="vehicleAcquisition"
                value="N"
                checked={values.vehicleAcquisition === "N"}
                onChange={(e) => setFieldValue("vehicleAcquisition", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">No</span>
            </label>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "घर अधिग्रहण" : "Home Acquisition"} />
            <span>:</span>
          </div>
          <div className="flex flex-row gap-6 items-center h-9">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="homeAcquisition"
                value="Y"
                checked={values.homeAcquisition === "Y"}
                onChange={(e) => setFieldValue("homeAcquisition", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="homeAcquisition"
                value="N"
                checked={values.homeAcquisition === "N"}
                onChange={(e) => setFieldValue("homeAcquisition", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">No</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "भविष्य निर्वाह निधी टक्केवारी" : "Provident Fund %"} />
            <span>:</span>
          </div>
          <Input
            value={values.pfPercent}
            onChange={(e) => setFieldValue("pfPercent", e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "PF रक्कम" : "P.F. Amount"} />
            <span>:</span>
          </div>
          <Input
            value={values.pfAmount}
            onChange={(e) => setFieldValue("pfAmount", e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "अतिरिक्त PF टक्केवारी" : "Additional PF %"} />
            <span>:</span>
          </div>
          <Input
            value={values.additionalPfPercent}
            onChange={(e) => setFieldValue("additionalPfPercent", e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "अतिरिक्त PF रक्कम" : "Additional PF Amount"} />
            <span>:</span>
          </div>
          <Input
            value={values.additionalPfAmount}
            onChange={(e) => setFieldValue("additionalPfAmount", e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "सण आगाऊ" : "Festival Advance"} />
            <span>:</span>
          </div>
          <Select value={values.festivalAdvance} onValueChange={(val) => setFieldValue("festivalAdvance", val)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select Festival Advance" />
            </SelectTrigger>
            <SelectContent>
              {festivalAdvanceList.map(fest => (
                <SelectItem key={fest.value} value={fest.value}>{fest.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "कपात प्रकार" : "Deduction Type"} />
            <span>:</span>
          </div>
          <div className="flex flex-row gap-6 items-center h-9">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="deductionType"
                value="DCPS"
                checked={values.deductionType === "DCPS"}
                onChange={(e) => setFieldValue("deductionType", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">DCPS</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="deductionType"
                value="PF"
                checked={values.deductionType === "PF"}
                onChange={(e) => setFieldValue("deductionType", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">PF</span>
            </label>
          </div>
        </div>
        
        {isAMC && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Employee Type" />
              <span>:</span>
            </div>
            <Select value={values.empType} onValueChange={(val) => setFieldValue("empType", val)}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select Employee Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OLD">OLD</SelectItem>
                <SelectItem value="NEW">NEW</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {showDhulaiBhatta && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="धुलाई भत्ता" />
              <span>:</span>
            </div>
            
            <div className="flex items-center h-9">
              <Checkbox
                checked={values.dhulaiBhatta}
                onCheckedChange={(checked) => setFieldValue("dhulaiBhatta", checked)}
              />
            </div>
          </div>
        )}
        
        {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Bill No." />
            <span>:</span>
          </div>
          <Input
            value={values.billNo}
            onChange={(e) => setFieldValue("billNo", e.target.value)}
            className="w-full h-9"
          />
        </div> */}
      </div>

      <div className="space-y-2 pt-4 border-t">
        <div className="flex justify-between items-center"> 
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="LIC Policies" className={"text-md font-semibold"} />
          </div>
          <Button type="button" onClick={handleAddLicRecord} className="bg-blue-900 hover:bg-blue-800 text-white">
            LIC Add New Record
          </Button>
        </div>
        <div className="overflow-x-auto">
          <ShadCNTable
            headers={licHeaders}
            data={transformedLicData}
            keyMapping={licKeyMapping}
            pagination={false}
            className="min-w-[800px]"
          />
        </div>
      </div>

      {showBankInstallment && (
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Bank Installments" />
              <span>:</span>
            </div>
            <Button type="button" onClick={handleAddBankInstallment} className="bg-blue-900 hover:bg-blue-800 text-white">
              Add Bank Record
            </Button>
          </div>
          <div className="overflow-x-auto">
            <ShadCNTable
              headers={["Bank", "From Date", "To Date", "Total Amount", "Installment Amount", "Delete"]}
              data={transformedBankData}
              keyMapping={{
                "Bank": "bankId",
                "From Date": "fromDate",
                "To Date": "toDate",
                "Total Amount": "totalAmount",
                "Installment Amount": "installment",
                "Delete": "delete"
              }}
              pagination={false}
              className="min-w-[800px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeDetailsTab;