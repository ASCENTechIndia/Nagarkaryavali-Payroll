import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useLocation, useNavigate,} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const FrmBankBranchMst = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const token = user?.token;
    const userId = user?.userId;
    const ulbId = user?.ulbId;
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const branchId = location?.state?.branchId;
    const mode = branchId ? 2 : 1;
    const [bankId, setBankId] = useState("");
    const [branchName, setBranchName] = useState("");
    const [bankOptions, setBankOptions] = useState([]);

    useEffect(() => {
        fetchBanks();
    }, []);

    useEffect(() => {
        if ( mode === 2 && branchId) {fetchBranchById()}
    }, [branchId]);

    const fetchBanks = async () => {
        try {
            const res = await axios.post(
                `${BASE_URL}/api/Branchlist/banklistBnh`,
                { ulbid: Number(ulbId) },
                {
                    headers: { Authorization: `Bearer ${token}` },
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
                text: err?.response?.data?.message || "Failed To Fetch Banks",
            });
        }
    };

    const fetchBranchById = async () => {
        try {
            Swal.fire({
                title:"Loading Branch...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
            const res = await axios.post(
                `${BASE_URL}/api/Branchlist/branchbyid`,
                {branchId:Number(branchId)},
                {headers: {Authorization: `Bearer ${token}`}}
            );
            const data = res?.data?.data?.data?.[0];

            console.log("Branch By Id =>",data);
            if (data) {
                setBankId(data.BANKID.toString());
                setBranchName(data.BRANCHNAME || "");
            }

        } catch (err) {
            console.error(err);
            Swal.fire({
                text: err?.response?.data?.message || "Failed To Fetch Branch",
            });
        } finally {
            Swal.close();
        }
    };

    const handleSubmit = async () => {
        try {
            if (!bankId) {
                Swal.fire({
                    icon: "warning",
                    text:"Please Select Bank",
                });
                return;
            }

            if (!branchName.trim()) {
                Swal.fire({
                    icon: "warning",
                    text:"Please Enter Branch Name",
                });
                return;
            }

            Swal.fire({
                title: mode === 1 ? "Saving..." : "Updating...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {Swal.showLoading()},
            });

            const payload = {
                bankId: Number(bankId),
                branchId: Number(branchId),
                branchName: branchName.trim(),
                userId: userId,
                mode: mode,
            };

            console.log("Save Payload =>",payload);
            const res = await axios.post(`${BASE_URL}/api/Branchlist/savebranch`,
                payload,
                {
                    headers: {Authorization: `Bearer ${token}`},
                }
            );
            console.log("Save Response =>",res.data);
            const responseData = res?.data?.data;
            Swal.close();
            if (
                responseData?.errorCode === -100
            ) {
                await Swal.fire({
                    icon: "success",
                    text:responseData?.errorMsg || responseData?.message || res?.data?.message,
                    confirmButtonText:"Ok"
                    
                });
                navigate(
                    "/Masters/FrmBankBranchList"
                );

            } else {
                Swal.fire({
                    text: responseData?.errorMsg || responseData?.message || res?.data?.message,
                });
            }
        } catch (err) {
            console.log(err);
            Swal.close();
            Swal.fire({
                 text: err?.response?.data?.error || "Something Went Wrong",
            });
        }
    };

    const handleDelete = async () => {

    try {

        const confirm =
            await Swal.fire({
                icon: "warning",
                text:"Do You Want To Delete This Branch?",
                showCancelButton: true,
                confirmButtonText:"Yes, Delete",
                cancelButtonText:"Cancel",
            });

        if (!confirm.isConfirmed) {return}
        Swal.fire({
            title: "Deleting...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const payload = {
            bankId: Number(bankId),
            branchId: Number(branchId),
            branchName: branchName.trim(),
            userId: userId,
            mode: 3,
        };

        console.log("Delete Payload =>",payload);

        const res = await axios.post(`${BASE_URL}/api/Branchlist/savebranch`,payload,
            {headers: {Authorization: `Bearer ${token}`}}
        );
        const responseData = res?.data?.data;
        Swal.close();
        if (responseData?.errorCode === -100) {

            await Swal.fire({
                icon: "success",
                text: responseData?.errorMsg || responseData?.message || res?.data?.message,
                confirmButtonText:"Ok"
            });
            navigate("/Masters/FrmBankBranchList");
        } else {
            Swal.fire({
                 text: err?.response?.data?.error || err?.response?.data?.message || err?.message || "Something Went Wrong",
            });
        }
    } catch (err) {
        console.error(err);
        Swal.close();
        Swal.fire({
            text: err?.response?.data?.message || "Failed To Delete Branch",
        });
    }
};

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">
                        Branch Master
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Bank" />
                                <span>:</span>
                            </div>
                            <Select
                                value={bankId}
                                onValueChange={setBankId}
                            >
                                <SelectTrigger  className="w-full">
                                    <SelectValue placeholder="Select Bank" />
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

                        {/* BRANCH */}
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
                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">

                        <Button
                            type="button"
                            onClick={
                                handleSubmit
                            }
                        >
                            {mode === 1 ? "Save" : "Update"}
                        </Button>

                        {mode === 2 && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="secondary"
                            path="/Masters/FrmBankBranchList"
                        >
                            Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmBankBranchMst;