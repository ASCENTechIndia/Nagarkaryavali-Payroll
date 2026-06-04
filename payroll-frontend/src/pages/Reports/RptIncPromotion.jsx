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
import { DatePicker } from "@/components/ui/calendar";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const RptIncPromotion = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbid = user?.ulbId;
    const [type, setType] = useState("ALL");
    const [deptId, setDeptId] = useState("");
    const [zoneId, setZoneId] = useState("");
    const [empId, setEmpId] = useState("");
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [departmentList, setDepartmentList] = useState([]);
    const [zoneList, setZoneList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [empStatus, setEmpStatus] = useState("NEW"); //For ulbid 770 and 1750

    useEffect(() => {
        if (token) { loadInitialData(); }
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

            const [deptRes, zoneRes, empRes] = await Promise.allSettled([
                fetchDepartmentList(),
                fetchZoneList(),
                fetchEmployeeList(),
            ]);

            if (deptRes.status === "rejected") {
                console.error("Department API Failed");
            }
            if (zoneRes.status === "rejected") {
                console.error("Zone API Failed");
            }
            if (empRes.status === "rejected") {
                console.error("Employee API Failed");
            }
            Swal.close();
        } catch (error) {
            Swal.close();
            Swal.fire({ text: "Failed To Load Master Data" });
        }
    };

    const fetchDepartmentList = async () => {
        const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,
            { ulbid },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setDepartmentList(res?.data?.data?.data || []);
    };

    const fetchZoneList = async () => {
        const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
            { ulbid },
            { headers: { Authorization: `Bearer ${token}` }, }
        );

        setZoneList(res?.data?.data?.data || []);
    };

    const fetchEmployeeList = async () => {
        const res = await axios.get(`${BASE_URL}/api/FrmOTherEarnEntryRpt/empoyee-list`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployeeList(res?.data?.data?.data || []);
    };

    const exportToExcel = (rows) => {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "IncrementPromotion"
        );

        const excelBuffer = XLSX.write(
            workbook,
            { bookType: "xlsx", type: "array" }
        );

        const blob = new Blob(
            [excelBuffer],
            { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
        );
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "IncrementPromotionReport.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
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

            const payload = {
                ulbid,
                empid: empId === "" ? null : Number(empId),
                deptid: deptId === "" ? null : Number(deptId),
                zoneid: zoneId === "" ? null : Number(zoneId),
                type: type === "ALL" ? null : type,
                empstatus: [770, 1750].includes(Number(ulbid)) ? empStatus : null,
                fromDate: fromDate ? fromDate.toISOString() : null,
                toDate: toDate ? toDate.toISOString() : null,
            };

            const res = await axios.post(
                `${BASE_URL}/api/RptIncPromotion/inc-promotion-report`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.close();
            const rows = res?.data?.data?.data || [];

            if (!rows.length) {
                Swal.fire({ text: "No Data Found", });
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
        setType("ALL");
        setDeptId("");
        setZoneId("");
        setEmpId("");
        setEmpStatus("NEW");
        setFromDate(new Date());
        setToDate(new Date());
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">
                        Increment & Promotion Report
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="flex max-sm:flex-col sm:items-center gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-between items-center">
                                <Label text="Type" required />
                                <span>:</span>
                            </div>

                            <Select
                                value={type}
                                onValueChange={setType}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="ALL">
                                        ALL
                                    </SelectItem>

                                    <SelectItem value="I">
                                        Increment
                                    </SelectItem>

                                    <SelectItem value="P">
                                        Promotion
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex max-sm:flex-col sm:items-center gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-between items-center">
                                <Label text="Department" />
                                <span>:</span>
                            </div>

                            <Select
                                value={deptId}
                                onValueChange={setDeptId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Select Option --" />
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

                        <div className="flex max-sm:flex-col sm:items-center gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-between items-center">
                                <Label text="Sub Department" />
                                <span>:</span>
                            </div>

                            <Select
                                value={zoneId}
                                onValueChange={setZoneId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Select Option --" />
                                </SelectTrigger>

                                <SelectContent>
                                    {zoneList.map((zone) => (
                                        <SelectItem
                                            key={zone.ZONEID}
                                            value={String(zone.ZONEID)}
                                        >
                                            {zone.ZONENAME}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    <SelectValue placeholder="-- Select Employee --" />
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

                        {[770, 1750].includes(Number(ulbid)) && (
                            <div className="flex max-sm:flex-col sm:items-center gap-4">
                                <div className="sm:w-36 shrink-0 flex justify-between items-center">
                                    <Label text="Employee Type" />
                                    <span>:</span>
                                </div>

                                <Select
                                    value={empStatus}
                                    onValueChange={setEmpStatus}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="OLD">
                                            OLD
                                        </SelectItem>

                                        <SelectItem value="NEW">
                                            NEW
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex max-sm:flex-col sm:items-center gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-between items-center">
                                <Label text="From Date" />
                                <span>:</span>
                            </div>

                            <DatePicker
                                value={fromDate}
                                onChange={setFromDate}
                            />
                        </div>

                        <div className="flex max-sm:flex-col sm:items-center gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-between items-center">
                                <Label text="To Date" />
                                <span>:</span>
                            </div>

                            <DatePicker
                                value={toDate}
                                onChange={setToDate}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 pt-10">
                        <Button
                            type="button"
                            onClick={handleProcess}
                        >
                            Process
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

export default RptIncPromotion;