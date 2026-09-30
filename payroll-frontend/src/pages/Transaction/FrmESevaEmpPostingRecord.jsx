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
import ShadCNTable from "@/components/ui/table";

const API = (BASE_URL) => `${BASE_URL}/api/FrmESevaEmpPostingRecord`;

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

const FrmESevaEmpPostingRecord = () => {
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
    fromDate: null,
    toDate: null,
    postHeldBy: "",
    deptName: "",
    designation: "",
    serviceId: "",
    purpose: "",
    signatureFile: null,
  });

  const [tableData, setTableData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // ==================== HELPERS ====================
  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const showAlert = async (text, redirectTo = null) => {
    await Swal.fire({ text });
    if (redirectTo) navigate(redirectTo);
  };

  const getNextId = (data) =>
    data.length > 0 ? Math.max(...data.map((r) => r.Id)) + 1 : 1;

  // ==================== FETCH SERVICE DROPDOWN ====================
  const fetchServices = async () => {
    try {
      const res = await axios.post(
        `${API(BASE_URL)}/service-dropdown`,
        {},
        { headers: authHeaders }
      );
      const rows = res?.data?.data?.data || [];
      setServiceOptions(
        rows.map((r) => ({
          value: r.VALUE_ID?.toString(),
          label: r.DISPLAY_TEXT,
        }))
      );
    } catch (e) {
      console.error("Failed to fetch services:", e);
    }
  };

  // ==================== INITIAL LOAD ====================
  useEffect(() => {

    // if (!empIdEseva) {
    //   showAlert("Invalid Employee Id.", "/Transactions/FrmEsevaEmpList");
    //   return;
    // }
    // if (!esevaEmpId) {
    //   showAlert(
    //     "Please enter Personal information first.",
    //     "/Transactions/FrmESevaEmpMaster?@=1"
    //   );
    //   return;
    // }

    const today = new Date();
    setForm((prev) => ({ ...prev, fromDate: today, toDate: today }));

    fetchServices();

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
        `${API(BASE_URL)}/posting-record`,
        payload,
        { headers: authHeaders }
      );

      const rows = res?.data?.data?.data || [];

      const mapped = rows.map((row, idx) => {
        const signBase64 = row.BLOB_SIGN || null;
        return {
          Id: idx + 1,
          FromDate: row.FROMDATE || "",
          ToDate: row.TODATE || "",
          PostHeldBy: row.POSTHELD || "",
          Department: row.DEPARTMENTNAME || "",
          Designation: row.DESIGNATION || "",
          Service: row.SERVICE || "",
          ServiceId: row.SERVICEID?.toString() || "",
          Purpose: row.PURPOSE || "",
          SignatureBase64: signBase64
            ? `data:image/png;base64,${signBase64}`
            : null,
          SignatureFile: null,
        };
      });

      setTableData(mapped);
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

  // ==================== FILE UPLOAD ====================
  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({ text: "Please upload a valid image file.", icon: "warning" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSignaturePreview(reader.result);
      updateForm("signatureFile", file);
    };
    reader.readAsDataURL(file);
  };

  // ==================== ADD / UPDATE ====================
  const handleAddOrUpdate = () => {
    if (!form.fromDate) {
      Swal.fire({ text: "Please select from date.", icon: "warning" });
      return;
    }
    if (!form.toDate) {
      Swal.fire({ text: "Please select to date.", icon: "warning" });
      return;
    }
    if (new Date(form.fromDate) > new Date(form.toDate)) {
      Swal.fire({
        text: "To date should be greater than from date.",
        icon: "warning",
      });
      return;
    }
    if (!form.serviceId || form.serviceId === "0") {
      Swal.fire({ text: "Please select service.", icon: "warning" });
      return;
    }

    const serviceLabel =
      serviceOptions.find((s) => s.value === form.serviceId)?.label || "";

    const record = {
      Id: editId !== null ? editId : getNextId(tableData),
      FromDate: formatDate(form.fromDate),
      ToDate: formatDate(form.toDate),
      PostHeldBy: form.postHeldBy.trim(),
      Department: form.deptName.trim(),
      Designation: form.designation.trim(),
      Service: serviceLabel,
      ServiceId: form.serviceId,
      Purpose: form.purpose.trim(),
      SignatureFile: form.signatureFile, // File object
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
    setForm((prev) => ({
      ...prev,
      postHeldBy: "",
      deptName: "",
      designation: "",
      serviceId: "",
      purpose: "",
      signatureFile: null,
    }));
    setSignaturePreview(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  // ==================== UPDATE ROW ====================
  const handleUpdateRow = (row) => {
    setForm({
      fromDate: parseDate(row.FromDate),
      toDate: parseDate(row.ToDate),
      postHeldBy: row.PostHeldBy,
      deptName: row.Department,
      designation: row.Designation,
      serviceId: row.ServiceId,
      purpose: row.Purpose,
      signatureFile: row.SignatureFile || null,
    });
    setSignaturePreview(row.SignatureBase64);
    setEditId(row.Id);
  };

  // ==================== DELETE ROW ====================
  const handleDeleteRow = (id) => {
    setTableData(tableData.filter((r) => r.Id !== id));
    if (editId === id) {
      setEditId(null);
      clearFields();
    }
  };

  // ==================== SAVE / PROCESS ====================
  const handleProcess = async () => {
    try {
      if (tableData.length === 0) {
        Swal.fire({
          text: "Please Add At least One Posting Record",
          icon: "warning",
        });
        return;
      }

      const str = tableData
        .map(
          (row) =>
            `${row.FromDate}$${row.ToDate}$${row.PostHeldBy}$${row.Department}$${row.Designation}$${row.Id}$${row.ServiceId}$${row.Purpose}`
        )
        .join("#");

      const sigMeta = [];
      const formData = new FormData();

      tableData.forEach((row) => {
        let file = row.SignatureFile;

        if (!file && row.SignatureBase64) {
          file = dataURLtoFile(
            row.SignatureBase64,
            `sign_${row.Id}.png`
          );
        }

        if (file) {
          sigMeta.push({ recordId: row.Id, seq: row.Id });
          formData.append(`sign_${row.Id}`, file);
        }
      });

      formData.append("userid", userId || "");
      formData.append("mode", mode);
      formData.append("empid", Number(empIdEseva));
      formData.append("ulbid", Number(ulbId));
      formData.append("esevaempid", Number(esevaEmpId));
      formData.append("STR", str);
      formData.append("signatures", JSON.stringify(sigMeta));

      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${API(BASE_URL)}/insert-posting-record`,
        formData,
        {
          headers: {
            ...authHeaders,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.close();

      const data = res?.data?.data || {};
      const errorCode = data.errorCode;
      const errorMsg = data.message || "Saved successfully";

      if (errorCode === 9999 || data.success) {
        await Swal.fire({ text: errorMsg, icon: "success" });
        navigate("/Transactions/FrmESevaEmpLeaveRecord", {
          state: { empId: empIdEseva, esevaEmpId, mode },
        });
      } else {
        await Swal.fire({ text: errorMsg, icon: "info" });
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

  // ==================== TABLE ROW BUILDER ====================
  const buildTableRows = () =>
    tableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      SignatureImage: row.SignatureBase64 ? (
        <img
          src={row.SignatureBase64}
          alt="Signature"
          className="h-10 w-auto object-contain"
        />
      ) : (
        <span className="text-gray-400 text-xs">No signature</span>
      ),
      Actions: (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-red-600 text-red-600 hover:bg-red-50"
            onClick={() => handleDeleteRow(row.Id)}
          >
            Delete
          </Button>
        </div>
      ),
    }));

  // ==================== RENDER HELPERS ====================
  const renderField = (label, content, required = false) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative">
      <div className="sm:w-44 shrink-0 flex justify-between items-center">
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
          <CardTitle className="text-xl font-bold">Posting Record</CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          {/* ============ ENTRY FORM ============ */}
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">
                Posting Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 gap-y-4">
                {renderField(
                  "From Date",
                  <DatePicker
                    value={form.fromDate}
                    onChange={(d) => updateForm("fromDate", d)}
                  />,
                  true
                )}

                {renderField(
                  "To Date",
                  <DatePicker
                    value={form.toDate}
                    onChange={(d) => updateForm("toDate", d)}
                  />,
                  true
                )}

                {renderField(
                  "Post Held",
                  <Input
                    value={form.postHeldBy}
                    onChange={(e) => updateForm("postHeldBy", e.target.value)}
                  />
                )}

                {renderField(
                  "Department Name",
                  <Input
                    value={form.deptName}
                    onChange={(e) => updateForm("deptName", e.target.value)}
                  />
                )}

                {renderField(
                  "Designation",
                  <Input
                    value={form.designation}
                    onChange={(e) => updateForm("designation", e.target.value)}
                  />
                )}

                {renderField(
                  "Sign",
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {signaturePreview && (
                      <div className="border rounded p-1 w-fit">
                        <img
                          src={signaturePreview}
                          alt="Signature Preview"
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}

                {renderField(
                  "Service",
                  <Select
                    value={form.serviceId}
                    onValueChange={(v) => updateForm("serviceId", v)}
                  >
                    <SelectTrigger className="w-full sm:w-50">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                  true
                )}

                {renderField(
                  "Purpose",
                  <Input
                    value={form.purpose}
                    onChange={(e) => updateForm("purpose", e.target.value)}
                  />
                )}
              </div>

              <div className="flex justify-center my-4">
                <Button onClick={handleAddOrUpdate}>
                  {editId !== null ? "Update" : "Add Posting Record"}
                </Button>
              </div>

              {tableData.length > 0 && (
                <ShadCNTable
                  headers={[
                    "Delete",
                    "Sr No",
                    "From Date",
                    "To Date",
                    "Post Held",
                    "Department",
                    "Designation",
                    "Signature",
                  ]}
                  data={buildTableRows()}
                  keyMapping={{
                    Delete: "Actions",
                    "Sr No": "SrNo",
                    "From Date": "FromDate",
                    "To Date": "ToDate",
                    "Post Held": "PostHeldBy",
                    Department: "Department",
                    Designation: "Designation",
                    Signature: "SignatureImage",
                  }}
                  pagination={true}
                  rowsPerPage={10}
                />
              )}
            </CardContent>
          </Card>

          {/* ============ ACTION BUTTONS ============ */}  
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

export default FrmESevaEmpPostingRecord;