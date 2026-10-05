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
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";

const API = (BASE_URL) => `${BASE_URL}/api/FrmESevaLoanNAdvance`;

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
  if (!day || !month || !year) return null;
  return new Date(`${year}-${month}-${day}`);
};

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

const dataURLtoFile = (dataURL, filename) => {
  if (!dataURL) return null;
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};

// ==================== VALIDATORS ====================
const onlyDigits = (v = "") => /^[0-9]*$/.test(String(v));
const isFourDigits = (v = "") => /^[0-9]{4}$/.test(String(v));

const sanitizeDigits = (v = "", maxLen = null) => {
  const cleaned = String(v).replace(/\D/g, "");
  return maxLen ? cleaned.slice(0, maxLen) : cleaned;
};

const FrmESevaLoanNAdvance = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();
  const location = useLocation();
  console.log("loans",{location});
  const [searchParams] = useSearchParams();

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const queryMode = searchParams.get("@");
  const mode = queryMode === "1" ? 2 : 1;

  const { empId, esevaEmployeeID } = useOutletContext();
  const empIdEseva = empId;
  const esevaEmpId = esevaEmployeeID;

  const authHeaders = { Authorization: `Bearer ${token}` };

  const [form, setForm] = useState({
    sancAmt: "",
    purpose: "",
    noOfInst: "",
    roi: "",
    sancOrderNo: "",
    sancDate: null,
    firstInstDate: null,
    monthlyInst: "",
    finYear: "",
    interestBearAdv: "",
    amtOs: "",
    amtRecover: "",
    intAcc: "",
    remark: "",
    signatureFile: null,
  });

  const [tableData, setTableData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const getNextId = (data) =>
    data.length > 0 ? Math.max(...data.map((r) => r.Id)) + 1 : 1;

  const showAlert = async (text, redirectTo = null) => {
    await Swal.fire({ text });
    if (redirectTo) navigate(redirectTo);
  };

  useEffect(() => {
    if (!token || !empIdEseva) return;

    const today = new Date();
    setForm((prev) => ({ ...prev, sancDate: today, firstInstDate: today }));

    const load = async () => {
      Swal.fire({
        text: "Please wait",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
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
        `${API(BASE_URL)}/getLoanAdvanceList`,
        payload,
        { headers: authHeaders }
      );

      const rows = unwrapRows(res);

      const mapped = rows.map((row, idx) => {
        const signRaw = pick(row, "BLOB_LOANADV_SIGNDET", "blob_loanadv_signdet");
        const signBase64 =
          typeof signRaw === "string" && signRaw.length > 0 ? signRaw : null;

        return {
          Id: idx + 1,
          SancAmount: (pick(row, "NUM_LOANADV_SANCTIONEDAMT", "num_loanadv_sanctionedamt")).toString(),
          Purpose: pick(row, "VAR_LOANADV_PURPOSE", "var_loanadv_purpose"),
          NoOfInst: (pick(row, "NUM_LOANADV_NUMOFINSTALL", "num_loanadv_numofinstall")).toString(),
          ROI: pick(row, "VAR_LOANADV_ROI", "var_loanadv_roi"),
          SancOrderNo: pick(row, "VAR_LOANADV_SANCTORDERNO", "var_loanadv_sanctorderno"),
          SancDate: pick(row, "DAT_LOANADV_SANCTDATE", "dat_loanadv_sanctdate"),
          FirstInstDate: pick(row, "DAT_LOANADV_FINSTALLDAT", "dat_loanadv_finstalldat"),
          MonthlyInst: (pick(row, "NUM_LOANADV_MONTHINSTALL", "num_loanadv_monthinstall")).toString(),
          FinYear: pick(row, "VAR_LOANADV_FINANCYEAR", "var_loanadv_financyear"),
          InterestBearAdv: pick(row, "VAR_LOANADV_INTBERADV", "var_loanadv_intberadv"),
          AmtOs: (pick(row, "NUM_LOANADV_AMTOS", "num_loanadv_amtos")).toString(),
          AmtRecover: (pick(row, "NUM_LOANADV_AMTRECOVER", "num_loanadv_amtrecover")).toString(),
          IntAcc: pick(row, "VAR_LOANADV_INTACC", "var_loanadv_intacc"),
          Remark: pick(row, "VAR_LOANADV_REMARK", "var_loanadv_remark"),
          SignatureBase64: signBase64
            ? `data:image/png;base64,${signBase64}`
            : null,
          SignatureFile: null,
        };
      });

      setTableData(mapped);
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

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({ text: "Please upload a valid image file."});
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSignaturePreview(reader.result);
      updateForm("signatureFile", file);
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrUpdate = () => {
    // Existing checks
    if (!form.sancAmt.trim()) return Swal.fire({ text: "Please enter sanctioned amount."});
    if (!onlyDigits(form.sancAmt.trim()))
      return Swal.fire({ text: "Sanctioned Amount must contain digits only."});

    if (!form.noOfInst.trim())
      return Swal.fire({ text: "Please enter no of installments." });
    if (!onlyDigits(form.noOfInst.trim()))
      return Swal.fire({ text: "No Of Installments must contain digits only." });

    if (form.roi.trim() && !onlyDigits(form.roi.trim()))
      return Swal.fire({ text: "R.O.I must contain digits only." });

    if (form.sancOrderNo.trim() && !onlyDigits(form.sancOrderNo.trim()))
      return Swal.fire({ text: "Sanctioned Order No must contain digits only."});

    if (form.monthlyInst.trim() && !onlyDigits(form.monthlyInst.trim()))
      return Swal.fire({ text: "Monthly Installment must contain digits only." });

    if (form.amtOs.trim() && !onlyDigits(form.amtOs.trim()))
      return Swal.fire({ text: "Amount O/S must contain digits only." });

    if (form.amtRecover.trim() && !onlyDigits(form.amtRecover.trim()))
      return Swal.fire({ text: "Amount Recover must contain digits only." });

    // Financial Year: 4-digit limit (only when provided)
    if (form.finYear.trim() && !isFourDigits(form.finYear.trim()))
      return Swal.fire({ text: "Financial Year must be exactly 4 digits." });

    if (!form.sancDate) return Swal.fire({ text: "Please select sanctioned date."});
    if (!form.firstInstDate) return Swal.fire({ text: "Please select first installment date."});
    if (new Date(form.firstInstDate) < new Date(form.sancDate))
      return Swal.fire({ text: "First installment date should be greater than sanctioned date."});

    const record = {
      Id: editId !== null ? editId : getNextId(tableData),
      SancAmount: form.sancAmt.trim(),
      Purpose: form.purpose.trim(),
      NoOfInst: form.noOfInst.trim(),
      ROI: form.roi.trim(),
      SancOrderNo: form.sancOrderNo.trim(),
      SancDate: formatDate(form.sancDate),
      FirstInstDate: formatDate(form.firstInstDate),
      MonthlyInst: form.monthlyInst.trim(),
      FinYear: form.finYear.trim(),
      InterestBearAdv: form.interestBearAdv.trim(),
      AmtOs: form.amtOs.trim(),
      AmtRecover: form.amtRecover.trim(),
      IntAcc: form.intAcc.trim(),
      Remark: form.remark.trim(),
      SignatureFile: form.signatureFile,
      SignatureBase64:
        signaturePreview ||
        (editId !== null
          ? tableData.find((r) => r.Id === editId)?.SignatureBase64
          : null),
    };

    if (editId !== null) {
      setTableData(tableData.map((r) => (r.Id === editId ? record : r)));
      setEditId(null);
    } else {
      setTableData([...tableData, record]);
    }

    clearFields();
  };

  const clearFields = () => {
    const today = new Date();
    setForm({
      sancAmt: "", purpose: "", noOfInst: "", roi: "", sancOrderNo: "",
      sancDate: today, firstInstDate: today, monthlyInst: "", finYear: "",
      interestBearAdv: "", amtOs: "", amtRecover: "", intAcc: "", remark: "",
      signatureFile: null,
    });
    setSignaturePreview(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteRow = (id) => {
    setTableData(tableData.filter((r) => r.Id !== id));
    if (editId === id) {
      setEditId(null);
      clearFields();
    }
  };

  const handleProcess = async () => {
    try {
      if (tableData.length === 0) {
        return Swal.fire({
          text: "Please Add At least One Loan and Advance record",
        });
      }

      const loanAdvStr = tableData
        .map(
          (row) =>
            `${row.SancAmount}$${row.Purpose}$${row.NoOfInst}$${row.ROI}$${row.SancOrderNo}$${row.SancDate}$${row.FirstInstDate}$${row.MonthlyInst}$${row.FinYear}$${row.InterestBearAdv}$${row.AmtOs}$${row.AmtRecover}$${row.IntAcc}$${row.Remark}`
        )
        .join("#");

      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const insertRes = await axios.post(
        `${API(BASE_URL)}/insertLoanAndAdvance`,
        {
          userId,
          mode,
          empId: Number(empIdEseva),
          ulbId: Number(ulbId),
          esevaEmpId: mode === 1 ? 0 : Number(esevaEmpId),
          loanAdvStr,
        },
        { headers: authHeaders }
      );

      const insertData = insertRes?.data?.data || {};
      const errorCode = insertData.errorCode;
      const errorMsg = insertData.errorMsg || insertData.message || "Saved successfully";

      if (!(errorCode === 9999 || insertData.success)) {
        Swal.close();
        return Swal.fire({ text: errorMsg });
      }

      const sigRows = tableData.filter((row) => row.SignatureFile || row.SignatureBase64);
      for (const row of sigRows) {
        let file = row.SignatureFile;
        if (!file && row.SignatureBase64) {
          file = dataURLtoFile(row.SignatureBase64, `sign_${row.Id}.png`);
        }
        if (!file) continue;

        const fd = new FormData();
        fd.append("signature", file);
        fd.append("empId", Number(empIdEseva));
        fd.append("ulbId", Number(ulbId));
        fd.append("esevaEmpId", Number(esevaEmpId));

        await axios.post(
          `${API(BASE_URL)}/updateLoanAdvanceSignature`,
          fd
        );
      }

      Swal.close();
      await Swal.fire({ text: errorMsg});
      navigate("/Transactions/FrmEsevaEmpPenalAction?@=1");
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

  const buildTableRows = () =>
    tableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      SignatureImage: row.SignatureBase64 ? (
        <img src={row.SignatureBase64} alt="Signature" className="h-10 w-auto object-contain" />
      ) : (
        <span className="text-gray-400 text-xs">No signature</span>
      ),
      Delete: (
        <Button
          variant="outline"
          size="sm"
          className="border-red-600 text-red-600 hover:bg-red-50"
          onClick={() => handleDeleteRow(row.Id)}
        >
          Delete
        </Button>
      ),
    }));

  const renderField = (label, content, required = false) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative">
      <div className="sm:w-44 shrink-0 flex justify-between items-center">
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
          <CardTitle className="text-xl font-bold">Loan and Advance</CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">Loan Advances</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 gap-y-4">
                {renderField("Sanctioned Amount",
                  <Input
                    value={form.sancAmt}
                    inputMode="numeric"
                    onChange={(e) => updateForm("sancAmt", sanitizeDigits(e.target.value))}
                  />
                )}
                {renderField("Purpose",
                  <Input value={form.purpose} onChange={(e) => updateForm("purpose", e.target.value)} />
                )}
                {renderField("No Of Installments",
                  <Input
                    value={form.noOfInst}
                    inputMode="numeric"
                    onChange={(e) => updateForm("noOfInst", sanitizeDigits(e.target.value))}
                  />
                )}
                {renderField("ROI",
                  <Input
                    value={form.roi}
                    inputMode="numeric"
                    onChange={(e) => updateForm("roi", sanitizeDigits(e.target.value))}
                  />
                )}
                {renderField("Sanctioned Order No",
                  <Input
                    value={form.sancOrderNo}
                    inputMode="numeric"
                    onChange={(e) => updateForm("sancOrderNo", sanitizeDigits(e.target.value))}
                  />
                )}
                {renderField("Sanctioned Date",
                  <DatePicker value={form.sancDate} onChange={(d) => updateForm("sancDate", d)} />
                )}
                {renderField("First Installment Date",
                  <DatePicker value={form.firstInstDate} onChange={(d) => updateForm("firstInstDate", d)} />
                )}
                {renderField("Monthly Installment",
                  <Input
                    value={form.monthlyInst}
                    inputMode="numeric"
                    onChange={(e) => updateForm("monthlyInst", sanitizeDigits(e.target.value))}
                  />
                )}
                {renderField("Financial Year",
                  <Input
                    value={form.finYear}
                    maxLength={4}
                    inputMode="numeric"
                    onChange={(e) => updateForm("finYear", sanitizeDigits(e.target.value, 4))}
                  />
                )}
                {renderField("Interest Bearing Advances",
                  <Input value={form.interestBearAdv} onChange={(e) => updateForm("interestBearAdv", e.target.value)} />
                )}
                {renderField("Amount O/S",
                  <Input
                    value={form.amtOs}
                    inputMode="numeric"
                    onChange={(e) => updateForm("amtOs", sanitizeDigits(e.target.value))}
                  />
                )}
                {renderField("Amount Recover",
                  <Input
                    value={form.amtRecover}
                    inputMode="numeric"
                    onChange={(e) => updateForm("amtRecover", sanitizeDigits(e.target.value))}
                  />
                )}
                {renderField("Int. ACC",
                  <Input value={form.intAcc} onChange={(e) => updateForm("intAcc", e.target.value)} />
                )}
                {renderField("Signature Details",
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {signaturePreview && (
                      <div className="border rounded p-1 w-fit">
                        <img src={signaturePreview} alt="Signature Preview" className="h-16 w-auto object-contain" />
                      </div>
                    )}
                  </div>
                )}
                {renderField("Remarks",
                  <Input value={form.remark} onChange={(e) => updateForm("remark", e.target.value)} />
                )}
              </div>

              <div className="flex justify-center gap-3 my-4">
                <Button onClick={handleAddOrUpdate}>
                  {editId !== null ? "Update" : "Add"}
                </Button>
                {editId !== null && (
                  <Button variant="secondary" onClick={() => { setEditId(null); clearFields(); }}>
                    Cancel
                  </Button>
                )}
              </div>

              {tableData.length > 0 && (
                <div className="w-full overflow-x-auto rounded-md border">
                  <div className="min-w-[1600px]">
                    <ShadCNTable
                      headers={[
                        "Delete",
                        "Sr No",
                        "Sanctioned Amount",
                        "Purpose",
                        "No Of Installments",
                        "ROI",
                        "Sanctioned Order No",
                        "Sanctioned Date",
                        "First Installment Date",
                        "Monthly Installment",
                        "Financial Year",
                        "Interest Bearing Advances",
                        "Amt O/S",
                        "Amount Recover",
                        "Int. ACC",
                        "Signature Details",
                        "Remarks",
                      ]}
                      data={buildTableRows()}
                      keyMapping={{
                        Delete: "Delete",
                        "Sr No": "SrNo",
                        "Sanctioned Amount": "SancAmount",
                        Purpose: "Purpose",
                        "No Of Installments": "NoOfInst",
                        ROI: "ROI",
                        "Sanctioned Order No": "SancOrderNo",
                        "Sanctioned Date": "SancDate",
                        "First Installment Date": "FirstInstDate",
                        "Monthly Installment": "MonthlyInst",
                        "Financial Year": "FinYear",
                        "Interest Bearing Advances": "InterestBearAdv",
                        "Amt O/S": "AmtOs",
                        "Amount Recover": "AmtRecover",
                        "Int. ACC": "IntAcc",
                        "Signature Details": "SignatureImage",
                        Remarks: "Remark",
                      }}
                      pagination={true}
                      rowsPerPage={10}
                      className="min-w-[1600px]"
                    />
                  </div>
                </div>
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

export default FrmESevaLoanNAdvance;