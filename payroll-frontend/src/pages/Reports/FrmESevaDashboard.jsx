import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShadCNTable from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

const FrmESevaDashboard = () => {
  const { authUser } = useAuth();
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const token = storedToken || authUser?.token;
  const user = storedUser || authUser;
  const ulbId = user?.orgId || user?.ulbId;

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [vibhagData, setVibhagData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [showEmployee, setShowEmployee] = useState(false);
  const [selectedVibhag, setSelectedVibhag] = useState(null);
  const [listType, setListType] = useState("");

  const vibhagHeaders = ["Vibhag", "Total Employee", "Proceed", "Pending"];

  const vibhagKeyMapping = {
    Vibhag: "vibhagName",
    "Total Employee": "totalEmp",
    Proceed: "proceed",
    Pending: "pending"
  };

  const employeeHeaders = [
    "Sr No",
    "Vibhag",
    "Department Name",
    "Employee Name",
    "Date of Joining",
    "Date of Retirement",
    "Status"
  ];

  const employeeKeyMapping = {
    "Sr No": "srNo",
    Vibhag: "vibhag",
    "Department Name": "department",
    "Employee Name": "employeeName",
    "Date of Joining": "joinDate",
    "Date of Retirement": "retirementDate",
    Status: "status"
  };

  const formatDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const fetchVibhagDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmESevaDashboard/vibhag-dashboard`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rows = res.data?.data || [];
      setVibhagData(rows);
    } catch (err) {
      console.error(err);
      Swal.fire({
        text: err.response?.data?.message || "Error loading Vibhag dashboard",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeList = async (zoneId, type, vibhagName) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmESevaDashboard/employee-list`,
        { ulbid: Number(ulbId), vibhagId: zoneId, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rows = res.data?.data || [];
      if (rows.length === 0) {
        Swal.fire({
          text: "No records found",
          confirmButtonColor: "#1e3a8a"
        });
        return;
      }
      setEmployeeData(rows);
      setSelectedVibhag({ zoneId, vibhagName, type });
      setListType(type);
      setShowEmployee(true);
    } catch (err) {
      console.error(err);
      Swal.fire({
        text: err.response?.data?.message || "Error loading employee list",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcelVibhag = () => {
    if (!vibhagData.length) return;

    const worksheetData = vibhagData.map((r, i) => ({
      "Sr No": i + 1,
      Vibhag: r.VAR_ZONE_NAME || "",
      "Total Employee": r.TOTALEMP || 0,
      Proceed: r.PROCCEDEMP || 0,
      Pending: r.PENDINGEMP || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vibhag");
    XLSX.writeFile(workbook, `ESeva_Vibhag_${Date.now()}.xlsx`);
  };

  const handleExportExcelEmployee = () => {
    if (!employeeData.length) return;

    const worksheetData = employeeData.map((r, i) => ({
      "Sr No": i + 1,
      Vibhag: r.ZONE_NAME || "",
      "Department Name": r.DEPTNAMEE || "",
      "Employee Name": r.ENGNAME || "",
      "Date of Joining": formatDate(r.JOINDATE),
      "Date of Retirement": formatDate(r.RETIREMNTDATE),
      Status: r.STATUS || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, listType || "Employee");
    XLSX.writeFile(workbook, `ESeva_Employee_${listType}_${Date.now()}.xlsx`);
  };

  const handleGeneratePDF = async (reportType) => {
    setPdfLoading(true);
    try {
      let loaderSwal = Swal.fire({
        title: "Generating...",
        text: "Please wait for e-seva dashboard pdf generation",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
        Swal.showLoading();
        },
      });

      const payload = { ulbid: Number(ulbId), reportType };

      if (reportType === "EMPLOYEE") {
        if (!selectedVibhag) return;
        payload.vibhagId = selectedVibhag.zoneId;
        payload.type = selectedVibhag.type;
        payload.vibhagName = selectedVibhag.vibhagName;
      }

      const res = await axios.post(
        `${BASE_URL}/api/FrmESevaDashboard/generate-pdf`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      loaderSwal.close();

      if (res.data?.success && res.data?.pdfUrl) {
        window.open(res.data.pdfUrl, "_blank");
      } else {
        Swal.fire({
          text: res.data?.message || "PDF not created",
          confirmButtonColor: "#1e3a8a"
        });
      }
    } catch (err) {
      console.error(err);
      loaderSwal.close();
      Swal.fire({
        text: err.response?.data?.message || "Error generating PDF",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleBackToVibhag = () => {
    setShowEmployee(false);
    setEmployeeData([]);
    setSelectedVibhag(null);
    setListType("");
    fetchVibhagDashboard()
  };

  useEffect(() => {
    if (ulbId) fetchVibhagDashboard();
  }, [ulbId]);

  const transformedVibhagData = vibhagData.map((row) => ({
    vibhagName: (
      <span>{row.VAR_ZONE_NAME || ""}</span>
    ),
    totalEmp: (
      <Button
        variant="link"
        size="sm"
      className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
        onClick={() =>
          fetchEmployeeList(row.ZONE_ID, "Total", row.VAR_ZONE_NAME)
        }
      >
        {row.TOTALEMP || 0}
      </Button>
    ),
    proceed: (
      <Button
        variant="link"
        size="sm"
      className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
        onClick={() =>
          fetchEmployeeList(row.ZONE_ID, "Proceed", row.VAR_ZONE_NAME)
        }
      >
        {row.PROCCEDEMP || 0}
      </Button>
    ),
    pending: (
      <Button
        variant="link"
        size="sm"
        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
        onClick={() =>
          fetchEmployeeList(row.ZONE_ID, "Pending", row.VAR_ZONE_NAME)
        }
      >
        {row.PENDINGEMP || 0}
      </Button>
    )
  }));

  const transformedEmployeeData = employeeData.map((row, idx) => ({
    srNo: idx + 1,
    vibhag: row.ZONE_NAME || "",
    department: row.DEPTNAMEE || "",
    employeeName: row.ENGNAME || "",
    joinDate: formatDate(row.JOINDATE),
    retirementDate: formatDate(row.RETIREMNTDATE),
    status: row.STATUS || ""
  }));

  return (
    <Card className="shadow-sm border">
        <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">
            E-Seva Dashboard
            </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
            <div className="flex justify-end gap-3">
            {!showEmployee ? (
                <>
                <Button
                    className="bg-blue-800 hover:bg-blue-900"
                    onClick={handleExportExcelVibhag}
                    disabled={!vibhagData.length}
                >
                    Export to Excel
                </Button>
                <Button
                    className="bg-blue-800 hover:bg-blue-900"
                    onClick={() => handleGeneratePDF("VIBHAG")}
                    disabled={pdfLoading || !vibhagData.length}
                >
                    {pdfLoading ? "Generating..." : "Export to Pdf"}
                </Button>
                </>
            ) : (
                <>
                <Button
                    className="bg-blue-800 hover:bg-blue-900"
                    onClick={handleExportExcelEmployee}
                    disabled={!employeeData.length}
                >
                    Export to Excel
                </Button>
                <Button
                    className="bg-blue-800 hover:bg-blue-900"
                    onClick={() => handleGeneratePDF("EMPLOYEE")}
                    disabled={pdfLoading || !employeeData.length}
                >
                    {pdfLoading ? "Generating..." : "Export to Pdf"}
                </Button>
                <Button
                    variant="outline"
                    onClick={handleBackToVibhag}
                >
                    Back
                </Button>
                </>
            )}
            </div>

            <div className="border rounded-lg overflow-hidden">
            {loading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                Loading...
                </div>
            ) : !showEmployee ? (
                vibhagData.length > 0 ? (
                <ShadCNTable
                    headers={vibhagHeaders}
                    data={transformedVibhagData}
                    keyMapping={vibhagKeyMapping}
                    pagination={true}
                    rowsPerPage={20}
                />
                ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                    No Records Found
                </div>
                )
            ) : employeeData.length > 0 ? (
                <ShadCNTable
                headers={employeeHeaders}
                data={transformedEmployeeData}
                keyMapping={employeeKeyMapping}
                pagination={true}
                rowsPerPage={20}
                />
            ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                No Records Found
                </div>
            )}
            </div>
        </CardContent>
    </Card>
  );
};

export default FrmESevaDashboard;