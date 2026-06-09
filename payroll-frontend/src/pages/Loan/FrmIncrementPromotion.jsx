import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

const initialValues = {
    deptId: "",
    subDeptId: "",
    billNo: "",
    empId: "",
    type: "I",
    incType: "",
    promType: "",
    effectiveFrom: null,
    orderNo: "",
    orderDate: null,
    currDesig: "",
    newDesig: "",
    currGrade: "",
    newGrade: "",
    currPayScale: "",
    newPayScale: "",
    currBasic: "",
    newBasic: "",
    currGradePay: "",
    newGradePay: "",
};

const FrmIncreamentPramotionMst = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const userId = user?.userId;

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [departmentList, setDepartmentList] = useState([]);
    const [subDepartmentList, setSubDepartmentList] = useState([]);
    const [billList, setBillList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [incrementTypeList, setIncrementTypeList] = useState([]);
    const [promotionList, setPromotionList] = useState([]);
    const [gradeList, setGradeList] = useState([]);
    const [payScaleList, setPayScaleList] = useState([]);
    const [designationList, setDesignationList] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);

    const getDepartmentList = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,
                { ulbid: ulbId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.data.data.success) {
                await Swal.fire({
                    text: "Department List: No data",
                    // text: res?.data?.data?.message,
                });
                return;
            }
            setDepartmentList(res.data?.data?.data || []);
        } catch (error) {
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    const getSubDepartmentList = async (deptid) => {
        try {
            const res = await axios.post(`${BASE_URL}/api/FrmIncreamentPramotionMst/sub-department-list`,
                { deptid },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.data.data.success) {
                await Swal.fire({
                    text: "Sub-Department List: No data",
                    // text: res?.data?.data?.message,
                });
                return;
            }

            setSubDepartmentList(res.data?.data?.data || []);
        } catch (error) {
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    const getBillList = async (deptid) => {
        try {
            const res = await axios.post(`${BASE_URL}/api/FrmIncreamentPramotionMst/bill-list`,
                { ulbid: ulbId, deptid },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.data.data.success) {
                await Swal.fire({
                    text: "Bill List: No data",
                    // text: res?.data?.data?.message,
                });
                return;
            }
            setBillList(res.data?.data?.data || []);
        } catch (error) {
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    const getEmployeeList = async ({ deptid, subdeptid, billno }) => {
        try {
            const res = await axios.post(`${BASE_URL}/api/FrmIncreamentPramotionMst/employee-list`,
                { deptid, subdeptid, billno, ulbid: ulbId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.data.data.success) {
                await Swal.fire({
                    text: "Employee List: No data",
                    // text: res?.data?.data?.message,
                });
                return;
            }
            setEmployeeList(res.data?.data?.data || []);
        } catch (error) {
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    const getIncrementTypeList = async () => {
        const res = await axios.get(`${BASE_URL}/api/FrmIncreamentPramotionMst/increment-type-list`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.data.data.success) {
            await Swal.fire({
                text: "Increment List: No data",
                // text: res?.data?.data?.message,
            });
            return;
        }
        setIncrementTypeList(res.data?.data?.data || []);

    };

    const getPromotionList = async () => {
        const res = await axios.get(`${BASE_URL}/api/FrmIncreamentPramotionMst/promotion-list`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.data.data.success) {
            await Swal.fire({
                text: "Promotion List: No data",
                // text: res?.data?.data?.message,
            });
            return;
        }
        setPromotionList(res.data?.data?.data || []);
    };

    const getGradeList = async () => {
        const res = await axios.get(`${BASE_URL}/api/FrmIncreamentPramotionMst/grade-list`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.data.data.success) {
            await Swal.fire({
                text: "Grade List: No data",
                // text: res?.data?.data?.message,
            });
            return;
        }
        setGradeList(res.data?.data?.data || []);
    };

    const getPayScaleList = async () => {
        const res = await axios.get(`${BASE_URL}/api/FrmIncreamentPramotionMst/payscale-list`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.data.data.success) {
            await Swal.fire({
                text: "Pay List: No data",
                // text: res?.data?.data?.message,
            });
            return;
        }
        setPayScaleList(res.data?.data?.data || []);
    };

    const getDesignationList = async () => {
        const res = await axios.post(`${BASE_URL}/api/FrmIncreamentPramotionMst/designation-list`,
            { ulbid: ulbId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.data.data.success) {
            await Swal.fire({
                text: "Designation List: No data",
                // text: res?.data?.data?.message,
            });
            return;
        }
        setDesignationList(res.data?.data?.data || []);
    };

    useEffect(() => {
        if (!token) return;

        const loadMasters = async () => {
            Swal.fire({
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });

            try {
                const results = await Promise.allSettled([
                    getDepartmentList(),
                    getIncrementTypeList(),
                    getPromotionList(),
                    getGradeList(),
                    getPayScaleList(),
                    getDesignationList(),
                    getEmployeeList({ deptid: null, subdeptid: null, billno: null })
                ]);
                console.log(results)
                results.forEach((result) => {
                    if (result.status === "rejected") {
                        console.error(result.reason);
                    }
                });
            } finally {
                Swal.close();
            }
        };

        loadMasters();
    }, [token]);


    const handleSubmit = async (values, resetForm) => {
        try {
            Swal.fire({
                title: "Saving...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const payload = {
                userId,
                empId: values.empId,
                deptId: values.deptId,
                subDeptId: values.subDeptId,
                type: values.type,
                effectiveFrom: values.effectiveFrom,
                incType: values.incType,
                promType: values.promType,
                orderNo: values.orderNo,
                orderDate: values.orderDate,
                currGrade: values.currGrade,
                newGrade: values.newGrade,
                currPayScale: values.currPayScale,
                newPayScale: values.newPayScale,
                currBasic: values.currBasic,
                newBasic: values.newBasic,
                currGradePay: values.currGradePay,
                newGradePay: values.newGradePay,
                currDesig: values.currDesig,
                newDesig: values.newDesig,
                ulbid: ulbId,
            };

            const saveRes = await axios.post(`${BASE_URL}/api/FrmIncreamentPramotionMst/save-increment-promotion`, payload);

            const incPromoId = saveRes.data?.data?.incPromoId;
            if (uploadFiles && incPromoId) {
                const formData = new FormData();
                formData.append("incPromoId", incPromoId);
                formData.append("imageType", uploadFiles.type);
                formData.append("BLOBDoc", uploadFiles);

                await axios.post(`${BASE_URL}/api/FrmIncreamentPramotionMst/update-IncreamentDocument`, formData);
            }

            Swal.fire({
                // icon: "success",
                text: saveRes.data?.data?.message,
            });

            resetForm();
            setUploadFiles(null);
            // setSubDepartmentList([]);
            // setBillList([]);
            // setEmployeeList([]);
        } catch (error) {
            await Swal.fire({
                text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong"
            });
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
        >
            {({ values, setFieldValue, resetForm }) => (
                <Form>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 md:p-5"
                    >
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b">
                                <CardTitle className="text-xl font-semibold">
                                    Increment And Promotion Form
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Department" required />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.deptId}
                                            onValueChange={(value) => {
                                                setFieldValue("deptId", value);
                                                setFieldValue("subDeptId", "");
                                                setFieldValue("billNo", "");
                                                setFieldValue("empId", "");

                                                getSubDepartmentList(value);
                                                getBillList(value);

                                                getEmployeeList({
                                                    deptid: value,
                                                    subdeptid: null,
                                                    billno: null,
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {departmentList.map((item) => (
                                                    <SelectItem
                                                        key={item.DEPTID}
                                                        value={String(item.DEPTID)}
                                                    >
                                                        {item.DEPTNAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center jus gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Sub Department" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            disabled={!values.deptId}
                                            value={values.subDeptId}
                                            onValueChange={(value) => {
                                                setFieldValue("subDeptId", value);

                                                getEmployeeList({
                                                    deptid: values.deptId,
                                                    subdeptid: value,
                                                    billno: values.billNo,
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {subDepartmentList.map((item) => (
                                                    <SelectItem
                                                        key={item.NUM_DEPTSUB_ID}
                                                        value={String(item.NUM_DEPTSUB_ID)}
                                                    >
                                                        {item.VAR_DEPTSUB_SDEPTNAMEE}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Bill No." />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            disabled={!values.deptId}
                                            value={values.billNo}
                                            onValueChange={(value) => {
                                                setFieldValue("billNo", value);

                                                getEmployeeList({
                                                    deptid: values.deptId,
                                                    subdeptid: values.subDeptId,
                                                    billno: value,
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {billList.map((item) => (
                                                    <SelectItem
                                                        key={item.BILLNO}
                                                        value={item.BILLNO}
                                                    >
                                                        {item.BILLCODE}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0  flex items-center justify-between">
                                            <Label text="Employee Name" required />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.empId}
                                            onValueChange={(value) =>
                                                setFieldValue("empId", value)
                                            }
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {employeeList.map((item) => (
                                                    <SelectItem
                                                        key={item.NUM_EMPLOYEE_EMPID}
                                                        value={String(item.NUM_EMPLOYEE_EMPID)}
                                                    >
                                                        {item.EMPNAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Type" required />
                                            <span>:</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="radio"
                                                name="type"
                                                checked={values.type === "I"}
                                                onChange={() =>
                                                    setFieldValue("type", "I")
                                                }
                                            />
                                            <Label text="Increment" />

                                            <Input
                                                type="radio"
                                                name="type"
                                                checked={values.type === "P"}
                                                onChange={() =>
                                                    setFieldValue("type", "P")
                                                }
                                            />
                                            <Label text="Promotion" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Increment Type" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.incType}
                                            onValueChange={(value) =>
                                                setFieldValue("incType", value)
                                            }
                                            disabled={values.type !== "I"}
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {incrementTypeList.map((item) => (
                                                    <SelectItem
                                                        key={item.NUM_INCTYPE_ID}
                                                        value={String(item.NUM_INCTYPE_ID)}
                                                    >
                                                        {item.VAR_INCTYPE_NAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Promotion Type" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.promType}
                                            onValueChange={(value) =>
                                                setFieldValue("promType", value)
                                            }
                                            disabled={values.type !== "P"}
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {promotionList.map((item) => (
                                                    <SelectItem
                                                        key={item.NUM_PROMOTION_ID}
                                                        value={String(item.NUM_PROMOTION_ID)}
                                                    >
                                                        {item.VAR_PROMOTION_NAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Effective From" required />
                                            <span>:</span>
                                        </div>
                                        <div className="w-64">
                                            <DatePicker
                                                value={values.effectiveFrom}
                                                onChange={(date) =>
                                                    setFieldValue("effectiveFrom", date)
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Order No" />
                                            <span>:</span>
                                        </div>
                                        <Input
                                            value={values.orderNo}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "orderNo",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Order Date" />
                                            <span>:</span>
                                        </div>
                                        <div className="w-64">
                                            <DatePicker
                                                value={values.orderDate}
                                                onChange={(date) =>
                                                    setFieldValue("orderDate", date)
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Current Designation" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.currDesig}
                                            onValueChange={(value) =>
                                                setFieldValue("currDesig", value)
                                            }
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {designationList.map((item) => (
                                                    <SelectItem
                                                        key={item.DESIG_ID}
                                                        value={String(item.DESIG_ID)}
                                                    >
                                                        {item.DESIG_ENAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="New Designation" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.newDesig}
                                            onValueChange={(value) =>
                                                setFieldValue("newDesig", value)
                                            }
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {designationList.map((item) => (
                                                    <SelectItem
                                                        key={item.DESIG_ID}
                                                        value={String(item.DESIG_ID)}
                                                    >
                                                        {item.DESIG_ENAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Current Grade" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.currGrade}
                                            onValueChange={(value) =>
                                                setFieldValue("currGrade", value)
                                            }
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {gradeList.map((item) => (
                                                    <SelectItem
                                                        key={item.NUM_GRADEMST_GRADEID}
                                                        value={String(item.NUM_GRADEMST_GRADEID)}
                                                    >
                                                        {item.VAR_GRADEMST_GRADENAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="New Grade" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.newGrade}
                                            onValueChange={(value) =>
                                                setFieldValue("newGrade", value)
                                            }
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {gradeList.map((item) => (
                                                    <SelectItem
                                                        key={item.NUM_GRADEMST_GRADEID}
                                                        value={String(item.NUM_GRADEMST_GRADEID)}
                                                    >
                                                        {item.VAR_GRADEMST_GRADENAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Current Payscale" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.currPayScale}
                                            onValueChange={(value) =>
                                                setFieldValue("currPayScale", value)
                                            }
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {payScaleList.map((item) => (
                                                    <SelectItem
                                                        key={item.NUM_PAYSCALEMST_PAYSCALEID}
                                                        value={String(
                                                            item.NUM_PAYSCALEMST_PAYSCALEID
                                                        )}
                                                    >
                                                        {item.VAR_PAYSCALEMST_PAYSCALEENAME ||
                                                            item.VAR_PAYSCALEMST_PAYSCALENAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="New Payscale" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.newPayScale}
                                            onValueChange={(value) =>
                                                setFieldValue("newPayScale", value)
                                            }
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {payScaleList.map((item) => (
                                                    <SelectItem
                                                        key={item.NUM_PAYSCALEMST_PAYSCALEID}
                                                        value={String(
                                                            item.NUM_PAYSCALEMST_PAYSCALEID
                                                        )}
                                                    >
                                                        {item.VAR_PAYSCALEMST_PAYSCALEENAME ||
                                                            item.VAR_PAYSCALEMST_PAYSCALENAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Current Basic" />
                                            <span>:</span>
                                        </div>
                                        <Input
                                            type="number"
                                            value={values.currBasic}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "currBasic",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="New Basic" />
                                            <span>:</span>
                                        </div>
                                        <Input
                                            type="number"
                                            value={values.newBasic}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "newBasic",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Current Grade Pay" />
                                            <span>:</span>
                                        </div>
                                        <Input
                                            type="number"
                                            value={values.currGradePay}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "currGradePay",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="New Grade Pay" />
                                            <span>:</span>
                                        </div>
                                        <Input
                                            type="number"
                                            value={values.newGradePay}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "newGradePay",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex items-center justify-between">
                                            <Label text="Upload Order" />
                                            <span>:</span>
                                        </div>
                                        <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) =>
                                                setUploadFiles(e.target.files?.[0] || null)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center gap-3 mt-8">
                                    <Button type="submit">
                                        Submit
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        path={"/"}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => {
                                            resetForm();
                                            setUploadFiles([]);
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Form>
            )}
        </Formik>
    );
}

export default FrmIncreamentPramotionMst;