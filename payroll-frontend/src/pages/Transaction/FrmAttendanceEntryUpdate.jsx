import React, { useContext, useEffect, useMemo, useState } from "react";
import { Formik, Form } from "formik";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function FrmAttendanceEntryUpdate() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const showSubDepartment = [670, 930, 1750, 770, 2].includes(ulbId);
  const showBillNo = [930, 1750].includes(ulbId);
  const [loading, setLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [zoneList, setZoneList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [subDepartmentList, setSubDepartmentList] = useState([]);
  const [billList, setBillList] = useState([]);
  const [monthList, setMonthList] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [tableData, setTableData] = useState([]);

  const initialValues = {
    category: "",
    zone: "",
    department: "",
    subDepartment: "",
    billNo: "",
    month: "",
    year: "",
    employeeId: "",
  };

  const monthNames = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  useEffect(() => {
    setMonthList(monthNames);
    const currentYear = new Date().getFullYear();
    setYearList([
      { value: currentYear, label: currentYear },
      { value: currentYear - 1, label: currentYear - 1 },
      { value: currentYear - 2, label: currentYear - 2 },
    ]);
    loadMasters();
  }, []);

  const loadMasters = async () => {
    Swal.fire({
      title: "Loading...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const [categoryRes, zoneRes, departmentRes] = await Promise.allSettled([
        axios.post(`${BASE_URL}/api/FrmEmployeeMstNewTest/employee-category-list`,
          { ulbid: ulbId },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.post(`${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
          { ulbid: ulbId },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.post(`${BASE_URL}/api/FrmEmployeeMstList/department-list`,
          { ulbid: ulbId },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      if (categoryRes.status === "fulfilled") {
        let list = categoryRes.value.data.data.data || [];

        if (showBillNo) {
          list = list.map((item) => ({
            ...item, VAR_CATEGORY_NAME: item.VAR_CATEGORY_NAME?.toUpperCase() === "REGULAR" ? "Permanent" : item.VAR_CATEGORY_NAME,
          }));
        }
        setCategoryList(list);
      }
      if (zoneRes.status === "fulfilled") {
        setZoneList(zoneRes.value.data.data.data || []);
      }
      if (departmentRes.status === "fulfilled") {
        setDepartmentList(departmentRes.value.data.data.data || []);
      }
    } finally {
      Swal.close();
    }
  };

  const loadSubDepartments = async (deptId) => {
    if (!deptId) return;
    try {
      const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/subdepartment-list`,
        { ulbid: ulbId, deptId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubDepartmentList(res.data.data.data || []);
    } catch (err) {
      console.error(err);
      setSubDepartmentList([]);
    }
  };

  const loadBillList = async (deptId) => {
    if (!deptId) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/FrmSalaryCalculation/bill-list`,
        { ulbid: ulbId, deptid: deptId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBillList(res.data.data.data || []);
    } catch (err) {
      console.error(err);
      setBillList([]);
    }
  };

  const getLastDate = (month, year) => {
    const date = new Date(year, month, 0);
    const dd = String(date.getDate()).padStart(2, "0");
    const monthName = date.toLocaleString("en-US", { month: "short" });
    return `${dd}-${monthName}-${year}`;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const calculatePresent = (attendance, medicalLeave, earnedLeave, hp, lwp) => {
    const at = Number(attendance || 0);
    const ml = Number(medicalLeave || 0);
    const el = Number(earnedLeave || 0);
    const half = Number(hp || 0);
    const withoutPay = Number(lwp || 0);
    return at - (ml + el + withoutPay + half / 2);
  };

  const handleCellChange = (index, field, value) => {
    setTableData((prev) => prev.map((row, i) => {
      if (i !== index) return row;

      const updated = { ...row, [field]: value };
      updated.present = calculatePresent(
        updated.attendance,
        updated.medicalLeave,
        updated.earnedLeave,
        updated.hp,
        updated.lwp
      );
      return updated;
    })
    );
  };

  const handleDepartmentChange = async (deptId, setFieldValue) => {
    setFieldValue("department", deptId);
    setFieldValue("subDepartment", "");
    setFieldValue("billNo", "");
    setSubDepartmentList([]);
    setBillList([]);
    if (showSubDepartment) { await loadSubDepartments(deptId) }
    if (showBillNo) { await loadBillList(deptId) }
  };

  const handleSubDepartmentChange = async (value, values, setFieldValue) => {
    setFieldValue("subDepartment", value);
    if (showBillNo) { await loadBillList(values.department) }
  };

  const searchAttendance = async (values) => {
     if (!values.category) {
    await Swal.fire({
      icon: "warning",
      text: "Please select Category.",
    });
    return;
  }

  if (!values.zone) {
    await Swal.fire({
      icon: "warning",
      text: "Please select Zone.",
    });
    return;
  }

  if (!values.department) {
    await Swal.fire({
      icon: "warning",
      text: "Please select Department.",
    });
    return;
  }

  if (showSubDepartment && !values.subDepartment) {
    await Swal.fire({
      icon: "warning",
      text: "Please select Sub Department.",
    });
    return;
  }

  if (showBillNo && !values.billNo) {
    await Swal.fire({
      icon: "warning",
      text: "Please select Bill No.",
    });
    return;
  }

  if (!values.month) {
    await Swal.fire({
      icon: "warning",
      text: "Please select Month.",
    });
    return;
  }

  if (!values.year) {
    await Swal.fire({
      icon: "warning",
      text: "Please select Year.",
    });
    return;
  }
  
    Swal.fire({
      title: "Loading...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const payload = {
        ulbid: ulbId,
        salaryDate: getLastDate(values.month, values.year),
        attendDate: getLastDate(values.month, values.year),
        deptid: Number(values.department),
        subdeptid: showSubDepartment ? Number(values.subDepartment || 0) : 0,
        billNo: showBillNo ? values.billNo : "",
        paysheettype: Number(values.category),
        zone: Number(values.zone),
        empid: ulbId === 930 || ulbId === 1750 ? values.employeeId : ulbId === 770 ? "" : values.employeeId,
        oldempno: ulbId === 770 ? values.employeeId : "",
      };

      const res = await axios.post(`${BASE_URL}/api/FrmAttendanceEntryUpdate/attendance-entry-list`, payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.data.success === false) {
        await Swal.fire({
          text: res.data?.data?.message || res.data?.message || "Something went wrong",
        });
        setTableData([]);
        return;
      }
      const attendanceDays = getDaysInMonth(values.month, values.year);

      const rows = (res?.data?.data?.data || []).map(
        (item, index) => ({
          checked: false,
          srNo: index + 1,
          empId: item.NUM_EMPLOYEE_EMPID,
          slipNo: item.VAR_DEPTSLIP_SEQUENCE,
          oldEmpNo: item.VAR_EMPLOYEE_OLDEMPNO,
          name: item.EMPNAME,
          bioMetric: 0,
          attendance: attendanceDays,
          medicalLeave: item.MONTHATTEND_MEDICALLEAVE || 0,
          earnedLeave: item.MONTHATTEND_EARNEDLEAVE || 0,
          hp: item.MONTHATTEND_HALFDAY || 0,
          lwp: item.MONTHATTEND_WITHOUTPAY || 0,
          remark: item.MONTHATTEND_REMARK || "",
          attendEntryId: item.ATTENDENTRY_ID,
          present: calculatePresent(attendanceDays, item.MONTHATTEND_MEDICALLEAVE || 0, item.MONTHATTEND_EARNEDLEAVE || 0, item.MONTHATTEND_HALFDAY || 0, item.MONTHATTEND_WITHOUTPAY || 0
          ),
        })
      );

      setTableData(rows);
    } catch (err) {
      console.error(err);
      Swal.fire({
        text: err.response?.data?.message || "Something went wrong"
      });
    } finally {
      Swal.close();
    }
  };

  const handleSubmit = async (values, resetForm) => {
    const selectedRows = tableData.filter((row) => row.checked);

    if (selectedRows.length === 0) {
      Swal.fire({
        text: "Please select atleast one record to proceed"
      });
      return;
    }

    const invalidRow = selectedRows.find((row) => row.attendance === "" || row.attendance === null || row.present === "" || row.present === null);

    if (invalidRow) {
      Swal.fire({
        text: "Attendance and Present are mandatory."
      });
      return;
    }

    const attendDate = getLastDate(values.month, values.year);
    const str = selectedRows.map((row) =>
        [row.empId, row.name, row.bioMetric || 0, row.attendance, row.present, row.medicalLeave || 0, row.earnedLeave || 0, row.hp || 0, row.lwp || 0, row.remark || "", attendDate].join("$")
      ).join("#");

    const payload = {
      userId: user.userId,
      id: 0,
      category: Number(values.category),
      zone: Number(values.zone),
      department: Number(values.department),
      month: Number(values.month),
      year: Number(values.year),
      subdepartment: showSubDepartment ? Number(values.subDepartment || 0) : 0,
      str,
    };

    Swal.fire({
      title: "Saving...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmAttendanceEntryUpdate/save-bulk-attendance`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.close();

      await Swal.fire({
        icon: "success",
        text: res.data.data?.message || res.data.message,
        timer: 2000,
        timerProgressBar: true,
      });

      resetForm();
      setTableData([]);
      if (showSubDepartment) setSubDepartmentList([]);
      if (showBillNo) setBillList([]);
    } catch (err) {
      Swal.close();

      await Swal.fire({
        icon: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleReset = (resetForm) => {
    resetForm();
    setTableData([]);
    setSubDepartmentList([]);
    setBillList([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm border">
        <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="text-lg font-semibold">Attendance Entry Update</CardTitle>
        </CardHeader>

        <CardContent>
          <Formik
            initialValues={initialValues}
            // validationSchema={validationSchema}
            onSubmit={(values) => searchAttendance(values)}
          >
            {({ values, errors, touched, setFieldValue, resetForm }) => (
              <Form className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-44 shrink-0 flex sm:justify-between items-center">
                      <Label text="Category" required className="min-w-fit" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.category}
                      onValueChange={(value) => setFieldValue("category", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>

                      <SelectContent>
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

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-44 shrink-0 flex sm:justify-between items-center">
                      <Label text="Zone" required className="min-w-fit" />
                      <span>:</span>
                    </div>

                    <Select
                      value={values.zone}
                      onValueChange={(value) => setFieldValue("zone", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Zone" />
                      </SelectTrigger>

                      <SelectContent>
                        {zoneList.map((item) => (
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

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-44 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text={ulbId === 2 ? "पगार बिल विभाग" : "Department"}
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>

                    <Select
                      value={values.department}
                      onValueChange={(value) =>
                        handleDepartmentChange(value, setFieldValue)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Department" />
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

                  {showSubDepartment && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-44 shrink-0 flex sm:justify-between items-center">
                        <Label
                          text="Sub Department"
                          className="min-w-fit"
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.subDepartment}
                        onValueChange={(value) => handleSubDepartmentChange(value, values, setFieldValue)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Sub Department" />
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
                  )}

                  {showBillNo && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-44 shrink-0 flex sm:justify-between items-center">
                        <Label
                          text="Bill No."
                          required
                          className="min-w-fit"
                        />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.billNo}
                        onValueChange={(value) =>
                          setFieldValue("billNo", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Bill No." />
                        </SelectTrigger>

                        <SelectContent>
                          {billList.map((item) => (
                            <SelectItem
                              key={item.BILLCODE}
                              value={String(item.BILLCODE)}
                            >
                              {item.BILLNO}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-44 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Month"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>

                    <Select
                      value={String(values.month)}
                      onValueChange={(value) =>
                        setFieldValue("month", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>

                      <SelectContent>
                        {monthList.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={String(item.value)}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-44 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text="Year"
                        required
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>

                    <Select
                      value={String(values.year)}
                      onValueChange={(value) =>
                        setFieldValue("year", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>

                      <SelectContent>
                        {yearList.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={String(item.value)}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-44 shrink-0 flex sm:justify-between items-center">
                      <Label
                        text={ulbId === 930 || ulbId === 1750 ? "Search Slip No." : ulbId === 770 ? "Search Old Employee No." : "Search Employee ID"
                        }
                        className="min-w-fit"
                      />
                      <span>:</span>
                    </div>

                    <Input
                      className="flex-1"
                      value={values.employeeId}
                      onChange={(e) => setFieldValue("employeeId", e.target.value)}
                      placeholder={ulbId === 930 || ulbId === 1750 ? "Enter Slip No." : ulbId === 770 ? "Enter Old Employee No." : "Enter Employee ID"
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <Button type="submit"> Search </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleReset(resetForm)}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit(values, resetForm)}
                    disabled={!tableData.length}
                  >
                    Save
                  </Button>
                </div>

                {tableData.length > 0 && (
                  <div className="mt-4 border rounded-md max-h-130 overflow-auto">
                    <Table className="table-auto min-w-410">
                      <TableHeader className="sticky top-0 z-10">
                        <TableRow className="bg-[#083c76] hover:bg-[#083c76]">
                          <TableHead className="w-14 text-center text-white">
                            <Checkbox
                              checked={tableData.length > 0 && tableData.every((row) => row.checked)}
                              onCheckedChange={(checked) => { setTableData((prev) => prev.map((row) => ({ ...row, checked: checked === true }))); }}
                              className="border-white"
                            />
                          </TableHead>

                          <TableHead className="text-center text-white">Sr.</TableHead>
                          {(ulbId === 930 || ulbId === 1750) && (<TableHead className="text-center text-white">Slip No.</TableHead>)}
                          {ulbId === 770 && (<TableHead className="text-center text-white">Old Employee No.</TableHead>)}

                          {ulbId !== 770 && ulbId !== 930 && ulbId !== 1750 && (<TableHead className="text-center text-white">Employee ID</TableHead>)}
                          <TableHead className="text-center text-white min-w-55 whitespace-normal">Name</TableHead>
                          <TableHead className="text-center text-white">Attendance</TableHead>
                          <TableHead className="text-center text-white">Medical Leave</TableHead>
                          <TableHead className="text-center text-white">Earned Leave</TableHead>
                          <TableHead className="text-center text-white">HP</TableHead>
                          <TableHead className="text-center text-white">LWP</TableHead>
                          <TableHead className="text-center text-white">Present</TableHead>
                          <TableHead className="text-center text-white min-w-55">Remark</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {tableData.map((row, index) => (
                          <TableRow key={row.attendEntryId ?? index}>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={!!row.checked}
                                onCheckedChange={(checked) => {
                                  setTableData((prev) => prev.map((item, i) => i === index ? { ...item, checked: checked === true } : item));
                                }}
                                className="border-black"
                              />
                            </TableCell>
                            <TableCell className="text-center">{row.srNo}</TableCell>
                            {(ulbId === 930 || ulbId === 1750) && (<TableCell className="text-center">{row.slipNo}</TableCell>)}
                            {ulbId === 770 && (<TableCell className="text-center">{row.oldEmpNo}</TableCell>)}
                            {ulbId !== 770 && ulbId !== 930 && ulbId !== 1750 && (<TableCell className="text-center">{row.empId}</TableCell>)}
                            <TableCell className="whitespace-normal wrap-break-word">{row.name}</TableCell>
                            <TableCell>
                              <Input
                                className="h-8"
                                value={row.attendance}
                                disabled
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8"
                                value={row.medicalLeave}
                                onChange={(e) => handleCellChange(index, "medicalLeave", e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8"
                                value={row.earnedLeave}
                                onChange={(e) => handleCellChange(index, "earnedLeave", e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8"
                                value={row.hp}
                                onChange={(e) => handleCellChange(index, "hp", e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8"
                                value={row.lwp}
                                onChange={(e) => handleCellChange(index, "lwp", e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 bg-muted"
                                value={row.present}
                                readOnly
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 min-w-55"
                                value={row.remark}
                                onChange={(e) => handleCellChange(index, "remark", e.target.value)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </motion.div>
  );
}