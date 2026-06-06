import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import ShadCNTable from "@/components/ui/table";

const initialValues = {
  category: "",
  payHead: "",
  designation: "",
  grade: "",
};

const FrmPayHeadConfigList = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [payHeadOptions, setPayHeadOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [payHeadConfigData, setPayHeadConfigData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmEmployeeMstList/employee-category-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_CATEGORY_NAME,
          value: String(item.NUM_CATEGORY_ID),
        }));
        setCategoryOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchPayHead = async () => {
    try {
      if (!ulbId) return;
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmPayHeadConfigList/payheaddll`,
        { ulbId: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_PAYHEADS_ENAME,
          value: String(item.NUM_PAYHEADS_ID),
        }));
        setPayHeadOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching zones:", err);
    }
  };
  
  const fetchDesignation = async () => {
    try {
      if (!ulbId) return;
      
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstNewTest/designation-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.DESIG_ENAME,
          value: String(item.DESIG_ID),
        }));
        setDesignationOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchGrade = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmEmployeeMstNewTest/grade-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.VAR_GRADEMST_GRADENAME,
          value: String(item.NUM_GRADEMST_GRADEID),
        }));
        setGradeOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const handleSearch = async (values) => {
    setHasSearched(true);
    setLoading(true);
    try {
      if (!ulbId) {
        Swal.fire({ text: "ULB ID not found", confirmButtonColor: "#1e3a8a" });
        return;
      }
      if (!values.category) {
        Swal.fire({ text: "Please Select Category.", confirmButtonColor: "#1e3a8a" });
        return;
      }

      const payload = {
        ulbId: Number(ulbId),
        categoryId: values.category && values.category !== "-1" ? Number(values.category) : null,
        payHeadId: values.payHead && values.payHead !== "-1" ? Number(values.payHead) : null,
        desigId: values.designation && values.designation !== "-1" ? Number(values.designation) : null,
        gradeId: values.grade && values.grade !== "-1" ? Number(values.subDepartment) : null,
      };

      const res = await axios.post(
        `${BASE_URL}/api/FrmPayHeadConfigList/payheadconfig-list`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res?.data || res.data?.data || [];

      console.log("apiData", apiData);
      
      if (apiData.length > 0) {
        setPayHeadConfigData(apiData);
      } else {
        setPayHeadConfigData([]);
        Swal.fire({
          text: "No records found",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Search Error:", error);
      setPayHeadConfigData([]);
      Swal.fire({
        text: error.response?.data?.message || "Error searching employees",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setHasSearched(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ulbId) {
      fetchCategories();
      fetchPayHead();
      fetchDesignation();
      fetchGrade();
    }
  }, [ulbId]);

  const headers = [
    "Select",
    "Pay Head",
    "Category",
    "Designation",
    "Grade",
    "Calculation Type",
    "Value",
    "Max Limit",
  ];

  const keyMapping = {
    Select: "select",
    "Pay Head": "payHead",
    Category: "category",
    Designation: "designation",
    Grade: "grade",
    "Calculation Type": "calculationType",
    Value: "value",
    "Max Limit": "maxLimit",
  };

  const handleSelectEmployee = (row) => {
    navigate("/Masters/FrmPayHeadConfigMst", {
      state: {
        mode: 2,
        editData: {
          payTranId: row.PAYTRANID,
          payHeadId: row.NUM_PAYHEADSDTL_ID,
          categoryId: row.CATEGORYID,
          desigId: row.NUM_PAYHEADSDTL_DESIGID,
          gradeId: row.NUM_PAYHEADSDTL_GRADEID
        }
      },
    });
  };

  const tableRows = payHeadConfigData.map((row) => ({
    select: (
      <Button
        variant="link"
        size="sm"
        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
        onClick={() => handleSelectEmployee(row)}
      >
        Select
      </Button>
    ),
    payHead: row.VAR_PAYHEADS_ENAME ?? "",
    category: row.CATEGORYNAME ?? "",
    designation: row.VAR_DESIGMST_DESIGNATIONNAME ?? "",
    grade: row.VAR_GRADEMST_GRADENAME ?? "",
    calculationType: row.VAR_PAYHEADSDTL_CALCTYPE ?? "",
    value: row.NUM_PAYHEADSDTL_VALUE ?? "",
    maxLimit: row.NUM_PAYHEADSDTL_MAXLIMIT ?? "",
  }));

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSearch}
    >
      {({ values, setFieldValue, isSubmitting, resetForm }) => (
        <Form>
          <Card className="shadow-sm border">
            <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                PayHead Config List
              </CardTitle>

              
              <Button
                type="button"
                onClick={() => navigate("/Masters/FrmPayHeadConfigMst", { state: { mode: 1 } })}
                className="bg-blue-900 hover:bg-blue-800 text-white hover:text-white w-full sm:w-auto"
              >
                Add New
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4">

              

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Category" required />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.category}
                    onValueChange={(v) => setFieldValue("category", v)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- विकल्प निवडा --" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="PayHead" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.payHead}
                    onValueChange={(v) => setFieldValue("payHead", v)}
                  >
                    <SelectTrigger className="w-full! h-9 overflow-hidden">
                      <SelectValue placeholder="-- विकल्प निवडा --" />
                    </SelectTrigger>
                    <SelectContent>
                      {payHeadOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Designation" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.designation}
                    onValueChange={(v) => setFieldValue("designation", v)}
                  >
                    <SelectTrigger className="w-full! h-9 overflow-hidden">
                      <SelectValue placeholder="-- विकल्प निवडा --" />
                    </SelectTrigger>
                    <SelectContent>
                      {designationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Grade" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.grade}
                    onValueChange={(v) => setFieldValue("grade", v)}
                  >
                    <SelectTrigger className="w-full! h-9 overflow-hidden">
                      <SelectValue placeholder="-- विकल्प निवडा --" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="flex justify-center mt-8">
                <Button type="submit" disabled={isSubmitting || loading}>
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>

              <div>
                {loading && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Loading data...
                  </div>
                )}

                {!loading && payHeadConfigData.length > 0 && (
                  <ShadCNTable
                    headers={headers}
                    data={tableRows}
                    keyMapping={keyMapping}
                    pagination={true}
                    rowsPerPage={5}
                    className="max-md:min-w-380"
                  />
                )}

                {hasSearched && !loading && payHeadConfigData.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No records found.
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmPayHeadConfigList;