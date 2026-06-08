import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ShadCNTable from "@/components/ui/table";
import MultiSelect from "@/components/MultiSelect";

const FrmBankLoanMstList = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [zoneId, setZoneId] = useState("");
    const [deptId, setDeptId] = useState("");
    const [payheadId, setPayheadId] = useState("");

    // keeping MultiSelect but allowing only one employee
    const [employeeIds, setEmployeeIds] = useState([]);
    const [zoneOptions, setZoneOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [payheadOptions, setPayheadOptions] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);

    useEffect(() => {
        if (token) {
            fetchInitialData();
        }
    }, [token]);

    const fetchInitialData = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const results = await Promise.allSettled([
                fetchZoneList(),
                fetchDepartmentList(),
                fetchEmployeeList(),
                fetchPayheadList(),
            ]);
            console.log(results)
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
        try {
            const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
                { ulbid: Number(ulbId) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("resZone", res)
            const rows = res?.data?.data?.data || [];

            if (res.data.data.count === 0) {
                await Swal.fire({
                    text: "No data for Zone Dropdwon",
                    // text: res?.data?.data?.message,
                });
                return;
            }

            setZoneOptions(
                rows.map((item) => ({
                    value: item.ZONEID.toString(),
                    label: item.ZONENAME,
                }))
            );
        } catch (error) {
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    const fetchDepartmentList = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,
                { ulbid: Number(ulbId), },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("fetchDepartmentList", res)
            const rows = res?.data?.data?.data || [];

            if (res.data.data.count === 0) {
                await Swal.fire({
                    text: "No data for Department Dropdwon",
                    // text: res?.data?.data?.message,
                });
                return;
            }

            setDepartmentOptions(
                rows.map((item) => ({
                    value: item.DEPTID.toString(),
                    label: item.DEPTNAME,
                }))
            );
        } catch (error) {
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    const fetchEmployeeList = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/api/FrmBankLoanMstList/ulbWise-employeeList`,
                { ulbid: Number(ulbId) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const rows = res?.data?.data?.data || [];
            if (res.data.data.count === 0) {
                await Swal.fire({
                    text: "No data for Employee Dropdwon",
                    // text: res?.data?.data?.message,
                });
                return;
            } setEmployeeOptions(
                rows.map((item) => ({
                    label: item.EMPNAME,
                    value: item.NUM_EMPLOYEE_EMPID,
                }))
            );
        } catch (error) {
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    const fetchPayheadList = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/api/FrmBankLoanMstList/getPayheads`,
                { ulbid: Number(ulbId) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.data.data.success) {
                await Swal.fire({
                    text: "No data for Pay Head",
                    // text: res?.data?.data?.message,
                });
                return;
            }
            const rows = res?.data?.data?.data || [];

            setPayheadOptions(
                rows.map((item) => ({
                    value: item.NUM_PAYHEADS_ID.toString(),
                    label: item.VAR_PAYHEADS_ENAME,
                }))
            );
        } catch (error) {
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    const handleSelect = (row) => {
        navigate("/Masters/FrmBankLoanMst", {
            state: {
                mode: 2,
                bankLoanId: row.NUM_BANKLOAN_ID,
                data: row,
            },
        });
    };

    const handleSearch = async () => {
        try {
            if (!payheadId) {
                Swal.fire({
                    text: "Please Select PayHead",
                });
                return;
            }

            Swal.fire({
                title: "Searching...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await axios.post(`${BASE_URL}/api/FrmBankLoanMstList/bank-loan-list`,
                {
                    ulbid: Number(ulbId),
                    zoneid: zoneId || null,
                    deptid: deptId || null,
                    empid: employeeIds[0] || null,
                    payheadid: payheadId || null,
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const rows = res?.data?.data?.data || [];

            const formattedRows = rows.map((row) => ({
                ...row,
                SELECT: (
                    <Button
                        variant="link"
                        size="sm"
                        className="px-0 text-blue-700"
                        onClick={() => handleSelect(row)}
                    >
                        Select
                    </Button>
                ),
            }));

            setTableData(formattedRows);
            setShowTable(true);
            Swal.close();
        } catch (error) {
            console.error(error);
            Swal.close();
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    const tableHeaders = [
        "Select",
        "Employee Name",
        "Pay Head",
        "Loan Amount",
        "Installment Amount",
        "Balance Amount",
        "Zone",
        "Department",
    ];

    const keyMapping = {
        Select: "SELECT",
        "Employee Name": "VAR_EMPLOYEE_ENGNAME",
        "Pay Head": "VAR_PAYHEADS_ENAME",
        "Loan Amount": "NUM_BANKLOAN_LOANAMT",
        "Installment Amount": "NUM_BANKLOAN_INSTALLAMT",
        "Balance Amount": "NUM_BANKLOAN_BALANCE",
        Zone: "ZONENAME",
        Department: "DEPTNAME",
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-5"
        >
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">
                        Bank Loan List
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-32 shrink-0 flex justify-between items-center">
                                <Label text="Zone" />
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
                            <div className="sm:w-32 shrink-0 flex justify-between items-center">
                                <Label text="Department" />
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

                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                            <div className="sm:w-32 shrink-0 flex justify-between items-center mt-2">
                                <Label text="Employee Name" />
                                <span>:</span>
                            </div>

                            <MultiSelect
                                options={employeeOptions}
                                value={employeeIds}
                                onChange={(values) => {
                                    // allow only single employee
                                    if (values.length <= 1) {
                                        setEmployeeIds(values);
                                    }
                                }}
                                placeholder="Search Employee..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-32 shrink-0 flex justify-between items-center">
                                <Label
                                    text="Pay Head"
                                    required
                                />
                                <span>:</span>
                            </div>

                            <Select
                                value={payheadId}
                                onValueChange={setPayheadId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Select Pay Head --" />
                                </SelectTrigger>

                                <SelectContent>
                                    {payheadOptions.map((item) => (
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

                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            type="button"
                            onClick={handleSearch}
                        >
                            Search
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            path={"/"}
                        >
                            Close
                        </Button>

                    </div>

                    {showTable && (
                        <ShadCNTable
                            headers={tableHeaders}
                            data={tableData}
                            keyMapping={keyMapping}
                            pagination={true}
                            rowsPerPage={10}
                            className="min-w-300"
                        />
                    )}

                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmBankLoanMstList;