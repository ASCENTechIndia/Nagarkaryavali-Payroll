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

const initialValues = {
    CommissionName: "",
    payTypeCode: "",
    status: "Active",
};

const FrmPayCommMst = () => {

    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const navigate = useNavigate();
    const location = useLocation();

    const mode = location.state?.mode || 1;


    return (
        <Formik initialValues={initialValues} onSubmit={() => { }}>
            {({ values, handleChange }) => (
                <Form>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 md:p-5 min-h-screen"
                    >
                        <Card className="border-0 shadow-none rounded-none bg-transparent">
                            {/* Header */}
                            <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                                <CardTitle className="text-xl font-bold">
                                    Pay Commission Master
                                </CardTitle>
                            </CardHeader>

                            {/* Form */}
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-52 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label className="text-[15px] font-semibold text-black text-nowrap">
                                                <span className="text-red-500">*</span> Pay Commission Name
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
                                        Save
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