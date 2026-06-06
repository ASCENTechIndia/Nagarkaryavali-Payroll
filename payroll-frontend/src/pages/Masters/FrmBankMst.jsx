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
    bankName: "",
};

const FrmBankMst = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const userId = user?.userId;
    const navigate = useNavigate();
    const location = useLocation();

    const mode = location.state?.mode || 1;
    const bankData = location.state?.data;

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [formInitialValues, setFormInitialValues] = useState(initialValues);

    const fetchBankDetails = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${BASE_URL}/api/BankList/bankbyid`,
                {
                    bankId: bankData?.bankCode,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const data = res.data?.data?.data?.[0];

            if (data) {
                setFormInitialValues({
                    bankName: data.VAR_BANK_NAME || "",
                });
            }
        } catch (error) {
            console.error("Bank Details API Error:", error);
        } finally {
            Swal.close();
        }
    };

    useEffect(() => {
        if (mode === 2 && bankData?.bankCode && token) {
            fetchBankDetails();
        }
    }, [mode, bankData, token]);

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
                bankId: mode === 2 ? bankData?.bankCode : 0,
                bankName: values.bankName,
                userId: userId,
                mode: mode === 2 ? 2 : 1,
            };

            const res = await axios.post(
                `${BASE_URL}/api/BankList/savebank`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (res.data?.ok) {
                Swal.fire({
                    text: res.data?.data?.errorMsg,
                }).then(() => {
                    navigate("/Masters/FrmBankList");
                });
            } else {
                Swal.fire({
                    text: res.data?.message,
                });
            }
        } catch (error) {
            console.error("Save Bank API Error:", error);

            Swal.fire({
                text: "Failed to save bank",
            });
        }
    };

    return (
        <Formik
            initialValues={formInitialValues}
            enableReinitialize={true}
            onSubmit={handleSubmit}
        >
            {({ values, handleChange }) => {
                const handleDelete = async () => {
                    try {
                        Swal.fire({
                            title: "Deleting...",
                            allowOutsideClick: false,
                            didOpen: () => {
                                Swal.showLoading();
                            },
                        });

                        const payload = {
                            bankId: bankData?.bankCode,
                            bankName: values.bankName,
                            userId: userId,
                            mode: 3,
                        };

                        const res = await axios.post(
                            `${BASE_URL}/api/BankList/savebank`,
                            payload,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (res.data?.ok) {
                            Swal.fire({
                                text: res.data?.data?.errorMsg,
                            }).then(() => {
                                navigate("/Masters/FrmBankList");
                            });
                        } else {
                            Swal.fire({
                                text: res.data?.message,
                            });
                        }
                    } catch (error) {
                        console.error("Delete Bank API Error:", error);
                        Swal.fire({
                            text: "Failed to delete bank",
                        });
                    }
                };
                return (
                    <Form>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 md:p-5 min-h-screen"
                        >
                            <Card className="border-0 shadow-none rounded-none bg-transparent">
                                <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                                    <CardTitle className="text-xl font-bold">Bank Master</CardTitle>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label className="text-[15px] font-semibold text-black" required>
                                                    Bank Name
                                                </Label>
                                                <span>:</span>
                                            </div>

                                            <Input
                                                name="bankName"
                                                value={values.bankName}
                                                onChange={handleChange}
                                                className="w-full h-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
                                        <Button
                                            type="submit"
                                            className="bg-blue-900 hover:bg-blue-800 text-white px-8"
                                        >
                                            {mode === 1 ? "Submit" : "Update"}
                                        </Button>

                                        {mode === 2 && (
                                            <Button
                                                type="button"
                                                className="bg-red-600 hover:bg-red-500 text-white px-8"
                                                onClick={handleDelete}
                                            >
                                                Delete
                                            </Button>
                                        )}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="px-8"
                                            onClick={() => navigate("/Masters/FrmBankList")}
                                        >
                                            Back
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Form>
                );
            }}
        </Formik>
    );
};

export default FrmBankMst;
