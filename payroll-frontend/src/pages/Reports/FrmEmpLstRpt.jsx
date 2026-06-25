import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FrmEmployeeListReport = () => {
  const { token, user } = useAuth();

  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const isMarathiULB =
    Number(user?.ulbId) === 751 || Number(user?.ulbId) === 870;

  const labels = {
    department: isMarathiULB ? "विभाग" : "Department",
    designation: isMarathiULB ? "पदनाम" : "Designation",
    employeeType: isMarathiULB ? "कर्मचारी प्रकार" : "Category",
    employeeStatus: isMarathiULB ? "कर्मचारी स्थिती" : "Employee Status",
    gender: isMarathiULB ? "लिंग" : "Gender",
    employeeCode: isMarathiULB ? "कर्मचारी क्रमांक" : "Employee Code",

    working: isMarathiULB ? "कार्यरत" : "Working",
    retired: isMarathiULB ? "निवृत्त" : "Retired",
    suspended: isMarathiULB ? "निलंबित" : "Suspended",

    male: isMarathiULB ? "पुरुष" : "Male",
    female: isMarathiULB ? "स्त्री" : "Female",
    both: isMarathiULB ? "दोन्ही" : "Both",
  };

  const initialValues = {
    department: "-1",
    designation: "-1",
    employeeType: "-1",
    employeeStatus: "working",
    gender: "male",
    exportType: "pdf",
    employeeCode: "",
  };

  const getDepartmentList = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/FrmEmployeeMstList/department-list`,
        {
          ulbid: user?.ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDepartmentList(response?.data?.data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getDesignationList = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/FrmEmployeeMstNewTest/designation-list`,
        {
          ulbid: user?.ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDesignationList(response?.data?.data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getCategoryList = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/FrmSalaryCalulation/category`,
        {
          ulbid: user?.ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCategoryList(response?.data?.data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!token || !user?.ulbId) return;

    const loadData = async () => {
      await Promise.allSettled([
        getDepartmentList(),
        getDesignationList(),
        getCategoryList(),
      ]);
    };

    loadData();
  }, [token, user?.ulbId]);

  const handleSubmit = async (values) => {
    try {
      Swal.fire({
        title: "Please Wait...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
     
        // ulbid: 870,
        // empId: "2084",
        // categoryId: "1",
        // deptId: "459",
        // desigId: "423",
      
        ulbid: user?.ulbId,
        empId: values.employeeCode?.trim() || "",
        categoryId: values.employeeType === "-1" ? "" : values.employeeType,
        deptId: values.department === "-1" ? "" : values.department,
        desigId: values.designation === "-1" ? "" : values.designation,
        gender:
          values.gender === "male"
            ? "M"
            : values.gender === "female"
              ? "F"
              : "both",
        empStatus:
          values.employeeStatus === "working"
            ? "A"
            : values.employeeStatus === "retired"
              ? "R"
              : "S",
      };

      if (values.exportType === "pdf") {
        const response = await axios.post(
          `${baseUrl}/api/FrmEmpLstRpt/generate-employee-list-pdf`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        Swal.close();

        if (response?.data?.success && response?.data?.pdfUrl) {
          window.open(response.data.pdfUrl, "_blank");
        } else {
          Swal.fire({
            icon: "warning",
            text: response?.data?.message || "No Data Found",
          });
        }
      } else {
        const response = await axios.post(
          `${baseUrl}/api/FrmEmpLstRpt/employee-list`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        Swal.close();

        const data = response?.data?.data?.data || [];

        if (!data.length) {
          Swal.fire({
            icon: "warning",
            text: "No Data Found",
          });
          return;
        }

        console.log(data);

        const worksheet = XLSX.utils.json_to_sheet(data);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Employee List");

        XLSX.writeFile(workbook, `Employee_List_${Date.now()}.xlsx`);
      }
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: "error",
        text: error?.response?.data?.error,
      });
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue, resetForm }) => (
        <Form>
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Employee List Report
              </CardTitle>
            </CardHeader>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                {/* Department */}
                <div className="space-y-2">
                  <Label text={labels.department} />

                  <Select
                    value={values.department}
                    onValueChange={(value) =>
                      setFieldValue("department", value)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- ALL --" />
                    </SelectTrigger>

                    <SelectContent className="max-h-72">
                      <SelectItem value="-1">-- ALL --</SelectItem>

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

                {/* Designation */}
                <div className="space-y-2">
                  <Label text={labels.designation} />

                  <Select
                    value={values.designation}
                    onValueChange={(value) =>
                      setFieldValue("designation", value)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- ALL --" />
                    </SelectTrigger>

                    <SelectContent className="max-h-72">
                      <SelectItem value="-1">-- ALL --</SelectItem>

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

                {/* Employee Type */}
                <div className="space-y-2">
                  <Label text={labels.employeeType} />

                  <Select
                    value={values.employeeType}
                    onValueChange={(value) =>
                      setFieldValue("employeeType", value)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- ALL --" />
                    </SelectTrigger>

                    <SelectContent className="max-h-72">
                      <SelectItem value="-1">-- ALL --</SelectItem>

                      {categoryList.map((item) => (
                        <SelectItem
                          key={item.NUM_CATEGORY_ID}
                          value={String(item.NUM_CATEGORY_ID)}
                        >
                          {item.VAR_CATEGORY_NAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Employee Status */}
                <div className="space-y-3">
                  <Label text={labels.employeeStatus} />

                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="employeeStatus"
                        value="working"
                        checked={values.employeeStatus === "working"}
                        onChange={(e) =>
                          setFieldValue("employeeStatus", e.target.value)
                        }
                      />
                      <span>{labels.working}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="employeeStatus"
                        value="retired"
                        checked={values.employeeStatus === "retired"}
                        onChange={(e) =>
                          setFieldValue("employeeStatus", e.target.value)
                        }
                      />
                      <span>{labels.retired}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="employeeStatus"
                        value="suspended"
                        checked={values.employeeStatus === "suspended"}
                        onChange={(e) =>
                          setFieldValue("employeeStatus", e.target.value)
                        }
                      />
                      <span>{labels.suspended}</span>
                    </label>
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-3">
                  <Label text={labels.gender} />

                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={values.gender === "male"}
                        onChange={(e) =>
                          setFieldValue("gender", e.target.value)
                        }
                      />
                      <span>{labels.male}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={values.gender === "female"}
                        onChange={(e) =>
                          setFieldValue("gender", e.target.value)
                        }
                      />
                      <span>{labels.female}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="gender"
                        value="both"
                        checked={values.gender === "both"}
                        onChange={(e) =>
                          setFieldValue("gender", e.target.value)
                        }
                      />
                      <span>{labels.both}</span>
                    </label>
                  </div>
                </div>

                {/* Employee Code */}
                <div className="space-y-2">
                  <Label text={labels.employeeCode} />

                  <Input
                    value={values.employeeCode}
                    onChange={(e) =>
                      setFieldValue("employeeCode", e.target.value)
                    }
                  />
                </div>

                {/* Export */}
                <div className="space-y-3 md:col-span-3">
                  <Label text="Export To" required />

                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="exportType"
                        value="pdf"
                        checked={values.exportType === "pdf"}
                        onChange={(e) =>
                          setFieldValue("exportType", e.target.value)
                        }
                      />
                      <span>PDF</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="exportType"
                        value="excel"
                        checked={values.exportType === "excel"}
                        onChange={(e) =>
                          setFieldValue("exportType", e.target.value)
                        }
                      />
                      <span>EXCEL</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-10">
                <Button type="submit">Print</Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => resetForm()}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmEmployeeListReport;
