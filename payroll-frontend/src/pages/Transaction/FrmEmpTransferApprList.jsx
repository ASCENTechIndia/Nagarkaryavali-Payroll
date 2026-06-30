import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ShadCNTable from "@/components/ui/table";
import { Label } from "@/components/ui/label";

const container = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.08 },
    },
};

const FrmEmpTransferApprList = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [searchText, setSearchText] = useState("");
    const [tableData, setTableData] = useState([]);

    // const tableHeaders = ["Select", "Emptransid", "empid", "Empname", "Old Designation", "New Designation", "Current Department", "New Department", "Order Date", "Order No"];
    const tableHeaders = [
        "Select",
        // "Employee Transfer ID",
        // "Employee ID",
        "Employee Name",
        "Old Designation",
        "New Designation",
        "Current Department",
        "New Department",
        "Order Date",
        "Order No",
    ];
    const keyMapping = {
        Select: "select",
        // "Employee Transfer ID": "empTransId",
        // "Employee ID": "empId",
        "Employee Name": "empName",
        "Old Designation": "oldDesignation",
        "New Designation": "newDesignation",
        "Current Department": "currentDept",
        "New Department": "newDept",
        "Order Date": "orderDate",
        "Order No": "orderNo",
    };


    const fetchTransferList = async () => {
        try {
            Swal.fire({
                title: "Loading ...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmEmpTransferApproval/transfer-list`,
                {
                    ulbid: ulbId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const apiData = res.data?.data?.data || [];

            const formattedData = apiData.map((item) => ({
                empTransId: item.EMPTRANSID,
                empId: item.EMPID,
                empName: item.EMPNAME,
                oldDesignation: item.OLDDESIGNATION,
                newDesignation: item.NEWDESIGNATION,
                currentDept: item.CURRENTDPT,
                newDept: item.NEWDEPT,
                orderDate: item.ORDERDT
                    ? new Date(item.ORDERDT).toLocaleDateString("en-GB")
                    : "",
                orderNo: item.ORDENO,

                select: (
                    <Button
                        variant="link"
                        size="sm"
                        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
                        onClick={() =>
                            navigate(
                                "/Transactions/FrmEmpTransferApproval",
                                {
                                    state: {
                                        mode: 2,
                                        empId: item.EMPID,
                                        empTransId: item.EMPTRANSID
                                    },
                                }
                            )
                        }
                    >
                        Select
                    </Button>
                ),
            }));

            setTableData(formattedData);
        } catch (error) {
            console.error("Transfer List API Error:", error);
            setTableData([]);
        } finally {
            Swal.close();
        }
    };

    const filteredData = tableData.filter((row) =>
        Object.values(row).some((value) =>
            String(value)
                .toLowerCase()
                .includes(searchText.toLowerCase())
        )
    );





    useEffect(() => {
        if (token && ulbId) {
            fetchTransferList();
        }
    }, [token, ulbId]);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="p-3 sm:p-4 md:p-5 min-h-screen"
        >
            <Card className="border-0 shadow-none rounded-none bg-transparent">
                <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <CardTitle className="text-xl font-bold">Employee Transfer Approval List</CardTitle>
                </CardHeader>

                <CardContent className="px-4 pt-3 sm:pt-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-1/2">
                        <Label className="sm:w-44 text-[15px] font-semibold text-gray-700 text-nowrap">Employee Name :</Label>
                        <Input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="flex-1 h-9"
                        />
                    </div>

                    <div className="rounded-xl bg-white">
                        <ShadCNTable
                            headers={tableHeaders}
                           data={filteredData}
                            keyMapping={keyMapping}
                            pagination={true}
                            rowsPerPage={10}
                            className="min-w-[900px] lg:min-w-full"
                        />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmEmpTransferApprList;
