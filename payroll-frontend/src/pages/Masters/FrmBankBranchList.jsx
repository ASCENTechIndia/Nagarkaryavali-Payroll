import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ShadCNTable from "@/components/ui/table";

const FrmBankBranchList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const [bankId, setBankId] = useState("");
    const [branchName, setBranchName] = useState("");
    const [bankOptions, setBankOptions] = useState([]);
    const [tableData, setTableData] = useState([]);

    const headers = [
        "Select",
        "Serial No.",
        "Branch Name",
    ];

    const keyMapping = {
        Select: "action",
        "Serial No.": "serialNo",
        "Branch Name": "branchName",
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            Swal.fire({
            title: "Loading Banks...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            });
            const res = await axios.post(
                `${BASE_URL}/api/Branchlist/banklistBnh`,
                {ulbid: Number(ulbId)},
                {
                    headers: {Authorization: `Bearer ${token}`},
                }
            );

            const rows = res?.data?.data?.data || [];
            const formatted =
                rows.map((item) => ({
                    value: item.BANKID.toString(),
                    label: item.BANKNAME,
                }));
            setBankOptions(formatted);
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                text: "Failed To Fetch Bank List",
            });
        }finally{
            Swal.close()
        }
    };

    const fetchBranchList = async (selectedBankId = bankId) => {
        try {
            Swal.fire({
            title: "Loading Branches...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            });
            const payload = {
                bankId: Number(selectedBankId),
                searchText: branchName.toUpperCase(),
            };
            const res = await axios.post(`${BASE_URL}/api/Branchlist/branchlist`,
                payload,
                {headers: {Authorization: `Bearer ${token}`}}
            );

            const rows = res?.data?.data?.data || [];
            const formatted =
                rows.map((item, index) => ({
                    serialNo: index + 1,
                    branchName: item.BRANCHNAME,
                    branchId: item.BRANCHID,
                }));
            setTableData(formatted);
        } catch (err) {
            console.error(err);
            setTableData([]);
            Swal.fire({
                icon: "error",
                text: err?.response?.data?.message || "Failed To Fetch Branch List",
            });
        }finally{
            Swal.close()
        }
    };

    const transformedTableData =
        tableData.map((item) => ({
            ...item,
            action: (
                <Button
                    type="button"
                    variant="link"
                    onClick={() =>
                        navigate(
                        "/Masters/FrmBankBranchMst",
                        {state: { branchId: item.branchId }}
                        )
                    }
                >
                    Select
                </Button>
            ),
        }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">
                        Branch List
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Bank" />
                                <span>:</span>
                            </div>
                            <Select
                                value={bankId}
                                onValueChange={( value ) => {
                                    setBankId(value);
                                    fetchBranchList(value);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Select --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bankOptions.map(
                                        (bank) => (
                                            <SelectItem
                                                key={bank.value}
                                                value={bank.value}
                                            >
                                                {bank.label}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        {bankId && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                    <Label text="Branch Name" />
                                    <span>:</span>
                                </div>
                                <Input
                                    value={branchName}
                                    onChange={(e) =>
                                        setBranchName(e.target.value)
                                    }
                                    placeholder="Enter Branch Name"
                                />
                            </div>
                        )}
                    </div>
                    {bankId && (
                        <>
                            <div className="flex justify-center gap-4 flex-wrap">
                                 <Button
                                    type="button"
                                    onClick={() =>fetchBranchList()}
                                >
                                    Search
                                </Button>
                               
                                <Button
                                    type="button"
                                    variant="secondary"
                                    path="/"
                                >
                                    Close
                                </Button>
                                <Button
                                    type="button"
                                    path="/Masters/FrmBankBranchMst"
                                >
                                    Add New
                                </Button>
                            </div>

                            <ShadCNTable
                                headers={headers}
                                data={transformedTableData}
                                keyMapping={keyMapping}
                                pagination={true}
                                rowsPerPage={5}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmBankBranchList;