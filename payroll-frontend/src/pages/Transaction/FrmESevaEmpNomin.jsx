import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
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
import ShadCNTable from "@/components/ui/table";

const FrmESevaEmpNomin = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();
  const location = useLocation();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const empId =
    location.state?.empId || Number(sessionStorage.getItem("EmpidEseva"));
  const esevaEmpId =
    location.state?.esevaEmpId || Number(sessionStorage.getItem("esevaempid"));
  const mode = location.state?.mode || (esevaEmpId ? 2 : 1);

  // ==================== STATE ====================
  const [accHeadOptions, setAccHeadOptions] = useState([]);
  const [selectedAccHead, setSelectedAccHead] = useState("");
  const [nomineeAlternate, setNomineeAlternate] = useState("");
  const [percentage, setPercentage] = useState("");
  const [tableData, setTableData] = useState([]);
  const [editId, setEditId] = useState(null);

  // ==================== INIT ====================
  useEffect(() => {
    if (!token) return;

    // if (!empId) {
    //   Swal.fire({ text: "Invalid Employee Id.", icon: "warning" }).then(() => {
    //     navigate("/Transactions/FrmEsevaEmpList");
    //   });
    //   return;
    // }

    if (mode === 2 && !esevaEmpId) {
      navigate("/Transactions/FrmEsevaEmpList");
      return;
    }

    fetchAccHeadOptions();

    if (mode === 2 && empId && esevaEmpId) {
      bindGrid();
    }
  }, [token, mode, empId, esevaEmpId]);

  // ==================== ACCOUNT HEAD DROPDOWN ====================
  const fetchAccHeadOptions = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmESevaEmpNomin/accounthead-dropdown`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rows = res?.data?.data || [];

      setAccHeadOptions(
        rows.map((r) => ({
          value: r.VALUE_ID?.toString(),
          label: r.DISPLAY_TEXT,
        }))
      );
    } catch (error) {
      console.error("Account head dropdown error:", error);
      setAccHeadOptions([]);
    }
  };

  // ==================== BIND GRID (Edit Mode) ====================
  const bindGrid = async () => {
    try {
      Swal.fire({
        text: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        ulbid: Number(ulbId),
        empId: Number(empId),
        esevaEmpId: Number(esevaEmpId),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmESevaEmpNomin/nomination-data`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rows = res?.data?.data || [];

      if (rows.length > 0) {
        const mapped = rows.map((row, idx) => ({
          Id: idx + 1,
          AccountHead: row.ACCOUNTHEAD || "",
          AccountHeadId: row.ACCOUNTHEADID?.toString() || "",
          Nominee: row.NOMINEE || "",
          Percentage: row.PERCENTAGE?.toString() || "",
        }));

        setTableData(mapped);
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
        icon: "error",
      });
    }
  };

  // ==================== HELPERS ====================
  const getNextId = (data) =>
    data.length > 0 ? Math.max(...data.map((r) => r.Id)) + 1 : 1;

  const clearForm = () => {
    setSelectedAccHead("");
    setNomineeAlternate("");
    setPercentage("");
    setEditId(null);
  };

  // ==================== ADD / UPDATE ====================
  const handleAddOrUpdate = () => {
    if (!selectedAccHead || selectedAccHead === "0") {
      Swal.fire({ text: "Please select Account Head", icon: "warning" });
      return;
    }
    if (!nomineeAlternate.trim()) {
      Swal.fire({ text: "Nominee cannot be blank", icon: "warning" });
      return;
    }
    if (!percentage.trim()) {
      Swal.fire({ text: "Percentage cannot be blank", icon: "warning" });
      return;
    }

    const selectedOption = accHeadOptions.find(
      (o) => o.value === selectedAccHead
    );

    if (editId !== null) {
      setTableData(
        tableData.map((r) =>
          r.Id === editId
            ? {
                ...r,
                AccountHead: selectedOption?.label || "",
                AccountHeadId: selectedAccHead,
                Nominee: nomineeAlternate.trim(),
                Percentage: percentage.trim(),
              }
            : r
        )
      );
      setEditId(null);
    } else {
      setTableData([
        ...tableData,
        {
          Id: getNextId(tableData),
          AccountHead: selectedOption?.label || "",
          AccountHeadId: selectedAccHead,
          Nominee: nomineeAlternate.trim(),
          Percentage: percentage.trim(),
        },
      ]);
    }

    clearForm();
  };

  const handleUpdateRow = (row) => {
    setSelectedAccHead(row.AccountHeadId);
    setNomineeAlternate(row.Nominee);
    setPercentage(row.Percentage);
    setEditId(row.Id);
  };

  const handleDeleteRow = (id) => {
    Swal.fire({
      text: "Are you sure you want to delete this record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        setTableData(tableData.filter((r) => r.Id !== id));
        if (editId === id) clearForm();
      }
    });
  };

  // ==================== SAVE ====================
  const handleSave = async () => {
    try {
      if (tableData.length === 0) {
        Swal.fire({
          text: "Please Add At least One Nominee",
          icon: "warning",
        });
        return;
      }

      const str = tableData
        .map((row) => {
          const cleanNominee = (row.Nominee || "").replace(/[$#]/g, "");
          const cleanPercentage = (row.Percentage || "").replace(/[$#]/g, "");
          return `${row.AccountHeadId}$${cleanNominee}$${cleanPercentage}`;
        })
        .join("#");

      Swal.fire({
        text: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        userid: userId,
        esevaempid: Number(esevaEmpId),
        ulbid: Number(ulbId),
        empid: Number(empId),
        STR: str,
        mode: Number(mode),
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmESevaEmpNomin/insert-nomination`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.close();

      const outerSuccess = res?.data?.success;
      const errorMsg =
        res?.data?.data?.message || res?.data?.message || "Saved successfully";

      if (outerSuccess) {
        await Swal.fire({ text: errorMsg, icon: "success" });
        navigate("/Transactions/FrmESevaEmpPostingRecord", {
          state: { empId, esevaEmpId, mode },
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
        icon: "error",
      });
    }
  };

  // ==================== TABLE ROWS ====================
  const buildTableRows = () =>
    tableData.map((row, idx) => ({
      ...row,
      SrNo: idx + 1,
      Update: (
        <Button
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
          onClick={() => handleUpdateRow(row)}
        >
          Update
        </Button>
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

  // ==================== RENDER ====================
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">
            Nomination
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">
                Nomination Details
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Account Head" />
                    <span>:</span>
                  </div>
                  <Select
                    value={selectedAccHead}
                    onValueChange={setSelectedAccHead}
                  >
                    <SelectTrigger className="w-full sm:w-50">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {accHeadOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Nominee / Alternate" />
                    <span>:</span>
                  </div>
                  <Input
                    value={nomineeAlternate}
                    onChange={(e) => setNomineeAlternate(e.target.value)}
                    placeholder="Enter nominee name"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-between items-center">
                    <Label required text="Percentage" />
                    <span>:</span>
                  </div>
                  <Input
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="Enter percentage"
                    type="number"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex justify-center my-3">
                <Button onClick={handleAddOrUpdate}>
                  {editId !== null ? "Update" : "Add"}
                </Button>
              </div>

              {tableData.length > 0 && (
                <ShadCNTable
                  headers={[
                    "Delete",
                    "Update",
                    "Sr No",
                    "Account Head",
                    "Percentage",
                  ]}
                  data={buildTableRows()}
                  keyMapping={{
                    Delete: "Delete",
                    Update: "Update",
                    "Sr No": "SrNo",
                    "Account Head": "AccountHead",
                    Percentage: "Percentage",
                  }}
                  pagination={true}
                  rowsPerPage={10}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 pt-2">
            <Button onClick={handleSave} className="min-w-32">
              Process
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmESevaEmpNomin;