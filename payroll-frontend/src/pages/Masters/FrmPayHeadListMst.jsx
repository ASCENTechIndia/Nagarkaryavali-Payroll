
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ShadCNTable from "@/components/ui/table";
// 1. UPDATE IMPORTS
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const container = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.08 },
    },
};

const FrmPayHeadListMst = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [tableData, setTableData] = useState([]);

    const tableHeaders = [
        "Action",
        "Pay Head ID",
        "Pay Head",
        "Parent",
        "English Name",
        "Marathi Name",
        "Pay Sheet Order",
    ];

    const keyMapping = {
        Action: "action",
        "Pay Head ID": "payHeadId",
        "Pay Head": "payHead",
        Parent: "parent",
        "English Name": "englishName",
        "Marathi Name": "marathiName",
        "Pay Sheet Order": "paySheetOrder",
    };

    const handleAddNew = () => {
        navigate("/Masters/FrmPayHeadMst", {
            state: { mode: 1 },
        });
    };

    const handleSelectItem = (item) => {
        console.log("Selected Item:", item);

        navigate("/Masters/FrmPayHeadMst", {
            state: {
                mode: 2,
                headId: item.payHeadId,
            },
        });
    };

    const fetchPayHeadList = async () => {
        try {

            Swal.fire({
                title: "Loading ...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmPayHeadListMst/payheads-list`,
                {
                    ulbId: ulbId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const apiData = res.data?.rows || [];

            const formattedData = apiData.map((item) => ({
                action: (
                    <Button
                        variant="link"
                        size="sm"
                        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
                        onClick={() =>
                            handleSelectItem({
                                payHeadId: item.PAYID,
                            })
                        }
                    >
                        Select
                    </Button>
                ),

                payHeadId: item.PAYID,
                payHead: item.SUBHEAD || "-",
                parent: item.PARENTNAME || "-",
                englishName: item.NAMEE || "-",
                marathiName: item.NAMEM || "-",
                paySheetOrder: item.NUM_PAYHEADS_ORDERNO || "-",
            }));

            setTableData(formattedData);

        } catch (error) {
            console.error("PayHead List API Error:", error);
            setTableData([]);
        } finally {
            Swal.close();
        }
    };

    useEffect(() => {
        if (token && ulbId) {
            fetchPayHeadList();
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
                    <CardTitle className="text-xl font-bold">
                        PayHead Master
                    </CardTitle>
                    <Button
                        className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
                        onClick={handleAddNew}
                    >
                        Add New
                    </Button>
                </CardHeader>

                {/* Table */}
                <CardContent className="px-4 pt-5 sm:pt-8">
                    <div className="rounded-xl bg-white overflow-hidden">
                        <ShadCNTable
                            headers={tableHeaders}
                            data={tableData}
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

export default FrmPayHeadListMst;