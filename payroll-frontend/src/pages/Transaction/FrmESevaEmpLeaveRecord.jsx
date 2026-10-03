import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams, useOutletContext } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";

const API = (BASE_URL) => `${BASE_URL}/api/FrmESevaEmpLeaveRecord`;

const leaveMainColumns = [
  { key: "Leave", label: "Leave" },
  { key: "year", label: "Year" },
  { key: "PreviousBalances", label: "Previous Balance" },
  { key: "CreatedJan", label: "Created 1st Jan" },
  { key: "Debited", label: "Debited" },
  { key: "CurrentBalances", label: "Current Balance" },
  { key: "CreatedJuly", label: "Created 1st July" },
  { key: "PreviousBalance", label: "Previous Balance" },
  { key: "Debite", label: "Debited" },
  { key: "currentBalance", label: "Current Balance" },
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

const num = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const pick = (obj, ...keys) => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return "";
};

const unwrapRows = (res) => {
  const d = res?.data?.data;
  return Array.isArray(d) ? d : (d?.rows || []);
};

// ==================== VALIDATORS ====================
const onlyDigits = (v = "") => /^[0-9]*$/.test(v);
const isFourDigits = (v = "") => /^[0-9]{4}$/.test(v);

const sanitizeDigits = (v = "", maxLen = null) => {
  const cleaned = String(v).replace(/\D/g, "");
  return maxLen ? cleaned.slice(0, maxLen) : cleaned;
};

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

  const { empId, esevaEmployeeID } = useOutletContext();
  const empIdEseva = empId;
  const esevaEmpId = esevaEmployeeID;

  const authHeaders = { Authorization: `Bearer ${token}` };

  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [leaveTypeChildOptions, setLeaveTypeChildOptions] = useState([]);
  const [leaveTypeOtherOptions, setLeaveTypeOtherOptions] = useState([]);
  const [leaveTypeTEOptions, setLeaveTypeTEOptions] = useState([]);
  const [relationOptions, setRelationOptions] = useState([]);

  const [leaveMainForm, setLeaveMainForm] = useState({
    leaveType: "", year: "", previousBalance: "", createdFirstJan: "",
    totalLeave: "", debited: "", currentBalance: "", createdFirstJuly: "",
    previousBalanceN: "", totalLeaveN: "", debitedN: "", currentBalanceN: "", ltcIfAny: "",
  });
  const [editingLeaveMainId, setEditingLeaveMainId] = useState(null);

  const [leaveTEForm, setLeaveTEForm] = useState({
    leaveType: "", fromDate: null, toDate: null, purpose: "", noOfDays: "", balance: "",
  });
  const [editingLeaveTEId, setEditingLeaveTEId] = useState(null);

  const [leaveL2Form, setLeaveL2Form] = useState({
    leaveType: "", totalDays: "", debited: "", balance: "",
  });
  const [editingLeaveL2Id, setEditingLeaveL2Id] = useState(null);

  const [finalLeaveForm, setFinalLeaveForm] = useState({
    leaveType: "", leaveTypeText: "", fromDate: null, toDate: null, total: "", remark: "",
  });
  const [editingFinalLeaveId, setEditingFinalLeaveId] = useState(null);

  const [leaveAvailForm, setLeaveAvailForm] = useState({
    blockYear: "", availedYear: "", name: "", relationship: "", age: "",
    placeOfVisit: "", availLeaveEnc: "N", balanceOutOfMax: "",
  });
  const [editingLeaveAvailId, setEditingLeaveAvailId] = useState(null);

  const [leaveMainData, setLeaveMainData] = useState([]);
  const [leaveTEData, setLeaveTEData] = useState([]);
  const [leaveL2Data, setLeaveL2Data] = useState([]);
  const [finalLeaveData, setFinalLeaveData] = useState([]);
  const [leaveAvailData, setLeaveAvailData] = useState([]);

  const showAlert = useCallback(async (text, redirectTo = null) => {
    await Swal.fire({ text });
    if (redirectTo) navigate(redirectTo);
  }, [navigate]);

  const toOptions = (rows = []) =>
    rows.map((r) => ({
      value: (r.VALUE_ID ?? r.value_id)?.toString(),
      label: r.DISPLAY_TEXT ?? r.display_text ?? "",
    }));

  const nextSrNo = (arr) =>
    arr.length === 0 ? 1 : Math.max(...arr.map((r) => Number(r.Id) || 0)) + 1;

  const calcDays = (from, to) => {
    if (!from || !to) return "";
    const d1 = new Date(from);
    const d2 = new Date(to);
    if (d2 < d1) return "";
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    return diff.toString();
  };

  const updateLeaveMainField = (field, value) => {
    setLeaveMainForm((prev) => {
      const next = { ...prev, [field]: value };
      next.totalLeave = (num(next.previousBalance) + num(next.createdFirstJan)).toString();
      next.currentBalance = (num(next.totalLeave) - num(next.debited)).toString();
      next.previousBalanceN = next.currentBalance;
      next.totalLeaveN = (num(next.currentBalance) + num(next.createdFirstJuly)).toString();
      next.currentBalanceN = (num(next.totalLeaveN) - num(next.debitedN)).toString();
      return next;
    });
  };

  const fetchLeaveTypes = async () => {
    try {
      const [mainRes, childRes, otherRes, teRes] = await Promise.allSettled([
        axios.post(`${API(BASE_URL)}/getLeaveTypeList`,      {}, { headers: authHeaders }),
        axios.post(`${API(BASE_URL)}/getLeaveTypeChildList`, {}, { headers: authHeaders }),
        axios.post(`${API(BASE_URL)}/getLeaveTypeOtherList`, {}, { headers: authHeaders }),
        axios.post(`${API(BASE_URL)}/getLeaveTypeTEList`,    {}, { headers: authHeaders }),
      ]);

      const rowsOf = (r) => (r.status === "fulfilled" ? unwrapRows(r.value) : []);

      const toLeaveOpts = (rows) =>
        rows.map((r) => ({
          value: (r.NUM_LEAVE_ID ?? r.num_leave_id)?.toString(),
          label: r.VAR_LEAVE_NAME ?? r.var_leave_name ?? "",
        }));

      setLeaveTypeOptions(toLeaveOpts(rowsOf(mainRes)));
      setLeaveTypeChildOptions(toLeaveOpts(rowsOf(childRes)));
      setLeaveTypeOtherOptions(toLeaveOpts(rowsOf(otherRes)));
      setLeaveTypeTEOptions(toLeaveOpts(rowsOf(teRes)));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRelations = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmESevaEmpMaster/relation-dropdown`,
        {},
        { headers: authHeaders }
      );
      setRelationOptions(toOptions(res?.data?.data || []));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!token || !empIdEseva) return;
    if (queryMode === "1" && !esevaEmpId) {
      navigate("/Transactions/FrmEsevaEmpList");
      return;
    }

    const load = async () => {
      Swal.fire({
        text: "Please wait",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        await Promise.allSettled([fetchLeaveTypes(), fetchRelations()]);
        if (mode === 2) await bindAll();
      } finally {
        requestAnimationFrame(() => Swal.close());
      }
    };
    load();
  }, [token, mode, empIdEseva, esevaEmpId]);

  const bindAll = async () => {
    const body = {
      ulbId: Number(ulbId),
      empId: Number(empIdEseva),
      esevaEmpId: Number(esevaEmpId),
    };
    try {
      const [mainRes, teRes, l2Res, fnlRes, laRes] = await Promise.allSettled([
        axios.post(`${API(BASE_URL)}/getESevaEmpLeaveRecord`, body, { headers: authHeaders }),
        axios.post(`${API(BASE_URL)}/getLeaveTakenAndEarned`,  body, { headers: authHeaders }),
        axios.post(`${API(BASE_URL)}/getLeaveDetails2`,        body, { headers: authHeaders }),
        axios.post(`${API(BASE_URL)}/getFinalLeaveDetails`,    body, { headers: authHeaders }),
        axios.post(`${API(BASE_URL)}/getLeaveAvailability`,    body, { headers: authHeaders }),
      ]);

      const rowsOf = (r) => (r.status === "fulfilled" ? unwrapRows(r.value) : []);

      setLeaveMainData(
        rowsOf(mainRes).map((r, i) => ({
          Id: (i + 1).toString(),
          Leave: pick(r, "LEAVE", "leave"),
          Leaveid: (pick(r, "LEAVETYPEID", "leavetypeid")).toString(),
          year: pick(r, "YEAR", "year"),
          PreviousBalances: (pick(r, "PREVBAL_1", "prevbal_1")).toString(),
          CreatedJan: pick(r, "CR1STJAN", "cr1stjan"),
          TotalLeave: (num(pick(r, "PREVBAL_1", "prevbal_1")) + num(pick(r, "CR1STJAN", "cr1stjan"))).toString(),
          Debited: (pick(r, "DEBITED_1", "debited_1")).toString(),
          CurrentBalances: (pick(r, "CURRBAL_1", "currbal_1")).toString(),
          CreatedJuly: pick(r, "CR1STJULY", "cr1stjuly"),
          PreviousBalance: (pick(r, "PREVBAL_2", "prevbal_2")).toString(),
          TotalLeaveN: (num(pick(r, "PREVBAL_2", "prevbal_2")) + num(pick(r, "CR1STJULY", "cr1stjuly"))).toString(),
          Debite: (pick(r, "DEBITED_2", "debited_2")).toString(),
          currentBalance: (pick(r, "CURRBAL_2", "currbal_2")).toString(),
          LTCIfAny: pick(r, "LTC", "ltc"),
        }))
      );

      setLeaveTEData(
        rowsOf(teRes).map((r, i) => ({
          Id: (i + 1).toString(),
          Leave: pick(r, "LEAVE", "leave"),
          Leaveid: (pick(r, "LEAVETYPEID", "leavetypeid")).toString(),
          FromDate: pick(r, "FROMDATE", "fromdate"),
          ToDate: pick(r, "TODATE", "todate"),
          Purpose: pick(r, "PURPOSE", "purpose"),
          Days: (pick(r, "NOOFDAYS", "noofdays")).toString(),
          Balance: (pick(r, "BALANCE", "balance")).toString(),
        }))
      );

      setLeaveL2Data(
        rowsOf(l2Res).map((r, i) => ({
          Id: (i + 1).toString(),
          Leave: pick(r, "LEAVE", "leave"),
          Leaveid: (pick(r, "LEAVETYPEID", "leavetypeid") || "5").toString(),
          TotalDays: (pick(r, "TOTALDAYS", "totaldays")).toString(),
          Debited: (pick(r, "DEBITED", "debited")).toString(),
          Balance: (pick(r, "BALANCE", "balance")).toString(),
        }))
      );

      setFinalLeaveData(
        rowsOf(fnlRes).map((r, i) => ({
          Id: (i + 1).toString(),
          Leave: pick(r, "LEAVE", "leave"),
          Leaveid: (pick(r, "LEAVETYPEID", "leavetypeid") || "8").toString(),
          LeaveType: pick(r, "DEFLEAVE", "defleave"),
          fromdatenew: pick(r, "FROMDATE", "fromdate"),
          ToDatenew: pick(r, "TODATE", "todate"),
          Total: (pick(r, "TOTAL", "total")).toString(),
          Remark: pick(r, "REMARK", "remark"),
        }))
      );

      setLeaveAvailData(
        rowsOf(laRes).map((r, i) => {
          const enc = pick(r, "VAR_LEAVEDETSLTA_LEAVEENC");
          return {
            Id: (i + 1).toString(),
            BlockYear: pick(r, "VAR_LEAVEDETSLTA_BLOCKYEAR"),
            AvailedYear: pick(r, "VAR_LEAVEDETSLTA_AVAILYEAR"),
            Name: pick(r, "VAR_LEAVEDETSLTA_NAME"),
            Relationshipid: (pick(r, "NUM_LEAVEDETSLTA_RELID")).toString(),
            Relationshiptype: pick(r, "VAR_LEAVEDETSLTA_RELNAME"),
            Age: (pick(r, "NUM_LEAVEDETSLTA_AGE")).toString(),
            PlaceOfVisit: pick(r, "VAR_LEAVEDETSLTA_PLACE"),
            AvailLeaveEncID: enc,
            AvailLeaveEnc: enc === "Y" ? "Yes" : enc === "N" ? "No" : "",
            BalanceOutOfMax: (pick(r, "NUM_LEAVEDETSLTA_OUTOFMAX")).toString(),
          };
        })
      );
    } catch (e) {
      showAlert(e?.response?.data?.message || e.message);
    }
  };

  const addLeaveMain = () => {
    const f = leaveMainForm;
    if (!f.leaveType) return showAlert("Please Select Leave");
    if (!f.year) return showAlert("Year Name cannot be blank");
    if (!isFourDigits(String(f.year).trim()))
      return showAlert("Year must be exactly 4 digits.");
    if (!f.previousBalance) return showAlert("Previous Balance cannot be blank");
    if (!onlyDigits(String(f.previousBalance)))
      return showAlert("Previous Balance must contain digits only.");
    if (!f.createdFirstJan) return showAlert("Created On First Jan cannot be blank");
    if (!onlyDigits(String(f.createdFirstJan)))
      return showAlert("Created On First Jan must contain digits only.");
    if (!f.debited) return showAlert("Debited cannot be blank");
    if (!onlyDigits(String(f.debited)))
      return showAlert("Debited must contain digits only.");
    if (!f.createdFirstJuly) return showAlert("Created On First July cannot be blank");
    if (!onlyDigits(String(f.createdFirstJuly)))
      return showAlert("Created On First July must contain digits only.");
    if (!f.debitedN) return showAlert("Debited cannot be blank");
    if (!onlyDigits(String(f.debitedN)))
      return showAlert("Debited must contain digits only.");
    if (!f.ltcIfAny) return showAlert("LTC If Any cannot be blank");

    const label = leaveTypeOptions.find((o) => o.value === f.leaveType)?.label || "";
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
    setLeaveMainData((p) =>
      editingLeaveMainId ? p.map((r) => (r.Id === editingLeaveMainId ? record : r)) : [...p, record]
    );
    setEditingLeaveMainId(null);
    setLeaveMainForm({
      leaveType: "", year: "", previousBalance: "", createdFirstJan: "",
      totalLeave: "", debited: "", currentBalance: "", createdFirstJuly: "",
      previousBalanceN: "", totalLeaveN: "", debitedN: "", currentBalanceN: "", ltcIfAny: "",
    });
  };

  const editLeaveMain = (row) => {
    setEditingLeaveMainId(row.Id);
    setLeaveMainForm({
      leaveType: row.Leaveid || "", year: row.year || "",
      previousBalance: row.PreviousBalances || "",
      createdFirstJan: row.CreatedJan || "",
      totalLeave: row.TotalLeave || "", debited: row.Debited || "",
      currentBalance: row.CurrentBalances || "",
      createdFirstJuly: row.CreatedJuly || "",
      previousBalanceN: row.PreviousBalance || "",
      totalLeaveN: row.TotalLeaveN || "", debitedN: row.Debite || "",
      currentBalanceN: row.currentBalance || "", ltcIfAny: row.LTCIfAny || "",
    });
  };

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

    const label = leaveTypeTEOptions.find((o) => o.value === f.leaveType)?.label || "";
    const record = {
      Id: editingLeaveTEId ?? nextSrNo(leaveTEData).toString(),
      Leave: label, Leaveid: f.leaveType,
      FromDate: new Date(f.fromDate).toLocaleDateString("en-GB"),
      ToDate: new Date(f.toDate).toLocaleDateString("en-GB"),
      Purpose: f.purpose, Days: f.noOfDays, Balance: f.balance,
    };
    setLeaveTEData((p) =>
      editingLeaveTEId ? p.map((r) => (r.Id === editingLeaveTEId ? record : r)) : [...p, record]
    );
    setEditingLeaveTEId(null);
    setLeaveTEForm({ leaveType: "", fromDate: null, toDate: null, purpose: "", noOfDays: "", balance: "" });
  };

  const editLeaveTE = (row) => {
    setEditingLeaveTEId(row.Id);
    const parse = (s) => {
      if (!s) return null;
      const [d, m, y] = s.split("/");
      if (!d || !m || !y) return null;
      return new Date(`${y}-${m}-${d}`);
    };
    setLeaveTEForm({
      leaveType: row.Leaveid || "",
      fromDate: parse(row.FromDate), toDate: parse(row.ToDate),
      purpose: row.Purpose || "", noOfDays: row.Days || "", balance: row.Balance || "",
    });
  };

  const addLeaveL2 = () => {
    const f = leaveL2Form;
    if (!f.leaveType) return showAlert("Please Select Leave");
    if (!f.totalDays) return showAlert("Total 180 Days cannot be blank");
    if (!f.debited) return showAlert("Debited (Spell Calendar Wise) cannot be blank");
    if (!f.balance) return showAlert("Balance Record cannot be blank");

    const label = leaveTypeChildOptions.find((o) => o.value === f.leaveType)?.label || "";
    const record = {
      Id: editingLeaveL2Id ?? nextSrNo(leaveL2Data).toString(),
      Leave: label, Leaveid: f.leaveType,
      TotalDays: f.totalDays, Debited: f.debited, Balance: f.balance,
    };
    setLeaveL2Data((p) =>
      editingLeaveL2Id ? p.map((r) => (r.Id === editingLeaveL2Id ? record : r)) : [...p, record]
    );
    setEditingLeaveL2Id(null);
    setLeaveL2Form({ leaveType: "", totalDays: "", debited: "", balance: "" });
  };

  const editLeaveL2 = (row) => {
    setEditingLeaveL2Id(row.Id);
    setLeaveL2Form({
      leaveType: row.Leaveid || "", totalDays: row.TotalDays || "",
      debited: row.Debited || "", balance: row.Balance || "",
    });
  };

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

    const label = leaveTypeOtherOptions.find((o) => o.value === f.leaveType)?.label || "";
    const record = {
      Id: editingFinalLeaveId ?? nextSrNo(finalLeaveData).toString(),
      Leave: label, Leaveid: f.leaveType,
      LeaveType: f.leaveTypeText,
      fromdatenew: new Date(f.fromDate).toLocaleDateString("en-GB"),
      ToDatenew: new Date(f.toDate).toLocaleDateString("en-GB"),
      Total: f.total, Remark: f.remark,
    };
    setFinalLeaveData((p) =>
      editingFinalLeaveId ? p.map((r) => (r.Id === editingFinalLeaveId ? record : r)) : [...p, record]
    );
    setEditingFinalLeaveId(null);
    setFinalLeaveForm({ leaveType: "", leaveTypeText: "", fromDate: null, toDate: null, total: "", remark: "" });
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
      leaveType: row.Leaveid || "", leaveTypeText: row.LeaveType || "",
      fromDate: parse(row.fromdatenew), toDate: parse(row.ToDatenew),
      total: row.Total || "", remark: row.Remark || "",
    });
  };

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

    const relLabel = relationOptions.find((o) => o.value === f.relationship)?.label || "";
    const encLabel = f.availLeaveEnc === "Y" ? "Yes" : "No";
    const record = {
      Id: editingLeaveAvailId ?? nextSrNo(leaveAvailData).toString(),
      BlockYear: f.blockYear, AvailedYear: f.availedYear,
      Name: f.name, Relationshipid: f.relationship, Relationshiptype: relLabel,
      Age: f.age, PlaceOfVisit: f.placeOfVisit,
      AvailLeaveEncID: f.availLeaveEnc, AvailLeaveEnc: encLabel,
      BalanceOutOfMax: f.balanceOutOfMax,
    };
    setLeaveAvailData((p) =>
      editingLeaveAvailId ? p.map((r) => (r.Id === editingLeaveAvailId ? record : r)) : [...p, record]
    );
    setEditingLeaveAvailId(null);
    setLeaveAvailForm({
      blockYear: "", availedYear: "", name: "", relationship: "",
      age: "", placeOfVisit: "", availLeaveEnc: "N", balanceOutOfMax: "",
    });
  };

  const editLeaveAvail = (row) => {
    setEditingLeaveAvailId(row.Id);
    setLeaveAvailForm({
      blockYear: row.BlockYear || "", availedYear: row.AvailedYear || "",
      name: row.Name || "", relationship: row.Relationshipid || "",
      age: row.Age || "", placeOfVisit: row.PlaceOfVisit || "",
      availLeaveEnc: row.AvailLeaveEncID || "N",
      balanceOutOfMax: row.BalanceOutOfMax || "",
    });
  };

  const handleProcess = async () => {
    if (leaveMainData.length === 0) return showAlert("Please Add At least One Detail");
    if (leaveTEData.length === 0) return showAlert("Please Add At least One Detail");

    const buildStr = (arr, fields) =>
      arr.map((r) => fields.map((f) => r[f] ?? "").join("$")).join("#");

    const leaveStr = buildStr(leaveMainData, [
      "Leaveid","year","PreviousBalances","CreatedJan","TotalLeave","Debited",
      "CurrentBalances","CreatedJuly","PreviousBalance","TotalLeaveN","Debite",
      "currentBalance","LTCIfAny",
    ]);
    const leaveStrET = buildStr(leaveTEData, [
      "Leaveid","FromDate","ToDate","Purpose","Days","Balance",
    ]);
    const leaveStr2 = buildStr(leaveL2Data, [
      "Leaveid","TotalDays","Debited","Balance",
    ]);
    const leaveStrFNL = buildStr(finalLeaveData, [
      "Leaveid","LeaveType","fromdatenew","ToDatenew","Total","Remark",
    ]);
    const leaveStrLA = buildStr(leaveAvailData, [
      "BlockYear","AvailedYear","Name","Relationshipid","Age","PlaceOfVisit",
      "AvailLeaveEncID","BalanceOutOfMax",
    ]);

    try {
      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        userId,
        mode,
        empId: Number(empIdEseva),
        ulbId: Number(ulbId),
        esevaEmpId: mode === 1 ? 0 : Number(esevaEmpId),
        leaveStr,
        leaveStrEd: leaveStrET,
        leaveStrMat: leaveStr2,
        leaveStrOtr: leaveStrFNL,
        leaveStrLA,
      };

      const res = await axios.post(
        `${API(BASE_URL)}/insert-leave-record`,
        payload,
        { headers: authHeaders }
      );

      Swal.close();
      const data = res?.data?.data || {};

      if (data.success) {
        await Swal.fire({ text: data.errorMsg || data.message || "Saved successfully" });
        if (String(ulbId) === "870") {
          navigate("/Transactions/FrmESevaIncrAndPromotionsmkc?@=1");
        } else {
          navigate("/Transactions/FrmESevaIncrAndPromotion?@=1");
        }
      } else {
        showAlert(data.errorMsg || data.message || "Something went wrong");
      }
    } catch (e) {
      Swal.close();
      showAlert(e?.response?.data?.message || e?.response?.data?.error || e.message);
    }
  };

  const renderField = (label, content) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative">
      <div className="sm:w-56 shrink-0 flex justify-between items-center">
        <Label text={label} />
        <span>:</span>
      </div>
      <div className="w-full sm:w-72 focus-within:z-50">{content}</div>
    </div>
  );

  const renderTable = (columns, data, setter, onEdit) =>
    data.length > 0 && (
      <ShadCNTable
        headers={["Delete","Update","Sr No", ...columns.map((c) => c.label)]}
        data={data.map((r, i) => ({
          ...r,
          "Sr No": i + 1,
          Delete: (
            <Button variant="link" size="sm" className="px-0 text-red-600"
              onClick={() => setter((p) => p.filter((x) => x.Id !== r.Id))}>Delete</Button>
          ),
          Update: (
            <Button variant="link" size="sm" className="px-0 text-blue-600"
              onClick={() => onEdit(r)}>Update</Button>
          ),
        }))}
        keyMapping={{
          Delete: "Delete", Update: "Update", "Sr No": "Sr No",
          ...Object.fromEntries(columns.map((c) => [c.label, c.key])),
        }}
        pagination rowsPerPage={5}
      />
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">Leave Records</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Leave Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField("Leave",
                <Select value={leaveMainForm.leaveType}
                  onValueChange={(v) => updateLeaveMainField("leaveType", v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                  <SelectContent>
                    {leaveTypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {/* Year: 4-digit numeric only */}
              {renderField("Year",
                <Input
                  value={leaveMainForm.year}
                  maxLength={4}
                  inputMode="numeric"
                  onChange={(e) =>
                    updateLeaveMainField("year", sanitizeDigits(e.target.value, 4))
                  }
                />
              )}
              {/* Previous Balances: digits only */}
              {renderField("Previous Balances",
                <Input
                  value={leaveMainForm.previousBalance}
                  inputMode="numeric"
                  onChange={(e) =>
                    updateLeaveMainField("previousBalance", sanitizeDigits(e.target.value))
                  }
                />
              )}
              {/* Created ON 1ST Jan: digits only */}
              {renderField("Created ON 1ST Jan",
                <Input
                  value={leaveMainForm.createdFirstJan}
                  inputMode="numeric"
                  onChange={(e) =>
                    updateLeaveMainField("createdFirstJan", sanitizeDigits(e.target.value))
                  }
                />
              )}
              {renderField("Total Leave",
                <Input value={leaveMainForm.totalLeave} readOnly className="bg-muted" />
              )}
              {/* Debited: digits only */}
              {renderField("Debited",
                <Input
                  value={leaveMainForm.debited}
                  inputMode="numeric"
                  onChange={(e) =>
                    updateLeaveMainField("debited", sanitizeDigits(e.target.value))
                  }
                />
              )}
              {renderField("Current Balances",
                <Input value={leaveMainForm.currentBalance} readOnly className="bg-muted" />
              )}
              {/* Created ON 1ST July: digits only */}
              {renderField("Created ON 1ST July",
                <Input
                  value={leaveMainForm.createdFirstJuly}
                  inputMode="numeric"
                  onChange={(e) =>
                    updateLeaveMainField("createdFirstJuly", sanitizeDigits(e.target.value))
                  }
                />
              )}
              {renderField("Previous Balances",
                <Input value={leaveMainForm.previousBalanceN} readOnly className="bg-muted" />
              )}
              {renderField("Total Leave",
                <Input value={leaveMainForm.totalLeaveN} readOnly className="bg-muted" />
              )}
              {/* Debited (2nd): digits only */}
              {renderField("Debited",
                <Input
                  value={leaveMainForm.debitedN}
                  inputMode="numeric"
                  onChange={(e) =>
                    updateLeaveMainField("debitedN", sanitizeDigits(e.target.value))
                  }
                />
              )}
              {renderField("Current Balance",
                <Input value={leaveMainForm.currentBalanceN} readOnly className="bg-muted" />
              )}
              {renderField("LTC If Any",
                <Input value={leaveMainForm.ltcIfAny}
                  onChange={(e) => updateLeaveMainField("ltcIfAny", e.target.value)} />
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={addLeaveMain}>
                {editingLeaveMainId ? "Update Leave Record" : "Add Leave Record"}
              </Button>
              {editingLeaveMainId && (
                <Button variant="secondary" onClick={() => {
                  setEditingLeaveMainId(null);
                  setLeaveMainForm({
                    leaveType: "", year: "", previousBalance: "", createdFirstJan: "",
                    totalLeave: "", debited: "", currentBalance: "", createdFirstJuly: "",
                    previousBalanceN: "", totalLeaveN: "", debitedN: "", currentBalanceN: "", ltcIfAny: "",
                  });
                }}>Cancel</Button>
              )}
            </div>
            {renderTable(leaveMainColumns, leaveMainData, setLeaveMainData, editLeaveMain)}
          </div>

          <hr className="border-t" />

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Leave Taken & Earned</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField("Leave",
                <Select value={leaveTEForm.leaveType}
                  onValueChange={(v) => setLeaveTEForm({ ...leaveTEForm, leaveType: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                  <SelectContent>
                    {leaveTypeTEOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {renderField("From Date",
                <DatePicker value={leaveTEForm.fromDate}
                  onChange={(d) => {
                    const days = calcDays(d, leaveTEForm.toDate);
                    setLeaveTEForm({ ...leaveTEForm, fromDate: d, noOfDays: days || leaveTEForm.noOfDays });
                  }} />
              )}
              {renderField("To Date",
                <DatePicker value={leaveTEForm.toDate}
                  onChange={(d) => {
                    const days = calcDays(leaveTEForm.fromDate, d);
                    setLeaveTEForm({ ...leaveTEForm, toDate: d, noOfDays: days || leaveTEForm.noOfDays });
                  }} />
              )}
              {renderField("Purpose",
                <Input value={leaveTEForm.purpose}
                  onChange={(e) => setLeaveTEForm({ ...leaveTEForm, purpose: e.target.value })} />
              )}
              {renderField("Days",
                <Input value={leaveTEForm.noOfDays}
                  onChange={(e) => setLeaveTEForm({ ...leaveTEForm, noOfDays: e.target.value })} />
              )}
              {renderField("Balance",
                <Input value={leaveTEForm.balance}
                  onChange={(e) => setLeaveTEForm({ ...leaveTEForm, balance: e.target.value })} />
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={addLeaveTE}>
                {editingLeaveTEId ? "Update" : "Add"}
              </Button>
              {editingLeaveTEId && (
                <Button variant="secondary" onClick={() => {
                  setEditingLeaveTEId(null);
                  setLeaveTEForm({ leaveType: "", fromDate: null, toDate: null, purpose: "", noOfDays: "", balance: "" });
                }}>Cancel</Button>
              )}
            </div>
            {renderTable(leaveTakenEarnedColumns, leaveTEData, setLeaveTEData, editLeaveTE)}
          </div>

          <hr className="border-t" />

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Leave Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField("Leave",
                <Select value={leaveL2Form.leaveType}
                  onValueChange={(v) => setLeaveL2Form({ ...leaveL2Form, leaveType: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                  <SelectContent>
                    {leaveTypeChildOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {renderField("Total 180 Days",
                <Input value={leaveL2Form.totalDays}
                  onChange={(e) => setLeaveL2Form({ ...leaveL2Form, totalDays: e.target.value })} />
              )}
              {renderField("Debited (Spell Calendar Wise)",
                <Input value={leaveL2Form.debited}
                  onChange={(e) => setLeaveL2Form({ ...leaveL2Form, debited: e.target.value })} />
              )}
              {renderField("Balance",
                <Input value={leaveL2Form.balance}
                  onChange={(e) => setLeaveL2Form({ ...leaveL2Form, balance: e.target.value })} />
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={addLeaveL2}>
                {editingLeaveL2Id ? "Update Leave Record" : "Add Leave Record"}
              </Button>
              {editingLeaveL2Id && (
                <Button variant="secondary" onClick={() => {
                  setEditingLeaveL2Id(null);
                  setLeaveL2Form({ leaveType: "", totalDays: "", debited: "", balance: "" });
                }}>Cancel</Button>
              )}
            </div>
            {renderTable(leaveDetails2Columns, leaveL2Data, setLeaveL2Data, editLeaveL2)}
          </div>

          <hr className="border-t" />

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Leave Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField("Leave",
                <Select value={finalLeaveForm.leaveType}
                  onValueChange={(v) => setFinalLeaveForm({ ...finalLeaveForm, leaveType: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                  <SelectContent>
                    {leaveTypeOtherOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {renderField("Leave Type",
                <Input value={finalLeaveForm.leaveTypeText}
                  onChange={(e) => setFinalLeaveForm({ ...finalLeaveForm, leaveTypeText: e.target.value })} />
              )}
              {renderField("From Date",
                <DatePicker value={finalLeaveForm.fromDate}
                  onChange={(d) => setFinalLeaveForm({ ...finalLeaveForm, fromDate: d })} />
              )}
              {renderField("To Date",
                <DatePicker value={finalLeaveForm.toDate}
                  onChange={(d) => setFinalLeaveForm({ ...finalLeaveForm, toDate: d })} />
              )}
              {renderField("Total",
                <Input value={finalLeaveForm.total}
                  onChange={(e) => setFinalLeaveForm({ ...finalLeaveForm, total: e.target.value })} />
              )}
              {renderField("Remark",
                <Input value={finalLeaveForm.remark}
                  onChange={(e) => setFinalLeaveForm({ ...finalLeaveForm, remark: e.target.value })} />
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={addFinalLeave}>
                {editingFinalLeaveId ? "Update" : "Add"}
              </Button>
              {editingFinalLeaveId && (
                <Button variant="secondary" onClick={() => {
                  setEditingFinalLeaveId(null);
                  setFinalLeaveForm({ leaveType: "", leaveTypeText: "", fromDate: null, toDate: null, total: "", remark: "" });
                }}>Cancel</Button>
              )}
            </div>
            {renderTable(finalLeaveColumns, finalLeaveData, setFinalLeaveData, editFinalLeave)}
          </div>

          <hr className="border-t" />

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Details Of Leave Travel Consession Availed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {renderField("Block Year",
                <Input value={leaveAvailForm.blockYear}
                  onChange={(e) => setLeaveAvailForm({ ...leaveAvailForm, blockYear: e.target.value })} />
              )}
              {renderField("Availed Year",
                <Input value={leaveAvailForm.availedYear}
                  onChange={(e) => setLeaveAvailForm({ ...leaveAvailForm, availedYear: e.target.value })} />
              )}
              {renderField("Name",
                <Input value={leaveAvailForm.name}
                  onChange={(e) => setLeaveAvailForm({ ...leaveAvailForm, name: e.target.value })} />
              )}
              {renderField("Relationship",
                <Select value={leaveAvailForm.relationship}
                  onValueChange={(v) => setLeaveAvailForm({ ...leaveAvailForm, relationship: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                  <SelectContent>
                    {relationOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {renderField("Age",
                <Input value={leaveAvailForm.age}
                  onChange={(e) => setLeaveAvailForm({ ...leaveAvailForm, age: e.target.value })} />
              )}
              {renderField("Place of Visit",
                <Input value={leaveAvailForm.placeOfVisit}
                  onChange={(e) => setLeaveAvailForm({ ...leaveAvailForm, placeOfVisit: e.target.value })} />
              )}
              {renderField("Wheather Availed Leave Encashment",
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <Input type="radio" name="availLeaveEnc" value="Y"
                      checked={leaveAvailForm.availLeaveEnc === "Y"}
                      onChange={(e) => setLeaveAvailForm({ ...leaveAvailForm, availLeaveEnc: e.target.value })}
                      className="h-4 w-4" />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Input type="radio" name="availLeaveEnc" value="N"
                      checked={leaveAvailForm.availLeaveEnc === "N"}
                      onChange={(e) => setLeaveAvailForm({ ...leaveAvailForm, availLeaveEnc: e.target.value })}
                      className="h-4 w-4" />
                    <span>False</span>
                  </label>
                </div>
              )}
              {renderField("Balance Out Of a Maximum Of 60 Days",
                <Input value={leaveAvailForm.balanceOutOfMax}
                  disabled={leaveAvailForm.availLeaveEnc !== "Y"}
                  onChange={(e) => setLeaveAvailForm({ ...leaveAvailForm, balanceOutOfMax: e.target.value })} />
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={addLeaveAvail}>
                {editingLeaveAvailId ? "Update" : "Add"}
              </Button>
              {editingLeaveAvailId && (
                <Button variant="secondary" onClick={() => {
                  setEditingLeaveAvailId(null);
                  setLeaveAvailForm({
                    blockYear: "", availedYear: "", name: "", relationship: "",
                    age: "", placeOfVisit: "", availLeaveEnc: "N", balanceOutOfMax: "",
                  });
                }}>Cancel</Button>
              )}
            </div>
            {renderTable(leaveAvailColumns, leaveAvailData, setLeaveAvailData, editLeaveAvail)}
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t">
            <Button onClick={handleProcess}>Process</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmESevaEmpLeaveRecord;