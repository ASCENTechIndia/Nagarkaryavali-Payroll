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
    desigId: "",
    desigName: "",
    washAllowance: "",
    cleanAllowance: "",
};

const FrmDesgMst = () => {

    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const userId = user?.userId;
    const navigate = useNavigate();
    const location = useLocation();

    const mode = location.state?.mode || 1;
    const desgId = location.state?.data?.desigId;

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [formInitialValues, setFormInitialValues] = useState(initialValues);


    const fetchDesignationDetails = async () => {

        try {

            Swal.fire({
                title: "Loading ...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmDesgListMst/designation-details`,
                {
                    desgId: desgId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = res.data?.rows?.[0];

            if (data) {

                setFormInitialValues({
                    desigId: data.DESGID?.toString() || "",
                    desigName: data.DESGNAME || "",
                    washAllowance:
                        data.WASHALLOW?.toString() || "",
                    cleanAllowance:
                        data.CLEANALLOW?.toString() || "",
                });
            }

        } catch (error) {
            console.error(
                "Designation Details API Error:",
                error
            );
        } finally {
            Swal.close();
        }
    };

    useEffect(() => {

        if (
            mode === 2 &&
            desgId &&
            token
        ) {
            fetchDesignationDetails();
        }

    }, [mode, desgId, token]);

    const handleSubmit = async (values) => {

        try {

            Swal.fire({
                title: "Saving ...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const payload = {
                userId: userId,
                desgId: mode === 2 ? Number(values.desigId) : 0,
                desgName: values.desigName,
                washAllowance: Number(values.washAllowance) || 0,
                cleanAllowance: Number(values.cleanAllowance) || 0,
                mode: mode,
            };

            const res = await axios.post(
                `${BASE_URL}/api/FrmDesgListMst/save-designation`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data?.success) {
                Swal.fire({
                    text: res.data?.message,
                    confirmButtonColor: "#1e3a8a"
                }).then(() => {
                    navigate("/Masters/FrmDesgListMst");
                });
            } else {
                Swal.fire({
                    text: res.data?.message || "Something went wrong",
                });
            }
        } catch (error) {
            console.error("Save Designation API Error:", error);

            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to save designation";

            Swal.fire({
                text: errorMessage,
                confirmButtonColor: "#1e3a8a",
            });
        }
    }

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
                                    Designation Master
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label className="text-[15px] font-semibold text-black text-nowrap" required>
                                                Designation ID
                                            </Label>
                                            <span>:</span>
                                        </div>

                                        <Input
                                            name="desigId"
                                            value={values.desigId}
                                            onChange={handleChange}
                                            className="w-full h-9"
                                            disabled
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label className="text-[15px] font-semibold text-black text-nowrap" required>
                                                Designation Name
                                            </Label>
                                            <span>:</span>
                                        </div>

                                        <Input
                                            name="desigName"
                                            value={values.desigName}
                                            onChange={handleChange}
                                            className="w-full h-9"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label className="text-[15px] font-semibold text-black text-nowrap" required>
                                                Wash Allowance
                                            </Label>
                                            <span>:</span>
                                        </div>

                                        <Input
                                            name="washAllowance"
                                            value={values.washAllowance}
                                            onChange={handleChange}
                                            className="w-full h-9"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label className="text-[15px] font-semibold text-black text-nowrap" required>
                                                Clean Allowance
                                            </Label>
                                            <span>:</span>
                                        </div>

                                        <Input
                                            name="cleanAllowance"
                                            value={values.cleanAllowance}
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
                                        Save
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-8"
                                        onClick={() => navigate("/Masters/FrmDesgListMst")}
                                    >
                                        cancel
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

export default FrmDesgMst;