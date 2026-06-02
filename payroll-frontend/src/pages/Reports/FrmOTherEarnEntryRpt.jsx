import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmOTherEarnEntryRpt = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbid = user?.ulbId;
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(String(currentYear));
    const [empId, setEmpId] = useState("");
    const [employeeList, setEmployeeList] = useState([]);

    const yearOptions = [
        currentYear,
        currentYear - 1,
        currentYear - 2,
        currentYear - 3,
    ];

    useEffect(() => {
        fetchEmployeeList();
    }, []);

    const fetchEmployeeList = async () => {
        try {
            Swal.fire({
                title: "Loading Employees...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.get(`${BASE_URL}/api/FrmOTherEarnEntryRpt/empoyee-list`,
                {headers: {Authorization: `Bearer ${token}`}}
            );
            setEmployeeList(res?.data?.data?.data || []);
            Swal.close();
        } catch (error) {
            Swal.close();
            Swal.fire({
                text: error?.response?.data?.message || "Failed to load employee list",
            });
        }
    };

    const exportToExcel = (data) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet( workbook, worksheet, "Other Earning Report");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const blob = new Blob([excelBuffer],{type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Other_Earning_Report_${year}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async () => {
        try {
            if (!empId) {
            Swal.fire({
                text: "Please Select Employee",
            });
            return;
            }
            Swal.fire({
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const payload = { ulbid: Number(ulbid), salaryYear: year, empid: Number(empId) };
            const res = await axios.post(`${BASE_URL}/api/FrmOTherEarnEntryRpt/earn-entry-report`,payload,
                {headers: {Authorization: `Bearer ${token}`}}
            );

            Swal.close();
            const responseData = res?.data?.data;
            if (!responseData?.success) {
                Swal.fire({text: responseData?.message || "No data found"});
                return;
            }

            const reportData = responseData?.data || [];
            if (reportData.length === 0) {
                Swal.fire({text: "No data found"});
                return;
            }

            exportToExcel(reportData);
            Swal.fire({
                text: `${reportData.length} records exported successfully`,
            });
        } catch (error) {
            Swal.close();
            Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || "Failed to generate report",
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
                        Other Earning Report
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1  gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex max-sm:flex-col sm:items-center gap-4">
                                <div className="shrink-0 flex justify-start sm:justify-between items-center">
                                    <Label text="Year" required />
                                    <span>:</span>
                                </div>

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

                            <div className="flex max-sm:flex-col sm:items-center gap-4">
                                <div className="shrink-0 flex justify-start sm:justify-between items-center">
                                    <Label text="Employee Id" required />
                                    <span>:</span>
                                </div>

                                <Select
                                    value={empId}
                                    onValueChange={setEmpId}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="-- Select Option --" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {employeeList.map((emp) => (
                                            <SelectItem
                                                key={emp.NUM_EMPLOYEE_EMPID}
                                                value={String(emp.NUM_EMPLOYEE_EMPID)}
                                            >
                                                {emp.EMPNAME}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 ">
                            <Button
                                type="button"
                                onClick={handleExport}
                            >
                                Export
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                path={"/"}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmOTherEarnEntryRpt;