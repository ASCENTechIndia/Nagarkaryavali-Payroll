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

const FrmDesgListMst = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [searchText, setSearchText] = useState("");
    const [tableData, setTableData] = useState([]);

    const tableHeaders = ["Select", "Designation ID", "Designation Name", "Wash Allowance", "Clean Allowance"];
    const keyMapping = {
        Select: "select",
        "Designation ID": "desigId",
        "Designation Name": "desigName",
        "Wash Allowance": "washAllowance",
        "Clean Allowance": "cleanAllowance",
    };

    const handleAddNew = () => {
        navigate("/Masters/FrmDesgMst", { state: { mode: 1 } });
    };

    const handleSelectItem = (item) => {
        navigate("/Masters/FrmDesgMst", {
            state: { mode: 2, data: item },
        });
    };

    const fetchDesignationList = async () => {
        try {

            Swal.fire({
                title: "Loading ...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.get(
                `${BASE_URL}/api/FrmDesgListMst/designation-list`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const apiData = res.data?.rows || [];

            const formattedData = apiData.map((item) => ({
                desigId: item.DESGID,
                desigName: item.DESGNAME,
                washAllowance: item.WASHALLOW,
                cleanAllowance: item.CLEANALLOW,

                select: (
                    <Button
                        variant="link"
                        size="sm"
                        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
                        onClick={() =>
                            handleSelectItem({
                                desigId: item.DESGID,
                                desigName: item.DESGNAME,
                                washAllowance: item.WASHALLOW,
                                cleanAllowance: item.CLEANALLOW,
                            })
                        }
                    >
                        Select
                    </Button>
                ),
            }));

            setTableData(formattedData);

        } catch (error) {
            console.error("Designation List API Error:", error);
            setTableData([]);
        } finally {
            Swal.close();
        }
    };

    const searchDesignation = async () => {
        try {
            Swal.fire({
                title: "Loading ...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmDesgListMst/designation-search`,
                { searchText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const apiData = res.data?.rows || res.data?.data?.rows || res.data?.data || [];
            const formattedData = apiData.map((item) => ({
                desigId: item.DESGID,
                desigName: item.DESGNAME,
                washAllowance: item.WASHALLOW,
                cleanAllowance: item.CLEANALLOW,
                select: (
                    <Button
                        variant="link"
                        size="sm"
                        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
                        onClick={() =>
                            handleSelectItem({
                                desigId: item.DESGID,
                                desigName: item.DESGNAME,
                                washAllowance: item.WASHALLOW,
                                cleanAllowance: item.CLEANALLOW,
                            })
                        }
                    >
                        Select
                    </Button>
                ),
            }));

            setTableData(formattedData);
        } catch (error) {
            console.error("Designation Search API Error:", error);
            setTableData([]);
        } finally {
            Swal.close();
        }
    };


    useEffect(() => {
        if (token) {
            fetchDesignationList();
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
                    <CardTitle className="text-xl font-bold">Designation List</CardTitle>
                    <Button
                        className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
                        onClick={handleAddNew}
                    >
                        Add New
                    </Button>
                </CardHeader>

                <CardContent className="px-4 pt-3 sm:pt-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-1/2">
                        <Label className="sm:w-44 text-[15px] font-semibold text-gray-700 text-nowrap">Designation Name :</Label>
                        <Input
                            placeholder="Enter Designation Name"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onBlur={() => {

                                if (searchText.trim()) {
                                    searchDesignation();
                                } else {
                                    fetchDesignationList();
                                }
                            }}
                            className="flex-1 h-9"
                        />
                    </div>

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

export default FrmDesgListMst;
