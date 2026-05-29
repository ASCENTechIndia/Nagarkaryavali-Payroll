import React from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

const initialValues = {
  payScaleId: "",
  payScale: "",
};

const FrmPayScaleMst = () => {

    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const navigate = useNavigate();
    const location = useLocation();

    const mode = location.state?.mode || 1;

    const data = location.state?.data;

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [formValues, setFormValues] = useState(initialValues);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchPayScaleDetails = async (payScaleId) => {
        try {
            setLoading(true);

            const res = await axios.post(
            `${BASE_URL}/api/FrmPayScaleListMst/payscale-details`,
            {
                payscaleid: payScaleId,
            },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            const apiData = res?.data?.[0];

            if (apiData) {
            setFormValues({
                payScaleId: apiData.NUM_PAYSCALEMST_PAYSCALEID,
                payScale:
                apiData.VAR_PAYSCALEMST_PAYSCALENAME || "",
            });
            }
        } catch (err) {
            console.error("Details Error :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mode === 2 && data?.payScaleId) {
            fetchPayScaleDetails(data.payScaleId);
        }
    }, []);

    const handleSubmit = async (values) => {
        try {
            const payload = {
            userId: user?.userId,
            payslid:
                mode === 2
                ? Number(values.payScaleId)
                : 0,
            payScale: values.payScale,
            mode: mode === 2 ? 2 : 1,
            };

            const res = await axios.post(
            `${BASE_URL}/api/FrmPayScaleListMst/save-payscale`,
            payload,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            if (res?.data?.success) {
            Swal.fire({
                text: res?.data?.errorMsg,
                confirmButtonColor: "#1e3a8a",
            });

            navigate("/Masters/FrmPayScaleList");
            }
        } catch (err) {
            console.error("Save Error :", err);
            confirmButtonColor: "#1e3a8a",

            Swal.fire({
            text: "Something went wrong",
            confirmButtonColor: "#1e3a8a",
            });
        }
    };

    const handleDelete = async (values) => {
        try {
            setDeleteLoading(true);

            const payload = {
            userId: user?.userId,
            payslid: Number(values.payScaleId),
            payScale: values.payScale,
            mode: 3,
            };

            const res = await axios.post(
            `${BASE_URL}/api/FrmPayScaleListMst/save-payscale`,
            payload,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            if (res?.data?.success) {
            Swal.fire({
                text: res?.data?.errorMsg,
            });

            navigate("/Masters/FrmPayScaleList");
            }
        } catch (err) {
            console.error("Delete Error :", err);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <Formik 
            initialValues={formValues}
            enableReinitialize
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
                                    Pay Scale Master
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label text="Pay Scale" />
                                            <span>:</span>
                                        </div>
                                        <Input
                                            name="payScale"
                                            value={values.payScale}
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
                                            onClick={() => handleDelete(values)}
                                            disabled={deleteLoading}
                                        >
                                            Delete
                                        </Button>
                                    )}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-8"
                                        onClick={() => navigate("/Masters/FrmPayScaleList")}
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

export default FrmPayScaleMst;