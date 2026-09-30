import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";

const API = (BASE_URL) => `${BASE_URL}/api/FrmESevaEmpLeaveRecord`;

// ------------------------- Column definitions -------------------------
const leaveMainColumns = [
  { key: "Leave", label: "Leave" },
  { key: "year", label: "Year" },
  { key: "PreviousBalances", label: "Previous Balance" },
  { key: "CreatedJan", label: "Created 1st Jan" },
  { key: "TotalLeave", label: "Total Leave" },
  { key: "Debited", label: "Debited" },
  { key: "CurrentBalances", label: "Current Balance" },
  { key: "CreatedJuly", label: "Created 1st July" },
  { key: "PreviousBalance", label: "Previous Balance (N)" },
  { key: "TotalLeaveN", label: "Total Leave (N)" },
  { key: "Debite", label: "Debited (N)" },
  { key: "currentBalance", label: "Current Balance (N)" },
  { key: "LTCIfAny", label: "LTC If Any" },
];

const leaveTakenEarnedColumns = [
  { key: "Leave", label: "Leave" },
  { key: "FromDate", label: "From Date" },
  { key: "ToDate", label: "To Date" },
  { key: "Purpose", label: "Purpose" },
  { key: "Days", label: "Days" },
  { key: "Balance", label: "Balance" },
];

const leaveDetails2Columns = [
  { key: "Leave", label: "Leave" },
  { key: "TotalDays", label: "Total 180 Days" },
  { key: "Debited", label: "Debited (Spell Cal.)" },
  { key: "Balance", label: "Balance" },
];

const finalLeaveColumns = [
  { key: "Leave", label: "Leave" },
  { key: "LeaveType", label: "Leave Type" },
  { key: "fromdatenew", label: "From Date" },
  { key: "ToDatenew", label: "To Date" },
  { key: "Total", label: "Total" },
  { key: "Remark", label: "Remark" },
];

const leaveAvailColumns = [
  { key: "BlockYear", label: "Block Year" },
  { key: "AvailedYear", label: "Availed Year" },
  { key: "Name", label: "Name" },
  { key: "Relationshiptype", label: "Relationship" },
  { key: "Age", label: "Age" },
  { key: "PlaceOfVisit", label: "Place of Visit" },
  { key: "AvailLeaveEnc", label: "Avail Leave Enc" },
  { key: "BalanceOutOfMax", label: "Balance (Out of Max 60)" },
];

// ------------------------- Safe number helper -------------------------
const num = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

// ------------------------- Component -------------------------
const FrmESevaEmpLeaveRecord = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const queryMode = searchParams.get("@");
  const mode = queryMode === "1" ? 2 : 1;
  const empIdEseva = sessionStorage.getItem("EmpidEseva");
  const esevaEmpId = sessionStorage.getItem("esevaempid");

  const authHeaders = { Authorization: `Bearer ${token}` };

  // ------------------------- Dropdowns -------------------------
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [leaveTypeChildOptions, setLeaveTypeChildOptions] = useState([]);
  const [leaveTypeOtherOptions, setLeaveTypeOtherOptions] = useState([]);
  const [relationOptions, setRelationOptions] = useState([]);

  // ------------------------- Form states -------------------------
  const [leaveMainForm, setLeaveMainForm] = useState({
    leaveType: "",
    year: "",
    previousBalance: "",
    createdFirstJan: "",
    totalLeave: "",
    debited: "",
    currentBalance: "",
    createdFirstJuly: "",
    previousBalanceN: "",
    totalLeaveN: "",
    debitedN: "",
    currentBalanceN: "",
    ltcIfAny: "",
  });

  const [editingLeaveMainId, setEditingLeaveMainId] = useState(null);

  const [leaveTEForm, setLeaveTEForm] = useState({
    leaveType: "",
    fromDate: null,
    toDate: null,
    purpose: "",
    noOfDays: "",
    balance: "",
  });
  const [editingLeaveTEId, setEditingLeaveTEId] = useState(null);

  const [leaveL2Form, setLeaveL2Form] = useState({
    leaveType: "",
    totalDays: "",
    debited: "",
    balance: "",
  });
  const [editingLeaveL2Id, setEditingLeaveL2Id] = useState(null);

  const [finalLeaveForm, setFinalLeaveForm] = useState({
    leaveType: "",
    leaveTypeText: "",
    fromDate: null,
    toDate: null,
    total: "",
    remark: "",
  });
  const [editingFinalLeaveId, setEditingFinalLeaveId] = useState(null);

  const [leaveAvailForm, setLeaveAvailForm] = useState({
    blockYear: "",
    availedYear: "",
    name: "",
    relationship: "",
    age: "",
    placeOfVisit: "",
    availLeaveEnc: "N",
    balanceOutOfMax: "",
  });
  const [editingLeaveAvailId, setEditingLeaveAvailId] = useState(null);

  // ------------------------- Grid Data -------------------------
  const [leaveMainData, setLeaveMainData] = useState([]);
  const [leaveTEData, setLeaveTEData] = useState([]);
  const [leaveL2Data, setLeaveL2Data] = useState([]);
  const [finalLeaveData, setFinalLeaveData] = useState([]);
  const [leaveAvailData, setLeaveAvailData] = useState([]);

  // ------------------------- Helpers -------------------------
  const showAlert = useCallback(
    async (text, redirectTo = null) => {
      await Swal.fire({ text });
      if (redirectTo) navigate(redirectTo);
    },
    [navigate]
  );

  const toOptions = (rows = []) =>
    rows.map((r) => ({
      value: r.VALUE_ID?.toString(),
      label: r.DISPLAY_TEXT,
    }));

  const nextSrNo = (arr) =>
    arr.length === 0
      ? 1
      : Math.max(...arr.map((r) => Number(r.Id) || 0)) + 1;

  const calcDays = (from, to) => {
    if (!from || !to) return "";
    const d1 = new Date(from);
    const d2 = new Date(to);
    if (d2 < d1) return "";
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    return diff.toString();
  };

  // ------------------------- Leave Main computed-update handler -------------------------
  const updateLeaveMainField = (field, value) => {
    setLeaveMainForm((prev) => {
      const next = { ...prev, [field]: value };

      // 1st Total Leave = Previous Balance + Created On 1st Jan
      next.totalLeave = (num(next.previousBalance) + num(next.createdFirstJan)).toString();

      // 1st Current Balance = Total Leave - Debited
      next.currentBalance = (num(next.totalLeave) - num(next.debited)).toString();

      // Previous Balance (N) = 1st Total Leave - 1st Debited
      next.previousBalanceN = next.currentBalance;

      // 2nd Total Leave = 1st Current Balance + Created On 1st July
      next.totalLeaveN = (num(next.currentBalance) + num(next.createdFirstJuly)).toString();

      // 2nd Current Balance = 2nd Total Leave - 2nd Debited
      // (if you literally want "+" change the "-" below)
      next.currentBalanceN = (num(next.totalLeaveN) - num(next.debitedN)).toString();

      return next;
    });
  };

  // ------------------------- Dropdown fetchers -------------------------
  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/leave-type-dropdown`,
        { ulbid: Number(ulbId) },
        { headers: authHeaders }
      );
      const data = res?.data?.data || {};
      setLeaveTypeOptions(toOptions(data.main || []));
      setLeaveTypeChildOptions(toOptions(data.child || []));
      setLeaveTypeOtherOptions(toOptions(data.other || []));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRelations = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/relation-dropdown`,
        {},
        { headers: authHeaders }
      );
      setRelationOptions(toOptions(res?.data?.data || []));
    } catch (e) {
      console.error(e);
    }
  };

  // ------------------------- Load on mount -------------------------
  useEffect(() => {
    if (!token) return;
    if (queryMode === "1" && !esevaEmpId) {
      navigate("/Transactions/FrmEsevaEmpList");
      return;
    }

    const load = async () => {
      Swal.fire({
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        await Promise.allSettled([fetchLeaveTypes(), fetchRelations()]);
      } finally {
        Swal.close();
      }

      if (mode === 2) {
        await bindAll();
      }
    };
    load();
  }, [token, mode]);

  // ------------------------- Bind Existing Data -------------------------
  const bindAll = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/get-leave-records`,
        {
          ulbid: Number(ulbId),
          empId: Number(empIdEseva),
          esevaEmpId: Number(esevaEmpId),
        },
        { headers: authHeaders }
      );
      const data = res?.data?.data || {};

      setLeaveMainData(
        (data.leaveMain || []).map((r, i) => ({
          Id: (i + 1).toString(),
          Leave: r.VAR_LEAVE_NAME || "",
          Leaveid: r.NUM_LEAVEDETAILS_LEAVETYPEID?.toString() || "",
          year: r.DAT_LEAVEDETAILS_YEAR || "",
          PreviousBalances: r.NUM_LEAVEDETAILS_PREVBAL_1?.toString() || "",
          CreatedJan: r.VAR_LEAVEDETAILS_CR1STJAN || "",
          TotalLeave:
            r.NUM_LEAVEDETAILS_TOTALLEAVE_1?.toString() ||
            r.VAR_LEAVEDETAILS_TOTALLEAVE_1 ||
            "",
          Debited: r.NUM_LEAVEDETAILS_DEBITED_1?.toString() || "",
          CurrentBalances: r.NUM_LEAVEDETAILS_CURRBAL_1?.toString() || "",
          CreatedJuly: r.VAR_LEAVEDETAILS_CR1STJULY || "",
          PreviousBalance: r.NUM_LEAVEDETAILS_PREVBAL_2?.toString() || "",
          TotalLeaveN:
            r.NUM_LEAVEDETAILS_TOTALLEAVE_2?.toString() ||
            r.VAR_LEAVEDETAILS_TOTALLEAVE_2 ||
            "",
          Debite: r.NUM_LEAVEDETAILS_DEBITED_2?.toString() || "",
          currentBalance: r.NUM_LEAVEDETAILS_CURRBAL_2?.toString() || "",
          LTCIfAny: r.VAR_LEAVEDETAILS_LTC || "",
        }))
      );

      setLeaveTEData(
        (data.leaveTakenEarned || []).map((r, i) => ({
          Id: (i + 1).toString(),
          Leave: r.VAR_LEAVE_NAME || "",
          Leaveid: r.NUM_LEAVEDETSET_LEAVETYPEID?.toString() || "",
          FromDate: r.FROMDATE || "",
          ToDate: r.TODATE || "",
          Purpose: r.VAR_LEAVEDETSET_PURPOSE || "",
          Days: r.NUM_LEAVEDETSET_NOOFDAYS?.toString() || "",
          Balance: r.NUM_LEAVEDETSET_BALANCE?.toString() || "",
        }))
      );

      setLeaveL2Data(
        (data.leaveDetails2 || []).map((r, i) => ({
          Id: (i + 1).toString(),
          Leave: r.VAR_LEAVE_NAME || "",
          Leaveid: r.NUM_LEAVEDETSMAT_LEAVETYPEID?.toString() || "5",
          TotalDays: r.NUM_LEAVEDETSMAT_TOTALDAYS?.toString() || "",
          Debited: r.NUM_LEAVEDETSMAT_DEBITED?.toString() || "",
          Balance: r.NUM_LEAVEDETSMAT_BALANCE?.toString() || "",
        }))
      );

      setFinalLeaveData(
        (data.finalLeave || []).map((r, i) => ({
          Id: (i + 1).toString(),
          Leave: r.VAR_LEAVE_NAME || "",
          Leaveid: r.NUM_LEAVEDETSOTHER_LEAVETYPEID?.toString() || "8",
          LeaveType: r.VAR_LEAVEDETSOTHER_DEFLEAVE || "",
          fromdatenew: r.FROMDATE || "",
          ToDatenew: r.TODATE || "",
          Total: r.NUM_LEAVEDETSOTHER_TOTAL?.toString() || "",
          Remark: r.VAR_LEAVEDETSOTHER_REMARK || "",
        }))
      );

      setLeaveAvailData(
        (data.leaveAvail || []).map((r, i) => {
          const enc = r.VAR_LEAVEDETSLTA_LEAVEENC?.toString();
          return {
            Id: (i + 1).toString(),
            BlockYear: r.VAR_LEAVEDETSLTA_BLOCKYEAR || "",
            AvailedYear: r.VAR_LEAVEDETSLTA_AVAILYEAR || "",
            Name: r.VAR_LEAVEDETSLTA_NAME || "",
            Relationshipid: r.NUM_LEAVEDETSLTA_RELID?.toString() || "",
            Relationshiptype: r.VAR_LEAVEDETSLTA_RELNAME || "",
            Age: r.NUM_LEAVEDETSLTA_AGE?.toString() || "",
            PlaceOfVisit: r.VAR_LEAVEDETSLTA_PLACE || "",
            AvailLeaveEncID: r.VAR_LEAVEDETSLTA_LEAVEENC || "",
            AvailLeaveEnc: enc == null ? "" : enc === "Y" ? "Yes" : "No",
            BalanceOutOfMax: r.NUM_LEAVEDETSLTA_OUTOFMAX?.toString() || "",
          };
        })
      );
    } catch (e) {
      showAlert(e?.response?.data?.message || e.message);
    }
  };

  // =========================================================
  //   LEAVE MAIN : Add / Update
  // =========================================================
  const addLeaveMain = () => {
    const f = leaveMainForm;
    if (!f.leaveType) return showAlert("Please Select Leave");
    if (!f.year) return showAlert("Year Name cannot be blank");
    if (!f.previousBalance) return showAlert("Previous Balance cannot be blank");
    if (!f.createdFirstJan) return showAlert("Created On First Jan cannot be blank");
    if (!f.debited) return showAlert("Debited cannot be blank");
    if (!f.createdFirstJuly) return showAlert("Created On First July cannot be blank");
    if (!f.debitedN) return showAlert("Debited (N) cannot be blank");
    if (!f.ltcIfAny) return showAlert("LTC If Any cannot be blank");

    const label =
      leaveTypeOptions.find((o) => o.value === f.leaveType)?.label || "";

    const record = {
      Id: editingLeaveMainId ?? nextSrNo(leaveMainData).toString(),
      Leave: label,
      Leaveid: f.leaveType,
      year: f.year,
      PreviousBalances: f.previousBalance,
      CreatedJan: f.createdFirstJan,
      TotalLeave: f.totalLeave,
      Debited: f.debited,
      CurrentBalances: f.currentBalance,
      CreatedJuly: f.createdFirstJuly,
      PreviousBalance: f.previousBalanceN,
      TotalLeaveN: f.totalLeaveN,
      Debite: f.debitedN,
      currentBalance: f.currentBalanceN,
      LTCIfAny: f.ltcIfAny,
    };

    if (editingLeaveMainId) {
      setLeaveMainData((p) =>
        p.map((r) => (r.Id === editingLeaveMainId ? record : r))
      );
    } else {
      setLeaveMainData((p) => [...p, record]);
    }

    setEditingLeaveMainId(null);
    setLeaveMainForm({
      leaveType: "",
      year: "",
      previousBalance: "",
      createdFirstJan: "",
      totalLeave: "",
      debited: "",
      currentBalance: "",
      createdFirstJuly: "",
      previousBalanceN: "",
      totalLeaveN: "",
      debitedN: "",
      currentBalanceN: "",
      ltcIfAny: "",
    });
  };

  const editLeaveMain = (row) => {
    setEditingLeaveMainId(row.Id);
    setLeaveMainForm({
      leaveType: row.Leaveid || "",
      year: row.year || "",
      previousBalance: row.PreviousBalances || "",
      createdFirstJan: row.CreatedJan || "",
      totalLeave: row.TotalLeave || "",
      debited: row.Debited || "",
      currentBalance: row.CurrentBalances || "",
      createdFirstJuly: row.CreatedJuly || "",
      previousBalanceN: row.PreviousBalance || "",
      totalLeaveN: row.TotalLeaveN || "",
      debitedN: row.Debite || "",
      currentBalanceN: row.currentBalance || "",
      ltcIfAny: row.LTCIfAny || "",
    });
    setLeaveMainData((p) => p.filter((x) => x.Id !== row.Id));
  };

  // =========================================================
  //   LEAVE TAKEN & EARNED : Add / Update
  // =========================================================
  const addLeaveTE = () => {
    const f = leaveTEForm;
    if (!f.leaveType) return showAlert("Please Select Leave");
    if (!f.fromDate) return showAlert("Please select from date.");
    if (!f.toDate) return showAlert("Please select to date.");
    if (new Date(f.fromDate) > new Date(f.toDate))
      return showAlert("To date should be greater than from date.");
    if (!f.purpose) return showAlert("Purpose cannot be blank");
    if (!f.noOfDays) return showAlert("Number Of Days cannot be blank");
    if (!f.balance) return showAlert("Balance Record cannot be blank");

    const label =
      leaveTypeOptions.find((o) => o.value === f.leaveType)?.label || "";

    const record = {
      Id: editingLeaveTEId ?? nextSrNo(leaveTEData).toString(),
      Leave: label,
      Leaveid: f.leaveType,
      FromDate: new Date(f.fromDate).toLocaleDateString("en-GB"),
      ToDate: new Date(f.toDate).toLocaleDateString("en-GB"),
      Purpose: f.purpose,
      Days: f.noOfDays,
      Balance: f.balance,
    };

    if (editingLeaveTEId) {
      setLeaveTEData((p) =>
        p.map((r) => (r.Id === editingLeaveTEId ? record : r))
      );
    } else {
      setLeaveTEData((p) => [...p, record]);
    }

    setEditingLeaveTEId(null);
    setLeaveTEForm({
      leaveType: "",
      fromDate: null,
      toDate: null,
      purpose: "",
      noOfDays: "",
      balance: "",
    });
  };

  const editLeaveTE = (row) => {
    setEditingLeaveTEId(row.Id);
    // parse "dd/mm/yyyy" back to Date
    const parse = (s) => {
      if (!s) return null;
      const [d, m, y] = s.split("/");
      if (!d || !m || !y) return null;
      return new Date(`${y}-${m}-${d}`);
    };
    setLeaveTEForm({
      leaveType: row.Leaveid || "",
      fromDate: parse(row.FromDate),
      toDate: parse(row.ToDate),
      purpose: row.Purpose || "",
      noOfDays: row.Days || "",
      balance: row.Balance || "",
    });
    setLeaveTEData((p) => p.filter((x) => x.Id !== row.Id));
  };

  // =========================================================
  //   LEAVE DETAILS 2 : Add / Update
  // =========================================================
  const addLeaveL2 = () => {
    const f = leaveL2Form;
    if (!f.leaveType) return showAlert("Please Select Leave");
    if (!f.totalDays) return showAlert("Total 180 Days cannot be blank");
    if (!f.debited)
      return showAlert("Debited (Spell Calendar Wise) cannot be blank");
    if (!f.balance) return showAlert("Balance Record cannot be blank");

    const label =
      leaveTypeChildOptions.find((o) => o.value === f.leaveType)?.label || "";

    const record = {
      Id: editingLeaveL2Id ?? nextSrNo(leaveL2Data).toString(),
      Leave: label,
      Leaveid: f.leaveType,
      TotalDays: f.totalDays,
      Debited: f.debited,
      Balance: f.balance,
    };

    if (editingLeaveL2Id) {
      setLeaveL2Data((p) =>
        p.map((r) => (r.Id === editingLeaveL2Id ? record : r))
      );
    } else {
      setLeaveL2Data((p) => [...p, record]);
    }

    setEditingLeaveL2Id(null);
    setLeaveL2Form({ leaveType: "", totalDays: "", debited: "", balance: "" });
  };

  const editLeaveL2 = (row) => {
    setEditingLeaveL2Id(row.Id);
    setLeaveL2Form({
      leaveType: row.Leaveid || "",
      totalDays: row.TotalDays || "",
      debited: row.Debited || "",
      balance: row.Balance || "",
    });
    setLeaveL2Data((p) => p.filter((x) => x.Id !== row.Id));
  };

  // =========================================================
  //   FINAL LEAVE : Add / Update
  // =========================================================
  const addFinalLeave = () => {
    const f = finalLeaveForm;
    if (!f.leaveType) return showAlert("Please Select Leave");
    if (!f.leaveTypeText) return showAlert("Leave Type cannot be blank");
    if (!f.fromDate) return showAlert("Please select from date.");
    if (!f.toDate) return showAlert("Please select to date.");
    if (new Date(f.fromDate) > new Date(f.toDate))
      return showAlert("To date should be greater than from date.");
    if (!f.total) return showAlert("Total cannot be blank");
    if (!f.remark) return showAlert("Remark cannot be blank");

    const label =
      leaveTypeOtherOptions.find((o) => o.value === f.leaveType)?.label || "";

    const record = {
      Id: editingFinalLeaveId ?? nextSrNo(finalLeaveData).toString(),
      Leave: label,
      Leaveid: f.leaveType,
      LeaveType: f.leaveTypeText,
      fromdatenew: new Date(f.fromDate).toLocaleDateString("en-GB"),
      ToDatenew: new Date(f.toDate).toLocaleDateString("en-GB"),
      Total: f.total,
      Remark: f.remark,
    };

    if (editingFinalLeaveId) {
      setFinalLeaveData((p) =>
        p.map((r) => (r.Id === editingFinalLeaveId ? record : r))
      );
    } else {
      setFinalLeaveData((p) => [...p, record]);
    }

    setEditingFinalLeaveId(null);
    setFinalLeaveForm({
      leaveType: "",
      leaveTypeText: "",
      fromDate: null,
      toDate: null,
      total: "",
      remark: "",
    });
  };

  const editFinalLeave = (row) => {
    setEditingFinalLeaveId(row.Id);
    const parse = (s) => {
      if (!s) return null;
      const [d, m, y] = s.split("/");
      if (!d || !m || !y) return null;
      return new Date(`${y}-${m}-${d}`);
    };
    setFinalLeaveForm({
      leaveType: row.Leaveid || "",
      leaveTypeText: row.LeaveType || "",
      fromDate: parse(row.fromdatenew),
      toDate: parse(row.ToDatenew),
      total: row.Total || "",
      remark: row.Remark || "",
    });
    setFinalLeaveData((p) => p.filter((x) => x.Id !== row.Id));
  };

  // =========================================================
  //   LEAVE AVAIL (LTA) : Add / Update
  // =========================================================
  const addLeaveAvail = () => {
    const f = leaveAvailForm;
    if (!f.blockYear) return showAlert("Block Year cannot be blank");
    if (!f.availedYear) return showAlert("Availed Year Cannot Be Blank");
    if (!f.name) return showAlert("Please Enter Name");
    if (!f.relationship) return showAlert("Please select Relationship");
    if (!f.age) return showAlert("Please Enter Age");
    if (!f.placeOfVisit) return showAlert("Please Enter Place Of Visit");
    if (!f.balanceOutOfMax)
      return showAlert("Please Enter Balance Out Of a Maximum Of 60 Days");

    const relLabel =
      relationOptions.find((o) => o.value === f.relationship)?.label || "";
    const encLabel = f.availLeaveEnc === "Y" ? "Yes" : "No";

    const record = {
      Id: editingLeaveAvailId ?? nextSrNo(leaveAvailData).toString(),
      BlockYear: f.blockYear,
      AvailedYear: f.availedYear,
      Name: f.name,
      Relationshipid: f.relationship,
      Relationshiptype: relLabel,
      Age: f.age,
      PlaceOfVisit: f.placeOfVisit,
      AvailLeaveEncID: f.availLeaveEnc,
      AvailLeaveEnc: encLabel,
      BalanceOutOfMax: f.balanceOutOfMax,
    };

    if (editingLeaveAvailId) {
      setLeaveAvailData((p) =>
        p.map((r) => (r.Id === editingLeaveAvailId ? record : r))
      );
    } else {
      setLeaveAvailData((p) => [...p, record]);
    }

    setEditingLeaveAvailId(null);
    setLeaveAvailForm({
      blockYear: "",
      availedYear: "",
      name: "",
      relationship: "",
      age: "",
      placeOfVisit: "",
      availLeaveEnc: "N",
      balanceOutOfMax: "",
    });
  };

  const editLeaveAvail = (row) => {
    setEditingLeaveAvailId(row.Id);
    setLeaveAvailForm({
      blockYear: row.BlockYear || "",
      availedYear: row.AvailedYear || "",
      name: row.Name || "",
      relationship: row.Relationshipid || "",
      age: row.Age || "",
      placeOfVisit: row.PlaceOfVisit || "",
      availLeaveEnc: row.AvailLeaveEncID || "N",
      balanceOutOfMax: row.BalanceOutOfMax || "",
    });
    setLeaveAvailData((p) => p.filter((x) => x.Id !== row.Id));
  };

  // ------------------------- Submit (Process) -------------------------
  const handleProcess = async () => {
    if (leaveMainData.length === 0)
      return showAlert("Please Add At least One Detail");
    if (leaveTEData.length === 0)
      return showAlert("Please Add At least One Detail");

    const buildStr = (arr, fields) =>
      arr.map((r) => fields.map((f) => r[f] ?? "").join("$")).join("#");

    const leaveStr = buildStr(leaveMainData, [
      "Leaveid",
      "year",
      "PreviousBalances",
      "CreatedJan",
      "TotalLeave",
      "Debited",
      "CurrentBalances",
      "CreatedJuly",
      "PreviousBalance",
      "TotalLeaveN",
      "Debite",
      "currentBalance",
      "LTCIfAny",
    ]);
    const leaveStrET = buildStr(leaveTEData, [
      "Leaveid",
      "FromDate",
      "ToDate",
      "Purpose",
      "Days",
      "Balance",
    ]);
    const leaveStr2 = buildStr(leaveL2Data, [
      "Leaveid",
      "TotalDays",
      "Debited",
      "Balance",
    ]);
    const leaveStrFNL = buildStr(finalLeaveData, [
      "Leaveid",
      "LeaveType",
      "fromdatenew",
      "ToDatenew",
      "Total",
      "Remark",
    ]);
    const leaveStrLA = buildStr(leaveAvailData, [
      "BlockYear",
      "AvailedYear",
      "Name",
      "Relationshipid",
      "Age",
      "PlaceOfVisit",
      "AvailLeaveEncID",
      "BalanceOutOfMax",
    ]);

    try {
      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${API(BASE_URL)}/insert-leave-record`,
        {
          mode,
          userid: userId,
          ulbid: Number(ulbId),
          empid: Number(empIdEseva),
          esevaempid: mode === 1 ? 0 : Number(esevaEmpId),
          LeaveStr: leaveStr,
          LeaveStrET: leaveStrET,
          LeaveStr2: leaveStr2,
          LeaveStrFNL: leaveStrFNL,
          LeaveStrLA: leaveStrLA,
        },
        { headers: authHeaders }
      );

      Swal.close();
      const data = res?.data?.data || {};

      if (data.success) {
        await Swal.fire({ text: data.message });
        if (String(ulbId) === "870") {
          navigate("/Transactions/FrmESevaIncrAndPromotionsmkc");
        } else {
          navigate("/Transactions/FrmESevaIncrAndPromotion");
        }
      } else {
        showAlert(data.message || "Something went wrong");
      }
    } catch (e) {
      Swal.close();
      showAlert(
        e?.response?.data?.message || e?.response?.data?.error || e.message
      );
    }
  };

  const handleClose = () => {
    navigate("/Transactions/FrmEsevaEmpList");
  };

  // ------------------------- Reusable render helpers -------------------------
  const renderField = (label, content) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative">
      <div className="sm:w-56 shrink-0 flex justify-between items-center">
        <Label text={label} />
        <span>:</span>
      </div>
      <div className="w-full sm:w-72 focus-within:z-50">{content}</div>
    </div>
  );

  // Table with Delete | Update | Sr No as first 3 columns
  const renderTable = (columns, data, setter, onEdit) =>
    data.length > 0 && (
      <ShadCNTable
        headers={[
          "Delete",
          "Update",
          "Sr No",
          ...columns.map((c) => c.label),
        ]}
        data={data.map((r, i) => ({
          ...r,
          "Sr No": i + 1,
          Delete: (
            <Button
              variant="link"
              size="sm"
              className="px-0 text-red-600"
              onClick={() => setter((p) => p.filter((x) => x.Id !== r.Id))}
            >
              Delete
            </Button>
          ),
          Update: (
            <Button
              variant="link"
              size="sm"
              className="px-0 text-blue-600"
              onClick={() => onEdit(r)}
            >
              Update
            </Button>
          ),
        }))}
        keyMapping={{
          Delete: "Delete",
          Update: "Update",
          "Sr No": "Sr No",
          ...Object.fromEntries(columns.map((c) => [c.label, c.key])),
        }}
        pagination
        rowsPerPage={5}
      />
    );

  // ------------------------- Render -------------------------
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">Leave Records</CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {/* ============ SECTION 1 : LEAVE MAIN ============ */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Leave Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Leave",
                <Select
                  value={leaveMainForm.leaveType}
                  onValueChange={(v) => updateLeaveMainField("leaveType", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {renderField(
                "Year",
                <Input
                  value={leaveMainForm.year}
                  onChange={(e) => updateLeaveMainField("year", e.target.value)}
                />
              )}
              {renderField(
                "Previous Balances",
                <Input
                  value={leaveMainForm.previousBalance}
                  onChange={(e) =>
                    updateLeaveMainField("previousBalance", e.target.value)
                  }
                />
              )}
              {renderField(
                "Created ON 1ST Jan",
                <Input
                  value={leaveMainForm.createdFirstJan}
                  onChange={(e) =>
                    updateLeaveMainField("createdFirstJan", e.target.value)
                  }
                />
              )}
              {renderField(
                "Total Leave",
                <Input
                  value={leaveMainForm.totalLeave}
                  readOnly
                  className="bg-muted"
                />
              )}
              {renderField(
                "Debited",
                <Input
                  value={leaveMainForm.debited}
                  onChange={(e) =>
                    updateLeaveMainField("debited", e.target.value)
                  }
                />
              )}
              {renderField(
                "Current Balances",
                <Input
                  value={leaveMainForm.currentBalance}
                  readOnly
                  className="bg-muted"
                />
              )}
              {renderField(
                "Created ON 1ST July",
                <Input
                  value={leaveMainForm.createdFirstJuly}
                  onChange={(e) =>
                    updateLeaveMainField("createdFirstJuly", e.target.value)
                  }
                />
              )}
              {renderField(
                "Previous Balances",
                <Input
                  value={leaveMainForm.previousBalanceN}
                  readOnly
                  className="bg-muted"
                />
              )}
              {renderField(
                "Total Leave",
                <Input
                  value={leaveMainForm.totalLeaveN}
                  readOnly
                  className="bg-muted"
                />
              )}
              {renderField(
                "Debited",
                <Input
                  value={leaveMainForm.debitedN}
                  onChange={(e) =>
                    updateLeaveMainField("debitedN", e.target.value)
                  }
                />
              )}
              {renderField(
                "Current Balance",
                <Input
                  value={leaveMainForm.currentBalanceN}
                  readOnly
                  className="bg-muted"
                />
              )}
              {renderField(
                "LTC If Any",
                <Input
                  value={leaveMainForm.ltcIfAny}
                  onChange={(e) =>
                    updateLeaveMainField("ltcIfAny", e.target.value)
                  }
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={addLeaveMain}>
                {editingLeaveMainId ? "Update Leave Record" : "Add Leave Record"}
              </Button>
              {editingLeaveMainId && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingLeaveMainId(null);
                    setLeaveMainForm({
                      leaveType: "",
                      year: "",
                      previousBalance: "",
                      createdFirstJan: "",
                      totalLeave: "",
                      debited: "",
                      currentBalance: "",
                      createdFirstJuly: "",
                      previousBalanceN: "",
                      totalLeaveN: "",
                      debitedN: "",
                      currentBalanceN: "",
                      ltcIfAny: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            {renderTable(
              leaveMainColumns,
              leaveMainData,
              setLeaveMainData,
              editLeaveMain
            )}
          </div>

          <hr className="border-t" />

          {/* ============ SECTION 2 : LEAVE TAKEN & EARNED ============ */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Leave Taken & Earned
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Leave",
                <Select
                  value={leaveTEForm.leaveType}
                  onValueChange={(v) =>
                    setLeaveTEForm({ ...leaveTEForm, leaveType: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {renderField(
                "From Date",
                <DatePicker
                  value={leaveTEForm.fromDate}
                  onChange={(d) => {
                    const days = calcDays(d, leaveTEForm.toDate);
                    setLeaveTEForm({
                      ...leaveTEForm,
                      fromDate: d,
                      noOfDays: days || leaveTEForm.noOfDays,
                    });
                  }}
                />
              )}
              {renderField(
                "To Date",
                <DatePicker
                  value={leaveTEForm.toDate}
                  onChange={(d) => {
                    const days = calcDays(leaveTEForm.fromDate, d);
                    setLeaveTEForm({
                      ...leaveTEForm,
                      toDate: d,
                      noOfDays: days || leaveTEForm.noOfDays,
                    });
                  }}
                />
              )}
              {renderField(
                "Purpose",
                <Input
                  value={leaveTEForm.purpose}
                  onChange={(e) =>
                    setLeaveTEForm({
                      ...leaveTEForm,
                      purpose: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Days",
                <Input
                  value={leaveTEForm.noOfDays}
                  onChange={(e) =>
                    setLeaveTEForm({
                      ...leaveTEForm,
                      noOfDays: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Balance",
                <Input
                  value={leaveTEForm.balance}
                  onChange={(e) =>
                    setLeaveTEForm({
                      ...leaveTEForm,
                      balance: e.target.value,
                    })
                  }
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={addLeaveTE}>
                {editingLeaveTEId ? "Update" : "Add"}
              </Button>
              {editingLeaveTEId && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingLeaveTEId(null);
                    setLeaveTEForm({
                      leaveType: "",
                      fromDate: null,
                      toDate: null,
                      purpose: "",
                      noOfDays: "",
                      balance: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            {renderTable(
              leaveTakenEarnedColumns,
              leaveTEData,
              setLeaveTEData,
              editLeaveTE
            )}
          </div>

          <hr className="border-t" />

          {/* ============ SECTION 3 : LEAVE DETAILS 2 ============ */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Leave Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Leave",
                <Select
                  value={leaveL2Form.leaveType}
                  onValueChange={(v) =>
                    setLeaveL2Form({ ...leaveL2Form, leaveType: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypeChildOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {renderField(
                "Total 180 Days",
                <Input
                  value={leaveL2Form.totalDays}
                  onChange={(e) =>
                    setLeaveL2Form({
                      ...leaveL2Form,
                      totalDays: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Debited (Spell Calendar Wise)",
                <Input
                  value={leaveL2Form.debited}
                  onChange={(e) =>
                    setLeaveL2Form({
                      ...leaveL2Form,
                      debited: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Balance",
                <Input
                  value={leaveL2Form.balance}
                  onChange={(e) =>
                    setLeaveL2Form({
                      ...leaveL2Form,
                      balance: e.target.value,
                    })
                  }
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={addLeaveL2}>
                {editingLeaveL2Id ? "Update Leave Record" : "Add Leave Record"}
              </Button>
              {editingLeaveL2Id && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingLeaveL2Id(null);
                    setLeaveL2Form({
                      leaveType: "",
                      totalDays: "",
                      debited: "",
                      balance: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            {renderTable(
              leaveDetails2Columns,
              leaveL2Data,
              setLeaveL2Data,
              editLeaveL2
            )}
          </div>

          <hr className="border-t" />

          {/* ============ SECTION 4 : FINAL LEAVE DETAILS ============ */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Leave Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Leave",
                <Select
                  value={finalLeaveForm.leaveType}
                  onValueChange={(v) =>
                    setFinalLeaveForm({ ...finalLeaveForm, leaveType: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypeOtherOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {renderField(
                "Leave Type",
                <Input
                  value={finalLeaveForm.leaveTypeText}
                  onChange={(e) =>
                    setFinalLeaveForm({
                      ...finalLeaveForm,
                      leaveTypeText: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "From Date",
                <DatePicker
                  value={finalLeaveForm.fromDate}
                  onChange={(d) =>
                    setFinalLeaveForm({ ...finalLeaveForm, fromDate: d })
                  }
                />
              )}
              {renderField(
                "To Date",
                <DatePicker
                  value={finalLeaveForm.toDate}
                  onChange={(d) =>
                    setFinalLeaveForm({ ...finalLeaveForm, toDate: d })
                  }
                />
              )}
              {renderField(
                "Total",
                <Input
                  value={finalLeaveForm.total}
                  onChange={(e) =>
                    setFinalLeaveForm({
                      ...finalLeaveForm,
                      total: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Remark",
                <Input
                  value={finalLeaveForm.remark}
                  onChange={(e) =>
                    setFinalLeaveForm({
                      ...finalLeaveForm,
                      remark: e.target.value,
                    })
                  }
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={addFinalLeave}>
                {editingFinalLeaveId ? "Update" : "Add"}
              </Button>
              {editingFinalLeaveId && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingFinalLeaveId(null);
                    setFinalLeaveForm({
                      leaveType: "",
                      leaveTypeText: "",
                      fromDate: null,
                      toDate: null,
                      total: "",
                      remark: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            {renderTable(
              finalLeaveColumns,
              finalLeaveData,
              setFinalLeaveData,
              editFinalLeave
            )}
          </div>

          <hr className="border-t" />

          {/* ============ SECTION 5 : LEAVE AVAIL (LTA) ============ */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Details Of Leave Travel Consession Availed
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField(
                "Block Year",
                <Input
                  value={leaveAvailForm.blockYear}
                  onChange={(e) =>
                    setLeaveAvailForm({
                      ...leaveAvailForm,
                      blockYear: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Availed Year",
                <Input
                  value={leaveAvailForm.availedYear}
                  onChange={(e) =>
                    setLeaveAvailForm({
                      ...leaveAvailForm,
                      availedYear: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Name",
                <Input
                  value={leaveAvailForm.name}
                  onChange={(e) =>
                    setLeaveAvailForm({
                      ...leaveAvailForm,
                      name: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Relationship",
                <Select
                  value={leaveAvailForm.relationship}
                  onValueChange={(v) =>
                    setLeaveAvailForm({ ...leaveAvailForm, relationship: v })
                  }
                >
                  <SelectTrigger className="w-full">
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
                "Age",
                <Input
                  value={leaveAvailForm.age}
                  onChange={(e) =>
                    setLeaveAvailForm({
                      ...leaveAvailForm,
                      age: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Place of Visit",
                <Input
                  value={leaveAvailForm.placeOfVisit}
                  onChange={(e) =>
                    setLeaveAvailForm({
                      ...leaveAvailForm,
                      placeOfVisit: e.target.value,
                    })
                  }
                />
              )}
              {renderField(
                "Wheather Availed Leave Encashment",
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="availLeaveEnc"
                      value="Y"
                      checked={leaveAvailForm.availLeaveEnc === "Y"}
                      onChange={(e) =>
                        setLeaveAvailForm({
                          ...leaveAvailForm,
                          availLeaveEnc: e.target.value,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      name="availLeaveEnc"
                      value="N"
                      checked={leaveAvailForm.availLeaveEnc === "N"}
                      onChange={(e) =>
                        setLeaveAvailForm({
                          ...leaveAvailForm,
                          availLeaveEnc: e.target.value,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span>False</span>
                  </label>
                </div>
              )}
              {renderField(
                "Balance Out Of a Maximum Of 60 Days",
                <Input
                  value={leaveAvailForm.balanceOutOfMax}
                  disabled={leaveAvailForm.availLeaveEnc !== "Y"}
                  onChange={(e) =>
                    setLeaveAvailForm({
                      ...leaveAvailForm,
                      balanceOutOfMax: e.target.value,
                    })
                  }
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={addLeaveAvail}>
                {editingLeaveAvailId ? "Update" : "Add"}
              </Button>
              {editingLeaveAvailId && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingLeaveAvailId(null);
                    setLeaveAvailForm({
                      blockYear: "",
                      availedYear: "",
                      name: "",
                      relationship: "",
                      age: "",
                      placeOfVisit: "",
                      availLeaveEnc: "N",
                      balanceOutOfMax: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            {renderTable(
              leaveAvailColumns,
              leaveAvailData,
              setLeaveAvailData,
              editLeaveAvail
            )}
          </div>

          {/* ============ ACTION BUTTONS ============ */}
          <div className="flex justify-center gap-4 pt-4 border-t">
            <Button onClick={handleProcess}>Process</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmESevaEmpLeaveRecord;