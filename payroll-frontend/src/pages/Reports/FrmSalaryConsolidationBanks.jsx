import  { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmSalaryConsolidationBanks = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbid = user?.ulbId;
    const currentYear = new Date().getFullYear();
    const [month, setMonth] = useState(String(new Date().getMonth() + 1));
    const [year, setYear] = useState(String(currentYear));
    const [deptId, setDeptId] = useState("");
    const [reportType, setReportType] = useState("D");
    const [departmentList, setDepartmentList] = useState([]);
    const yearOptions = [
        currentYear,
        currentYear - 1,
        currentYear - 2,
        currentYear - 3,
    ];

    useEffect(() => {
        fetchDepartmentList();
    }, []);

    const fetchDepartmentList = async () => {
        try {
            Swal.fire({
                title: "Loading Departments...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,
                { ulbid: Number(ulbid) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const rows = res?.data?.data?.data || res?.data?.data?.rows || [];
            setDepartmentList(rows);
            Swal.close();
        } catch (error) {
            Swal.close();
            console.error(error);
            Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || "Something went wrong",
            });
        }
    };

    const exportToExcel = (data) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            reportType === "D" ? "Department Wise" : "Employee Wise"
        );
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob(
            [excelBuffer],
            { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
        );

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "long", });
        link.download = `SalaryConsolidation_${reportType}_${monthName}_${year}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handlePrint = async () => {
        try {
            // if (!deptId) {
            //     Swal.fire({
            //         // icon: "warning",
            //         text: "Please Select Department",
            //     });
            //     return;
            // }

            const fromDate = new Date(Number(year), Number(month) - 1, 1);
            const toDate = new Date(Number(year), Number(month), 0);
            const payload = {
                ulbid: Number(ulbid),
                fromDate: fromDate.toISOString().split("T")[0],
                toDate: toDate.toISOString().split("T")[0],
                deptId: Number(deptId),
                reportType,
            };

            Swal.fire({
                title: "Loading Report...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(`${BASE_URL}/api/FrmSalaryConsolidationBanks/salary-consolidation-bank-report`, payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.close();
            if (!res.data?.data?.success || res.data?.data?.count === 0) {
                Swal.fire({
                    // icon: "info",
                    text: "No Data Found",
                });
                return;
            }

            const reportData = res.data?.data?.data || [];
            exportToExcel(reportData);
            Swal.fire({
                icon: "success",
                text: `Data records exported successfully`,
                // text: `${reportData.length} records exported successfully`,
                timer: 2000,
            });
        } catch (error) {
            console.error(error);
            Swal.close();
            Swal.fire({
                // icon: "error",
                text: error?.response?.data?.message || error?.response?.data?.error || "Failed To Generate Report",
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">
                        Salary Consolidation (पगार एकत्रीकरण) Report - Banks
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid max-sm:grid-cols-1 max-xl:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Salary Date" required />
                                <span>:</span>
                            </div>

                            <div className="flex gap-3 w-full">
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="1">January</SelectItem>
                                        <SelectItem value="2">February</SelectItem>
                                        <SelectItem value="3">March</SelectItem>
                                        <SelectItem value="4">April</SelectItem>
                                        <SelectItem value="5">May</SelectItem>
                                        <SelectItem value="6">June</SelectItem>
                                        <SelectItem value="7">July</SelectItem>
                                        <SelectItem value="8">August</SelectItem>
                                        <SelectItem value="9">September</SelectItem>
                                        <SelectItem value="10">October</SelectItem>
                                        <SelectItem value="11">November</SelectItem>
                                        <SelectItem value="12">December</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {yearOptions.map((yr) => (
                                            <SelectItem
                                                key={yr}
                                                value={String(yr)}
                                            >
                                                {yr}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>



                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Department" required />
                                <span>:</span>
                            </div>

                            <Select
                                value={deptId}
                                onValueChange={setDeptId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue value="" placeholder="-- Select Department --" />
                                </SelectTrigger>

                                <SelectContent>
                                    {departmentList.map((dept) => (
                                        <SelectItem
                                            key={dept.DEPTID}
                                            value={String(dept.DEPTID)}
                                        >
                                            {dept.DEPTNAME}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Report Type" />
                                <span>:</span>
                            </div>

                            <div className="flex gap-2">
                               <div className="flex items-center gap-2">
                                 <Input
                                    type="radio"
                                    checked={reportType === "D"}
                                    onChange={() => setReportType("D")}
                                />
                                <Label text="Department" />
                               </div>

                                <div className="flex items-center gap-2">
                                <Input
                                    type="radio"
                                    checked={reportType === "E"}
                                    onChange={() => setReportType("E")}
                                />
                                <Label text="Employee" />
                                 </div>           
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            type="button"
                            onClick={handlePrint}
                        >
                            Print
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setDeptId("");
                                setReportType("D");
                            }}
                            path="/HomePage/FrmHomePage"
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmSalaryConsolidationBanks;