import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
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

const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDate = (str) => {
  if (!str) return null;
  const [day, month, year] = str.split("-");
  return new Date(`${year}-${month}-${day}`);
};

const FrmEsevaEmpPenalAction = () => {
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

  // ==================== FORM STATE ====================
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

  // ==================== HELPERS ====================
  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const showAlert = async (text, redirectTo = null) => {
    await Swal.fire({ text });
    if (redirectTo) navigate(redirectTo);
  };

  // ==================== FETCH DROPDOWNS ====================
  const fetchDropdowns = async () => {
    try {
      const [actionRes, impactRes] = await Promise.all([
        axios.post(
          `${API(BASE_URL)}/action-type-dropdown`,
          {},
          { headers: authHeaders }
        ),
        axios.post(
          `${API(BASE_URL)}/impact-pension-dropdown`,
          {},
          { headers: authHeaders }
        ),
      ]);

      const actionRows = actionRes?.data?.data?.data || [];
      const impactRows = impactRes?.data?.data?.data || [];

      setActionTypeOptions(
        actionRows.map((r) => ({
          value: r.VALUE_ID?.toString(),
          label: r.DISPLAY_TEXT,
        }))
      );
      setImpactOptions(
        impactRows.map((r) => ({
          value: r.VALUE_ID?.toString(),
          label: r.DISPLAY_TEXT,
        }))
      );
    } catch (e) {
      console.error("Failed to fetch dropdowns:", e);
    }
  };

  // ==================== INITIAL LOAD ====================
  useEffect(() => {
    // if (!empIdEseva) {
    //   showAlert("Invalid Employee Id.", "/Transactions/FrmEsevaEmpList");
    //   return;
    // }
    // if (!esevaEmpId) {
    //   showAlert("Invalid Eseva Employee Id.", "/Transactions/FrmEsevaEmpList");
    //   return;
    // }

    fetchDropdowns();

    if (mode === 2) {
      loadExistingData();
    }
  }, [token, mode]);

  // ==================== LOAD EXISTING DATA ====================
  const loadExistingData = async () => {
    Swal.fire({
      text: "Loading...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = {
        ulbid: Number(ulbId),
        empId: Number(empIdEseva),
        esevaEmpId: Number(esevaEmpId),
      };

      const res = await axios.post(
        `${API(BASE_URL)}/penal-action-details`,
        payload,
        { headers: authHeaders }
      );

      const row = res?.data?.data?.data?.[0];

      if (row) {
        setForm({
          actionType: row.NUM_PENACTION_ACTIONTYP?.toString() || "",
          reason: row.VAR_PENACTION_REASON || "",
          currentStatus: row.VAR_PENACTION_CURRSTATUS || "",
          orderDate: row.DAT_PENACTION_ORDERDAT
            ? new Date(row.DAT_PENACTION_ORDERDAT)
            : new Date(),
          caseNumber: row.VAR_PENACTION_CASENO || "",
          impactOnPension:
            row.NUM_PENACTION_WHETHERIMPACT?.toString() || "",
          details: row.VAR_PENACTION_DETAILS || "",
          ifRevokeOrderNo: row.VAR_PENACTION_ORDERNO || "",
          detailsOfOrder: row.VAR_PENACTION_ORDERDETAILS || "",
        });
      } else {
        Swal.close();
        await showAlert("No record found.", "/Transactions/FrmEsevaEmpList");
        return;
      }

      Swal.close();
    } catch (error) {
      Swal.close();
      await Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load data",
      });
    }
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async () => {
    if (!form.actionType) {
      Swal.fire({ text: "Please Select Action Type", icon: "warning" });
      return;
    }
    if (!form.reason.trim()) {
      Swal.fire({ text: "Please Enter Reason", icon: "warning" });
      return;
    }
    if (!form.currentStatus.trim()) {
      Swal.fire({ text: "Please Enter Current Status", icon: "warning" });
      return;
    }
    if (!form.caseNumber.trim()) {
      Swal.fire({ text: "Please Enter Case Number", icon: "warning" });
      return;
    }
    if (!form.details.trim()) {
      Swal.fire({ text: "Please Enter Details", icon: "warning" });
      return;
    }
    if (!form.ifRevokeOrderNo.trim()) {
      Swal.fire({ text: "Please Enter Order Number", icon: "warning" });
      return;
    }
    if (!form.detailsOfOrder.trim()) {
      Swal.fire({ text: "Please Enter Details Of Order", icon: "warning" });
      return;
    }
    if (!form.impactOnPension) {
      Swal.fire({
        text: "Please Select Whether Impact On Pension",
        icon: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        userid: userId || "",
        id: Number(esevaEmpId),
        ulbid: Number(ulbId),
        empid: Number(empIdEseva),
        actionType: Number(form.actionType) || 0,
        reason: form.reason.trim(),
        currentStatus: form.currentStatus.trim(),
        caseNumber: form.caseNumber.trim(),
        dateOfOrder: form.orderDate
          ? new Date(form.orderDate).toISOString()
          : null,
        details: form.details.trim(),
        ifRevokeOrderNo: form.ifRevokeOrderNo.trim(),
        detailsOfOrder: form.detailsOfOrder.trim(),
        impactOnPension: Number(form.impactOnPension) || 0,
        mode: mode,
      };

      const res = await axios.post(
        `${API(BASE_URL)}/insert-penal-action`,
        payload,
        { headers: authHeaders }
      );

      Swal.close();
      setLoading(false);

      const data = res?.data?.data || {};
      const errorCode = data.errorCode;
      const errorMsg = data.message || "Saved successfully";

      if (errorCode === 9999) {
        await Swal.fire({ text: errorMsg, icon: "info" });
        navigate("/Transactions/FrmEsevaEmpList");
      } else {
        await Swal.fire({ text: errorMsg, icon: "success" });
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

  // ==================== CLOSE ====================
  const handleClose = () => {
    navigate("/Transactions/FrmEsevaEmpList");
  };

// ==================== RENDER HELPERS ====================
  const renderField = (label, content, required = false) => (
    <div className="flex items-center gap-2">
      <Label
        required={required}
        text={label}
        className="w-32 shrink-0 text"
      />
      <span className="shrink-0">:</span>
      <div className="flex-1 min-w-0">{content}</div>
    </div>
  );

  // ==================== RENDER ====================
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">Penal Action</CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          {/* ============ ENTRY FORM ============ */}
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">
                Action Details
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* ---------- ROW 1 ---------- */}
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
                    onChange={(e) =>
                      updateForm("currentStatus", e.target.value)
                    }
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
                    onChange={(e) =>
                      updateForm("ifRevokeOrderNo", e.target.value)
                    }
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
                    onChange={(e) =>
                      updateForm("detailsOfOrder", e.target.value)
                    }
                  />
                )}

              </div>
            </CardContent>
          </Card>

          {/* ============ ACTION BUTTONS ============ */}
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