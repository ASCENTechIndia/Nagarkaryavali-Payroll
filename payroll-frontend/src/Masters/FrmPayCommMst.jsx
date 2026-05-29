

import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const initialValues = {
    CommissionName: "",
    payTypeCode: "",
    status: "Active",
};

const FrmPayCommMst = () => {
    const { user } = useAuth();
    const token = user?.token;
    const navigate = useNavigate();
    const userId = user?.userId;
    const location = useLocation();

    const mode = location.state?.mode || 1;
    const payCommId = location.state?.data?.payCommId;

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [formInitialValues, setFormInitialValues] = useState(initialValues);

    const fetchPayCommissionDetails = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmPayCommissionListMst/paycommission-details`,
                {
                    paycommid: payCommId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const data = res.data?.[0];

            if (data) {
                setFormInitialValues({
                    CommissionName: data.VAR_PAYCOMM_NAME || "",
                    payTypeCode: data.VAR_PAYCOMM_CODE || "",
                    status: data.VAR_PAYCOMM_FLAG === "Y" ? "Active" : "InActive",
                });
            }
        } catch (error) {
            console.error("Pay Commission Details API Error:", error);

            Swal.fire({
                text: "Failed to fetch details",
            });
        } finally {
            Swal.close();
        }
    };

    useEffect(() => {
        if (mode === 2 && payCommId && token) {
            fetchPayCommissionDetails();
        }
    }, [mode, payCommId, token]);

    const handleSubmit = async (values) => {
        try {
            Swal.fire({
                title: "Saving...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const payload = {
                userId: userId,
                paycId: mode === 2 ? payCommId : 0,
                paycName: values.CommissionName,
                paycCode: values.payTypeCode,
                paycflag: values.status === "Active" ? "Y" : "N",
                mode: mode,
            };

            const res = await axios.post(
                `${BASE_URL}/api/FrmPayCommissionListMst/save-paycommission`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (res.data?.success) {
                Swal.fire({
                    text: res.data?.errorMsg,
                    confirmButtonColor: "#1e3a8a"
                }).then(() => {
                    navigate("/Masters/FrmPayCommList");
                });


            } else {
                Swal.fire({
                    text: res.data?.errorMsg || "Something went wrong",
                });
            }
        } catch (error) {
            console.error("Save Pay Commission API Error:", error);
            Swal.fire({
                text: "Pension Commission already exist",
                confirmButtonColor: "#1e3a8a"
            }).then(() => {
                navigate("/Masters/FrmPayCommList");
            });
        }
    };

    return (
        <Formik
            initialValues={formInitialValues}
            enableReinitialize={true}
            onSubmit={handleSubmit}
        >
            {({ values, handleChange }) => (
                <Form>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 md:p-5 min-h-screen"
                    >
                        <Card className="border-0 shadow-none rounded-none bg-transparent">

                            <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                                <CardTitle className="text-xl font-bold">
                                    Pay Commission Master
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-52 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label className="text-[15px] font-semibold text-black text-nowrap">
                                                <span className="text-red-500">*</span> Pay Commission
                                                Name
                                            </Label>

                                            <span>:</span>
                                        </div>

                                        <Input
                                            name="CommissionName"
                                            value={values.CommissionName}
                                            onChange={handleChange}
                                            placeholder="Enter Pay Commission Name"
                                            className="w-full h-9"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label className="text-[15px] font-semibold text-black text-nowrap">
                                                <span className="text-red-500">*</span> Pay Type Code
                                            </Label>
                                            <span>:</span>
                                        </div>
                                        <Input
                                            name="payTypeCode"
                                            value={values.payTypeCode}
                                            onChange={handleChange}
                                            placeholder="Enter Pay Type Code"
                                            className="w-full h-9"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label className="text-[15px] font-semibold text-black">
                                                <span className="text-red-500">*</span> Status
                                            </Label>

                                            <span>:</span>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            <Label className="flex items-center gap-3 cursor-pointer">
                                                <Input
                                                    type="radio"
                                                    name="status"
                                                    value="Active"
                                                    checked={values.status === "Active"}
                                                    onChange={handleChange}
                                                    className="w-9 h-4"
                                                />
                                                Active
                                            </Label>

                                            <Label className="flex items-center gap-2 cursor-pointer">
                                                <Input
                                                    type="radio"
                                                    name="status"
                                                    value="InActive"
                                                    checked={values.status === "InActive"}
                                                    onChange={handleChange}
                                                    className="w-9 h-4"
                                                />
                                                InActive
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
                                    <Button
                                        type="submit"
                                        className="bg-blue-900 hover:bg-blue-800 text-white px-8"
                                    >
                                        {mode === 1 ? "Save" : "Update"}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-8"
                                        onClick={() => navigate("/Masters/FrmPayCommList")}
                                    >
                                        Back
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Form>
            )}
        </Formik>
    );
};

export default FrmPayCommMst;
