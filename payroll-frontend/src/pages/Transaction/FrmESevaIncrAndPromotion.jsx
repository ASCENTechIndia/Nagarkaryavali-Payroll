import React, { useEffect, useState} from "react";
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
import ShadCNTable from "@/components/ui/table";

const API = (BASE_URL) => `${BASE_URL}/api/FrmESevaIncrAndPromotion`;

// ==================== DATE HELPERS ====================
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

const getToday = () => new Date();

// ==================== MAIN COMPONENT ====================
const FrmESevaIncrAndPromotion = () => {
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

  // ==================== STATE ====================
  // Increment form
  const [incForm, setIncForm] = useState({
    origPayscaleId: "",
    revPayscaleId: "",
    orderNo: "",
    orderDate: getToday(),
    details: "",
  });

  // Promotion form
  const [promForm, setPromForm] = useState({
    origDesigId: "",
    origDeptId: "",
    origPayscaleId: "",
    revDesigId: "",
    revDeptId: "",
    revPayscaleId: "",
    orderNo: "",
    orderDate: getToday(),
    details: "",
  });

  // Grid data
  const [incTableData, setIncTableData] = useState([]);
  const [promTableData, setPromTableData] = useState([]);

  // Edit tracking
  const [incEditId, setIncEditId] = useState(null);
  const [promEditId, setPromEditId] = useState(null);

  // Dropdown options
  const [payscaleOptions, setPayscaleOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [desigOptions, setDesigOptions] = useState([]);

  // ==================== HELPERS ====================
  const updateIncForm = (field, value) =>
    setIncForm((prev) => ({ ...prev, [field]: value }));

  const updatePromForm = (field, value) =>
    setPromForm((prev) => ({ ...prev, [field]: value }));

  const showAlert = async (text, redirectTo = null) => {
    await Swal.fire({ text });
    if (redirectTo) navigate(redirectTo);
  };

  const getNextId = (data) =>
    data.length > 0 ? Math.max(...data.map((r) => r.Id)) + 1 : 1;

  // ==================== INITIAL LOAD ====================
  useEffect(() => {
    // if (!empIdEseva) {
    //   showAlert("Invalid Employee Id.", "/Transactions/FrmEsevaEmpList");
    //   return;
    // }
    if (mode === 2 && !esevaEmpId) {
      showAlert("Please enter Personal information first.", "/Transactions/FrmESevaEmpMaster?@=1");
      return;
    }

    fetchDropdowns();

    if (mode === 2) {
      loadExistingIncrementData();
      loadExistingPromotionData();
    }
  }, [token, mode]);

  // ==================== FETCH DROPDOWNS ====================
  const fetchDropdowns = async () => {
    try {
      const payload = { ulbid: Number(ulbId) };
      const res = await axios.post(
        `${API(BASE_URL)}/dropdowns`,
        payload,
        { headers: authHeaders }
      );
      const data = res?.data?.data?.data || {};
      setPayscaleOptions(
        (data.payscales || []).map((r) => ({
          value: r.PAYSCALEID?.toString(),
          label: r.PAYSCALENAME,
        }))
      );
      setDeptOptions(
        (data.departments || []).map((r) => ({
          value: r.DEPTID?.toString(),
          label: r.DEPTNAME,
        }))
      );
      setDesigOptions(
        (data.designations || []).map((r) => ({
          value: r.DESIG_ID?.toString(),
          label: r.DESIG_ENAME,
        }))
      );
    } catch (e) {
      console.error("Failed to fetch dropdowns:", e);
    }
  };

  // ==================== LOAD EXISTING - INCREMENT ====================
  const loadExistingIncrementData = async () => {
    try {
      const payload = {
        ulbid: Number(ulbId),
        empId: Number(empIdEseva),
        esevaEmpId: Number(esevaEmpId),
      };
      const res = await axios.post(
        `${API(BASE_URL)}/increment-record`,
        payload,
        { headers: authHeaders }
      );
      const rows = res?.data?.data?.data || [];
      const mapped = rows.map((row, idx) => ({
        Id: idx + 1,
        OrigPayscale: row.ORIGINALPAYSCALEN || "",
        OrigPayscaleId: row.ORIGINALPAYSCALE?.toString() || "",
        RevPayscale: row.REVISEDPAYSCALEN || "",
        RevPayscaleId: row.REVISEDPAYSCALE?.toString() || "",
        OrderNo: row.ORDERNO || "",
        OrderDate: row.ORDERDATE || "",
        Details: row.DETAILS || "",
      }));
      setIncTableData(mapped);
    } catch (error) {
      Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load increment data",
      });
    }
  };

  // ==================== LOAD EXISTING - PROMOTION ====================
  const loadExistingPromotionData = async () => {
    try {
      const payload = {
        ulbid: Number(ulbId),
        empId: Number(empIdEseva),
        esevaEmpId: Number(esevaEmpId),
      };
      const res = await axios.post(
        `${API(BASE_URL)}/promotion-record`,
        payload,
        { headers: authHeaders }
      );
      const rows = res?.data?.data?.data || [];
      const mapped = rows.map((row, idx) => ({
        Id: idx + 1,
        OrigDesig: row.ORIGINALDESIGNATIONN || "",
        OrigDesigId: row.ORIGINALDESIGNATION?.toString() || "",
        OrigDept: row.ORIGINALDEPTN || "",
        OrigDeptId: row.ORIGINALDEPT?.toString() || "",
        OrigPayscale: row.ORIGINALPAYSCALEN || "",
        OrigPayscaleId: row.ORIGINALPAYSCALE?.toString() || "",
        RevDesig: row.REVISEDDESIGNATIONN || "",
        RevDesigId: row.REVISEDDESIGNATION?.toString() || "",
        RevDept: row.REVISEDDEPTN || "",
        RevDeptId: row.REVISEDDEPT?.toString() || "",
        RevPayscale: row.REVISEDPAYSCALEN || "",
        RevPayscaleId: row.REVISEDPAYSCALE?.toString() || "",
        OrderNo: row.ORDERNO || "",
        OrderDate: row.ORDERDATE || "",
        Details: row.DETAILS || "",
      }));
      setPromTableData(mapped);
    } catch (error) {
      Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load promotion data",
      });
    }
  };

  // ==================== INCREMENT - ADD / UPDATE ====================
  const handleAddOrUpdateIncrement = () => {
    if (!incForm.origPayscaleId || incForm.origPayscaleId === "0") {
      Swal.fire({ text: "Please select Increment Original payscale", icon: "warning" });
      return;
    }
    if (!incForm.revPayscaleId || incForm.revPayscaleId === "0") {
      Swal.fire({ text: "Please select Increment Revised payscale", icon: "warning" });
      return;
    }
    if (!incForm.orderNo.trim()) {
      Swal.fire({ text: "Increment order no cannot be blank", icon: "warning" });
      return;
    }
    if (!incForm.orderDate) {
      Swal.fire({ text: "Please select Increment order date", icon: "warning" });
      return;
    }
    if (!incForm.details.trim()) {
      Swal.fire({ text: "Increment order details cannot be blank", icon: "warning" });
      return;
    }

    const origLabel =
      payscaleOptions.find((p) => p.value === incForm.origPayscaleId)?.label || "";
    const revLabel =
      payscaleOptions.find((p) => p.value === incForm.revPayscaleId)?.label || "";

    const record = {
      Id: incEditId !== null ? incEditId : getNextId(incTableData),
      OrigPayscale: origLabel,
      OrigPayscaleId: incForm.origPayscaleId,
      RevPayscale: revLabel,
      RevPayscaleId: incForm.revPayscaleId,
      OrderNo: incForm.orderNo.trim(),
      OrderDate: formatDate(incForm.orderDate),
      Details: incForm.details.trim(),
    };

    if (incEditId !== null) {
      setIncTableData(incTableData.map((r) => (r.Id === incEditId ? record : r)));
      setIncEditId(null);
    } else {
      setIncTableData([...incTableData, record]);
    }

    clearIncForm();
  };

  const clearIncForm = () => {
    setIncForm({
      origPayscaleId: "",
      revPayscaleId: "",
      orderNo: "",
      orderDate: getToday(),
      details: "",
    });
  };

  const handleUpdateIncrementRow = (row) => {
    setIncForm({
      origPayscaleId: row.OrigPayscaleId,
      revPayscaleId: row.RevPayscaleId,
      orderNo: row.OrderNo,
      orderDate: parseDate(row.OrderDate),
      details: row.Details,
    });
    setIncEditId(row.Id);
  };

  const handleDeleteIncrementRow = (id) => {
    setIncTableData(incTableData.filter((r) => r.Id !== id));
    if (incEditId === id) {
      setIncEditId(null);
      clearIncForm();
    }
  };

  // ==================== PROMOTION - ADD / UPDATE ====================
  const handleAddOrUpdatePromotion = () => {
    if (!promForm.origDesigId || promForm.origDesigId === "0") {
      Swal.fire({ text: "Please select Promotion Original designation", icon: "warning" });
      return;
    }
    if (!promForm.origDeptId || promForm.origDeptId === "0") {
      Swal.fire({ text: "Please select Promotion Original department", icon: "warning" });
      return;
    }
    if (!promForm.origPayscaleId || promForm.origPayscaleId === "0") {
      Swal.fire({ text: "Please select Promotion Original payscale", icon: "warning" });
      return;
    }
    if (!promForm.revDesigId || promForm.revDesigId === "0") {
      Swal.fire({ text: "Please select Promotion Revised designation", icon: "warning" });
      return;
    }
    if (!promForm.revDeptId || promForm.revDeptId === "0") {
      Swal.fire({ text: "Please select Promotion Revised department", icon: "warning" });
      return;
    }
    if (!promForm.revPayscaleId || promForm.revPayscaleId === "0") {
      Swal.fire({ text: "Please select Promotion Revised payscale", icon: "warning" });
      return;
    }
    if (!promForm.orderNo.trim()) {
      Swal.fire({ text: "Promotion order no cannot be blank", icon: "warning" });
      return;
    }
    if (!promForm.orderDate) {
      Swal.fire({ text: "Please select Promotion order date", icon: "warning" });
      return;
    }
    if (!promForm.details.trim()) {
      Swal.fire({ text: "Promotion order details cannot be blank", icon: "warning" });
      return;
    }

    const findLabel = (options, value) =>
      options.find((o) => o.value === value)?.label || "";

    const record = {
      Id: promEditId !== null ? promEditId : getNextId(promTableData),
      OrigDesig: findLabel(desigOptions, promForm.origDesigId),
      OrigDesigId: promForm.origDesigId,
      OrigDept: findLabel(deptOptions, promForm.origDeptId),
      OrigDeptId: promForm.origDeptId,
      OrigPayscale: findLabel(payscaleOptions, promForm.origPayscaleId),
      OrigPayscaleId: promForm.origPayscaleId,
      RevDesig: findLabel(desigOptions, promForm.revDesigId),
      RevDesigId: promForm.revDesigId,
      RevDept: findLabel(deptOptions, promForm.revDeptId),
      RevDeptId: promForm.revDeptId,
      RevPayscale: findLabel(payscaleOptions, promForm.revPayscaleId),
      RevPayscaleId: promForm.revPayscaleId,
      OrderNo: promForm.orderNo.trim(),
      OrderDate: formatDate(promForm.orderDate),
      Details: promForm.details.trim(),
    };

    if (promEditId !== null) {
      setPromTableData(promTableData.map((r) => (r.Id === promEditId ? record : r)));
      setPromEditId(null);
    } else {
      setPromTableData([...promTableData, record]);
    }

    clearPromForm();
  };

  const clearPromForm = () => {
    setPromForm({
      origDesigId: "",
      origDeptId: "",
      origPayscaleId: "",
      revDesigId: "",
      revDeptId: "",
      revPayscaleId: "",
      orderNo: "",
      orderDate: getToday(),
      details: "",
    });
  };

  const handleUpdatePromotionRow = (row) => {
    setPromForm({
      origDesigId: row.OrigDesigId,
      origDeptId: row.OrigDeptId,
      origPayscaleId: row.OrigPayscaleId,
      revDesigId: row.RevDesigId,
      revDeptId: row.RevDeptId,
      revPayscaleId: row.RevPayscaleId,
      orderNo: row.OrderNo,
      orderDate: parseDate(row.OrderDate),
      details: row.Details,
    });
    setPromEditId(row.Id);
  };

  const handleDeletePromotionRow = (id) => {
    setPromTableData(promTableData.filter((r) => r.Id !== id));
    if (promEditId === id) {
      setPromEditId(null);
      clearPromForm();
    }
  };

  // ==================== PROCESS (STEP 2 / SAVE) ====================
  const handleProcess = async () => {
    try {
      if (incTableData.length === 0) {
        Swal.fire({ text: "Please Add At least One Increment Detail", icon: "warning" });
        return;
      }
      if (promTableData.length === 0) {
        Swal.fire({ text: "Please Add At least One Promotion Detail", icon: "warning" });
        return;
      }

      const str = incTableData
        .map(
          (r) =>
            `${r.OrigPayscaleId}$${r.RevPayscaleId}$${r.OrderNo}$${r.OrderDate}$${r.Details}`
        )
        .join("#");

      const strAT = promTableData
        .map(
          (r) =>
            `${r.OrigDesigId}$${r.OrigDeptId}$${r.OrigPayscaleId}$${r.RevDesigId}$${r.RevDeptId}$${r.RevPayscaleId}$${r.OrderNo}$${r.OrderDate}$${r.Details}`
        )
        .join("#");

      const payload = {
        userid: userId,
        ulbid: Number(ulbId),
        empid: Number(empIdEseva),
        esevaempid: Number(esevaEmpId),
        STR: str,
        STR_AT: strAT,
        mode: mode,
      };

      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${API(BASE_URL)}/insert-incr-prom`,
        payload,
        { headers: authHeaders }
      );

      Swal.close();

      const data = res?.data?.data || {};
      const errorCode = data.errorCode;
      const errorMsg = data.message || "Saved successfully";

      if (errorCode === 9999) {
        await Swal.fire({ text: errorMsg, icon: "info" });
        navigate("/Transactions/FrmESevaLoanNAdvance");
      } else {
        await Swal.fire({ text: errorMsg, icon: "success" });
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong",
      });
    }
  };

  // ==================== TABLE ROW BUILDERS ====================
  const buildIncrementRows = () =>
    incTableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      Actions: (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => handleUpdateIncrementRow(row)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-600 text-red-600 hover:bg-red-50"
            onClick={() => handleDeleteIncrementRow(row.Id)}
          >
            Delete
          </Button>
        </div>
      ),
    }));

  const buildPromotionRows = () =>
    promTableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      Actions: (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => handleUpdatePromotionRow(row)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-600 text-red-600 hover:bg-red-50"
            onClick={() => handleDeletePromotionRow(row.Id)}
          >
            Delete
          </Button>
        </div>
      ),
    }));

  // ==================== RENDER HELPER ====================
  const renderField = (label, content, required = false) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative">
      <div className="sm:w-48 shrink-0 flex justify-between items-center">
        <Label required={required} text={label} />
        <span>:</span>
      </div>
      <div className="w-full sm:w-72 focus-within:z-50">{content}</div>
    </div>
  );

  // ==================== RENDER ====================
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">
            Increment And Promotion
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          {/* ==================== INCREMENT SECTION ==================== */}
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">Increment</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 gap-y-4">
                {renderField(
                  "Original Payscale",
                  <Select
                    value={incForm.origPayscaleId}
                    onValueChange={(v) => updateIncForm("origPayscaleId", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {payscaleOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                  true
                )}

                {renderField(
                  "Revised Payscale",
                  <Select
                    value={incForm.revPayscaleId}
                    onValueChange={(v) => updateIncForm("revPayscaleId", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {payscaleOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                  true
                )}

                {renderField(
                  "Order No",
                  <Input
                    value={incForm.orderNo}
                    onChange={(e) => updateIncForm("orderNo", e.target.value)}
                  />,
                  true
                )}

                {renderField(
                  "Order Date",
                  <DatePicker
                    value={incForm.orderDate}
                    onChange={(d) => updateIncForm("orderDate", d)}
                  />,
                  true
                )}

                {renderField(
                  "Details",
                  <Input
                    value={incForm.details}
                    onChange={(e) => updateIncForm("details", e.target.value)}
                  />,
                  true
                )}
              </div>

              <div className="flex justify-center my-2">
                <Button onClick={handleAddOrUpdateIncrement}>
                  {incEditId !== null ? "Update Increment" : "Add"}
                </Button>
              </div>

              {incTableData.length > 0 && (
                <ShadCNTable
                  headers={[
                    "Delete",
                    "Sr No",
                    "Original Payscale",
                    "Revised Payscale",
                    "Order No",
                    "Order Date",
                    "Details",
                  ]}
                  data={buildIncrementRows()}
                  keyMapping={{
                    Delete: "Actions",
                    "Sr No": "SrNo",
                    "Original Payscale": "OrigPayscale",
                    "Revised Payscale": "RevPayscale",
                    "Order No": "OrderNo",
                    "Order Date": "OrderDate",
                    Details: "Details",
                  }}
                  pagination={true}
                  rowsPerPage={10}
                />
              )}
            </CardContent>
          </Card>

          {/* ==================== PROMOTION SECTION ==================== */}
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">Promotion</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 gap-y-4">
                {renderField(
                  "Original Designation",
                  <Select
                    value={promForm.origDesigId}
                    onValueChange={(v) => updatePromForm("origDesigId", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {desigOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                  true
                )}

                {renderField(
                  "Original Department",
                  <Select
                    value={promForm.origDeptId}
                    onValueChange={(v) => updatePromForm("origDeptId", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {deptOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                  true
                )}

                {renderField(
                  "Original Payscale",
                  <Select
                    value={promForm.origPayscaleId}
                    onValueChange={(v) => updatePromForm("origPayscaleId", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {payscaleOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                  true
                )}

                {renderField(
                  "Revised Designation",
                  <Select
                    value={promForm.revDesigId}
                    onValueChange={(v) => updatePromForm("revDesigId", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {desigOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                  true
                )}

                {renderField(
                  "Revised Department",
                  <Select
                    value={promForm.revDeptId}
                    onValueChange={(v) => updatePromForm("revDeptId", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {deptOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                  true
                )}

                {renderField(
                  "Revised Payscale",
                  <Select
                    value={promForm.revPayscaleId}
                    onValueChange={(v) => updatePromForm("revPayscaleId", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {payscaleOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                  true
                )}

                {renderField(
                  "Order No",
                  <Input
                    value={promForm.orderNo}
                    onChange={(e) => updatePromForm("orderNo", e.target.value)}
                  />,
                  true
                )}

                {renderField(
                  "Order Date",
                  <DatePicker
                    value={promForm.orderDate}
                    onChange={(d) => updatePromForm("orderDate", d)}
                  />,
                  true
                )}

                {renderField(
                  "Details",
                  <Input
                    value={promForm.details}
                    onChange={(e) => updatePromForm("details", e.target.value)}
                  />,
                  true
                )}
              </div>

              <div className="flex justify-center my-2">
                <Button onClick={handleAddOrUpdatePromotion}>
                  {promEditId !== null ? "Update Promotion" : "Add"}
                </Button>
              </div>

              {promTableData.length > 0 && (
                <ShadCNTable
                  headers={[
                    "Delete",
                    "Sr No",
                    "Orig Designation",
                    "Orig Department",
                    "Orig Payscale",
                    "Rev Designation",
                    "Rev Department",
                    "Rev Payscale",
                    "Order No",
                    "Order Date",
                    "Details",
                  ]}
                  data={buildPromotionRows()}
                  keyMapping={{
                    Delete: "Actions",
                    "Sr No": "SrNo",
                    "Orig Designation": "OrigDesig",
                    "Orig Department": "OrigDept",
                    "Orig Payscale": "OrigPayscale",
                    "Rev Designation": "RevDesig",
                    "Rev Department": "RevDept",
                    "Rev Payscale": "RevPayscale",
                    "Order No": "OrderNo",
                    "Order Date": "OrderDate",
                    Details: "Details",
                  }}
                  pagination={true}
                  rowsPerPage={10}
                />
              )}
            </CardContent>
          </Card>

          {/* ==================== ACTION BUTTONS ==================== */}
          <div className="flex justify-center gap-4 pt-2 border-t">
            <Button onClick={handleProcess} className="min-w-32">
              Process
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmESevaIncrAndPromotion;