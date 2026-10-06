import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams, useOutletContext, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";

const API = (BASE_URL) => `${BASE_URL}/api/FrmESevaEmpMaster`;

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${dt.getFullYear()}`;
  
};

const isTenDigits = (v) => /^\d{10}$/.test(String(v ?? "").trim());
const isSixDigits = (v) => /^\d{6}$/.test(String(v ?? "").trim());
const onlyDigits = (v) => /^\d+$/.test(String(v ?? "").trim());
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());

const FrmESevaEmpMaster = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const [detailsLoaded, setDetailsLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  console.log("master", {location});
  const [searchParams] = useSearchParams();

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const queryMode = searchParams.get("@");
  const mode = queryMode === "1" ? 2 : 1;

  const authHeaders = { Authorization: `Bearer ${token}` };

  const { empId, esevaEmployeeID } = useOutletContext();

  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    dob: null,
    nationality: "",
    religion: "",
    cast: "",
    subCast: "",
    category: "",
    mobileNo: "",
    emailId: "",
    bloodGroup: "",
    height: "",
    perIdentificationMark: "",

    isPhysicallyHandicapped: "N",
    handicappedDetails: "",
    isMarried: "N",
    spouseName: "",

    permanentAddress: "",
    permanentDistrict: "",
    permanentState: "",
    permanentCountry: "",
    permanentPostOffice: "",
    permanentPincode: "",
    permanentMobileNumber: "",
    permanentAlternateNumber: "",

    communicationAddress: "",
    communicationDistrict: "",
    communicationState: "",
    communicationCountry: "",
    communicationPostOffice: "",
    communicationPincode: "",
    communicationMobileNumber: "",
    communicationAlternateNumber: "",

    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactMobileNumber: "",
    emergencyAlternateContactName: "",
    emergencyAlternateRelation: "",
    emergencyAlternateMobileNumber: "",

    hometownAtJoining: "",
    hometownNearRailwayStation: "",
    hometownNearAirport: "",
    subsequenceHometown: "",
    subsequenceNearRailwayStation: "",
    subsequenceNearAirport: "",

    medTestRptCertNo: "",
    medTestRptDate: null,
    medTestRptAuthAndDesig: "",
    note: "",
  });

  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  const [familyDetails, setFamilyDetails] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [famForm, setFamForm] = useState({
    fammemname: "",
    fammemdob: null,
    fammemrelation: "",
    fammemrelationid: "",
    fammemmarstatus: "",
    fammemmarstatusid: "N",
    fammemocc: "",
    fammemmoninc: "",
    fammemisdep: "",
    fammemisdepid: "Y",
  });

  const [nationalityOptions, setNationalityOptions] = useState([]);
  const [religionOptions, setReligionOptions] = useState([]);
  const [castOptions, setCastOptions] = useState([]);
  const [subCastOptions, setSubCastOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [bloodGroupOptions, setBloodGroupOptions] = useState([]);
  const [relationOptions, setRelationOptions] = useState([]);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const showAlert = async (text, redirectTo = null) => {
    await Swal.fire({ text });
    if (redirectTo) navigate(redirectTo);
  };

  const toOptions = (rows = []) =>
    rows.map((r) => ({
      value: r.VALUE_ID?.toString(),
      label: r.DISPLAY_TEXT,
    }));

  const fetchNationality = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/nationality-dropdown`,
        {},
        { headers: authHeaders }
      );
      setNationalityOptions(toOptions(res?.data?.data || []));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReligion = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/religion-dropdown`,
        {},
        { headers: authHeaders }
      );
      setReligionOptions(toOptions(res?.data?.data || []));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/category-dropdown`,
        { ulbid: Number(ulbId) },
        { headers: authHeaders }
      );
      setCategoryOptions(toOptions(res?.data?.data || []));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBloodGroup = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/bloodgroup-dropdown`,
        {},
        { headers: authHeaders }
      );
      setBloodGroupOptions(toOptions(res?.data?.data || []));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRelation = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/relation-dropdown`,
        {},
        { headers: authHeaders }
      );
      const opts = toOptions(res?.data?.data || []);
      setRelationOptions(opts);
      return opts;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const fetchCast = async (religionId) => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/caste-dropdown`,
        { ulbid: Number(ulbId), religionId: Number(religionId) },
        { headers: authHeaders }
      );
      const opts = toOptions(res?.data?.data || []);
      setCastOptions(opts);
      return opts;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const fetchSubCast = async (castId, religionId) => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/subcaste-dropdown`,
        {
          ulbid: Number(ulbId),
          casteId: Number(castId),
          religionId: Number(religionId),
        },
        { headers: authHeaders }
      );
      const opts = toOptions(res?.data?.data || []);
      setSubCastOptions(opts);
      return opts;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  useEffect(() => {
    if (form.religion && form.religion !== "0") fetchCast(form.religion);
    else setCastOptions([]);
  }, [form.religion]);

  useEffect(() => {
    if (form.cast && form.cast !== "0") fetchSubCast(form.cast, form.religion);
    else setSubCastOptions([]);
  }, [form.cast]);

useEffect(() => {
  if (!token || !empId) return;

  setDetailsLoaded(false);

  Swal.fire({
    text: "Please wait",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });

  const load = async () => {
    try {
      await Promise.allSettled([
        fetchNationality(),
        fetchReligion(),
        fetchCategory(),
        fetchBloodGroup(),
        fetchRelation(),
      ]);

      if (mode === 1) await bindEmpDetails();
      else if (mode === 2) await bindDetails();
    } catch (e) {
      setDetailsLoaded(true);
    }
  };
  load();
}, [token, empId, esevaEmployeeID, mode]);

useEffect(() => {
  if (detailsLoaded) Swal.close();
}, [detailsLoaded]);

  const bindEmpDetails = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/employee-def`,
        { ulbid: Number(ulbId), empId: Number(empId) },
        { headers: authHeaders }
      );
      const row = res?.data?.data;
      console.log({res});
      if (!row) return;

      setForm((prev) => ({
        ...prev,
        name: row.VAR_EMPLOYEE_ENGNAME || "",
        dob: row.DATE_EMPLOYEE_DOB ? new Date(row.DATE_EMPLOYEE_DOB) : null,
        nationality: "1",
        category: row.NUM_EMPLOYEE_PAYSHEETTYPE?.toString() || "",
        mobileNo: row.NUM_EMPLOYEE_MOBILENO?.toString() || "",
        emailId: row.VAR_EMPLOYEE_EMAILID || "",
        permanentAddress: row.VAR_EMPLOYEE_PMNTADDRESS || "",
        isPhysicallyHandicapped: row.VAR_EMPLOYEE_HANDICAP || "N",
      }));
      setDetailsLoaded(true);
    } catch (e) {
      showAlert(e?.response?.data?.message || e.message);
    }
  };

  const bindDetails = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/eseva-emp-details`,
        {
          ulbid: Number(ulbId),                    
          empId: Number(empId),                     
          esevaEmpId: Number(esevaEmployeeID),     
          mode,                                     
        },
        { headers: authHeaders }
      );

      const payload = res?.data?.data || {};
      const row = payload.data;
      const family = payload.family || [];

      if (!row) {
        showAlert("No record found.", "/Transactions/FrmEsevaEmpList");
        return;
      }

      setForm({
        name: row.VAR_EMPLOYEE_ENGNAME || "",
        fatherName: row.VAR_ESEVAEMP_FATNAME || "",
        motherName: row.VAR_ESEVAEMP_MOTNAME || "",
        dob: row.DATE_EMPLOYEE_DOB ? new Date(row.DATE_EMPLOYEE_DOB) : null,
        nationality: row.NUM_ESEVAEMP_NATIONALITY?.toString() || "",
        religion: row.NUM_EMPLOYEE_RELIGION?.toString() || "",
        cast: row.VAR_EMPLOYEE_CAST?.toString() || "",
        subCast: row.VAR_EMPLOYEE_SUBCAST?.toString() || "",
        category: row.NUM_EMPLOYEE_CASTCAT?.toString() || "",
        mobileNo: row.NUM_EMPLOYEE_MOBILENO?.toString() || "",
        emailId: row.VAR_EMPLOYEE_EMAILID || "",
        bloodGroup: row.NUM_ESEVAEMP_BLOODGRP?.toString() || "",
        isPhysicallyHandicapped: row.VAR_ESEVAEMP_PHYHANDICAPPED || "N",
        handicappedDetails: row.VAR_ESEVAEMP_PHYHANDICAP_IFY || "",
        isMarried: row.VAR_EMPLOYEE_MARSTATUS || "N",
        spouseName: row.VAR_ESEVAEMP_MARRGSTATUS_IFY || "",
        permanentAddress: row.VAR_EMPLOYEE_PMNTADDRESS || "",
        permanentDistrict: row.VAR_ESEVAEMP_DISTRICT || "",
        permanentState: row.VAR_ESEVAEMP_STATE || "",
        permanentCountry: row.VAR_ESEVAEMP_COUNTRY || "",
        permanentPostOffice: row.VAR_ESEVAEMP_POSTOFFICE || "",
        permanentPincode: row.NUM_ESEVAEMP_PINCODE?.toString() || "",
        permanentMobileNumber: row.NUM_ESEVAEMP_MOBNO_1?.toString() || "",
        permanentAlternateNumber: row.NUM_ESEVAEMP_ALTERMOBNO?.toString() || "",
        communicationAddress: row.VAR_ESEVAEMP_COMMADDRESS || "",
        communicationDistrict: row.VAR_ESEVAEMP_COMMDISTRICT || "",
        communicationState: row.VAR_ESEVAEMP_COMMSTATE || "",
        communicationCountry: row.VAR_ESEVAEMP_COMMCOUNTRY || "",
        communicationPostOffice: row.VAR_ESEVAEMP_COMMPOSTOFF || "",
        communicationPincode: row.NUM_ESEVAEMP_COMMPINCODE?.toString() || "",
        communicationMobileNumber: row.NUM_ESEVAEMP_COMMMOBNO?.toString() || "",
        communicationAlternateNumber:
          row.NUM_ESEVAEMP_COMMALTERMOBNO?.toString() || "",
        emergencyContactName: row.VAR_ESEVAEMP_EMRGNCYCONTACT || "",
        emergencyContactRelation: row.VAR_ESEVAEMP_RELATION?.toString() || "",
        emergencyContactMobileNumber:
          row.NUM_ESEVAEMP_EMRGNCYMOBNO?.toString() || "",
        emergencyAlternateContactName:
          row.VAR_ESEVAEMP_EMRGNCYCONTACT_1 || "",
        emergencyAlternateRelation:
          row.VAR_ESEVAEMP_RELATION_1?.toString() || "",
        emergencyAlternateMobileNumber:
          row.NUM_ESEVAEMP_EMRGNCYMOBNO_1?.toString() || "",
        hometownAtJoining: row.VAR_ESEVAEMP_HOMETOWN || "",
        hometownNearRailwayStation: row.VAR_ESEVAEMP_NEARRAILWAY || "",
        hometownNearAirport: row.VAR_ESEVAEMP_NEARAIRPORT || "",
        subsequenceHometown: row.VAR_ESEVAEMP_SUBHOMETOWN || "",
        subsequenceNearRailwayStation: row.VAR_ESEVAEMP_SUBNEARRAILWAY || "",
        subsequenceNearAirport: row.VAR_ESEVAEMP_SUBNEARAIRPORT || "",
        height: row.VAR_ESEVAEMP_HEIGHT || "",
        perIdentificationMark: row.VAR_ESEVAEMP_IDMARK || "",
        medTestRptCertNo: row.VAR_ESEVAEMP_MDRPTCRNO || "",
        medTestRptDate: row.DAT_ESEVAEMP_MDRPTDATE
          ? new Date(row.DAT_ESEVAEMP_MDRPTDATE)
          : null,
        medTestRptAuthAndDesig: row.VAR_ESEVAEMP_ISAUTHNDESIG || "",
        note: row.VAR_ESEVAEMP_NOTE || "",
      });

      const opts = relationOptions.length ? relationOptions : await fetchRelation();
      const mapped = family.map((r) => {
        const rid = r.VAR_ESEVAEMPDET_RELETIONSHIP?.toString() || "";
        const relName = opts.find((o) => o.value === rid)?.label || "";
        return {
          fammemname: r.VAR_ESEVAEMPDET_NAME || "",
          fammemdob: r.DAT_ESEVAEMPDET_DOB || null,
          fammemrelation: relName,
          fammemrelationid: rid,
          fammemmarstatus:
            r.VAR_ESEVAEMPDET_MARRGSTATUS === "Y" ? "Yes" : "No",
          fammemmarstatusid: r.VAR_ESEVAEMPDET_MARRGSTATUS || "N",
          fammemocc: r.VAR_ESEVAEMPDET_OCCUPATION || "",
          fammemmoninc: r.NUM_ESEVAEMPDET_MONTHINCOME?.toString() || "",
          fammemisdep:
            r.VAR_ESEVAEMPDET_ISDEPENDENT === "Y" ? "Yes" : "No",
          fammemisdepid: r.VAR_ESEVAEMPDET_ISDEPENDENT || "Y",
        };
      });
      setFamilyDetails(mapped);
      setDetailsLoaded(true);
    } catch (e) {
      showAlert(e?.response?.data?.message || e.message);
      setDetailsLoaded(true);
    }
  };

  const handleAddOrUpdateFamily = () => {
    if (!famForm.fammemname) return showAlert("Please Enter Name.");
    if (!famForm.fammemdob) return showAlert("Please select date of birth.");
    if (!famForm.fammemrelation) return showAlert("Please select relation.");

    const relationLabel =
      relationOptions.find((r) => r.value === famForm.fammemrelation)?.label ||
      "";

    const record = {
      ...famForm,
      fammemrelation: relationLabel,
      fammemmarstatus: famForm.fammemmarstatusid === "Y" ? "Yes" : "No",
      fammemisdep: famForm.fammemisdepid === "Y" ? "Yes" : "No",
    };

    if (editIndex !== null) {
      const updated = [...familyDetails];
      updated[editIndex] = record;
      setFamilyDetails(updated);
      setEditIndex(null);
    } else {
      setFamilyDetails((prev) => [...prev, record]);
    }
    clearFamFields();
  };

  const clearFamFields = () =>
    setFamForm({
      fammemname: "",
      fammemdob: null,
      fammemrelation: "",
      fammemrelationid: "",
      fammemmarstatus: "",
      fammemmarstatusid: "N",
      fammemocc: "",
      fammemmoninc: "",
      fammemisdep: "",
      fammemisdepid: "Y",
    });

  const handleDeleteFamily = (index) =>
    setFamilyDetails((prev) => prev.filter((_, i) => i !== index));

  useEffect(() => {
    if (!sameAsPermanent) return;
    setForm((prev) => ({
      ...prev,
      communicationAddress: prev.permanentAddress,
      communicationDistrict: prev.permanentDistrict,
      communicationState: prev.permanentState,
      communicationCountry: prev.permanentCountry,
      communicationPostOffice: prev.permanentPostOffice,
      communicationPincode: prev.permanentPincode,
      communicationMobileNumber: prev.permanentMobileNumber,
      communicationAlternateNumber: prev.permanentAlternateNumber,
    }));
  }, [
    sameAsPermanent,
    form.permanentAddress,
    form.permanentDistrict,
    form.permanentState,
    form.permanentCountry,
    form.permanentPostOffice,
    form.permanentPincode,
    form.permanentMobileNumber,
    form.permanentAlternateNumber,
  ]);

  const handleSameAsPermanent = (checked) => {
    setSameAsPermanent(checked);
    if (!checked) {
      setForm((prev) => ({
        ...prev,
        communicationAddress: "",
        communicationDistrict: "",
        communicationState: "",
        communicationCountry: "",
        communicationPostOffice: "",
        communicationPincode: "",
        communicationMobileNumber: "",
        communicationAlternateNumber: "",
      }));
    }
  };

  const validate = () => {
  if (!form.name) return "Please enter name.";
  if (!form.fatherName) return "Please enter fathers name.";
  if (!form.motherName) return "Please enter mothers name.";
  if (!form.nationality || form.nationality === "0")
    return "Please select nationality.";
  if (!form.category || form.category === "0")
    return "Please select category.";

  if (!form.mobileNo) return "Please enter mobile no.";
  if (!isTenDigits(form.mobileNo))
    return "Mobile Number must be exactly 10 digits (numbers only).";

  if (!form.emailId) return "Please enter email id.";
  if (!isEmail(form.emailId))
    return "Please enter a valid Email-Id (must contain @).";

  if (form.isMarried === "Y" && !form.spouseName)
    return "Please enter spouse name.";
  if (form.isPhysicallyHandicapped === "Y" && !form.handicappedDetails)
    return "Please specify physically handicapped details.";

  if (!form.height) return "Please enter exact height by measurement.";
  if (!onlyDigits(form.height))
    return "Exact Height by Measurement must contain numbers only.";

  if (!form.permanentAddress) return "Please enter permanent address.";
  if (!form.permanentDistrict) return "Please enter district.";
  if (!form.permanentState) return "Please enter state.";
  if (!form.permanentCountry) return "Please enter country.";

  if (!form.permanentPincode) return "Please enter pincode.";
  if (!isSixDigits(form.permanentPincode))
    return "Permanent Pincode must be exactly 6 digits (numbers only).";

  if (form.communicationPincode && !isSixDigits(form.communicationPincode))
    return "Communication Pincode must be exactly 6 digits (numbers only).";

  if (
    form.permanentMobileNumber &&
    !isTenDigits(form.permanentMobileNumber)
  )
    return "Permanent Mobile Number must be exactly 10 digits.";

  if (
    form.communicationMobileNumber &&
    !isTenDigits(form.communicationMobileNumber)
  )
    return "Communication Mobile Number must be exactly 10 digits.";

  return null;
};

  const buildFamilyDetailsStr = () =>
    familyDetails
      .map((r) =>
        [
          r.fammemname || "",
          r.fammemdob ? fmtDate(r.fammemdob) : "",
          r.fammemrelation || "",
          r.fammemmarstatusid === "Y" ? "Y" : "N",
          r.fammemocc || "",
          r.fammemmoninc || "",
          r.fammemisdepid === "Y" ? "Y" : "N",
        ].join("#")
      )
      .join("$");

  const handleStep1Submit = async () => {
    const err = validate();
    if (err) return showAlert(err);

    try {
      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const payload = {
        mode,
        userid: userId,
        ulbid: Number(ulbId),
        empid: Number(empId),
        esevaempid: mode === 1 ? 0 : Number(esevaEmployeeID),

        esevaempdetid: 0,

        Name: form.name,
        FatherName: form.fatherName,
        MotherName: form.motherName,
        DateOfBirth: form.dob ? new Date(form.dob).toISOString() : null,
        Nationality: form.nationality ? Number(form.nationality) : null,
        Religion: form.religion ? Number(form.religion) : null,
        Cast: form.cast ? Number(form.cast) : null,
        SubCast: form.subCast ? Number(form.subCast) : null,
        Category: form.category ? Number(form.category) : null,
        MobileNumber: form.mobileNo ? Number(form.mobileNo) : null,
        EmailId: form.emailId,
        BloodGroup: form.bloodGroup ? Number(form.bloodGroup) : null,
        Height: form.height,
        PerIdentificationMark: form.perIdentificationMark,
        IsPhysicallyHandicapped: form.isPhysicallyHandicapped,
        HandicappedDetails: form.handicappedDetails,
        IsMarried: form.isMarried,
        SpouseName: form.spouseName,

        PermanentAddress: form.permanentAddress,
        PermanentDistrict: form.permanentDistrict,
        PermanentState: form.permanentState,
        PermanentCountry: form.permanentCountry,
        PermanentPostOffice: form.permanentPostOffice,
        PermanentPincode: form.permanentPincode
          ? Number(form.permanentPincode)
          : null,
        PermanentMobileNumber: form.permanentMobileNumber
          ? Number(form.permanentMobileNumber)
          : null,
        PermanentAlternateNumber: form.permanentAlternateNumber
          ? Number(form.permanentAlternateNumber)
          : null,

        CommunicationAddress: form.communicationAddress,
        CommunicationDistrict: form.communicationDistrict,
        CommunicationState: form.communicationState,
        CommunicationCountry: form.communicationCountry,
        CommunicationPostOffice: form.communicationPostOffice,
        CommunicationPincode: form.communicationPincode
          ? Number(form.communicationPincode)
          : null,
        CommunicationMobileNumber: form.communicationMobileNumber
          ? Number(form.communicationMobileNumber)
          : null,
        CommunicationAlternateNumber: form.communicationAlternateNumber
          ? Number(form.communicationAlternateNumber)
          : null,

        EmergencyContactName: form.emergencyContactName,
        EmergencyContactRelation: form.emergencyContactRelation
          ? Number(form.emergencyContactRelation)
          : null,
        EmergencyContactMobileNumber: form.emergencyContactMobileNumber
          ? Number(form.emergencyContactMobileNumber)
          : null,
        EmergencyAlternateContactName: form.emergencyAlternateContactName,
        EmergencyAlternateRelation: form.emergencyAlternateRelation
          ? Number(form.emergencyAlternateRelation)
          : null,
        EmergencyAlternateMobileNumber: form.emergencyAlternateMobileNumber
          ? Number(form.emergencyAlternateMobileNumber)
          : null,

        HometownAtJoining: form.hometownAtJoining,
        HometownNearRailwayStation: form.hometownNearRailwayStation,
        HometownNearAirport: form.hometownNearAirport,
        SubsequenceHometown: form.subsequenceHometown,
        SubsequenceNearRailwayStation: form.subsequenceNearRailwayStation,
        SubsequenceNearAirport: form.subsequenceNearAirport,

        FamilyDetStr: buildFamilyDetailsStr(),
        Note: form.note,

        MedTestRptCertNo: form.medTestRptCertNo,
        MedTestRptDate: form.medTestRptDate
          ? new Date(form.medTestRptDate).toISOString()
          : null,
        MedTestRptAuthAndDesig: form.medTestRptAuthAndDesig,
      };

      const res = await axios.post(
        `${API(BASE_URL)}/insert-eseva-emp`,
        payload,
        { headers: authHeaders }
      );

      Swal.close();

      const data = res?.data?.data || {};
      if (data.success) {
        if (data.esevaEmpId)
          sessionStorage.setItem("empIdEseva", data.esevaEmpId.toString());

        await Swal.fire({ text: data.message });
        navigate("/Transactions/FrmESevaEmpEducationalInformation?@=1", {
          state: { empId, esevaEmpId: data?.esevaEmpId, mode },
        });
      } else {
        await Swal.fire({
          text: res?.data?.message || "Something went wrong",
        });
      }
    } catch (e) {
      Swal.close();
      showAlert(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e.message
      );
    }
  };

  const handleClose = () => {
    sessionStorage.removeItem("EmpidEseva");
    sessionStorage.removeItem("empIdEseva");
    sessionStorage.removeItem("esevaempid");
    navigate("/Transactions/FrmEsevaEmpList");
  };

  const renderField = (label, content) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative">
      <div className="sm:w-48 shrink-0 flex justify-between items-center">
        <Label text={label} />
        <span>:</span>
      </div>
      <div className="w-full sm:w-72 focus-within:z-50">{content}</div>
    </div>
  );

  const familyTableHeaders = [
    "Sr No",
    "Name",
    "DOB",
    "Relationship",
    "Marital Status",
    "Occupation",
    "Monthly Income",
    "Is Dependent",
    "",
  ];

  const familyKeyMapping = {
    "Sr No": "Sr No",
    Name: "fammemname",
    DOB: "fammemdob",
    Relationship: "fammemrelation",
    "Marital Status": "fammemmarstatus",
    Occupation: "fammemocc",
    "Monthly Income": "fammemmoninc",
    "Is Dependent": "fammemisdep",
    "": "ACTIONS",
  };

  const familyTableData = familyDetails.map((row, idx) => ({
    ...row,
    "Sr No": idx + 1,
    fammemdob: row.fammemdob ? fmtDate(row.fammemdob) : "",
    ACTIONS: (
      <div className="flex gap-2">
        <Button
          variant="link"
          size="sm"
          className="px-0 text-red-600"
          onClick={() => handleDeleteFamily(idx)}
        >
          Delete
        </Button>
      </div>
    ),
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">
            Personal Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <section>
            <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 gap-y-4">
              {renderField(
                "Name",
                <Input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                />
              )}

              {renderField(
                "Father Name",
                <Input
                  value={form.fatherName}
                  onChange={(e) => updateForm("fatherName", e.target.value)}
                />
              )}

              {renderField(
                "Mother Name",
                <Input
                  value={form.motherName}
                  onChange={(e) => updateForm("motherName", e.target.value)}
                />
              )}

              {renderField(
                "Date of Birth",
                <DatePicker
                  value={form.dob}
                  onChange={(d) => updateForm("dob", d)}
                />
              )}

              {renderField(
                "Nationality",
                <Select
                  value={form.nationality}
                  onValueChange={(v) => updateForm("nationality", v)}
                >
                  <SelectTrigger className="w-full sm:w-50">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalityOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {renderField(
                "Religion",
                <Select
                  value={form.religion}
                  onValueChange={(v) => updateForm("religion", v)}
                >
                  <SelectTrigger className="w-full sm:w-50">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {religionOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {renderField(
                "Cast",
                <Select
                  value={form.cast}
                  onValueChange={(v) => updateForm("cast", v)}
                  disabled={!form.religion}
                >
                  <SelectTrigger className="w-full sm:w-50">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {castOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {renderField(
                "Sub-Cast",
                <Select
                  value={form.subCast}
                  onValueChange={(v) => updateForm("subCast", v)}
                  disabled={!form.cast}
                >
                  <SelectTrigger className="w-full sm:w-50">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCastOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {renderField(
                "Category",
                <Select
                  value={form.category}
                  onValueChange={(v) => updateForm("category", v)}
                >
                  <SelectTrigger className="w-full sm:w-50">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {renderField(
                "Mobile Number",
                <Input
                  value={form.mobileNo}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateForm("mobileNo", v);
                  }}
                />
              )}

              {renderField(
                "Email-Id",
                <Input
                  type="email"
                  value={form.emailId}
                  onChange={(e) => updateForm("emailId", e.target.value.trim())}
                />
              )}

              {renderField(
                "Blood Group",
                <Select
                  value={form.bloodGroup}
                  onValueChange={(v) => updateForm("bloodGroup", v)}
                >
                  <SelectTrigger className="w-full sm:w-50">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroupOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {renderField(
                "Physically Handicapped",
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="phyHandicap"
                      value="Y"
                      checked={form.isPhysicallyHandicapped === "Y"}
                      onChange={(e) =>
                        updateForm("isPhysicallyHandicapped", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="phyHandicap"
                      value="N"
                      checked={form.isPhysicallyHandicapped === "N"}
                      onChange={(e) =>
                        updateForm("isPhysicallyHandicapped", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <span>No</span>
                  </label>
                </div>
              )}

              {renderField(
                "Handicap Details",
                <Input
                  value={form.handicappedDetails}
                  disabled={form.isPhysicallyHandicapped !== "Y"}
                  placeholder="If Yes"
                  onChange={(e) =>
                    updateForm("handicappedDetails", e.target.value)
                  }
                />
              )}

              {renderField(
                "Exact Height by Measurement",
                <Input
                  value={form.height}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, "");
                    updateForm("height", v);
                  }}
                />
              )}

              {renderField(
                "Personal Marks for Identification",
                <Input
                  value={form.perIdentificationMark}
                  onChange={(e) =>
                    updateForm("perIdentificationMark", e.target.value)
                  }
                />
              )}

              {renderField(
                "Marital Status",
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="maritalStatus"
                      value="Y"
                      checked={form.isMarried === "Y"}
                      onChange={(e) =>
                        updateForm("isMarried", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="maritalStatus"
                      value="N"
                      checked={form.isMarried === "N"}
                      onChange={(e) =>
                        updateForm("isMarried", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <span>No</span>
                  </label>
                </div>
              )}

              {renderField(
                "Spouse Name",
                <Input
                  value={form.spouseName}
                  placeholder="If Yes Spouse Name"
                  disabled={form.isMarried !== "Y"}
                  onChange={(e) => updateForm("spouseName", e.target.value)}
                />
              )}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">Permanent Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Address",
                <Input
                  value={form.permanentAddress}
                  onChange={(e) =>
                    updateForm("permanentAddress", e.target.value)
                  }
                />
              )}

              {renderField(
                "District",
                <Input
                  value={form.permanentDistrict}
                  onChange={(e) =>
                    updateForm("permanentDistrict", e.target.value)
                  }
                />
              )}

              {renderField(
                "State",
                <Input
                  value={form.permanentState}
                  onChange={(e) =>
                    updateForm("permanentState", e.target.value)
                  }
                />
              )}

              {renderField(
                "Country",
                <Input
                  value={form.permanentCountry}
                  onChange={(e) =>
                    updateForm("permanentCountry", e.target.value)
                  }
                />
              )}

              {renderField(
                "Post Office",
                <Input
                  value={form.permanentPostOffice}
                  onChange={(e) =>
                    updateForm("permanentPostOffice", e.target.value)
                  }
                />
              )}

              {renderField(
                "Pincode",
                <Input
                  value={form.permanentPincode}
                  maxLength={6}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    updateForm("permanentPincode", v);
                  }}
                />
              )}

              {renderField(
                "Mobile Number",
                <Input
                  value={form.permanentMobileNumber}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateForm("permanentMobileNumber", v);
                  }}
                />
              )}

              {renderField(
                "Alternate Number",
                <Input
                  value={form.permanentAlternateNumber}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateForm("permanentAlternateNumber", v);
                  }}
                />
              )}

            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Communication Address</h3>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={sameAsPermanent}
                  onCheckedChange={handleSameAsPermanent}
                />
                <span className="text-sm">Same as Permanent Address</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Address",
                <Input
                  value={form.communicationAddress}
                  disabled={sameAsPermanent}
                  onChange={(e) =>
                    updateForm("communicationAddress", e.target.value)
                  }
                />
              )}

              {renderField(
                "District",
                <Input
                  value={form.communicationDistrict}
                  disabled={sameAsPermanent}
                  onChange={(e) =>
                    updateForm("communicationDistrict", e.target.value)
                  }
                />
              )}

              {renderField(
                "State",
                <Input
                  value={form.communicationState}
                  disabled={sameAsPermanent}
                  onChange={(e) =>
                    updateForm("communicationState", e.target.value)
                  }
                />
              )}

              {renderField(
                "Country",
                <Input
                  value={form.communicationCountry}
                  disabled={sameAsPermanent}
                  onChange={(e) =>
                    updateForm("communicationCountry", e.target.value)
                  }
                />
              )}

              {renderField(
                "Post Office",
                <Input
                  value={form.communicationPostOffice}
                  disabled={sameAsPermanent}
                  onChange={(e) =>
                    updateForm("communicationPostOffice", e.target.value)
                  }
                />
              )}

              {renderField(
                "Pincode",
                <Input
                  value={form.communicationPincode}
                  disabled={sameAsPermanent}
                  maxLength={6}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    updateForm("communicationPincode", v);
                  }}
                />
              )}

              {renderField(
                "Mobile Number",
                <Input
                  value={form.communicationMobileNumber}
                  disabled={sameAsPermanent}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateForm("communicationMobileNumber", v);
                  }}
                />
              )}

              {renderField(
                "Alternate Number",
                <Input
                  value={form.communicationAlternateNumber}
                  disabled={sameAsPermanent}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateForm("communicationAlternateNumber", v);
                  }}
                />
              )}

            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">
              Emergency Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Contact Person",
                <Input
                  value={form.emergencyContactName}
                  onChange={(e) =>
                    updateForm("emergencyContactName", e.target.value)
                  }
                />
              )}

              {renderField(
                "Relation",
                <Select
                  value={form.emergencyContactRelation}
                  onValueChange={(v) =>
                    updateForm("emergencyContactRelation", v)
                  }
                >
                  <SelectTrigger className="w-full sm:w-50">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {renderField(
                "Mobile Number",
                <Input
                  value={form.emergencyContactMobileNumber}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateForm("emergencyContactMobileNumber", v);
                  }}
                />
              )}

              {renderField(
                "Alternate Person",
                <Input
                  value={form.emergencyAlternateContactName}
                  onChange={(e) =>
                    updateForm(
                      "emergencyAlternateContactName",
                      e.target.value
                    )
                  }
                />
              )}
              {renderField(
                "Relation",
                <Select
                  value={form.emergencyAlternateRelation}
                  onValueChange={(v) =>
                    updateForm("emergencyAlternateRelation", v)
                  }
                >
                  <SelectTrigger className="w-full sm:w-50">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {renderField(
                "Mobile Number",
                <Input
                  value={form.emergencyAlternateMobileNumber}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateForm("emergencyAlternateMobileNumber", v);
                  }}
                />
              )}

            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">
              Hometown Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Home Town At Time Of Joining",
                <Input
                  value={form.hometownAtJoining}
                  onChange={(e) =>
                    updateForm("hometownAtJoining", e.target.value)
                  }
                />
              )}

              {renderField(
                "Near By Railway Station",
                <Input
                  value={form.hometownNearRailwayStation}
                  onChange={(e) =>
                    updateForm(
                      "hometownNearRailwayStation",
                      e.target.value
                    )
                  }
                />
              )}

              {renderField(
                "Near By Airport",
                <Input
                  value={form.hometownNearAirport}
                  onChange={(e) =>
                    updateForm("hometownNearAirport", e.target.value)
                  }
                />
              )}

              {renderField(
                "Subsequent Change Of Home Town",
                <Input
                  value={form.subsequenceHometown}
                  onChange={(e) =>
                    updateForm("subsequenceHometown", e.target.value)
                  }
                />
              )}

              {renderField(
                "Near By Railway Station",
                <Input
                  value={form.subsequenceNearRailwayStation}
                  onChange={(e) =>
                    updateForm(
                      "subsequenceNearRailwayStation",
                      e.target.value
                    )
                  }
                />
              )}

              {renderField(
                "Near By Airport",
                <Input
                  value={form.subsequenceNearAirport}
                  onChange={(e) =>
                    updateForm("subsequenceNearAirport", e.target.value)
                  }
                />
              )}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">
              Report To Medical Test
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Certificate No",
                <Input
                  value={form.medTestRptCertNo}
                  onChange={(e) =>
                    updateForm("medTestRptCertNo", e.target.value)
                  }
                />
              )}

              {renderField(
                "Certificate Date",
                <DatePicker
                  value={form.medTestRptDate}
                  onChange={(d) => updateForm("medTestRptDate", d)}
                />
              )}

              {renderField(
                "Issuing Authority and His Designation",
                <Input
                  value={form.medTestRptAuthAndDesig}
                  onChange={(e) =>
                    updateForm("medTestRptAuthAndDesig", e.target.value)
                  }
                />
              )}

              {renderField(
                "Note",
                <Input
                  value={form.note}
                  onChange={(e) => updateForm("note", e.target.value)}
                />
              )}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">Family Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
              {renderField(
                "Name",
                <Input
                  value={famForm.fammemname}
                  onChange={(e) =>
                    setFamForm({ ...famForm, fammemname: e.target.value })
                  }
                />
              )}

              {renderField(
                "Date of Birth",
                <DatePicker
                  value={famForm.fammemdob}
                  onChange={(d) =>
                    setFamForm({ ...famForm, fammemdob: d })
                  }
                />
              )}

              {renderField(
                "Relationship",
                <Select
                  value={famForm.fammemrelation}
                  onValueChange={(v) =>
                    setFamForm({ ...famForm, fammemrelation: v })
                  }
                >
                  <SelectTrigger className="w-full sm:w-50">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {renderField(
                "Marital Status",
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="famMarStatus"
                      value="Y"
                      checked={famForm.fammemmarstatusid === "Y"}
                      onChange={(e) =>
                        setFamForm({
                          ...famForm,
                          fammemmarstatusid: e.target.value,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="famMarStatus"
                      value="N"
                      checked={famForm.fammemmarstatusid === "N"}
                      onChange={(e) =>
                        setFamForm({
                          ...famForm,
                          fammemmarstatusid: e.target.value,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span>No</span>
                  </label>
                </div>
              )}

              {renderField(
                "Occupation",
                <Input
                  value={famForm.fammemocc}
                  onChange={(e) =>
                    setFamForm({ ...famForm, fammemocc: e.target.value })
                  }
                />
              )}

              {renderField(
                "Monthly Income",
                <Input
                  value={famForm.fammemmoninc}
                  onChange={(e) =>
                    setFamForm({ ...famForm, fammemmoninc: e.target.value })
                  }
                />
              )}
              
              {renderField(
                "Is Dependent",
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="famIsDep"
                      value="Y"
                      checked={famForm.fammemisdepid === "Y"}
                      onChange={(e) =>
                        setFamForm({
                          ...famForm,
                          fammemisdepid: e.target.value,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="famIsDep"
                      value="N"
                      checked={famForm.fammemisdepid === "N"}
                      onChange={(e) =>
                        setFamForm({
                          ...famForm,
                          fammemisdepid: e.target.value,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span>No</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3 mb-4">
              <Button onClick={handleAddOrUpdateFamily}>
                {editIndex !== null
                  ? "Update Family Member"
                  : "Save Family Member"}
              </Button>
              {editIndex !== null && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditIndex(null);
                    clearFamFields();
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            {familyTableData.length > 0 && (
              <ShadCNTable
                headers={familyTableHeaders}
                data={familyTableData}
                keyMapping={familyKeyMapping}
                pagination={true}
                rowsPerPage={5}
              />
            )}
          </section>

          <div className="flex justify-center gap-4 pt-4 border-t">
            <Button onClick={handleStep1Submit}>Process</Button>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmESevaEmpMaster;