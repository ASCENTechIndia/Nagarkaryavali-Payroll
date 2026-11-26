
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
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
import * as XLSX from "xlsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const monthNames = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

const FrmBankListReport = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const navigate = useNavigate();

    const currentDate = new Date();

    const isSubDepartmentVisible = ["1630", "1750"];
    const isBillNoVisible =  "1750";
    const isEmployeeTypeVisible =  "1750";

    const [selectedMonth, setSelectedMonth] = useState(
        String(currentDate.getMonth() + 1)
    );
    const [selectedYear, setSelectedYear] = useState(
        String(currentDate.getFullYear())
    );

    const [departmentId, setDepartmentId] = useState("-1");
    const [bankId, setBankId] = useState("-1");
    const [subDepartmentId, setSubDepartmentId] = useState("-1");
    const [billNo, setBillNo] = useState("-1");
    const [employeeType, setEmployeeType] = useState("NEW");

    const [departments, setDepartments] = useState([]);
    const [banks, setBanks] = useState([]);
    const [yearList, setYearList] = useState([]);
    const [subDepartmentList, setSubDepartmentList] = useState([]);
    const [billList, setBillList] = useState([]);

    useEffect(() => {
        if (token && ulbId) {
            fetchMasters();
        }
    }, [token, ulbId]);

    const fetchMasters = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const payload = { ulbid: Number(ulbId) };

            const [departmentRes, bankRes, yearRes] = await Promise.allSettled([
                axios.post(
                    `${BASE_URL}/api/FrmBankListReport/department-list`,
                    payload,
                    config
                ),
                axios.post(
                    `${BASE_URL}/api/FrmBankListReport/bank-list`,
                    payload,
                    config
                ),
                axios.post(
                    `${BASE_URL}/api/FrmPayrollReport/year-list`,
                    {},
                    config
                ),
            ]);

            if (departmentRes.status === "fulfilled") {
                setDepartments(
                    departmentRes.value?.data?.data?.data ||
                    departmentRes.value?.data?.data?.rows ||
                    []
                );
            }

            if (bankRes.status === "fulfilled") {
                setBanks(
                    bankRes.value?.data?.data?.data ||
                    bankRes.value?.data?.data?.rows ||
                    bankRes.value?.data?.data ||
                    []
                );
            }

            if (yearRes.status === "fulfilled") {
                const years = yearRes.value?.data?.data?.data || [];
                setYearList(years);

                const currentYear = years.find(
                    (item) =>
                        String(item.VAR_YEAR) === String(currentDate.getFullYear())
                );

                if (currentYear) {
                    setSelectedYear(String(currentYear.VAR_YEAR));
                }
            }

            Swal.close();
        } catch (err) {
            Swal.close();
            Swal.fire({
                text: err.response?.data?.message || "Failed to load master data.",
                confirmButtonColor: "#1e3a8a",
            });
        }
    };

    const getSubDepartmentList = async (deptid) => {
        try {
            const res = await axios.post(
                `${BASE_URL}/api/FrmIncreamentPramotionMst/sub-department-list`,
                { deptid },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const result = res.data?.data ?? res.data;

            const rows = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.rows)
                        ? result.rows
                        : [];

            setSubDepartmentList(rows);
        } catch (error) {
            setSubDepartmentList([]);
            await Swal.fire({
                text:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    "Unable to load Sub Department list.",
            });
        }
    };

    const getBillList = async (deptid ) => {
        try {
            const payload = {
                ulbid: Number(ulbId),
                deptid: Number(deptid),
            };

            const res = await axios.post(
                `${BASE_URL}/api/FrmIncreamentPramotionMst/bill-list`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Bill List API Response:", res.data);
            console.log("Bill List Request:", payload);

            const result = res.data?.data ?? res.data;

            const rows = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.rows)
                        ? result.rows
                        : Array.isArray(result?.data?.rows)
                            ? result.data.rows
                            : [];

            setBillList(rows);
        } catch (error) {
            setBillList([]);
            await Swal.fire({
                text:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    "Unable to load Bill No list.",
            });
        }
    };

    useEffect(() => {
        setSubDepartmentId("-1");
        setSubDepartmentList([]);
        setBillNo("-1");
        setBillList([]);

        if (departmentId !== "-1" && token) {
            if (isSubDepartmentVisible) {
                getSubDepartmentList(Number(departmentId));
            }

            if (isBillNoVisible) {
                getBillList(departmentId, "-1");
            }
        }
    }, [departmentId, token, ulbId]);

    const handleSubDepartmentChange = (value) => {
        setSubDepartmentId(value);
        setBillNo("-1");
        setBillList([]);

        if (isBillNoVisible && departmentId !== "-1") {
            getBillList(departmentId, value);
        }
    };

    const handlePrint = async () => {
        if (!selectedMonth) {
            Swal.fire({ icon: "warning", text: "Please select Month." });
            return;
        }

        if (!selectedYear) {
            Swal.fire({ icon: "warning", text: "Please select Year." });
            return;
        }

        if (
            departmentId === "-1" ||
            departmentId === "0" ||
            departmentId === ""
        ) {
            Swal.fire({
                icon: "warning",
                text: "Please select department.",
            });
            return;
        }

        try {
            Swal.fire({
                title: "Generating...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            const selectedDept = departments.find(
                (d) => String(d.DEPTID) === departmentId
            );

            const selectedBank = banks.find(
                (b) => String(b.BANKID ?? b.BANK_ID) === bankId
            );

            const selectedSubDept = subDepartmentList.find(
                (s) =>
                    String(
                        s.SUBDEPTID ??
                        s.SUBDEPT_ID ??
                        s.SUB_DEPT_ID
                    ) === subDepartmentId
            );

            const payload = {
                ulbId: Number(ulbId),
                month: Number(selectedMonth),
                year: Number(selectedYear),
                departmentId: Number(departmentId),
                bankId: bankId === "-1" ? "-1" : Number(bankId),
                subDepartmentId: isSubDepartmentVisible
                    ? subDepartmentId === "-1"
                        ? "-1"
                        : Number(subDepartmentId)
                    : "-1",
                billNo: isBillNoVisible ? billNo : "-1",
                employeeType: isEmployeeTypeVisible ? employeeType : null,
                deptName: selectedDept?.DEPTNAME || null,
                bankName: selectedBank
                    ? selectedBank.BANKNAME ?? selectedBank.BANK_NAME
                    : null,
                subDeptName: selectedSubDept
                    ? selectedSubDept.SUBDEPTNAME ??
                    selectedSubDept.SUB_DEPT_NAME ??
                    selectedSubDept.SUBDEPARTMENT
                    : null,
            };

            const response = await axios.post(
                `${BASE_URL}/api/FrmBankListReport/generate-bank-list-pdf`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            Swal.close();

            if (response.data?.success) {
                window.open(response.data.pdfUrl, "_blank");
            } else {
                Swal.fire({
                    text: response.data?.message || "Failed to generate report.",
                    confirmButtonColor: "#1e3a8a",
                });
            }
        } catch (err) {
            Swal.close();
            Swal.fire({
                text:
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Unable to generate report.",
                confirmButtonColor: "#1e3a8a",
            });
        }
    };


    const getValue = (row, ...keys) => {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) {
            return row[key];
        }
    }
    return "";
};


