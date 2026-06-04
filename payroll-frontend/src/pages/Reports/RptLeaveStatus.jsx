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

const monthOptions = [
    { label: "JAN", value: "01" },
    { label: "FEB", value: "02" },
    { label: "MAR", value: "03" },
    { label: "APR", value: "04" },
    { label: "MAY", value: "05" },
    { label: "JUN", value: "06" },
    { label: "JUL", value: "07" },
    { label: "AUG", value: "08" },
    { label: "SEP", value: "09" },
    { label: "OCT", value: "10" },
    { label: "NOV", value: "11" },
    { label: "DEC", value: "12" },
];

const RptLeaveStatus = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbid = user?.ulbId;
    const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
    const [year, setYear] = useState(String(new Date().getFullYear()));
    const [empId, setEmpId] = useState("");
    const [leaveTypeId, setLeaveTypeId] = useState("");
    const [yearList, setYearList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [leaveTypeList, setLeaveTypeList] = useState([]);

    useEffect(() => {
        if (token) { loadInitialData() }
    }, [token]);

    const loadInitialData = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            await Promise.allSettled([ fetchYearList(), fetchEmployeeList(), fetchLeaveTypeList() ]);
            Swal.close();
        } catch (error) {
            Swal.close();
            Swal.fire({text: "Failed To Load Data"});
        }
    };

    const fetchYearList = async () => {
        const res = await axios.get(`${BASE_URL}/api/FrmEmpSalPayheadsReport/year-list`,
            {headers: {Authorization: `Bearer ${token}`}}
        );
        setYearList(res?.data?.data?.data || []);
    };

    const fetchEmployeeList = async () => {
        const res = await axios.get(`${BASE_URL}/api/FrmOTherEarnEntryRpt/empoyee-list`,
            {headers: {Authorization: `Bearer ${token}`}}
        );
        setEmployeeList(res?.data?.data?.data || []);
    };

    const fetchLeaveTypeList = async () => {
        const res = await axios.get(`${BASE_URL}/api/RptLeaveStatus/leave-type`,
            {headers: {Authorization: `Bearer ${token}`}}
        );
        setLeaveTypeList(res?.data?.data?.data || []);
    };

    const exportToExcel = (rows) => {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "LeaveStatus"
        );
        XLSX.writeFile( workbook, "LeaveStatusReport.xlsx" );
    };

    const handleProcess = async () => {
        try {
            Swal.fire({
                title: "Generating Report...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const monthName = monthOptions.find((x) => x.value === month)?.label;
            const payload = {
                ulbid,
                fromMonth: `1-${monthName}-${year}`,
                leaveTypeId: leaveTypeId === "" ? null : Number(leaveTypeId),
                empid: empId === "" ? null : Number(empId),
            };

            const res = await axios.post(`${BASE_URL}/api/RptLeaveStatus/leave-report-list`,
                payload,
                {headers: {Authorization: `Bearer ${token}`}}
            );
            Swal.close();
            const rows = res?.data?.data?.data || [];

            if (!rows.length) {
                Swal.fire({text: "No Data Found"});
                return;
            }
            exportToExcel(rows);
            Swal.fire({
                text: `${rows.length} Records Exported Successfully`,
            });
        } catch (error) {
            Swal.close();
            Swal.fire({
                text: error?.response?.data?.message || "Failed To Generate Report",
            });
        }
    };

    const handleClear = () => {
        setEmpId("");
        setLeaveTypeId("");
        setMonth(String(new Date().getMonth() + 1).padStart(2, "0"));
        setYear(String(new Date().getFullYear())
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">
                        Leave Status Report
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="flex max-sm:flex-col sm:items-center gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-between items-center">
                                <Label text="Date" required />
                                <span>:</span>
                            </div>
                            <div className="flex gap-3 w-full">
                                <Select
                                    value={month}
                                    onValueChange={setMonth}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {monthOptions.map((month) => (
                                            <SelectItem
                                                key={month.value}
                                                value={month.value}
                                            >
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={year}
                                    onValueChange={setYear}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {yearList.map((item) => (
                                            <SelectItem
                                                key={item.NUM_YEAR_ID}
                                                value={String(item.VAR_YEAR)}
                                            >
                                                {item.VAR_YEAR}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex max-sm:flex-col sm:items-center gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-between items-center">
                                <Label text="Employee Name" />
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
                                            value={String(
                                                emp.NUM_EMPLOYEE_EMPID
                                            )}
                                        >
                                            {emp.EMPNAME}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex max-sm:flex-col sm:items-center gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-between items-center">
                                <Label text="Leave Type" />
                                <span>:</span>
                            </div>

                            <Select
                                value={leaveTypeId}
                                onValueChange={setLeaveTypeId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Select Option --" />
                                </SelectTrigger>

                                <SelectContent>
                                    {leaveTypeList.map((leave) => (
                                        <SelectItem
                                            key={leave.NUM_LEAVETYPE_ID}
                                            value={String(
                                                leave.NUM_LEAVETYPE_ID
                                            )}
                                        >
                                            {leave.VAR_LEAVETYPE_NAME}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 pt-10">
                        <Button
                            type="button"
                            onClick={handleProcess}
                        >
                            Submit
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClear}
                            path={"/"}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default RptLeaveStatus;