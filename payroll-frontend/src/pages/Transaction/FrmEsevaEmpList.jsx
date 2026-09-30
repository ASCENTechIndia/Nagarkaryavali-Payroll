import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ShadCNTable from "@/components/ui/table";

const FrmEsevaEmpList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = Number(user?.ulbId);
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [departmentList, setDepartmentList] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [department, setDepartment] = useState("");
    const [employeeCode, setEmployeeCode] = useState("");
    const [employeeName, setEmployeeName] = useState("");

    const formatDate = (value) => {
        if (!value) return "-";
        const datePart = String(value).split("T")[0];
        const [year, month, day] = datePart.split("-");
        if (!year || !month || !day) return value;
        return `${day}/${month}/${year}`;
    };

    const headers = [
        "Select",
        ...(ulbId === 930 ? ["Slip No."] : ["Employee ID"]),
        "Employee Name",
        "Category",
        "Zone",
        "Department",
        "Present Address",
        "Join Date",
        "Confirm Date",
        "Retirement Date"
    ];

    const keyMapping = {
        "Select": "action",
        "Slip No.": "slipNo",
        "Employee ID": "empId",
        "Employee Name": "name",
        "Category": "category",
        "Zone": "zone",
        "Department": "department",
        "Present Address": "address",
        "Join Date": "joinDate",
        "Confirm Date": "confirmDate",
        "Retirement Date": "retirementDate"
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        Swal.fire({
            text: "Loading Departments...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const res = await axios.post(
                `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
                { ulbid: ulbId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setDepartmentList(res?.data?.data?.data || []);
        } catch (err) {
            console.error(err);
            setDepartmentList([]);

            await Swal.fire({
                icon: "error",
                text: err?.response?.data?.error || err?.response?.data?.message || "Failed To Fetch Department List"
            });
        } finally {
            Swal.close();
        }
    };

    const fetchEmployeeList = async () => {
        Swal.fire({
            text: "Loading Employees...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const params = new URLSearchParams();
            params.append("ulbid", ulbId);

            if (department) {
                params.append("deptid", department);
            }

            if (employeeCode) {
                if (ulbId === 930) {
                    params.append("deptslipSequence", employeeCode);
                } else {
                    params.append("empid", employeeCode);
                }
            }

            if (employeeName) {
                params.append("empname", employeeName);
            }

            const res = await axios.get(
                `${BASE_URL}/api/FrmEsevaEmpList/employee-list?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const rows = res?.data?.data?.data || [];

            if (!rows.length) {
                setTableData([]);

                await Swal.fire({
                    // icon: "info",
                    text: "No employee records found."
                });

                return;
            }

            const formatted = rows.map((item, index) => ({
                serialNo: index + 1,
                empId: item.NUM_EMPLOYEE_EMPID,
                slipNo: item.VAR_DEPTSLIP_SEQUENCE,
                name: item.VAR_EMPLOYEE_ENGNAME,
                category: item.VAR_CATEGORY_NAME,
                zone: item.VAR_ZONE_NAME,
                department: item.VAR_DEPTMST_DEPTNAMEE,
                address: item.VAR_EMPLOYEE_PSNTADDRESS,
                joinDate: formatDate(item.DATE_EMPLOYEE_JOINDATE),
                confirmDate: formatDate(item.DATE_EMPLOYEE_CONFIRMDATE),
                retirementDate: formatDate(item.DATE_EMPLOYEE_RETIREMNTDATE)
            }));

            setTableData(formatted);
        } catch (err) {
            console.error(err);
            setTableData([]);

            await Swal.fire({
                icon: "error",
                text: err?.response?.data?.error || err?.response?.data?.message || "Failed To Fetch Employee List"
            });
        } finally {
            Swal.close();
        }
    };

    const handleEmployeeSelect = async (row) => {
        sessionStorage.setItem("EmpidEseva", String(row.empId));

        Swal.fire({
            text: "Loading...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const res = await axios.get(`${BASE_URL}/api/FrmEsevaEmpList/employee-stage?empid=${row.empId}&ulbid=${ulbId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const stageData = res?.data?.data?.data || [];

            let currentStage = 0;

            if (stageData.length > 0) {
                currentStage = Number(stageData[0].NUM_EMPSTAGE_STAGEID) || 0;
            }

            let nextStage = 1;

            if (currentStage === 8) {
                nextStage = 8;
            } else if (currentStage > 0) {
                nextStage = currentStage + 1;
            }

            const routes = {
                1: ulbId !== 870 ? "/Transactions/FrmESevaEmpMaster" : "/Transactions/FrmESevaEmpMasterSMKC",
                2: ulbId !== 870 ? "/Transactions/FrmESevaEmpEducationalInformation" : "/Transactions/FrmESevaEmpEducationalInformationSMKC",
                3: ulbId !== 870 ? "/Transactions/FrmESevaEmpNomin" : "/Transactions/FrmEsevaNominationDetailsSmkc",
                4: ulbId !== 870 ? "/Transactions/FrmESevaEmpPostingRecord" : "/Transactions/FrmESevaEmpPostingRecordSMKC",
                5: "/Transactions/FrmESevaEmpLeaveRecord",
                6: ulbId !== 870 ? "/Transactions/FrmESevaIncrAndPromotion" : "/Transactions/FrmESevaIncrAndPromotionSMKC",
                7: ulbId !== 870 ? "/Transactions/FrmESevaLoanNAdvance" : "/Transactions/FrmESevaLoanNAdvanceSMKC",
                8: ulbId !== 870 ? "/Transactions/FrmEsevaEmpPenalAction" : "/Transactions/FrmEsevaEmpPenalActionSMKC"
            };

            Swal.close();

            navigate(routes[nextStage], { state: { empId: row.empId, stageId:currentStage } });
        } catch (err) {
            Swal.close();
            console.error(err);

            await Swal.fire({
                icon: "error",
                text: err?.response?.data?.error || err?.response?.data?.message || "Unable to fetch employee stage"
            });
        }
    };

    const transformedTableData = tableData.map((item) => ({
        ...item,
        action: (<Button type="button" variant="link" onClick={() => handleEmployeeSelect(item)}>Select</Button>)
    }));

    const handleReset = () => {
        setDepartment("");
        setEmployeeCode("");
        setEmployeeName("");
        setTableData([]);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">E-Seva Employee List</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Department" />
                                <span>:</span>
                            </div>

                            <Select
                                value={department}
                                onValueChange={setDepartment}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Select --" />
                                </SelectTrigger>

                                <SelectContent>
                                    {departmentList.map((item) => (
                                        <SelectItem
                                            key={item.DEPTID}
                                            value={String(item.DEPTID)}
                                        >
                                            {item.DEPTNAME}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text={ulbId === 930 ? "Search Slip No." : "Search Employee ID"} />
                                <span>:</span>
                            </div>
                            <Input
                                value={employeeCode}
                                onChange={(e) => setEmployeeCode(e.target.value)}
                                placeholder={ulbId === 930 ? "Enter Slip No." : "Enter Employee ID"}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Employee Name" />
                                <span>:</span>
                            </div>
                            <Input
                                value={employeeName}
                                onChange={(e) => setEmployeeName(e.target.value)}
                                placeholder="Enter Employee Name"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 flex-wrap pt-2">
                        <Button type="button" onClick={fetchEmployeeList}>Search</Button>
                        <Button type="button" variant="secondary" onClick={handleReset}>Reset</Button>
                    </div>

                    {tableData.length > 0 && (
                        <ShadCNTable
                            headers={headers}
                            data={transformedTableData}
                            keyMapping={keyMapping}
                            // columnStyles={columnStyles}
                            pagination={true}
                            rowsPerPage={5}
                        />
                    )}

                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmEsevaEmpList;