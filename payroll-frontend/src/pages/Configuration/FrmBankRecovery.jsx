import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";

import { useAuth } from "@/context/AuthContext";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import axios from "axios";

const initialValues = {
  corporation: "",
  department: "",
  subDepartment: "",
  employee: "",
  bank: "",
  branch: "",
  recoveryAmount: "",
  isWorking: true,
  fromYear: "",
  toYear: "",
  fromMonth: "",
  toMonth: "",
};

const FrmBankRecovery = () => {
  const { token, user } = useAuth();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const userId = user?.ulbId;

  const [corporationList, setCorporationList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [subDepartmentList, setSubDepartmentList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [monthList, setMonthList] = useState([]);
  const [yearList, setYearList] = useState([]);

  const getMaster = async () => {
    try {
      Swal.fire({
        title: "Please Wait...",
        text: "Loading data...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const [
        corporationRes,
        departmentRes,
        zoneRes,
        employeeRes,
        bankRes,

        monthsRes,
        yearsRes,
      ] = await Promise.all([
        axios.get(`${baseUrl}/api/Branchconfi/corporationlist`, {
          headers: { Authorization: `Bearer ${token}` },
        }),

        axios.get(`${baseUrl}/api/LeaveApplication/departmentlist`, {
          headers: { Authorization: `Bearer ${token}` },
        }),

        axios.post(
          `${baseUrl}/api/FrmEmployeeMstList/zone-list`,
          {
            ulbid: userId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),

        axios.post(
          `${baseUrl}/api/LeaveApplication/employeelist`,
          {
            ulbId: userId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.post(
          `${baseUrl}/api/Branchlist/banklistBnh`,
          {
            ulbid: userId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.get(`${baseUrl}/api/FrmBankRecovery/month-list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/api/FrmBankRecovery/year-list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCorporationList(corporationRes.data?.data?.data || []);
      setDepartmentList(departmentRes.data?.data?.data || []);
      setSubDepartmentList(zoneRes.data?.data?.data || []);
      setEmployeeList(employeeRes.data?.data?.data || []);
      setBankList(bankRes.data?.data?.data || []);
      setMonthList(monthsRes.data || []);
      setYearList(yearsRes.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      Swal.close();
    }
  };

  useEffect(() => {
    if (!token) return;
    getMaster();
  }, [token]);

  const getBranchList = async (bankId) => {
    if (!bankId) {
      setBranchList([]);
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/FrmEmployeeMstNewTest/bank-branch-list`,
        {
          ulbid: userId,
          bankid: Number(bankId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setBranchList(response.data?.data?.data || []);
    } catch (error) {
      console.log(error);
      setBranchList([]);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      Swal.fire({
        title: "Saving..",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        userId: user?.userId,
        deptId: Number(values.department),
        subDeptId: Number(values.subDepartment),
        empId: Number(values.employee),
        isWorking: values.isWorking ? "Y" : "N",
        recovAmount: Number(values.recoveryAmount),
        bankId: Number(values.bank),
        branchId: Number(values.branch),
        fromYear: values.fromYear,
        toYear: values.toYear,
        fromMonth: values.fromMonth,
        toMonth: values.toMonth,
        ulbId: user?.ulbId,
      };
console.log("payload:", payload)
      const response = await axios.post(
        `${baseUrl}/api/FrmBankRecovery/save-bank-recovery`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Swal.close();

      if (
        response.data?.success ||
        response.data?.errorCode === -100 ||
        response.data?.data?.errorCode === -100
      ) {
        await Swal.fire({
          icon: "Success",
          text: response.data?.errorMsg || response.data?.data?.errorMsg,
        });
        resetForm();
      } else {
        Swal.fire({
          icon: "error",
          text:
            response.data?.errorMsg ||
            response.data?.message ||
            "Failed to save.",
        });
      }
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: "error",
        text:
          error?.response?.data?.errorMsg ||
          error?.response?.data?.message ||
          "Something went wrong.",
      });

      console.log(error);
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue, resetForm }) => (
        <Form>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">
                Employee Policy Form
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Corporation */}
                <div className="space-y-2">
                  <Label
                    text="Corporation Name"
                    required
                    className="min-w-[180px]"
                  />

                  <Select
                    value={values.corporation}
                    onValueChange={(value) =>
                      setFieldValue("corporation", value)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      {corporationList.map((item) => (
                        <SelectItem
                          key={item.ID_VALUE}
                          value={String(item.ID_VALUE)}
                        >
                          {item.DISPLAY_TEXT}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label text="Department" required />

                  <Select
                    value={values.department}
                    onValueChange={(value) =>
                      setFieldValue("department", value)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      {departmentList.map((item) => (
                        <SelectItem
                          key={item.ID_VALUE}
                          value={String(item.ID_VALUE)}
                        >
                          {item.DISPLAY_TEXT}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub Department */}
                <div className="space-y-2">
                  <Label
                    text="Sub-Department"
                    required
                    className="min-w-[180px]"
                  />

                  <Select
                    value={values.subDepartment}
                    onValueChange={(value) =>
                      setFieldValue("subDepartment", value)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      {subDepartmentList.map((item) => (
                        <SelectItem
                          key={item.ZONEID}
                          value={String(item.ZONEID)}
                        >
                          {item.ZONENAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee */}
                <div className="space-y-2">
                  <Label
                    text="Employee Name"
                    required
                    className="min-w-[180px]"
                  />

                  <Select
                    value={values.employee}
                    onValueChange={(value) => setFieldValue("employee", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
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

                {/* Bank */}
                <div className="space-y-2">
                  <Label text="Bank Name" required />

                  <Select
                    value={values.bank}
                    onValueChange={async (value) => {
                      (setFieldValue("bank", value),
                        setFieldValue("branch", ""));
                      await getBranchList(value);
                    }}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      {bankList.map((item) => (
                        <SelectItem
                          key={item.BANKID}
                          value={String(item.BANKID)}
                        >
                          {item.BANKNAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <Label text="Branch Name" required />

                  <Select
                    value={values.branch}
                    onValueChange={(value) => setFieldValue("branch", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      {branchList.map((item) => (
                        <SelectItem
                          key={item.BRANCHID}
                          value={String(item.BRANCHID)}
                        >
                          {item.BRANCHNAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Recovery Amount */}
                <div className="space-y-2">
                  <Label
                    text="Recovery Amount"
                    required
                    className="min-w-[180px]"
                  />

                  <Input
                    name="recoveryAmount"
                    value={values.recoveryAmount}
                    onChange={handleChange}
                    type="number"
                  />
                </div>

                {/* Working */}
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center gap-2 h-9">
                    <Input
                      type="checkbox"
                      checked={values.isWorking}
                      onChange={(e) =>
                        setFieldValue("isWorking", e.target.checked)
                      }
                    />

                    <Label text="Is Working?" className="w-auto" />
                  </div>
                </div>

                {/* From Year */}
                <div className="space-y-2">
                  <Label text="From Year" required />

                  <Select
                    value={values.fromYear}
                    onValueChange={(value) => setFieldValue("fromYear", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      {yearList.map((item) => (
                        <SelectItem
                          key={item.NUM_YEAR_ID}
                          value={String(item.NUM_YEAR_ID)}
                        >
                          {item.VAR_YEAR}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To Year */}
                <div className="space-y-2">
                  <Label text="To Year" required />

                  <Select
                    value={values.toYear}
                    onValueChange={(value) => setFieldValue("toYear", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearList.map((item) => (
                        <SelectItem
                          key={item.NUM_YEAR_ID}
                          value={String(item.NUM_YEAR_ID)}
                        >
                          {item.VAR_YEAR}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* From Month */}
                <div className="space-y-2">
                  <Label text="From Month" required />

                  <Select
                    value={values.fromMonth}
                    onValueChange={(value) => setFieldValue("fromMonth", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      {monthList.map((item) => (
                        <SelectItem
                          key={item.NUM_MONTH_ID}
                          value={String(item.NUM_MONTH_ID)}
                        >
                          {item.VAR_MONTH_NAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To Month */}
                <div className="space-y-2">
                  <Label text="To Month" required />

                  <Select
                    value={values.toMonth}
                    onValueChange={(value) => setFieldValue("toMonth", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      {monthList.map((item) => (
                        <SelectItem
                          key={item.NUM_MONTH_ID}
                          value={String(item.NUM_MONTH_ID)}
                        >
                          {item.VAR_MONTH_NAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-8">
                <Button type="submit">Accumulation</Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => resetForm()}
                >
                  Reset
                </Button>

                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmBankRecovery;
