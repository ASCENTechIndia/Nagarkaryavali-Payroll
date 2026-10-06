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
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";

const API = (BASE_URL) => `${BASE_URL}/api/FrmESevaIncrAndPromotion`;

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

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const FrmESevaIncrAndPromotion = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;

  const navigate = useNavigate();
  const location = useLocation();
  console.log("promo",{location});
  const [searchParams] = useSearchParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const queryMode = searchParams.get("@");
  const mode = queryMode === "1" ? 2 : 1;

  const { empId, esevaEmployeeID } = useOutletContext();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const empIdEseva =
    empId ||
    location?.state?.empId ||
    storedUser?.empId ||
    storedUser?.employeeId;

  const resolveEsevaEmpId = () => {
    if (esevaEmployeeID) return Number(esevaEmployeeID);

    const fromState = location?.state?.esevaEmpId;
    if (fromState) return Number(fromState);

    const fromUrl = searchParams.get("esevaEmpId");
    if (fromUrl) return Number(fromUrl);

    const fromSession =
      sessionStorage.getItem("empIdEseva") ||
      sessionStorage.getItem("esevaempid");
    if (fromSession) return Number(fromSession);

    const fromLocal =
      storedUser?.esevaEmployeeID || storedUser?.esevaEmpId;
    if (fromLocal) return Number(fromLocal);

    return 0;
  };

  const esevaEmpId = resolveEsevaEmpId();

  const authHeaders = { Authorization: `Bearer ${token}` };

  const [incForm, setIncForm] = useState({
    origPayscaleId: "", revPayscaleId: "", orderNo: "",
    orderDate: getToday(), details: "",
  });

  const [promForm, setPromForm] = useState({
    origDesigId: "", origDeptId: "", origPayscaleId: "",
    revDesigId: "", revDeptId: "", revPayscaleId: "",
    orderNo: "", orderDate: getToday(), details: "",
  });

  const [incTableData, setIncTableData] = useState([]);
  const [promTableData, setPromTableData] = useState([]);

  const [incEditId, setIncEditId] = useState(null);
  const [promEditId, setPromEditId] = useState(null);

  const [payscaleOptions, setPayscaleOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [desigOptions, setDesigOptions] = useState([]);

  const updateIncForm = (field, value) =>
    setIncForm((prev) => ({ ...prev, [field]: value }));
  const updatePromForm = (field, value) =>
    setPromForm((prev) => ({ ...prev, [field]: value }));

  const showAlert = async (text, redirectTo = null) => {
    await Swal.fire({ text });
    if (redirectTo) navigate(redirectTo);
  };

  useEffect(() => {
    if (!token || !empIdEseva) return;

    if (esevaEmpId) {
      sessionStorage.setItem("empIdEseva", String(esevaEmpId));
    }

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
          await Promise.all([
            loadExistingIncrementData(),
            loadExistingPromotionData(),
          ]);
        }
      } finally {
        requestAnimationFrame(() => Swal.close());
      }
    };

    load();
  }, [token, mode, empIdEseva, esevaEmpId]);

  const fetchDropdowns = async () => {
    const payload = { ulbid: Number(ulbId) };
    try {
      const [payRes, desigRes, deptRes] = await Promise.allSettled([
        axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/payscale-list`,    payload, { headers: authHeaders }),
        axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/designation-list`, payload, { headers: authHeaders }),
        axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,     payload, { headers: authHeaders }),
      ]);

      const rowsOf = (r) => (r.status === "fulfilled" ? unwrapRows(r.value) : []);

      setPayscaleOptions(
        Array.from(
          new Map(
            rowsOf(payRes)
              .filter((r) => r.PAYSCALEID != null)
              .map((r) => [
                r.PAYSCALEID.toString(),
                { value: r.PAYSCALEID.toString(), label: r.PAYSCALENAME ?? "" },
              ])
          ).values()
        )
      );

      setDesigOptions(
        Array.from(
          new Map(
            rowsOf(desigRes)
              .filter((r) => r.DESIG_ID != null)
              .map((r) => [
                r.DESIG_ID.toString(),
                { value: r.DESIG_ID.toString(), label: r.DESIG_ENAME ?? "" },
              ])
          ).values()
        )
      );

      setDeptOptions(
        Array.from(
          new Map(
            rowsOf(deptRes)
              .filter((r) => r.DEPTID != null)
              .map((r) => [
                r.DEPTID.toString(),
                { value: r.DEPTID.toString(), label: r.DEPTNAME ?? "" },
              ])
          ).values()
        )
      );

    } catch (e) {
      console.error("Failed to fetch dropdowns:", e);
    }
  };

  const loadExistingIncrementData = async () => {
    try {
      const payload = {
        ulbId: Number(ulbId),
        empId: empIdEseva || 0,
        esevaEmpId: esevaEmpId || 0,
      };
      const res = await axios.post(
        `${API(BASE_URL)}/getIncrementList`,
        payload,
        { headers: authHeaders }
      );
      const rows = unwrapRows(res);
      const mapped = rows.map((row, idx) => ({
        Id: makeId(),
        OrigPayscale: pick(row, "ORIGINALPAYSCALEN", "originalpayscalen"),
        OrigPayscaleId: (pick(row, "ORIGINALPAYSCALE", "originalpayscale")).toString(),
        RevPayscale: pick(row, "REVISEDPAYSCALEN", "revisedpayscalen"),
        RevPayscaleId: (pick(row, "REVISEDPAYSCALE", "revisedpayscale")).toString(),
        OrderNo: pick(row, "ORDERNO", "orderno"),
        OrderDate: pick(row, "ORDERDATE", "orderdate"),
        Details: pick(row, "DETAILS", "details"),
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

  const loadExistingPromotionData = async () => {
    try {
      const payload = {
        ulbId: Number(ulbId),
        empId: empIdEseva || 0,
        esevaEmpId: esevaEmpId || 0,
      };
      const res = await axios.post(
        `${API(BASE_URL)}/getPromotionList`,
        payload,
        { headers: authHeaders }
      );
      const rows = unwrapRows(res);
      const mapped = rows.map((row, idx) => ({
        Id: makeId(),
        OrigDesig: pick(row, "ORIGINALDESIGNATIONN", "originaldesignationn"),
        OrigDesigId: (pick(row, "ORIGINALDESIGNATION", "originaldesignation")).toString(),
        OrigDept: pick(row, "ORIGINALDEPTN", "originaldeptn"),
        OrigDeptId: (pick(row, "ORIGINALDEPT", "originaldept")).toString(),
        OrigPayscale: pick(row, "ORIGINALPAYSCALEN", "originalpayscalen"),
        OrigPayscaleId: (pick(row, "ORIGINALPAYSCALE", "originalpayscale")).toString(),
        RevDesig: pick(row, "REVISEDDESIGNATIONN", "reviseddesignationn"),
        RevDesigId: (pick(row, "REVISEDDESIGNATION", "reviseddesignation")).toString(),
        RevDept: pick(row, "REVISEDDEPTN", "reviseddeptn"),
        RevDeptId: (pick(row, "REVISEDDEPT", "reviseddept")).toString(),
        RevPayscale: pick(row, "REVISEDPAYSCALEN", "revisedpayscalen"),
        RevPayscaleId: (pick(row, "REVISEDPAYSCALE", "revisedpayscale")).toString(),
        OrderNo: pick(row, "ORDERNO", "orderno"),
        OrderDate: pick(row, "ORDERDATE", "orderdate"),
        Details: pick(row, "DETAILS", "details"),
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

  const handleAddOrUpdateIncrement = () => {
    if (!incForm.origPayscaleId || incForm.origPayscaleId === "0") {
      Swal.fire({ text: "Please select Increment Original payscale" });
      return;
    }
    if (!incForm.revPayscaleId || incForm.revPayscaleId === "0") {
      Swal.fire({ text: "Please select Increment Revised payscale" });
      return;
    }
    if (!incForm.orderNo.trim()) {
      Swal.fire({ text: "Increment order no cannot be blank" });
      return;
    }
    if (!incForm.orderDate) {
      Swal.fire({ text: "Please select Increment order date" });
      return;
    }
    if (!incForm.details.trim()) {
      Swal.fire({ text: "Increment order details cannot be blank" });
      return;
    }

    const origLabel = payscaleOptions.find((p) => p.value === incForm.origPayscaleId)?.label || "";
    const revLabel = payscaleOptions.find((p) => p.value === incForm.revPayscaleId)?.label || "";

    const record = {
      Id: incEditId !== null ? incEditId : makeId(),
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
      origPayscaleId: "", revPayscaleId: "", orderNo: "",
      orderDate: getToday(), details: "",
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

  const handleAddOrUpdatePromotion = () => {
    const p = promForm;
    if (!p.origDesigId || p.origDesigId === "0")
      return Swal.fire({ text: "Please select Promotion Original designation" });
    if (!p.origDeptId || p.origDeptId === "0")
      return Swal.fire({ text: "Please select Promotion Original department" });
    if (!p.origPayscaleId || p.origPayscaleId === "0")
      return Swal.fire({ text: "Please select Promotion Original payscale" });
    if (!p.revDesigId || p.revDesigId === "0")
      return Swal.fire({ text: "Please select Promotion Revised designation" });
    if (!p.revDeptId || p.revDeptId === "0")
      return Swal.fire({ text: "Please select Promotion Revised department" });
    if (!p.revPayscaleId || p.revPayscaleId === "0")
      return Swal.fire({ text: "Please select Promotion Revised payscale" });
    if (!p.orderNo.trim())
      return Swal.fire({ text: "Promotion order no cannot be blank" });
    if (!p.orderDate)
      return Swal.fire({ text: "Please select Promotion order date" });
    if (!p.details.trim())
      return Swal.fire({ text: "Promotion order details cannot be blank" });

    const findLabel = (options, value) => options.find((o) => o.value === value)?.label || "";

    const record = {
      Id: promEditId !== null ? promEditId : makeId(),
      OrigDesig: findLabel(desigOptions, p.origDesigId),
      OrigDesigId: p.origDesigId,
      OrigDept: findLabel(deptOptions, p.origDeptId),
      OrigDeptId: p.origDeptId,
      OrigPayscale: findLabel(payscaleOptions, p.origPayscaleId),
      OrigPayscaleId: p.origPayscaleId,
      RevDesig: findLabel(desigOptions, p.revDesigId),
      RevDesigId: p.revDesigId,
      RevDept: findLabel(deptOptions, p.revDeptId),
      RevDeptId: p.revDeptId,
      RevPayscale: findLabel(payscaleOptions, p.revPayscaleId),
      RevPayscaleId: p.revPayscaleId,
      OrderNo: p.orderNo.trim(),
      OrderDate: formatDate(p.orderDate),
      Details: p.details.trim(),
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
      origDesigId: "", origDeptId: "", origPayscaleId: "",
      revDesigId: "", revDeptId: "", revPayscaleId: "",
      orderNo: "", orderDate: getToday(), details: "",
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

  const handleProcess = async () => {

    try {

      if (mode === 2 && !esevaEmpId) {
        return Swal.fire({
          text: "Eseva Employee ID not found. Please re-open from the list.",
        });
      }

      if (incTableData.length === 0) {
        Swal.fire({ text: "Please Add At least One Increment Detail" });
        return;
      }
      if (promTableData.length === 0) {
        Swal.fire({ text: "Please Add At least One Promotion Detail" });
        return;
      }

      const str = incTableData
        .map((r) => `${r.OrigPayscaleId}$${r.RevPayscaleId}$${r.OrderNo}$${r.OrderDate}$${r.Details}`)
        .join("#");

      const strAT = promTableData
        .map((r) =>
          `${r.OrigDesigId}$${r.OrigDeptId}$${r.OrigPayscaleId}$${r.RevDesigId}$${r.RevDeptId}$${r.RevPayscaleId}$${r.OrderNo}$${r.OrderDate}$${r.Details}`
        )
        .join("#");

      const payload = {
        userId,
        mode,
        empId: empIdEseva || 0,
        ulbId: Number(ulbId),
        esevaEmpId: mode === 1 ? 0 : (esevaEmpId || 0), 
        incStr: str,
        proStr: strAT,
      };

      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${API(BASE_URL)}/insertIncrementAndPromotion`,
        payload,
        { headers: authHeaders }
      );

      Swal.close();

      const data = res?.data?.data || {};
      const errorCode = data.errorCode;
      const errorMsg = data.errorMsg || data.message || "Saved successfully";

      if (errorCode === 9999 || data.success) {

        const resolvedId = data?.esevaEmpId ?? esevaEmpId;

        if (resolvedId) {
          sessionStorage.setItem("empIdEseva", String(resolvedId));
        }

        await Swal.fire({ text: errorMsg });
        navigate("/Transactions/FrmESevaLoanNAdvance?@=1",
          {
            state: { empId: empIdEseva, esevaEmpId: data?.esevaEmpId, mode },
          }
        );

      } else {
        await Swal.fire({ text: errorMsg });
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

  const buildIncrementRows = () =>
    incTableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      Update: (
        <Button
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
          onClick={() => handleUpdateIncrementRow(row)}
        >
          Update
        </Button>
      ),
      Delete: (
        <Button
          variant="outline"
          size="sm"
          className="border-red-600 text-red-600 hover:bg-red-50"
          onClick={() => handleDeleteIncrementRow(row.Id)}
        >
          Delete
        </Button>
      ),
    }));

  const buildPromotionRows = () =>
    promTableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      Update: (
        <Button
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
          onClick={() => handleUpdatePromotionRow(row)}
        >
          Update
        </Button>
      ),
      Delete: (
        <Button
          variant="outline"
          size="sm"
          className="border-red-600 text-red-600 hover:bg-red-50"
          onClick={() => handleDeletePromotionRow(row.Id)}
        >
          Delete
        </Button>
      ),
    }));

  const renderField = (label, content, required = false) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative">
      <div className="sm:w-48 shrink-0 flex justify-between items-center">
        <Label required={required} text={label} />
        <span>:</span>
      </div>
      <div className="w-full sm:w-72 focus-within:z-50">{content}</div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">Increment And Promotion</CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">Increment</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 gap-y-4">
                {renderField("Original Payscale",
                  <Select value={incForm.origPayscaleId} onValueChange={(v) => updateIncForm("origPayscaleId", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                    <SelectContent>
                      {payscaleOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </SelectContent>
                  </Select>, true
                )}
                {renderField("Revised Payscale",
                  <Select value={incForm.revPayscaleId} onValueChange={(v) => updateIncForm("revPayscaleId", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                    <SelectContent>
                      {payscaleOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </SelectContent>
                  </Select>, true
                )}
                {renderField("Order No",
                  <Input value={incForm.orderNo} onChange={(e) => updateIncForm("orderNo", e.target.value)} />, true
                )}
                {renderField("Order Date",
                  <DatePicker value={incForm.orderDate} onChange={(d) => updateIncForm("orderDate", d)} />, true
                )}
                {renderField("Details",
                  <Input value={incForm.details} onChange={(e) => updateIncForm("details", e.target.value)} />, true
                )}
              </div>

              <div className="flex justify-center gap-3 my-2">
                <Button onClick={handleAddOrUpdateIncrement}>
                  {incEditId !== null ? "Update Increment" : "Add"}
                </Button>
                {incEditId !== null && (
                  <Button variant="secondary" onClick={() => { setIncEditId(null); clearIncForm(); }}>
                    Cancel
                  </Button>
                )}
              </div>

              {incTableData.length > 0 && (
                <ShadCNTable
                  headers={[
                    "Delete",
                    "Update",
                    "Sr No",
                    "Original Payscale",
                    "Revised Payscale",
                    "Order No",
                    "Order Date",
                    "Details",
                  ]}
                  data={buildIncrementRows()}
                  keyMapping={{
                    Delete: "Delete",
                    Update: "Update",
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

          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">Promotion</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 gap-y-4">
                {renderField("Original Designation",
                  <Select value={promForm.origDesigId} onValueChange={(v) => updatePromForm("origDesigId", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                    <SelectContent>
                      {desigOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </SelectContent>
                  </Select>, true
                )}
                {renderField("Original Department",
                  <Select value={promForm.origDeptId} onValueChange={(v) => updatePromForm("origDeptId", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                    <SelectContent>
                      {deptOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </SelectContent>
                  </Select>, true
                )}
                {renderField("Original Payscale",
                  <Select value={promForm.origPayscaleId} onValueChange={(v) => updatePromForm("origPayscaleId", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                    <SelectContent>
                      {payscaleOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </SelectContent>
                  </Select>, true
                )}
                {renderField("Revised Designation",
                  <Select value={promForm.revDesigId} onValueChange={(v) => updatePromForm("revDesigId", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                    <SelectContent>
                      {desigOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </SelectContent>
                  </Select>, true
                )}
                {renderField("Revised Department",
                  <Select value={promForm.revDeptId} onValueChange={(v) => updatePromForm("revDeptId", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                    <SelectContent>
                      {deptOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </SelectContent>
                  </Select>, true
                )}
                {renderField("Revised Payscale",
                  <Select value={promForm.revPayscaleId} onValueChange={(v) => updatePromForm("revPayscaleId", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                    <SelectContent>
                      {payscaleOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </SelectContent>
                  </Select>, true
                )}
                {renderField("Order No",
                  <Input value={promForm.orderNo} onChange={(e) => updatePromForm("orderNo", e.target.value)} />, true
                )}
                {renderField("Order Date",
                  <DatePicker value={promForm.orderDate} onChange={(d) => updatePromForm("orderDate", d)} />, true
                )}
                {renderField("Details",
                  <Input value={promForm.details} onChange={(e) => updatePromForm("details", e.target.value)} />, true
                )}
              </div>

              <div className="flex justify-center gap-3 my-2">
                <Button onClick={handleAddOrUpdatePromotion}>
                  {promEditId !== null ? "Update Promotion" : "Add"}
                </Button>
                {promEditId !== null && (
                  <Button variant="secondary" onClick={() => { setPromEditId(null); clearPromForm(); }}>
                    Cancel
                  </Button>
                )}
              </div>

              {promTableData.length > 0 && (
                <ShadCNTable
                  headers={[
                    "Delete",
                    "Update",
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
                    Delete: "Delete",
                    Update: "Update",
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

          <div className="flex justify-center gap-4 pt-2 border-t">
            <Button onClick={handleProcess} className="min-w-32">Process</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmESevaIncrAndPromotion;