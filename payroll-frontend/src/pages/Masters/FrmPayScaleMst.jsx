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
    payScale: "",
};

const FrmPayScaleMst = () => {

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