import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const initialValues = {
  corporation: "",
  payHead: "",
  calculation: "fix",
  value: "",
  designation: "",
  grade: "",
  category: "",
  maxLimit: "",
};

const FrmPayHeadConfigMst = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;

  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData || null;
  const mode = location.state?.mode || 1;

  const [loading, setLoading] = useState(false);
  const [corporationOptions, setCorporationOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [payHeadOptions, setPayHeadOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [isDesignationAll, setIsDesignationAll] = useState(false);
  const [isGradeAll, setIsGradeAll] = useState(false);
  const [isCategoryAll, setIsCategoryAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allDesignationsList, setAllDesignationsList] = useState([]);
  const [allGradesList, setAllGradesList] = useState([]);
  const [allCategoriesList, setAllCategoriesList] = useState([]);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [formValues, setFormValues] = useState(() => ({
    ...initialValues,
    corporation: mode === 2 && ulbId ? String(ulbId) : "",
  }));
  
  const isInitialDataSet = useRef(false);
  const isEditModeLoaded = useRef(false);
  
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchCorporation = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/Branchconfi/corporationlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data?.data || res.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.DISPLAY_TEXT,
          value: String(item.ID_VALUE),
        }));
        setCorporationOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching corporation:", err);
    }
  };
  
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
        const allCats = formatted.map(item => item.value);
        setAllCategoriesList(allCats);
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
      console.error("Error fetching payheads:", err);
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
        const allDesigs = formatted.map(item => item.value);
        setAllDesignationsList(allDesigs);
      }
    } catch (err) {
      console.error("Error fetching designations:", err);
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
        const allGrades = formatted.map(item => item.value);
        setAllGradesList(allGrades);
      }
    } catch (err) {
      console.error("Error fetching grades:", err);
    }
  };

  const buildStr1Combinations = (gradeIds, designationIds, categoryIds) => {
    const combinations = [];
    
    for (let i = 0; i < designationIds.length; i++) {
      for (let j = 0; j < gradeIds.length; j++) {
        for (let k = 0; k < categoryIds.length; k++) {
          combinations.push(`${gradeIds[j]}~${designationIds[i]}~${categoryIds[k]}`);
        }
      }
    }
    
    return combinations.join('^');
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!values.payHead || values.payHead === "0" || values.payHead === "") {
      Swal.fire({
        text: "Please select Pay Head",
        confirmButtonColor: "#1e3a8a"
      });
      setIsSaving(false);
      setSubmitting(false);
      return;
    }

    if (values.calculation !== "slab") {
      if (!values.value || values.value === "") {
        Swal.fire({
          text: "Please enter Value",
          confirmButtonColor: "#1e3a8a"
        });
        setIsSaving(false);
        setSubmitting(false);
        return;
      }
      
      const numValue = Number(values.value);
      if (isNaN(numValue) || numValue < 0) {
        Swal.fire({
          text: "Please enter a valid positive Value",
          confirmButtonColor: "#1e3a8a"
        });
        setIsSaving(false);
        setSubmitting(false);
        return;
      }
    }

    if (!isGradeAll) {
      if (!values.grade || values.grade === "0" || values.grade === "") {
        Swal.fire({
          text: "Please select Grade",
          confirmButtonColor: "#1e3a8a"
        });
        setIsSaving(false);
        setSubmitting(false);
        return;
      }
    }

    if (!isDesignationAll) {
      if (!values.designation || values.designation === "0" || values.designation === "") {
        Swal.fire({
          text: "Please select Designation",
          confirmButtonColor: "#1e3a8a"
        });
        setIsSaving(false);
        setSubmitting(false);
        return;
      }
    }

    if (!values.category || values.category === "0" || values.category === "") {
      Swal.fire({
        text: "Please select Category",
        confirmButtonColor: "#1e3a8a"
      });
      setIsSaving(false);
      setSubmitting(false);
      return;
    }

    if (values.maxLimit && values.maxLimit !== "") {
      const numMaxLimit = Number(values.maxLimit);
      if (isNaN(numMaxLimit) || numMaxLimit < 0) {
        Swal.fire({
          text: "Please enter a valid positive Max Limit",
          confirmButtonColor: "#1e3a8a"
        });
        setIsSaving(false);
        setSubmitting(false);
        return;
      }
    }

    setIsSaving(true);
    
    try {
      let gradeIds = [];
      if (isGradeAll) {
        gradeIds = allGradesList;
      } else if (values.grade && values.grade !== "0") {
        gradeIds = [values.grade];
      } else {
        gradeIds = ["0"];
      }
      
      let designationIds = [];
      if (isDesignationAll) {
        designationIds = allDesignationsList;
      } else if (values.designation && values.designation !== "0") {
        designationIds = [values.designation];
      } else {
        designationIds = ["0"];
      }
      
      let categoryIds = [];
      if (isCategoryAll) {
        categoryIds = allCategoriesList;
      } else if (values.category && values.category !== "0") {
        categoryIds = [values.category];
      } else {
        categoryIds = ["0"];
      }
      
      const str1 = buildStr1Combinations(gradeIds, designationIds, categoryIds);
      
      const payload = {
        userId: user?.userId || user?.name || "Admin",
        payHeadId: Number(values.payHead),
        calcType: values.calculation === "fix" ? "F" : 
                  values.calculation === "percentage" ? "P" : "S",
        value: Number(values.value) || 0,
        str1: str1,
        str2: null,
        str3: null,
        str4: null,
        str5: null,
        str6: null,
        mode: mode,
        tranId: editData?.payTranId || null,
        maxLimit: values.maxLimit ? Number(values.maxLimit) : null,
        ulbId: Number(ulbId)
      };
      
      const response = await axios.post(
        `${BASE_URL}/api/FrmPayHeadConfigList/save-payhead-config`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const result = response.data;
      if (result.errorCode === 9999 || result.errorCode === -100) {
        Swal.fire({
          text: result.errorMsg || "Saved Successfully",
          confirmButtonColor: "#1e3a8a"
        }).then(() => {
          navigate("/Masters/FrmPayHeadConfigList");
        });
      } else if (result.errorCode < 0) {
        Swal.fire({
          text: result.errorMsg || "Error occurred",
          confirmButtonColor: "#1e3a8a"
        });
      } else {
        Swal.fire({
          text: "Saved Successfully",
          confirmButtonColor: "#1e3a8a"
        }).then(() => {
          navigate("/Masters/FrmPayHeadConfigList");
        });
      }
    } catch (error) {
      Swal.fire({
        text: error.response?.data?.error || "Error saving configuration",
        confirmButtonColor: "#1e3a8a"
      });
    } finally {
      setIsSaving(false);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (ulbId) {
      fetchCorporation();
      fetchCategories();
      fetchPayHead();
      fetchDesignation();
      fetchGrade();
    }
  }, [ulbId]);

  useEffect(() => {
    const loadConfigDetails = async () => {
      if (
        mode === 2 &&
        editData &&
        ulbId &&
        token &&
        payHeadOptions.length > 0 &&
        designationOptions.length > 0 &&
        gradeOptions.length > 0 &&
        categoryOptions.length > 0 &&
        !isEditModeLoaded.current
      ) {
        isEditModeLoaded.current = true;
        setIsConfigLoading(true);

        try {
          const response = await axios.post(
            `${BASE_URL}/api/FrmPayHeadConfigList/payhead-config-details`,
            {
              categoryId: Number(editData.categoryId),
              payHeadId: Number(editData.payHeadId),
              desigId: Number(editData.desigId),
              gradeId: Number(editData.gradeId),
              ulbId: Number(ulbId),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const apiData = response.data?.data || response.data || [];

          if (apiData.length > 0) {
            const data = apiData[0];
            
            setFormValues({
              corporation: String(ulbId),
              payHead: String(data.NUM_PAYHEADSDTL_ID),
              calculation:
                data.VAR_PAYHEADSDTL_CALCTYPE === "P"
                  ? "percentage"
                  : data.VAR_PAYHEADSDTL_CALCTYPE === "S"
                  ? "slab"
                  : "fix",
              value:
                data.NUM_PAYHEADSDTL_VALUE?.toString() || "",
              designation: String(data.NUM_PAYHEADSDTL_DESIGID),
              grade: String(data.NUM_PAYHEADSDTL_GRADEID),
              category: String(data.CATEGORYID),
              maxLimit: data.NUM_PAYHEADSDTL_MAXLIMIT?.toString() || "",
            });
          }
        } catch (err) {
          console.error("Error fetching config details:", err);
          Swal.fire({
            text: "Error fetching configuration details",
            confirmButtonColor: "#1e3a8a"
          });
        } finally {
          setIsConfigLoading(false);
        }
      }
    };

    loadConfigDetails();
  }, [
    mode,
    editData,
    ulbId,
    token,
    payHeadOptions.length,
    designationOptions.length,
    gradeOptions.length,
    categoryOptions.length,
  ]);

  return (
    <Formik
      key={mode === 2 ? formValues.payHead : "add"} 
      initialValues={formValues}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({
        values,
        handleChange,
        setFieldValue,
        isSubmitting,
      }) => {
        return (
          <Form>
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-semibold">
                  PayHead Config Master
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                {isConfigLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                    <span className="ml-2">Loading Data...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Corporation Name" required />
                          <span>:</span>
                        </div>
                        <Select
                          value={values.corporation || (ulbId ? String(ulbId) : "")}
                          onValueChange={(v) => setFieldValue("corporation", v)}
                        >
                          <SelectTrigger className="w-full! h-9 overflow-hidden">
                            <SelectValue placeholder="-- विकल्प निवडा --" />
                          </SelectTrigger>
                          <SelectContent>
                            {corporationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="PayHead" required />
                          <span>:</span>
                        </div>
                        <Select
                          value={values.payHead}
                          onValueChange={(v) => setFieldValue("payHead", v)}
                          disabled={mode === 2}
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

                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                            <Label text="Calculation" required />
                            <span>:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Input
                                type="radio"
                                name="calculation"
                                checked={values.calculation === "fix"}
                                onChange={() => {
                                  setFieldValue("calculation", "fix");
                                  if (values.calculation === "slab") {
                                    setFieldValue("value", "");
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="font-medium text-gray-700 cursor-pointer">
                                Fix
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Input
                                type="radio"
                                name="calculation"
                                checked={values.calculation === "percentage"}
                                onChange={() => {
                                  setFieldValue("calculation", "percentage");
                                  if (values.calculation === "slab") {
                                    setFieldValue("value", "");
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="font-medium text-gray-700 cursor-pointer">
                                Percentage
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Input
                                type="radio"
                                name="calculation"
                                checked={values.calculation === "slab"}
                                onChange={() => {
                                  setFieldValue("calculation", "slab");
                                  setFieldValue("value", "");
                                }}
                                className="w-4 h-4"
                              />
                              <span className="font-medium text-gray-700 cursor-pointer">
                                Slab
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Value" required={values.calculation !== "slab"} />
                          <span>:</span>
                        </div>
                        <Input
                          name="value"
                          value={values.value}
                          onChange={handleChange}
                          disabled={values.calculation === "slab"}
                          className={values.calculation === "slab" ? "bg-gray-100" : ""}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Designation" required={!isDesignationAll} />
                          <span>:</span>
                        </div>
                        <Select
                          value={values.designation}
                          onValueChange={(v) => setFieldValue("designation", v)}
                          disabled={isDesignationAll}
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
                        {mode !== 2 && (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <Input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={isDesignationAll}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setIsDesignationAll(checked);
                                if (checked) {
                                  setFieldValue("designation", "");
                                }
                              }}
                            />
                            <span className="text-sm">All</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Grade" required={!isGradeAll} />
                          <span>:</span>
                        </div>
                        <Select
                          value={values.grade}
                          onValueChange={(v) => setFieldValue("grade", v)}
                          disabled={isGradeAll}
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
                        {mode !== 2 && (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <Input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={isGradeAll}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setIsGradeAll(checked);
                                if (checked) {
                                  setFieldValue("grade", "");
                                }
                              }}
                            />
                            <span className="text-sm">All</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Category" required />
                          <span>:</span>
                        </div>
                        <Select
                          value={values.category}
                          onValueChange={(v) => setFieldValue("category", v)}
                        >
                          <SelectTrigger className="w-full! h-9 overflow-hidden">
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
                        {mode !== 2 && (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <Input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={isCategoryAll}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setIsCategoryAll(checked);
                                if (checked) {
                                  setFieldValue("category", "");
                                }
                              }}
                            />
                            <span className="text-sm">All</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label text="Maxlimit" />
                          <span>:</span>
                        </div>
                        <Input
                          name="maxLimit"
                          value={values.maxLimit}
                          onChange={handleChange}
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center gap-3 mt-8">
                      <Button type="submit" disabled={isSubmitting || isSaving || loading}>
                        {isSaving ? "Saving..." : "Save"}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/Masters/FrmPayHeadConfigList")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmPayHeadConfigMst;