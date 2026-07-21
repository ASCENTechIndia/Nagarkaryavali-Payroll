import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FrmSalaryCalculation = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const userId = user?.userId;
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const currentYear = new Date().getFullYear();
    const [month, setMonth] = useState(String(new Date().getMonth() + 1));
    const [year, setYear] = useState(String(currentYear));
    const [zoneId, setZoneId] = useState("");
    const [deptId, setDeptId] = useState("");
    const [subDeptId, setSubDeptId] = useState("");
    const [billNo, setBillNo] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [zoneOptions, setZoneOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [subDepartmentOptions, setSubDepartmentOptions] = useState([]);
    const [billOptions, setBillOptions] = useState([]);
    const showSubDepartment = [590, 770, 1750, 930, 2, 1630].includes(Number(ulbId));
    const showBillNo = [770, 1750, 930].includes(Number(ulbId));

    const yearOptions = [
        currentYear,
        currentYear - 1,
        currentYear - 2,
        currentYear - 3,
    ];

    const formatDate = (date) => date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).replace(/ /g, "-");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (deptId) {
            if (showSubDepartment) { fetchSubDepartmentList() }
            if (showBillNo) { fetchBillList() }
        }
    }, [deptId]);

    useEffect(() => {
        if (showBillNo && showSubDepartment && deptId && subDeptId) {
            fetchBillList();
        }
    }, [subDeptId]);

    const fetchInitialData = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            const results = await Promise.allSettled([
                fetchZoneList(),
                fetchDepartmentList(),
                fetchCategoryList(),
            ]);

            results.forEach((result) => {
                if (result.status === "rejected") {
                    console.error(result.reason);
                }
            });
        } finally {
            Swal.close();
        }
    };

    const fetchZoneList = async () => {
        const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
            { ulbid: Number(ulbId) },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const rows = res?.data?.data?.data || [];
        setZoneOptions(
            rows.map((item) => ({
                value: item.ZONEID.toString(),
                label: item.ZONENAME,
            }))
        );
    };

    const fetchDepartmentList = async () => {
        const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,
            { ulbid: Number(ulbId) },
            { headers: { Authorization: `Bearer ${token}` }, }
        );

        const rows = res?.data?.data?.data || [];
        setDepartmentOptions(
            rows.map((item) => ({
                value: item.DEPTID.toString(),
                label: item.DEPTNAME,
            }))
        );
    };

    const fetchCategoryList = async () => {
        const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/employee-category-list`,
            { ulbid: Number(ulbId) },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const rows = res?.data?.data?.data || [];

        if (rows.length) {
            setCategoryId(
                rows[0].NUM_CATEGORY_ID.toString()
            );
        }
    };



    const fetchSubDepartmentList = async () => {
            const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/subdepartment-list`,
                { ulbid: Number(ulbId), deptId: Number(deptId) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const rows = res?.data?.data?.data || [];
            setSubDepartmentOptions(
                rows.map((item) => ({
                    value: item.NUM_DEPTSUB_ID.toString(),
                    label: item.VAR_DEPTSUB_SDEPTNAMEE,
                }))
            );
        };

    const fetchBillList = async () => {
            const payload = { ulbid: Number(ulbId), deptid: Number(deptId) };
            const res = await axios.post(`${BASE_URL}/api/FrmSalaryCalculation/bill-list`,
                payload,
                { headers: { Authorization: `Bearer ${token}`, }, }
            );

            const rows = res?.data?.data?.data || [];
            setBillOptions(
                rows.map((item) => ({
                    value: item.BILLNO.toString(),
                    label: item.BILLCODE,
                }))
            );
        };

    const getSalaryDate = () =>
        formatDate(
            new Date(Number(year), Number(month), 0)
        );

    const validateForm = () => {
        if (!zoneId) {
            Swal.fire({
                text: "Please Select Zone",
            });
            return false;
        }
        if (!deptId) {
            Swal.fire({
                text: "Please Select Department",
            });
            return false;
        }
        if (showSubDepartment && Number(ulbId) === 590 && !subDeptId) {
            Swal.fire({
                text: "Please Select Sub Department",
            });
            return false;
        }
        return true;
    };

    const getPayload = () => ({
        userId,
        date: getSalaryDate(),
        categoryId: Number(categoryId) || 0,
        zone: Number(zoneId),
        dept: Number(deptId),
        ulbid: Number(ulbId),
        subdepartment: showSubDepartment ? Number(subDeptId) || null : null,
        billno: showBillNo ? billNo || null : null,
    });

    const handleProcess = async () => {
            try {
                if (!validateForm()) {
                    return;
                }

                Swal.fire({
                    title: "Processing...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });

                const payload = getPayload();

                const res = await axios.post(`${BASE_URL}/api/FrmSalaryCalculation/calculateSalary`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                Swal.close();
                Swal.fire({
                    // icon: "success",
                    text: res?.data?.data?.errorMsg || res?.data?.message,
                });
                setZoneId("");
                setDeptId("");
                setSubDeptId("");
                setBillNo("");
                setMonth("")
                setYear("")
            } catch (error) {
                console.error(error);
                Swal.close();
                Swal.fire({
                    icon: "error",
                    text: error?.response?.data?.message || "Failed To Process Salary",
                });
                setZoneId("");
                setDeptId("");
                setSubDeptId("");
                setBillNo("");
                  setMonth("")
                setYear("")
            }
        };

    const handleDelete =
        async () => {
            try {
                if (!validateForm()) {
                    return;
                }

                const confirm =
                    await Swal.fire({
                        // icon: "warning",
                        title: "Delete Salary?",
                        text: "Are you sure you want to delete salary calculation?",
                        showCancelButton: true,
                        confirmButtonText: "Yes",
                    });

                if (!confirm.isConfirmed) {
                    return;
                }

                Swal.fire({
                    title: "Deleting...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => { Swal.showLoading() },
                });

                const payload = getPayload();
                const res = await axios.post(`${BASE_URL}/api/FrmSalaryCalculation/deleteSalary`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                Swal.close();
                Swal.fire({
                    icon: "success",
                    text: res?.data?.data?.errorMsg || res?.data?.message,
                });
                setZoneId("");
                setDeptId("");
                setSubDeptId("");
                setBillNo("");
                 setMonth("")
                setYear("")
            } catch (error) {
                console.error(error);
                Swal.close();
                Swal.fire({
                    icon: "error",
                    text: error?.response?.data?.message || "Failed To Delete Salary",
                });
                setZoneId("");
                setDeptId("");
                setSubDeptId("");
                setBillNo("");
                 setMonth("")
                setYear("")
            }
        };

    const handleCancel = () => {
        navigate("/");
    };

    const monthOptions = [
        {
            value: "1",
            label: "January",
        },
        {
            value: "2",
            label: "February",
        },
        {
            value: "3",
            label: "March",
        },
        {
            value: "4",
            label: "April",
        },
        {
            value: "5",
            label: "May",
        },
        {
            value: "6",
            label: "June",
        },
        {
            value: "7",
            label: "July",
        },
        {
            value: "8",
            label: "August",
        },
        {
            value: "9",
            label: "September",
        },
        {
            value: "10",
            label: "October",
        },
        {
            value: "11",
            label: "November",
        },
        {
            value: "12",
            label: "December",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">
                        Salary Calculation
                    </CardTitle>
                </CardHeader>


                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Zone" required />
                                <span>:</span>
                            </div>

                            <Select
                                value={zoneId}
                                onValueChange={setZoneId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Select Zone --" />
                                </SelectTrigger>

                                <SelectContent>
                                    {zoneOptions.map((item) => (
                                        <SelectItem
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    <SelectValue placeholder="-- Select Department --" />
                                </SelectTrigger>

                                <SelectContent>
                                    {departmentOptions.map((item) => (
                                        <SelectItem
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Salary Date" required />
                                <span>:</span>
                            </div>

                            <div className="flex gap-3 w-full">
                                <Select
                                    value={month}
                                    onValueChange={setMonth}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue  placeholder="-- Month --"/>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {monthOptions.map((item) => (
                                            <SelectItem
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={year}
                                    onValueChange={setYear}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue  placeholder="-- Year --"/>
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

                        {showSubDepartment && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                    <Label text="Sub Department" />
                                    <span>:</span>
                                </div>

                                <Select
                                    value={subDeptId}
                                    onValueChange={setSubDeptId}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="-- Select Sub Department --" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {subDepartmentOptions.map((item) => (
                                            <SelectItem
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showBillNo && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                    <Label text="Bill No" />
                                    <span>:</span>
                                </div>

                                <Select
                                    value={billNo}
                                    onValueChange={setBillNo}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="-- Select Bill No --" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {billOptions.map((item) => (
                                            <SelectItem
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-4 flex-wrap pt-4">
                        <Button
                            type="button"
                            onClick={handleProcess}
                        >
                            Process
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
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

export default FrmSalaryCalculation;