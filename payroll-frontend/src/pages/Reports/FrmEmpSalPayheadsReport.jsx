import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

const FrmEmpSalPayheadsReport = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbid = user?.ulbId;
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [deptId, setDeptId] = useState("");
    const [reportType, setReportType] = useState("rbtEmp");
    const [monthList, setMonthList] = useState([]);
    const [yearList, setYearList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);

    // useEffect(() => {
    //     fetchMonths();
    //     fetchYears();
    //     fetchDepartmentList();
    // }, []);

    // const fetchMonths = async () => {
    //     try {
    //         const res = await axios.get(`${BASE_URL}/api/FrmEmpSalPayheadsReport/month-list`,
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             }
    //         );

    //         const rows = res?.data?.data?.data || [];
    //         setMonthList(rows);
    //         if (rows.length > 0) {
    //             setMonth(String(rows[0].NUM_MONTH_ID));
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    // const fetchYears = async () => {
    //     try {
    //         const res = await axios.get(`${BASE_URL}/api/FrmEmpSalPayheadsReport/year-list`,
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             }
    //         );

    //         const rows = res?.data?.data?.data || [];

    //         setYearList(rows);
    //         if (rows.length > 0) {
    //             setYear(String(rows[0].NUM_YEAR_ID));
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    // const fetchDepartmentList = async () => {
    //     try {
    //         Swal.fire({
    //             title: "Loading Department...",
    //             allowOutsideClick: false,
    //             allowEscapeKey: false,
    //             showConfirmButton: false,
    //             didOpen: () => {
    //                 Swal.showLoading();
    //             },
    //         });
    //         const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,
    //             { ulbid: Number(ulbid) },
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             }
    //         );

    //         const rows = res?.data?.data?.data || [];
    //         setDepartmentList(rows);
    //         Swal.close()
    //     } catch (error) {
    //         Swal.close()
    //         console.error(error);
    //     }
    // };

    const loadInitialData = async () => {
        try {
            debugger;
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const [monthRes, yearRes, deptRes] =
                await Promise.allSettled([axios.get(`${BASE_URL}/api/FrmEmpSalPayheadsReport/month-list`,
                        {headers: {Authorization: `Bearer ${token}`}}
                    ),
                    axios.get(`${BASE_URL}/api/FrmEmpSalPayheadsReport/year-list`,
                        {headers: {Authorization: `Bearer ${token}`}}
                    ),

                    axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,
                        {ulbid: Number(ulbid)},
                        {headers: {Authorization: `Bearer ${token}`}}
                    ),
                ]);

            const months = monthRes.status === "fulfilled" ? monthRes.value?.data?.data?.data || [] : [];
            const years = yearRes.status === "fulfilled" ? yearRes.value?.data?.data?.data || [] : [];
            const departments = deptRes.status === "fulfilled" ? deptRes.value?.data?.data?.data || [] : [];

            setMonthList(months);
            setYearList(years);
            setDepartmentList(departments);

            if (months.length > 0) {
                setMonth(String(months[0].NUM_MONTH_ID));
            }

            if (years.length > 0) {
                setYear(String(years[0].NUM_YEAR_ID));
            }

            if (monthRes.status === "rejected" || yearRes.status === "rejected" || deptRes.status === "rejected"
            ) {
                console.error({
                    monthError: monthRes.status === "rejected" ? monthRes.reason : null,
                    yearError: yearRes.status === "rejected" ? yearRes.reason : null,
                    deptError: deptRes.status === "rejected" ? deptRes.reason : null,
                });
            }
        } finally {
            Swal.close();
        }
    };

    const exportToExcel = (data) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, reportType === "rbtEmp" ? "Employee Wise" : "Department Wise");

        const excelBuffer =
            XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

        const blob = new Blob(
            [excelBuffer],
            { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
        );
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = reportType === "rbtEmp" ? "EmployeeSalaryPayheads_EmployeeWise.xlsx" : "EmployeeSalaryPayheads_DepartmentWise.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async () => {
        try {
            if (!year) {
                Swal.fire({ text: "Please Select Year", });
                return;
            }
            if (!month) {
                Swal.fire({ text: "Please Select Month", });
                return;
            }
            if (!deptId) {
                Swal.fire({ text: "Please Select Department", });
                return;
            }

            const lastDate = new Date(Number(year), Number(month), 0);
            const salaryDate = lastDate.toISOString().split("T")[0];

            const payload = {
                ulbid: Number(ulbid),
                salaryDate,
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

            const res = await axios.post(`${BASE_URL}/api/FrmEmpSalPayheadsReport/emp-sal-payheads-report`, payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            Swal.close();

            if (!res.data?.data?.success || res.data?.data?.count === 0) {
                Swal.fire({
                    text: "No Data Found",
                });
                return;
            }
            const reportData = res.data?.data?.data || [];
            exportToExcel(reportData);
            Swal.fire({
                text: `${reportData.length} Records Exported Successfully`,
            });
        } catch (error) {
            console.error(error);
            Swal.close();
            Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || "Failed To Generate Report",
            });
        }
    };

    const handleReset = () => {
        setDeptId("");
        setReportType("rbtEmp");
        
    };

    useEffect(() => {
  loadInitialData();
}, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">
                        Employee Salary Payheads Report
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">

                    <div className="grid max-sm:grid-cols-1 max-xl:grid-cols-2 xl:grid-cols-3 gap-8">

                        {/* Year */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Year" required />
                                <span>:</span>
                            </div>

                            <Select
                                value={year}
                                onValueChange={setYear}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>

                                <SelectContent>
                                    {yearList.map((item) => (
                                        <SelectItem
                                            key={item.NUM_YEAR_ID}
                                            value={String(item.NUM_YEAR_ID)}
                                        >
                                            {item.VAR_YEAR}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Month */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Month" required />
                                <span>:</span>
                            </div>

                            <Select
                                value={month}
                                onValueChange={setMonth}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Month" />
                                </SelectTrigger>

                                <SelectContent>
                                    {monthList.map((item) => (
                                        <SelectItem
                                            key={item.NUM_MONTH_ID}
                                            value={String(item.NUM_MONTH_ID)}
                                        >
                                            {item.VAR_MONTH_NAME}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Department */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Department" />
                                <span>:</span>
                            </div>

                            <Select
                                value={deptId}
                                onValueChange={setDeptId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Department" />
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

                        {/* Report Type */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Report Type" />
                                <span>:</span>
                            </div>

                            <div className="flex gap-1.5">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        name="reportType"
                                        checked={reportType === "rbtEmp"}
                                        onChange={() =>
                                            setReportType("rbtEmp")
                                        }
                                    />
                                    <span>Employee Wise</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        name="reportType"
                                        checked={reportType === "rbtDept"}
                                        onChange={() =>
                                            setReportType("rbtDept")
                                        }
                                    />
                                    <span>Department Wise</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-center gap-4 pt-2">
                        <Button
                            type="button"
                            onClick={handleExport}
                        >
                            Export To Excel
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleReset}
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

export default FrmEmpSalPayheadsReport;