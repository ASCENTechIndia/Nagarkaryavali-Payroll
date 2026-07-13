import React, { useEffect, useState } from "react";
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

const initialValues = {
    payHead: "",
    payHeadId: "",
    englishName: "",
    marathiName: "",
    paySheetOrder: "",
    mergeIn: "",
};

const FrmPayHeadMst = () => {

    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const userId = user?.userId;
    const navigate = useNavigate();
    const location = useLocation();

    const mode = location.state?.mode;
    const headId = location.state?.headId;

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [payHeadOptions, setPayHeadOptions] = useState([]);
    const [mergeInOptions, setMergeInOptions] = useState([]);
    const [formInitialValues, setFormInitialValues] = useState(initialValues);


    const fetchPayHeads = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/api/FrmPayHeadListMst/paysubheads-list`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPayHeadOptions(res.data?.rows || []);
        } catch (error) {
            console.error("Pay Head Dropdown API Error:", error);
        }
    };

    const fetchMergeInOptions = async (paySubHeadId) => {
        try {
            Swal.fire({
                title: "Loading ...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmPayHeadListMst/parent-payheads-list`,
                {
                    paySubHeadId: paySubHeadId,
                    ulbId: ulbId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMergeInOptions(res.data?.rows || []);
        } catch (error) {
            console.error("Merge In API Error:", error);
            setMergeInOptions([]);
        } finally {
            Swal.close();
        }
    };

    useEffect(() => {
        if (token) {
            fetchPayHeads();
        }
    }, [token]);


    const fetchPayHeadDetails = async () => {
        try {

            Swal.fire({
                title: "Loading ...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmPayHeadListMst/payhead-details`,
                {
                    payHeadId: headId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = res.data?.rows?.[0];

            if (data) {
                const updatedValues = {
                    payHead: data.SUBPAYID?.toString() || "",
                    payHeadId: data.PAYID?.toString() || "",
                    englishName: data.NAMEE || "",
                    marathiName: data.NAMEM || "",
                    paySheetOrder:
                        data.NUM_PAYHEADS_ORDERNO?.toString() || "",
                    mergeIn:
                        data.NUM_PAYHEADS_MERGEID?.toString() || "",
                };

                setFormInitialValues(updatedValues);

                if (data.SUBPAYID) {
                    await fetchMergeInOptions(data.SUBPAYID);
                }
            }

        } catch (error) {
            console.error("PayHead Details API Error:", error);
        } finally {
            Swal.close();
        }
    };

    useEffect(() => {
        if (
            mode == 2 &&
            headId &&
            token
        ) {
            fetchPayHeadDetails();
        }
    }, [mode, headId, token]);

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
                corpId: Number(ulbId),
                payHeadId: mode == 2 ? Number(values.payHeadId) : 0,
                subHeadId: Number(values.payHead),
                engName: values.englishName,
                marathiName: values.marathiName,
                orderNo: Number(values.paySheetOrder),
                mergeId: values.mergeIn ? Number(values.mergeIn) : null,
                ulbId: ulbId,
                mode: mode == 2 ? 2 : 1,
            };

            const res = await axios.post(
                `${BASE_URL}/api/FrmPayHeadListMst/save-payhead`,
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
                    confirmButtonColor: "#1e3a8a",
                }).then(() => {
                    navigate("/Masters/FrmPayHeadListMst");
                });
            } else {

                Swal.fire({
                    text: res.data?.message
                });
            }

        } catch (error) {
            console.error("Save API Error:", error);
            Swal.fire({
                text: "Failed to save data",
            });

        }
    };


    return (
        <Formik initialValues={formInitialValues} enableReinitialize={true} onSubmit={handleSubmit}>
            {({ values, handleChange, setFieldValue }) => {

                return (
                    <Form>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 md:p-5 min-h-screen"
                        >
                            <Card className="border-0 shadow-none rounded-none bg-transparent">
                                <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                                    <CardTitle className="text-xl font-bold">
                                        PayHead Master
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label className="text-[15px] font-semibold text-black" text="Pay Head" required />
                                                <span>:</span>
                                            </div>
                                            <Select
                                                value={values.payHead}
                                                onValueChange={(value) => {
                                                    handleChange({
                                                        target: {
                                                            name: "payHead",
                                                            value,
                                                        },
                                                    });
                                                    fetchMergeInOptions(value);
                                                }}
                                                disabled={mode === 2}
                                            >
                                                <SelectTrigger className="w-full h-9">
                                                    <SelectValue placeholder="-- Select Option --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {payHeadOptions.map((item) => (
                                                        <SelectItem
                                                            key={item.NUM_PAYSUBHEADS_ID}
                                                            value={item.NUM_PAYSUBHEADS_ID.toString()}
                                                        >
                                                            {item.VAR_PAYSUBHEADS_NAME}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label className="text-[15px] font-semibold text-black" text=" Pay Head ID" />
                                                <span>:</span>
                                            </div>

                                            <Input
                                                name="payHeadId"
                                                value={values.payHeadId}
                                                onChange={handleChange}
                                                className="w-full h-9"
                                                disabled
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label className="text-[15px] font-semibold text-black text-nowrap" text="English Name" required />
                                                <span>:</span>
                                            </div>

                                            <Input
                                                name="englishName"
                                                value={values.englishName}
                                                onChange={handleChange}
                                                className="w-full h-9"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label className="text-[15px] font-semibold text-black text-nowrap" text="Marathi Name" required />
                                                <span>:</span>
                                            </div>

                                            <Input
                                                name="marathiName"
                                                value={values.marathiName}
                                                onChange={handleChange}
                                                className="w-full h-9"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label className="text-[15px] font-semibold text-black text-nowrap" text="Pay Paysheet Order" required />
                                                <span>:</span>
                                            </div>

                                            <Input
                                                name="paySheetOrder"
                                                value={values.paySheetOrder}
                                                onChange={handleChange}
                                                className="w-full h-9"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label className="text-[15px] font-semibold text-black text-nowrap" text="Merge In" />
                                                <span>:</span>
                                            </div>

                                            <Select
                                                value={values.mergeIn}
                                                onValueChange={(value) =>
                                                    handleChange({
                                                        target: {
                                                            name: "mergeIn",
                                                            value,
                                                        },
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="w-full h-9">
                                                    <SelectValue placeholder="-- Select Option --" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {mergeInOptions.map((item) => (
                                                        <SelectItem
                                                            key={item.NUM_PAYHEADS_ID}
                                                            value={item.NUM_PAYHEADS_ID.toString()}
                                                        >
                                                            {item.VAR_PAYHEADS_ENAME}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
                                        <Button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white px-8" >
                                            Save
                                        </Button>

                                        <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8">
                                            Delete
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="px-8"
                                            onClick={() => navigate("/Masters/FrmPayHeadListMst")}
                                        >
                                            Cancel
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

export default FrmPayHeadMst;