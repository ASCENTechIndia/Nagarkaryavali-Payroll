import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/calendar";

const PersonalInformationTab = ({ values, setFieldValue, ulbId, employeeData, mode }) => {
  const isInitialDataSet = useRef(false);

  useEffect(() => {
    if (employeeData && mode === 2 && !isInitialDataSet.current) {
      isInitialDataSet.current = true;

      setFieldValue("empId", employeeData.NUM_EMPLOYEE_EMPID || "");
      setFieldValue("empNameM", employeeData.VAR_EMPLOYEE_MARNAME || "");
      setFieldValue("empNameE", employeeData.VAR_EMPLOYEE_ENGNAME || "");
      setFieldValue("dob", employeeData.DATE_EMPLOYEE_DOB ? new Date(employeeData.DATE_EMPLOYEE_DOB) : new Date());
      setFieldValue("gender", employeeData.VAR_EMPLOYEE_GENDER || "M");
      setFieldValue("emailId", employeeData.VAR_EMPLOYEE_EMAILID || "");
      setFieldValue("mobileNo", employeeData.NUM_EMPLOYEE_MOBILENO?.toString() || "");
      setFieldValue("altMobNo", employeeData.NUM_EMPLOYEE_ALTMOBNO?.toString() || "");
      setFieldValue("panNo", employeeData.VAR_EMPLOYEE_PANNO || "");
      setFieldValue("aadharNo", employeeData.NUM_EMPLOYEE_AADHARNO?.toString() || "");
      setFieldValue("handicapped", employeeData.VAR_EMPLOYEE_HANDICAP || "N");
      setFieldValue("disabilityDesc", employeeData.VAR_EMPLOYEE_DISABLDESC || "");
      setFieldValue("disabilityPerc", employeeData.VAR_EMPLOYEE_DISABLPREC || "");
      setFieldValue("presentAddress", employeeData.VAR_EMPLOYEE_PSNTADDRESS || "");
      setFieldValue("permanentAddress", employeeData.VAR_EMPLOYEE_PMNTADDRESS || "");
      setFieldValue("societyMember", employeeData.VAR_EMPLOYEE_SOCMEM || "N");
      setFieldValue("societyAmt", employeeData.NUM_EMPLOYEE_SOCIETYAMT?.toString() || "");
      setFieldValue("musterSheet", employeeData.VAR_EMPLOYEE_MACHIATTEN || "");
      setFieldValue("education", employeeData.VAR_EMPLOYEE_EDUCATION || "");
      setFieldValue("sevaNivruti", employeeData.VAR_EMPLOYEE_SEVANIVFLAG || "N");
      setFieldValue("sevaNivrutiDate", employeeData.VAR_EMPLOYEE_SEVANIVDATE ? new Date(employeeData.VAR_EMPLOYEE_SEVANIVDATE) : null);
      setFieldValue("oldEmpNo", employeeData.VAR_EMPLOYEE_OLDEMPNO || "");
      setFieldValue("voterId", employeeData.VAR_EMPLOYEE_VOTERID || "");
      setFieldValue("partNo", employeeData.VAR_EMPLOYEE_PARTNO || "");
      setFieldValue("jobChart", employeeData.VAR_EMPLOYEE_JOBCHART || "");
      setFieldValue("jobTableNo", employeeData.VAR_EMPLOYEE_JOBTABLENO || "");
      setFieldValue("assemConNoName", employeeData.VAR_EMPLOYEE_ASSEMCONDET || "");
    }
  }, [employeeData, mode]);

  const isMarathi = ulbId === 870 || ulbId === 751;
  const showJobDetails = ulbId === 870 || ulbId === 751 || ulbId === 1690;
  const showAltMobNo = ulbId === 870 || ulbId === 751 || ulbId === 1690;
  const showDisabilityFields = ulbId === 870 || ulbId === 751 || ulbId === 1690;
  const showOldEmp = ulbId === 870 || ulbId === 751 || ulbId === 1690 || ulbId === 2;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "कर्मचारी नाव (मराठी)" : "Employee Marathi Name"} />
            <span>:</span>
          </div>
          <Input
            name="empNameM"
            value={values.empNameM}
            onChange={(e) => setFieldValue("empNameM", e.target.value)}
            placeholder={isMarathi ? "मराठी नाव प्रविष्ट करा" : "Enter marathi name"}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "कर्मचारी नाव (इंग्रजी)" : "Employee English Name"} />
            <span>:</span>
          </div>
           <Input
            name="empNameE"
            value={values.empNameE}
            onChange={(e) => setFieldValue("empNameE", e.target.value)}
            placeholder={isMarathi ? "इंग्रजी नाव प्रविष्ट करा" : "Enter english name"}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "जन्मतारीख" : "Date of Birth"} />
            <span>:</span>
          </div>
          <DatePicker
            value={values.dob}
            onChange={(date) => setFieldValue("dob", date)}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "लिंग" : "Gender"} />
            <span>:</span>
          </div>
          <div className="flex flex-row gap-6 items-center h-9">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="gender"
                value="M"
                checked={values.gender === "M"}
                onChange={(e) => setFieldValue("gender", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">{isMarathi ? "पुरुष" : "Male"}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="gender"
                value="F"
                checked={values.gender === "F"}
                onChange={(e) => setFieldValue("gender", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">{isMarathi ? "महिला" : "Female"}</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "ई-मेल आयडी" : "Email ID"} />
            <span>:</span>
          </div>
          <Input
            name="emailId"
            value={values.emailId}
            onChange={(e) => setFieldValue("emailId", e.target.value)}
            placeholder="Enter email id"
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "मोबाईल नंबर" : "Mobile Number"} />
            <span>:</span>
          </div>
          <Input
            name="mobileNo"
            value={values.mobileNo}
            onChange={(e) => setFieldValue("mobileNo", e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
            placeholder="Enter mobile no."
            maxLength={10}
            className="w-full h-9"
          />
        </div>

        {showAltMobNo && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="पर्यायी मोबाईल नंबर" />
              <span>:</span>
            </div>
            <Input
              name="altMobNo"
              value={values.altMobNo}
              onChange={(e) => setFieldValue("altMobNo", e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
              placeholder="Enter alternate mobile no."
              maxLength={10}
              className="w-full h-9"
            />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "पॅन क्रमांक" : "PAN No."} />
            <span>:</span>
          </div>
          <Input
            name="panNo"
            value={values.panNo}
            onChange={(e) => setFieldValue("panNo", e.target.value.toUpperCase())}
            placeholder="Enter pan no."
            maxLength={10}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "आधार क्रमांक" : "Aadhar No."} />
            <span>:</span>
          </div>
          <Input
            name="aadharNo"
            value={values.aadharNo}
            onChange={(e) => setFieldValue("aadharNo", e.target.value.replace(/[^0-9]/g, "").slice(0, 12))}
            placeholder="Enter aadhar no."
            maxLength={12}
            className="w-full h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "दिव्यांग" : "Handicapped"} />
            <span>:</span>
          </div>
          <div className="flex flex-row gap-6 items-center h-9">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="handicapped"
                value="Y"
                checked={values.handicapped === "Y"}
                onChange={(e) => {
                  setFieldValue("handicapped", e.target.value);
                  if (e.target.value === "N") {
                    setFieldValue("disabilityDesc", "");
                    setFieldValue("disabilityPerc", "");
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">{isMarathi ? "होय" : "Yes"}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="handicapped"
                value="N"
                checked={values.handicapped === "N"}
                onChange={(e) => {
                  setFieldValue("handicapped", e.target.value);
                  if (e.target.value === "N") {
                    setFieldValue("disabilityDesc", "");
                    setFieldValue("disabilityPerc", "");
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">{isMarathi ? "नाही" : "No"}</span>
            </label>
          </div>
        </div>
        
        {showDisabilityFields && values.handicapped === "Y" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="अपंगत्व प्रकार" />
                <span>:</span>
              </div>
              <Input
                name="disabilityDesc"
                value={values.disabilityDesc}
                onChange={(e) => setFieldValue("disabilityDesc", e.target.value)}
                className="w-full h-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="अपंगत्व % मध्ये" />
                <span>:</span>
              </div>
              <Input
                name="disabilityPerc"
                value={values.disabilityPerc}
                onChange={(e) => setFieldValue("disabilityPerc", e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full h-9"
              />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "सध्याचा पत्ता" : "Current Address"} />
            <span>:</span>
          </div>
          <Textarea
            name="presentAddress"
            value={values.presentAddress}
            onChange={(e) => setFieldValue("presentAddress", e.target.value)}
            placeholder={isMarathi ? "सध्याचा पत्ता प्रविष्ट करा" : "Enter current address"}
            rows={3}
            className="resize-none"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "कायमचा पत्ता" : "Permanent Address"} />
            <span>:</span>
          </div>
          <Textarea
            name="permanentAddress"
            value={values.permanentAddress}
            onChange={(e) => setFieldValue("permanentAddress", e.target.value)}
            placeholder={isMarathi ? "कायमचा पत्ता प्रविष्ट करा" : "Enter permanent address"}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "सोसायटी सदस्य" : "Society Member"} />
            <span>:</span>
          </div>
          <div className="flex flex-row gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="societyMember"
                value="Y"
                checked={values.societyMember === "Y"}
                onChange={(e) => {
                  setFieldValue("societyMember", e.target.value);
                  if (e.target.value === "N") setFieldValue("societyAmt", "");
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">{isMarathi ? "होय" : "Yes"}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="societyMember"
                value="N"
                checked={values.societyMember === "N"}
                onChange={(e) => {
                  setFieldValue("societyMember", e.target.value);
                  if (e.target.value === "N") setFieldValue("societyAmt", "");
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">{isMarathi ? "नाही" : "No"}</span>
            </label>
          </div>
          {values.societyMember === "Y" && (
            <Input
              name="societyAmt"
              value={values.societyAmt}
              onChange={(e) => setFieldValue("societyAmt", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="amount"
              className="h-9 mt-2"
            />
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "मस्टर शीट" : "Muster Sheet"} />
            <span>:</span>
          </div>
          <Input
            name="musterSheet"
            value={values.musterSheet}
            onChange={(e) => setFieldValue("musterSheet", e.target.value)}
            placeholder={isMarathi ? "मस्टर शीट प्रविष्ट करा" : "Enter muster sheet"}
            className="w-full h-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "शिक्षण" : "Education"} />
            <span>:</span>
          </div>
          <Input
            name="education"
            value={values.education}
            onChange={(e) => setFieldValue("education", e.target.value)}
            className="w-full h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "सेवा निवृत्त (होय / नाही)" : "सेवा निवृत्ती. होय/ नाही"} />
            <span>:</span>
          </div>
          <div className="flex flex-row gap-6 items-center h-9">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="sevaNivruti"
                value="Y"
                checked={values.sevaNivruti === "Y"}
                onChange={(e) => setFieldValue("sevaNivruti", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">{isMarathi ? "होय" : "Yes"}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="sevaNivruti"
                value="N"
                checked={values.sevaNivruti === "N"}
                onChange={(e) => setFieldValue("sevaNivruti", e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm font-normal">{isMarathi ? "नाही" : "No"}</span>
            </label>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "मुदतपुर्ती सेवा निवृत्ती दिनांक" : "मुदतपुर्व से.नि. दि.( सेवा निवृत्ती दिनांक)"} />
            <span>:</span>
          </div>
          <DatePicker
            value={values.sevaNivrutiDate}
            onChange={(date) => setFieldValue("sevaNivrutiDate", date)}
            className="w-full h-9"
          />
        </div>
        
        {showOldEmp && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text={ulbId === "751" || ulbId === "870" || ulbId === "1690" ? "Employee code" : "Old Empno."} />
              <span>:</span>
            </div>
            <Input
              name="oldEmpNo"
              value={values.oldEmpNo}
              onChange={(e) => setFieldValue("oldEmpNo", e.target.value)}
              className="w-full h-9"
              disabled={ulbId === "1630"}
            />
          </div>
        )}
      </div>

      {showJobDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="मतदार ओळखपत्र क्र." />
              <span>:</span>
            </div>
            <Input
              name="voterId"
              value={values.voterId}
              onChange={(e) => setFieldValue("voterId", e.target.value)}
              className="w-full h-9"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="यादी भाग क्रमांक" />
              <span>:</span>
            </div>
            <Input
              name="partNo"
              value={values.partNo}
              onChange={(e) => setFieldValue("partNo", e.target.value)}
              className="w-full h-9"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Job Chart" />
              <span>:</span>
            </div>
            <Input
              name="jobChart"
              value={values.jobChart}
              onChange={(e) => setFieldValue("jobChart", e.target.value)}
              className="w-full h-9"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Job Table No." />
              <span>:</span>
            </div>
            <Input
              name="jobTableNo"
              value={values.jobTableNo}
              onChange={(e) => setFieldValue("jobTableNo", e.target.value)}
              className="w-full h-9"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="विधानसभा मतदारसंघ क्र. - नाव" />
              <span>:</span>
            </div>
            <Input
              name="assemConNoName"
              value={values.assemConNoName}
              onChange={(e) => setFieldValue("assemConNoName", e.target.value)}
              className="w-full h-9"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInformationTab;