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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";

const API = (BASE_URL) => `${BASE_URL}/api/FrmEsevaEmpPenalAction`;

const unwrapRows = (res) => {
  const outer = res?.data?.data;
  if (Array.isArray(outer)) return outer;
  if (Array.isArray(outer?.rows)) return outer.rows;
  if (Array.isArray(outer?.data)) return outer.data;
  return [];
};

const pick = (obj, ...keys) => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return "";
};

const FrmEsevaEmpPenalAction = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();
  const location = useLocation();
  console.log("penal acion",{location});
  const [searchParams] = useSearchParams();

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const queryMode = searchParams.get("@");
  const mode = queryMode === "1" ? 2 : 1;

  const { empId, esevaEmployeeID } = useOutletContext();
  console.log({esevaEmployeeID});
  const empIdEseva = empId;
  const esevaEmpId = esevaEmployeeID;

  const authHeaders = { Authorization: `Bearer ${token}` };

  const [form, setForm] = useState({
    actionType: "",
    reason: "",
    currentStatus: "",
    orderDate: new Date(),
    caseNumber: "",
    impactOnPension: "",
    details: "",
    ifRevokeOrderNo: "",
    detailsOfOrder: "",
  });

  const [actionTypeOptions, setActionTypeOptions] = useState([]);
  const [impactOptions, setImpactOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const showAlert = async (text, redirectTo = null) => {
    await Swal.fire({ text });
    if (redirectTo) navigate(redirectTo);
  };

  const fetchDropdowns = async () => {
    try {
      const [actionRes, impactRes] = await Promise.allSettled([
        axios.post(`${API(BASE_URL)}/getActionTypeList`, {}, { headers: authHeaders }),
        axios.post(`${API(BASE_URL)}/getPensionImpactList`, {}, { headers: authHeaders }),
      ]);

      const rowsOf = (r) => (r.status === "fulfilled" ? unwrapRows(r.value) : []);

      const toOpts = (rows, valueKey, labelKey) =>
        rows.map((r) => ({
          value: (r[valueKey] ?? r[valueKey.toLowerCase()])?.toString(),
          label: r[labelKey] ?? r[labelKey.toLowerCase()] ?? "",
        }));

      setActionTypeOptions(
        toOpts(rowsOf(actionRes), "NUM_ACTIONTYPE_ID", "VAR_ACTIONTYPE_NAME")
      );
      setImpactOptions(
        toOpts(rowsOf(impactRes), "NUM_PENSIONIMPACT_ID", "VAR_PENSIONIMPACT_NAME")
      );
    } catch (e) {
      console.error("Failed to fetch dropdowns:", e);
    }
  };

  useEffect(() => {
    if (!token || !empIdEseva) return;

    const load = async () => {
      Swal.fire({
        text: "Please wait",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        await fetchDropdowns();
        if (mode === 2 && esevaEmpId) {
          await loadExistingData();
        }
      } finally {
        requestAnimationFrame(() => Swal.close());
      }
    };
    load();
  }, [token, mode, empIdEseva, esevaEmpId]);

  const loadExistingData = async () => {
    try {
      const payload = {
        ulbId: Number(ulbId),
        empId: Number(empIdEseva),
        esevaEmpId: Number(esevaEmpId),
      };

      const res = await axios.post(
        `${API(BASE_URL)}/getPenalActionDetails`,
        payload,
        { headers: authHeaders }
      );

      const rows = unwrapRows(res);
      const row = rows[0];

      if (row) {
        setIsEditMode(true);
      setForm({
        actionType: pick(row, "NUM_PENACTION_ACTIONTYP", "num_penaction_actiontyp")?.toString() || "",
        reason: pick(row, "VAR_PENACTION_REASON", "var_penaction_reason"),
        currentStatus: pick(row, "VAR_PENACTION_CURRSTATUS", "var_penaction_currstatus"),
        orderDate: pick(row, "DAT_PENACTION_ORDERDAT", "dat_penaction_orderdat")
          ? new Date(pick(row, "DAT_PENACTION_ORDERDAT", "dat_penaction_orderdat"))
          : new Date(),
        caseNumber: pick(row, "VAR_PENACTION_CASENO", "var_penaction_caseno"),
        impactOnPension: pick(row, "NUM_PENACTION_WHETHERIMPACT", "num_penaction_whetherimpact")?.toString() || "",
        details: pick(row, "VAR_PENACTION_DETAILS", "var_penaction_details"),
        ifRevokeOrderNo: pick(row, "VAR_PENACTION_ORDERNO", "var_penaction_orderno"),
        detailsOfOrder: pick(row, "VAR_PENACTION_ORDERDETAILS", "var_penaction_orderdetails"),
      });
      } else {
        setIsEditMode(false);
      }
    } catch (error) {
      await Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load data",
      });
    }
  };

  const handleSubmit = async () => {
    if (!form.actionType) return Swal.fire({ text: "Please Select Action Type"});
    if (!form.reason.trim()) return Swal.fire({ text: "Please Enter Reason" });
    if (!form.currentStatus.trim()) return Swal.fire({ text: "Please Enter Current Status" });
    if (!form.caseNumber.trim()) return Swal.fire({ text: "Please Enter Case Number" });
    if (!form.details.trim()) return Swal.fire({ text: "Please Enter Details" });
    if (!form.ifRevokeOrderNo.trim()) return Swal.fire({ text: "Please Enter Order Number" });
    if (!form.detailsOfOrder.trim()) return Swal.fire({ text: "Please Enter Details Of Order" });
    if (!form.impactOnPension) return Swal.fire({ text: "Please Select Whether Impact On Pension" });

    try {
      setLoading(true);
      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const submitMode = isEditMode ? 2 : 1;

      const payload = {
        userId,
        mode: submitMode,
        esevaEmpId: Number(esevaEmpId),
        empId: Number(empIdEseva),
        ulbId: Number(ulbId),
        actionType: Number(form.actionType) || null,
        reason: form.reason.trim(),
        currentStatus: form.currentStatus.trim(),
        caseNumber: form.caseNumber.trim(),
        details: form.details.trim(),
        ifRevokeOrderNo: form.ifRevokeOrderNo.trim(),
        dateOfOrder: form.orderDate ? new Date(form.orderDate).toISOString() : null,
        detailsOfOrder: form.detailsOfOrder.trim(),
        impactOnPension: Number(form.impactOnPension) || null,
      };

      console.log("INSERT PAYLOAD:", JSON.stringify(payload, null, 2));
      console.log("ENDPOINT:", `${API(BASE_URL)}/insertPenalAction`);
      console.log("HEADERS:", authHeaders);

      const res = await axios.post(
        `${API(BASE_URL)}/insertPenalAction`,
        payload,
        { headers: authHeaders }
      );

      console.log("RAW RESPONSE:", res.data);

      Swal.close();
      setLoading(false);

      const data = res?.data?.data || {};
      const errorCode = data.errorCode;
      const errorMsg = data.errorMsg || data.message || "Saved successfully";

      if (errorCode === 0 || errorCode === 9999 || data.success === true || data.success) {
        await Swal.fire({ text: errorMsg});
        navigate("/Transactions/FrmEsevaEmpList", {
          state: { empId, esevaEmpId: data?.esevaEmpId, mode },
        });
      } else {
        await Swal.fire({ text: errorMsg});
      }
    } catch (error) {
      Swal.close();
      setLoading(false);
      await Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong",
      });
    }
  };

  const handleClose = () => {
    navigate("/Transactions/FrmEsevaEmpList");
  };

  const renderField = (label, content, required = false) => (
    <div className="flex items-center gap-2">
      <Label required={required} text={label} className="w-32 shrink-0 text" />
      <span className="shrink-0">:</span>
      <div className="flex-1 min-w-0">{content}</div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">Penal Action</CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">Action Details</CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {renderField(
                  "Action Type",
                  <Select
                    value={form.actionType}
                    onValueChange={(v) => updateForm("actionType", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {renderField(
                  "Reason",
                  <Input
                    value={form.reason}
                    onChange={(e) => updateForm("reason", e.target.value)}
                  />
                )}

                {renderField(
                  "Current Status",
                  <Input
                    value={form.currentStatus}
                    onChange={(e) => updateForm("currentStatus", e.target.value)}
                  />
                )}

                {renderField(
                  "Case Number",
                  <Input
                    value={form.caseNumber}
                    onChange={(e) => updateForm("caseNumber", e.target.value)}
                  />
                )}

                {renderField(
                  "Details",
                  <Input
                    value={form.details}
                    onChange={(e) => updateForm("details", e.target.value)}
                  />
                )}

                {renderField(
                  "If Revoke,Order No.",
                  <Input
                    value={form.ifRevokeOrderNo}
                    onChange={(e) => updateForm("ifRevokeOrderNo", e.target.value)}
                  />
                )}

                {renderField(
                  "Date Of Order",
                  <DatePicker
                    value={form.orderDate}
                    onChange={(d) => updateForm("orderDate", d)}
                  />
                )}

                {renderField(
                  "Impact On Pension",
                  <Select
                    value={form.impactOnPension}
                    onValueChange={(v) => updateForm("impactOnPension", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {impactOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {renderField(
                  "Details Of Order",
                  <Input
                    value={form.detailsOfOrder}
                    onChange={(e) => updateForm("detailsOfOrder", e.target.value)}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 pt-2 border-t">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-32"
            >
              Submit
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="min-w-32"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmEsevaEmpPenalAction;