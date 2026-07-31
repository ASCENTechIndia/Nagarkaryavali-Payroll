import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/Label";
import ShadCNTable from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import config from "@/utils/config";

const FrmPayrollDashboard = () => {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = Number(user?.ulbId);
    const [level, setLevel] = useState(1);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedDesignation, setSelectedDesignation] = useState(null);

    useEffect(() => {
        loadDepartments();
    }, []);

    const showLoader = (title = "Loading...") => {
        Swal.fire({
            title,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });
    };

    const loadDepartments = async () => {
        try {
            setLoading(true);
            showLoader();

            const response = await axios.get(`${BASE_URL}/api/FrmHomepage/department`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { ulbId },
                }
            );
            console.log({ response })
            const rows = response?.data?.data?.data || [];
            setDepartments(rows);
            setLevel(1);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                text: error?.response?.data?.error || error?.response?.data?.message || "Unable to load departments."
            });
        } finally {
            setLoading(false);
            Swal.close()
        }
    };

    const loadDesignations = async (dept) => {
        try {
            setLoading(true);
            showLoader();

            const response = await axios.get(`${BASE_URL}/api/FrmHomepage/designation`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { ulbId, deptId: dept.DEPTID },
                }
            );

            const rows = response?.data?.data?.data || [];
            setSelectedDepartment(dept);
            setDesignations(rows);
            setLevel(2);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                text: error?.response?.data?.error || error?.response?.data?.message || "Unable to load designation list."
            });
        } finally {
            setLoading(false);
            Swal.close()
        }
    };

    const loadEmployees = async (designation) => {
        try {
            setLoading(true);
            showLoader();

            const response = await axios.get(`${BASE_URL}/api/FrmHomepage/employee`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { ulbId, deptId: selectedDepartment.DEPTID, designationId: designation.DESIGNATIONID },
                }
            );

            const rows = response?.data?.data?.data || [];
            setSelectedDesignation(designation);
            setEmployees(rows);
            setLevel(3);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                text: error?.response?.data?.error || error?.response?.data?.message || "Unable to load employees."
            });
        } finally {
            setLoading(false);
            Swal.close()
        }
    };

    const handleDepartmentClick = (row) => {
        loadDesignations(row);
    };

    const handleDesignationClick = (row) => {
        loadEmployees(row);
    };


    const handleBack = () => {
        if (level === 3) {
            setLevel(2);
            setEmployees([]);
            setSelectedDesignation(null);
            return;
        }

        if (level === 2) {
            setLevel(1);
            setDesignations([]);
            setSelectedDepartment(null);
        }
    };

    const departmentHeaders = ["Action", "Department", "Employee Count"];
    const departmentKeyMapping = { Action: "ACTION", Department: "DEPTNAMEE", "Employee Count": "EMPCOUNT" };
    const departmentData = departments.map((row) => ({
        ...row,
        ACTION: (<Button size="sm" onClick={() => handleDepartmentClick(row)}>View</Button>),
    }));

    const designationHeaders = ["Action", "Designation", "Employee Count"];
    const designationKeyMapping = { Action: "ACTION", Designation: "DESIGNATIONNAME", "Employee Count": "EMPCOUNT" };
    const designationData = designations.map((row) => ({
        ...row,
        ACTION: (<Button size="sm" onClick={() => handleDesignationClick(row)}>View</Button>),
    }));


    const employeeHeaders = ["Employee Code", "Employee Name", "Department", "Designation", "Mobile", "DOB", "Joining Date", "Address"];

    const employeeKeyMapping = { "Employee Code": "EMPID", "Employee Name": "VAR_EMPLOYEE_ENGNAME", Department: "DEPTNAMEE", Designation: "DESIGNATIONNAME", Mobile: "MOBILENO", DOB: "DOB", "Joining Date": "JOINDATE", Address: "PSNTADDRESS" };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5"
        >
            <Card className="border  shadow-sm">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold">
                            Payroll Dashboard
                        </CardTitle>
                        {level > 1 && (<Button variant="outline" onClick={handleBack}>Back</Button>)}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center js gap-2 text-sm">
                        {selectedDepartment && (
                            <>
                                <Button variant="link" size="sm"
                                    onClick={() => {
                                        setLevel(1); setDesignations([]); setEmployees([]); setSelectedDepartment(null); setSelectedDesignation(null);
                                    }}
                                >
                                    Departments
                                </Button>

                                <span>/</span>
                                <Button variant="link" size="sm" onClick={() => { setLevel(2); setEmployees([]); setSelectedDesignation(null) }}>
                                    {selectedDepartment.DEPTNAMEE}
                                </Button>
                            </>
                        )}
                        {selectedDesignation && (
                            <>
                                <span>/</span>
                                <span className="font-semibold">{selectedDesignation.DESIGNATIONNAME}</span>
                            </>
                        )}

                    </div>

                    {level === 1 && (
                        <ShadCNTable
                            headers={departmentHeaders}
                            data={departmentData}
                            keyMapping={departmentKeyMapping}
                            pagination={true}
                            rowsPerPage={10}
                        />
                    )}
                    {level === 2 && (
                        <ShadCNTable
                            headers={designationHeaders}
                            data={designationData}
                            keyMapping={designationKeyMapping}
                            pagination={true}
                            rowsPerPage={10}
                        />
                    )}

                    {level === 3 && (
                        <ShadCNTable
                            headers={employeeHeaders}
                            data={employees}
                            keyMapping={employeeKeyMapping}
                            pagination={true}
                            rowsPerPage={10}
                        />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmPayrollDashboard;