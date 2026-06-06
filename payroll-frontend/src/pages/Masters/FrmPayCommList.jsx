
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ShadCNTable from "@/components/ui/table";

const container = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.08 },
    },
};

const FrmPayCommList = () => {

    const { user } = useAuth();
    const token = user?.token;
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [payCommList, setPayCommList] = useState([]);

    const tableHeaders = [
        "Action",
        "Pay Commission Name",
        "Pay Commission Code",
        "Active",
    ];

    const keyMapping = {
        Action: "select",
        "Pay Commission Name": "payCommName",
        "Pay Commission Code": "payCommCode",
        "Active": "activeFlag",
    };

    const handleAddNew = () => {
        navigate("/Masters/FrmPayCommMst", {
            state: { mode: 1 },
        });
    };

    const handleSelectItem = (item) => {
        navigate("/Masters/FrmPayCommMst", {
            state: {
                mode: 2,
                data: item,
            },
        });
    };

    const fetchPayCommissionList = async () => {

        try {

            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.get(
                `${BASE_URL}/api/FrmPayCommissionListMst/paycommission-list`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const formattedData =
                (res.data || []).map((item) => ({
                    payCommId: item.NUM_PAYCOMM_ID,
                    payCommName: item.VAR_PAYCOMM_NAME,
                    payCommCode: item.VAR_PAYCOMM_CODE,
                    activeFlag: item.ACTIVEFLAG,

                    select: (
                        <Button
                            variant="link"
                            size="sm"
                            className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
                            onClick={() =>
                                handleSelectItem({
                                    payCommId: item.NUM_PAYCOMM_ID,
                                    payCommName: item.VAR_PAYCOMM_NAME,
                                    payCommCode: item.VAR_PAYCOMM_CODE,
                                    activeFlag: item.ACTIVEFLAG,
                                })
                            }
                        >
                            Modify
                        </Button>
                    ),
                })) || [];

            setPayCommList(formattedData);

        } catch (error) {

            console.error(
                "Pay Commission List API Error:",
                error
            );

            Swal.fire({
                text: "Failed to fetch pay commission list",
            });

        } finally {
            Swal.close();
        }
    };

    useEffect(() => {

        if (token) {
            fetchPayCommissionList();
        }

    }, [token]);

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
                        Pay Commission List
                    </CardTitle>

                    <Button
                        className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
                        onClick={handleAddNew}
                    >
                        Add New
                    </Button>
                </CardHeader>

                <CardContent className="px-4 pt-3 sm:pt-8 space-y-6">

                    <div className="rounded-xl bg-white overflow-hidden">
                        <ShadCNTable
                            headers={tableHeaders}
                            data={payCommList}
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

export default FrmPayCommList;