const handleExcel = async () => {
    if (!selectedMonth) {
        Swal.fire({ icon: "warning", text: "Please select Month." });
        return;
    }

    if (!selectedYear) {
        Swal.fire({ icon: "warning", text: "Please select Year." });
        return;
    }

    if (departmentId === "0" || departmentId === "") {
        Swal.fire({
            icon: "warning",
            text: "Please select department.",
        });
        return;
    }

    try {
        Swal.fire({
            title: "Generating Excel...",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        const selectedDept = departments.find(
            (d) => String(d.DEPTID) === departmentId
        );

        const selectedBank = banks.find(
            (b) => String(b.BANKID ?? b.BANK_ID) === bankId
        );

        const selectedSubDept = subDepartmentList.find(
            (s) =>
                String(
                    s.SUBDEPTID ??
                    s.SUBDEPT_ID ??
                    s.SUB_DEPT_ID
                ) === subDepartmentId
        );

        const payload = {
            ulbId: Number(ulbId),
            month: Number(selectedMonth),
            year: Number(selectedYear),
            departmentId: Number(departmentId),
            bankId: bankId === "-1" ? "-1" : Number(bankId),
            subDepartmentId: isSubDepartmentVisible
                ? subDepartmentId === "-1"
                    ? "-1"
                    : Number(subDepartmentId)
                : "-1",
            billNo: isBillNoVisible ? billNo : "-1",
            employeeType: isEmployeeTypeVisible ? employeeType : null,
            deptName: selectedDept?.DEPTNAME || null,
            bankName: selectedBank
                ? selectedBank.BANKNAME ?? selectedBank.BANK_NAME
                : null,
            subDeptName: selectedSubDept
                ? selectedSubDept.SUBDEPTNAME ??
                  selectedSubDept.SUB_DEPT_NAME ??
                  selectedSubDept.SUBDEPARTMENT
                : null,
        };

        const response = await axios.post(
            `${BASE_URL}/api/FrmBankListReport/get-bank-list-report-data`,
            payload,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const rows =
            response.data?.data?.rows ||
            response.data?.rows ||
            response.data?.data ||
            [];

        if (!Array.isArray(rows) || rows.length === 0) {
            Swal.close();
            Swal.fire({
                icon: "warning",
                text: "No records found for the selected filters.",
            });
            return;
        }

        console.log("response data :", rows);

        // All 13 columns from API response
        const headers = [
            "ACCNO",
            "AXISACCNO",
            "BANKNAME",
            "BILLNO",
            "DEPTID",
            "DEPTNAME",
            "DESIGNAME",
            "EMPID",
            "EMPNAME",
            "INDACCNO",
            "OLDEMPNO",
            "PAYABLEAMT",
            "SLIPNO",
        ];

        const data = rows.map((row) => [
            getValue(row, "ACCNO"),
            getValue(row, "AXISACCNO"),
            getValue(row, "BANKNAME"),
            getValue(row, "BILLNO"),
            getValue(row, "DEPTID"),
            getValue(row, "DEPTNAME"),
            getValue(row, "DESIGNAME"),
            getValue(row, "EMPID"),
            getValue(row, "EMPNAME"),
            getValue(row, "INDACCNO"),
            getValue(row, "OLDEMPNO"),
            Number(getValue(row, "PAYABLEAMT") || 0),
            getValue(row, "SLIPNO"),
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

        // Set column widths according to content
        worksheet["!cols"] = headers.map((header, index) => {
            const maxLength = Math.max(
                String(header).length,
                ...data.map((row) => String(row[index] ?? "").length)
            );

            return {
                wch: Math.min(Math.max(maxLength + 3, 15), 40),
            };
        });

        // Format PAYABLEAMT column (12th column, index 11)
        for (let row = 1; row <= data.length; row++) {
            const cell = XLSX.utils.encode_cell({
                r: row,
                c: 11,
            });

            if (worksheet[cell]) {
                worksheet[cell].z = "#,##0.00";
            }
        }

        // Enable Excel filters
        worksheet["!autofilter"] = {
            ref: worksheet["!ref"],
        };

        // Create and download workbook
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Bank List"
        );

        XLSX.writeFile(
            workbook,
            `BankList_${selectedMonth}_${selectedYear}.xlsx`
        );

        Swal.close();

        Swal.fire({
            icon: "success",
            text: "Excel downloaded successfully.",
            confirmButtonColor: "#1e3a8a",
        });

    } catch (err) {
        Swal.close();

        Swal.fire({
            icon: "error",
            text:
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Unable to generate Excel.",
            confirmButtonColor: "#1e3a8a",
        });
    }
};


    const handleCancel = () => {
        navigate("/HomePage/FrmHomePage");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-5 min-h-screen"
        >
            <Card className="border shadow-sm">
                <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                    <CardTitle className="text-xl font-bold">
                        Bank List Report
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Salary Date */}
                        <div className="flex flex-col gap-1.5">
                            <Label
                                required
                                text="Salary Date"
                                className="w-auto text-[13px] font-semibold text-gray-700"
                            />

                            <div className="flex gap-2">
                                <Select
                                    value={selectedMonth}
                                    onValueChange={setSelectedMonth}
                                >
                                    <SelectTrigger className="h-9 overflow-hidden flex-1 min-w-0">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthNames.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={selectedYear}
                                    onValueChange={setSelectedYear}
                                >
                                    <SelectTrigger className="h-9 overflow-hidden w-24 shrink-0">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearList.length > 0
                                            ? yearList.map((item) => (
                                                <SelectItem
                                                    key={item.NUM_YEAR_ID}
                                                    value={String(item.VAR_YEAR)}
                                                >
                                                    {item.VAR_YEAR}
                                                </SelectItem>
                                            ))
                                            : Array.from({ length: 10 }, (_, i) => {
                                                const y = currentDate.getFullYear() - i;
                                                return (
                                                    <SelectItem key={y} value={String(y)}>
                                                        {y}
                                                    </SelectItem>
                                                );
                                            })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="flex flex-col gap-1.5">
                            <Label
                                required
                                text="Department"
                                className="w-auto text-[13px] font-semibold text-gray-700"
                            />
                            <Select
                                value={departmentId}
                                onValueChange={setDepartmentId}
                            >
                                <SelectTrigger className="w-full h-9 overflow-hidden">
                                    <SelectValue placeholder="-- ALL --" />
                                </SelectTrigger>
                                <SelectContent showDefaultOption={false}>
                                    <SelectItem value="-1">-- ALL --</SelectItem>
                                    {departments.map((dept) => (
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

                        {/* Sub Department */}
                        {isSubDepartmentVisible && (
                            <div className="flex flex-col gap-1.5">
                                <Label
                                    text="Sub Department"
                                    className="w-auto text-[13px] font-semibold text-gray-700"
                                />
                                <Select
                                    value={subDepartmentId}
                                    onValueChange={handleSubDepartmentChange}
                                    disabled={departmentId === "-1"}
                                >
                                    <SelectTrigger className="w-full h-9 overflow-hidden">
                                        <SelectValue placeholder="-- ALL --" />
                                    </SelectTrigger>
                                    <SelectContent showDefaultOption={false}>
                                        <SelectItem value="-1">-- ALL --</SelectItem>
                                        {subDepartmentList.map((item, index) => {
                                            const id =
                                                item.SUBDEPTID ??
                                                item.SUBDEPT_ID ??
                                                item.SUB_DEPT_ID;

                                            if (id == null) return null;

                                            return (
                                                <SelectItem
                                                    key={id ?? index}
                                                    value={String(id)}
                                                >
                                                    {item.SUBDEPTNAME ??
                                                        item.SUB_DEPT_NAME ??
                                                        item.SUBDEPARTMENT}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Bill No */}
                        {isBillNoVisible && (
                            <div className="flex flex-col gap-1.5">
                                <Label
                                    text="Bill No"
                                    className="w-auto text-[13px] font-semibold text-gray-700"
                                />
                                <Select
                                    value={billNo}
                                    onValueChange={setBillNo}
                                    disabled={departmentId === "-1"}
                                >
                                    <SelectTrigger className="w-full h-9 overflow-hidden">
                                        <SelectValue placeholder="-- ALL --" />
                                    </SelectTrigger>
                                    <SelectContent showDefaultOption={false}>
                                        <SelectItem value="-1">-- ALL --</SelectItem>
                                        {billList.map((item, index) => {
                                            const value =
                                                item.BILLNO ??
                                                item.billno ??
                                                item.BILLCODE ??
                                                item.billcode;

                                            const label =
                                                item.BILLCODE ??
                                                item.billcode ??
                                                item.BILLNO ??
                                                item.billno;

                                            if (value == null) return null;

                                            return (
                                                <SelectItem
                                                    key={value ?? index}
                                                    value={String(value)}
                                                >
                                                    {label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Bank */}
                        <div className="flex flex-col gap-1.5">
                            <Label
                                text="Bank"
                                className="w-auto text-[13px] font-semibold text-gray-700"
                            />
                            <Select value={bankId} onValueChange={setBankId}>
                                <SelectTrigger className="w-full h-9 overflow-hidden">
                                    <SelectValue placeholder="-- ALL --" />
                                </SelectTrigger>
                                <SelectContent showDefaultOption={false}>
                                    <SelectItem value="-1">-- ALL --</SelectItem>
                                    {banks.map((bank) => (
                                        <SelectItem
                                            key={bank.BANKID ?? bank.BANK_ID}
                                            value={String(bank.BANKID ?? bank.BANK_ID)}
                                        >
                                            {bank.BANKNAME ?? bank.BANK_NAME}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Employee Type */}
                        {isEmployeeTypeVisible && (
                            <div className="flex flex-col gap-1.5">
                                <Label
                                    text="Employee Type"
                                    className="w-auto text-[13px] font-semibold text-gray-700"
                                />
                                <Select
                                    value={employeeType}
                                    onValueChange={setEmployeeType}
                                >
                                    <SelectTrigger className="w-full h-9 overflow-hidden">
                                        <SelectValue placeholder="-- ALL --" />
                                    </SelectTrigger>
                                    <SelectContent showDefaultOption={false}>
                                        <SelectItem value="OLD">OLD</SelectItem>
                                        <SelectItem value="NEW">NEW</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
    <Button
        type="button"
        className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8"
        onClick={handlePrint}
    >
        Print PDF
    </Button>

    <Button
        type="button"
        className="bg-[#15803d] hover:bg-[#166534] text-white px-8"
        onClick={handleExcel}
    >
        Export Excel
    </Button>

    <Button
        type="button"
        variant="outline"
        className="px-8"
        onClick={handleCancel}
    >
        Cancel
    </Button>
</div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmBankListReport;
