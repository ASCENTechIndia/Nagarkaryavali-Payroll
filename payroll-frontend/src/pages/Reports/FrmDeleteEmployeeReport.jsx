import { useCallback, useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmDeleteEmployeeReport = () => {
  const { user, token: authToken } = useAuth();
  const token = authToken || user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const [departmentList, setDepartmentList] = useState([]);
  const [billNoList, setBillNoList] = useState([]);

  const initialValues = {
    department: "-1",
    billNo: "-1",
    slipNo: "",
    empName: "",
  };

  const fetchBillNoList = useCallback(async (deptIdValue = "-1") => {
    if (!token || !ulbId) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmDeleteEmployeeReport/billno-list`,
        {
          ulbid: Number(ulbId),
          deptId: deptIdValue || "-1",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bills =
        response?.data?.data?.data ||
        response?.data?.data?.rows ||
        [];
      setBillNoList(bills);
    } catch (error) {
      console.error("Failed to load bill no list:", error);
      setBillNoList([]);
    }
  }, [token, ulbId]);

  useEffect(() => {
    if (!token || !ulbId) return;

    const loadMasters = async () => {
      try {
        Swal.fire({
          title: "Loading...",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        });

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [deptRes] = await Promise.allSettled([
          axios.post(
            `${BASE_URL}/api/FrmDeleteEmployeeReport/department-list`,
            { ulbid: Number(ulbId) },
            config
          ),
          fetchBillNoList("-1"),
        ]);

        if (deptRes.status === "fulfilled") {
          const depts =
            deptRes.value?.data?.data?.data ||
            deptRes.value?.data?.data?.rows ||
            [];
          setDepartmentList(depts);
        }
      } catch (error) {
        console.error("Failed to load dropdown masters:", error);
      } finally {
        Swal.close();
      }
    };

    loadMasters();
  }, [token, ulbId, fetchBillNoList]);

  const handleDepartmentChange = async (value, setFieldValue) => {
    setFieldValue("department", value);
    setFieldValue("billNo", "-1");
    await fetchBillNoList(value);
  };

  const handleSubmit = async (values) => {
    if (!values.department) {
      Swal.fire({ icon: "warning", text: "Please select Department." });
      return;
    }

    try {
      Swal.fire({
        title: "Generating...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const selectedDept = departmentList.find(
        (d) => String(d.DEPTID) === String(values.department)
      );

      const payload = {
        ulbId: Number(ulbId),
        ulbid: Number(ulbId),
        deptId: values.department,
        deptName: selectedDept ? selectedDept.DEPTNAME : null,
        billNo: values.billNo,
        slipNo: values.slipNo?.trim() || "",
        empName: values.empName?.trim() || "",
      };

      const response = await axios.post(
        `${BASE_URL}/api/FrmDeleteEmployeeReport/generate-pdf`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.close();

      if (response?.data?.success && response?.data?.pdfUrl) {
        window.open(response.data.pdfUrl, "_blank");
      } else {
        Swal.fire({
          icon: "warning",
          text: response?.data?.message || "Record not Found",
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to generate report.",
      });
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-5"
          >
            <Card className="border shadow-sm">
              <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                <CardTitle className="text-xl font-bold">
                  Delete Employee Record Report
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label
                        text="Department"
                        className="text-[15px] font-semibold text-black"
                      />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.department}
                      onValueChange={(value) =>
                        handleDepartmentChange(value, setFieldValue)
                      }
                    >
                      <SelectTrigger className="w-full h-9 overflow-hidden">
                        <SelectValue placeholder="-- ALL --" />
                      </SelectTrigger>
                      <SelectContent showDefaultOption={false}>
                        <SelectItem value="-1">-- ALL --</SelectItem>
                        {departmentList
                          .filter(
                            (dept) =>
                              dept?.DEPTID != null &&
                              String(dept.DEPTID).trim() !== ""
                          )
                          .map((dept) => (
                            <SelectItem
                              key={dept.DEPTID}
                              value={String(dept.DEPTID)}
                            >
                              {dept.DEPTNAME}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bill No. */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label
                        text="Bill No."
                        className="text-[15px] font-semibold text-black"
                      />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.billNo}
                      onValueChange={(value) => setFieldValue("billNo", value)}
                    >
                      <SelectTrigger className="w-full h-9 overflow-hidden">
                        <SelectValue placeholder="-- ALL --" />
                      </SelectTrigger>
                      <SelectContent showDefaultOption={false}>
                        <SelectItem value="-1">-- ALL --</SelectItem>
                        {billNoList
                          .filter((bill) => {
                            const code = bill?.BILLNO ?? bill?.BILLCODE;
                            return code != null && String(code).trim() !== "";
                          })
                          .map((bill) => {
                            const code = String(bill.BILLNO ?? bill.BILLCODE).trim();
                            return (
                              <SelectItem key={code} value={code}>
                                {bill.BILLCODE ?? bill.BILLNO}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Slip No. */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label
                        text="Slip No."
                        className="text-[15px] font-semibold text-black"
                      />
                      <span>:</span>
                    </div>
                    <Input
                      type="text"
                      name="slipNo"
                      placeholder="Enter Slip No."
                      className="h-9"
                      value={values.slipNo}
                      onChange={(e) => setFieldValue("slipNo", e.target.value)}
                    />
                  </div>

                  {/* Employee Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label
                        text="Employee Name"
                        className="text-[15px] font-semibold text-black"
                      />
                      <span>:</span>
                    </div>
                    <Input
                      type="text"
                      name="empName"
                      placeholder="Enter Employee Name"
                      className="h-9"
                      value={values.empName}
                      onChange={(e) => setFieldValue("empName", e.target.value)}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                  <Button type="submit" className="px-8">
                    Submit
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="px-8"
                    onClick={() => navigate("/HomePage/FrmHomePage")}
                  >
                    Cancel
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

export default FrmDeleteEmployeeReport;
