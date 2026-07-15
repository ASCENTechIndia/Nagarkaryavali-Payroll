import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Form, Formik } from "formik";
import axios from "axios";
import Swal from "sweetalert2";
import { FrmEmpLeaveListValidationSchema } from "@/validations/global.validation";

const FrmEmpLeaveList = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const initialFormValues = {
    department: "",
    category: "",
    empId: "",
    empName: "",
  };

  const fetchDepartments = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.DEPTNAME,
        value: String(item.DEPTID),
      }));
      setDepartmentOptions(formatted);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartmentOptions([]);
    }
  };

  const fetchCategories = async () => {
    try {
      if (!ulbId) return;

      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstNewTest/employee-category-list`,
        { ulbid: Number(ulbId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formatted = apiData.map((item) => ({
        label: item.VAR_CATEGORY_NAME,
        value: String(item.NUM_CATEGORY_ID),
      }));
      setCategoryOptions(formatted);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategoryOptions([]);
    }
  };

  const handleSearch = async (values, { setSubmitting }) => {
    try {
      const validationResult =
        FrmEmpLeaveListValidationSchema.safeParse(values);

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        await Swal.fire({
          text: firstError.message,
          confirmButtonColor: "#1e3a8a",
        });
        setSubmitting(false);
        return;
      }

      setLoading(true);
      setCurrentPage(1);

      const payload = {
        ulbId: Number(ulbId),
        empId: values.empId || null,
        empName: values.empName || null,
        deptId:
          values.department && values.department !== "0"
            ? values.department
            : null,
        categoryId:
          values.category && values.category !== "0" ? values.category : null,
      };

      const res = await axios.post(
        `${BASE_URL}/api/EmpleaveList/employeeleavebalancelist`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const apiData = res.data?.data?.data || res.data?.data || [];

      if (apiData.length > 0) {
        const mappedData = apiData.map((item) => ({
          empId: item.EMPID,
          empName: item.ENGNAME || "",
          ulbId: item.ULBID,
          pl: item.PL || 0,
          medLeave: item.MEDLEAVE || 0,
          hpmLeave: item.HPMLEAVE || 0,
          metLeave1: item.METLEAVE1 || 0,
          metLeave2: item.METLEAVE2 || 0,
          splLeave: item.SPLLEAVE || 0,
          optionalLeave: item.OPTIONALLEAVE || 0,
          adhyayan: item.ADHYAYAN || 0,
          childCare: item.CHILDCARE || 0,
          unexpecLeave: item.UNEXPECLEAVE || 0,
          splUnexpLeave: item.SPLUNEXPLEAVE || 0,
          nosalDeduct: item.NOSALDEDUCT || 0,
          casualLeave: item.CASUALLEAVE || 0,
          total: item.TOTAL || 0,
          checked: false,
        }));

        setTableData(mappedData);
        setShowTable(true);
      } else {
        setTableData([]);
        setShowTable(false);
        Swal.fire({
          text: "Record Not Found",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (err) {
      console.error("Search Error:", err);
      setTableData([]);
      setShowTable(false);
      Swal.fire({
        text: err.response?.data?.message || "Error searching records",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = value;

    const total =
      (parseFloat(updatedData[index].pl) || 0) +
      (parseFloat(updatedData[index].medLeave) || 0) +
      (parseFloat(updatedData[index].hpmLeave) || 0) +
      (parseFloat(updatedData[index].metLeave1) || 0) +
      (parseFloat(updatedData[index].metLeave2) || 0) +
      (parseFloat(updatedData[index].splLeave) || 0) +
      (parseFloat(updatedData[index].optionalLeave) || 0) +
      (parseFloat(updatedData[index].adhyayan) || 0) +
      (parseFloat(updatedData[index].childCare) || 0) +
      (parseFloat(updatedData[index].unexpecLeave) || 0) +
      (parseFloat(updatedData[index].splUnexpLeave) || 0) +
      (parseFloat(updatedData[index].nosalDeduct) || 0) +
      (parseFloat(updatedData[index].casualLeave) || 0);

    updatedData[index].total = total;
    setTableData(updatedData);
  };

  const handleRowCheck = (index, checked) => {
    const updatedData = [...tableData];
    updatedData[index].checked = checked;
    setTableData(updatedData);
  };

  const handleHeaderCheckboxChange = (checked) => {
    const updatedData = tableData.map((row) => ({
      ...row,
      checked: checked === true,
    }));
    setTableData(updatedData);
  };

  const isAllChecked =
    tableData.length > 0 && tableData.every((row) => row.checked);

  const handleSubmit = async (values, resetForm) => {
    debugger;
    const checkedRows = tableData.filter((row) => row.checked);

    if (checkedRows.length === 0) {
      Swal.fire({
        text: "Please select at least one record to proceed",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setSubmitting(true);

    const pdfLoaderSwal = Swal.fire({
      title: 'Submitting...',
      text: 'Please wait while submitting',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      let str = "";

      checkedRows.forEach((row) => {
        str += `${row.empId}$${row.empName}$${row.pl}$${row.medLeave}$${row.hpmLeave}$${row.metLeave1}$${row.metLeave2}$${row.splLeave}$${row.optionalLeave}$${row.adhyayan}$${row.childCare}$${row.unexpecLeave}$${row.splUnexpLeave}$${row.nosalDeduct}$${row.total}$${row.casualLeave}#`;
      });

      if (str.endsWith("#")) {
        str = str.slice(0, -1);
      }

      const payload = {
        userId: userId,
        ulbId: Number(ulbId),
        str: str,
      };

      const res = await axios.post(
        `${BASE_URL}/api/EmpleaveList/saveemployeeleavebalance`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("res: ", res);

      pdfLoaderSwal.close();

      if (res.data?.ok) {
        await Swal.fire({
          text: res.data?.data?.message || res.data?.data?.error || "Leave data saved successfully!",
          confirmButtonColor: "#1e3a8a",
        });
        
        resetForm(); 
        setTableData([]); 
        setShowTable(false); 
        setCurrentPage(1); 

      } else {
        Swal.fire({
          text: res.data?.message || res.data?.error || "Error saving leave data",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (err) {
      resetForm(); 
      setTableData([]); 
      setShowTable(false); 
      setCurrentPage(1); 
      console.error("Submit Error:", err);
      pdfLoaderSwal.close();
      Swal.fire({
        text: err.response?.data?.message || err.response?.data?.error || "Error saving leave data",
        confirmButtonColor: "#1e3a8a",
      });
      
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = tableData.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    if (ulbId) {
      const loadInitialData = async () => {
        Swal.fire({
          title: "Loading...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          await Promise.allSettled([fetchDepartments(), fetchCategories()]);
        } catch (error) {
          console.error(error);
        } finally {
          Swal.close();
        }
      };

      loadInitialData();
    }
  }, [ulbId]);

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize={true}
      onSubmit={handleSearch}
    >
      {({ values, setFieldValue, isSubmitting, resetForm }) => (
        <Form>
          <Card className="mt-5 shadow-sm border">
            <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                Leave Master
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Department Name" required />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.department}
                    onValueChange={(v) => setFieldValue("department", v)}
                  >
                    <SelectTrigger className="w-full! h-9 overflow-hidden">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Employee Type" required />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.category}
                    onValueChange={(v) => setFieldValue("category", v)}
                  >
                    <SelectTrigger className="w-full! h-9 overflow-hidden">
                      <SelectValue placeholder="-- Select Option --" />
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
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Employee ID" />
                    <span>:</span>
                  </div>
                  <Input
                    name="empId"
                    value={values.empId}
                    onChange={(e) => setFieldValue("empId", e.target.value)}
                    placeholder="Enter Employee ID"
                    className="w-full! h-9 overflow-hidden"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Employee Name" />
                    <span>:</span>
                  </div>
                  <Input
                    name="empName"
                    value={values.empName}
                    onChange={(e) => setFieldValue("empName", e.target.value)}
                    placeholder="Enter Employee Name"
                    className="w-full! h-9 overflow-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="bg-blue-800 hover:bg-blue-900"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>

              {showTable && tableData.length > 0 && (
                <div className="pt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="bg-[#083c76] hover:bg-[#083c76]">
                            <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap border border-gray-400">
                              Sr No.
                            </TableHead>
                            <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap border border-gray-400">
                              Emp ID
                            </TableHead>
                            <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap border border-gray-400">
                              Name
                            </TableHead>
                            <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap border border-gray-400 w-16">
                              <div className="flex justify-center items-center">
                                <Checkbox
                                  checked={isAllChecked}
                                  onCheckedChange={handleHeaderCheckboxChange}
                                  className="border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-900"
                                />
                              </div>
                            </TableHead>
                            <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap border border-gray-400">
                              अर्जित रजा
                            </TableHead>
                            <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap border border-gray-400">
                              वैद्यकीय रजा
                            </TableHead>
                            <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap border border-gray-400">
                              अर्धपगारी वैद्यकीय रजा
                            </TableHead>
                            <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap border border-gray-400">
                              किरकोळ रजा
                            </TableHead>
                            <TableHead className="text-white text-center font-semibold p-3 whitespace-nowrap border border-gray-400">
                              Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentData.map((row, idx) => {
                            const actualIndex = startIndex + idx;
                            return (
                              <TableRow
                                key={actualIndex}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="p-2 text-center border border-gray-300 whitespace-nowrap">
                                  {actualIndex + 1}
                                </TableCell>
                                <TableCell className="p-2 text-center border border-gray-300 whitespace-nowrap">
                                  {row.empId}
                                </TableCell>
                                <TableCell className="p-2 text-left border border-gray-300 whitespace-nowrap">
                                  {row.empName}
                                </TableCell>
                                <TableCell className="p-2 text-center border border-gray-300 whitespace-nowrap">
                                  <div className="flex justify-center items-center">
                                    <Checkbox
                                      checked={row.checked}
                                      onCheckedChange={(checked) =>
                                        handleRowCheck(
                                          actualIndex,
                                          checked === true,
                                        )
                                      }
                                      className="border-2 border-gray-500"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="p-2 text-center border border-gray-300 whitespace-nowrap">
                                  <Input
                                    type="number"
                                    value={row.pl}
                                    onChange={(e) =>
                                      handleInputChange(
                                        actualIndex,
                                        "pl",
                                        e.target.value,
                                      )
                                    }
                                    className="w-20 h-8 text-center"
                                  />
                                </TableCell>
                                <TableCell className="p-2 text-center border border-gray-300 whitespace-nowrap">
                                  <Input
                                    type="number"
                                    value={row.medLeave}
                                    onChange={(e) =>
                                      handleInputChange(
                                        actualIndex,
                                        "medLeave",
                                        e.target.value,
                                      )
                                    }
                                    className="w-20 h-8 text-center"
                                  />
                                </TableCell>
                                <TableCell className="p-2 text-center border border-gray-300 whitespace-nowrap">
                                  <Input
                                    type="number"
                                    value={row.hpmLeave}
                                    onChange={(e) =>
                                      handleInputChange(
                                        actualIndex,
                                        "hpmLeave",
                                        e.target.value,
                                      )
                                    }
                                    className="w-20 h-8 text-center"
                                  />
                                </TableCell>
                                <TableCell className="p-2 text-center border border-gray-300 whitespace-nowrap">
                                  <Input
                                    type="number"
                                    value={row.casualLeave}
                                    onChange={(e) =>
                                      handleInputChange(
                                        actualIndex,
                                        "casualLeave",
                                        e.target.value,
                                      )
                                    }
                                    className="w-20 h-8 text-center"
                                  />
                                </TableCell>
                                <TableCell className="p-2 text-center border border-gray-300 whitespace-nowrap">
                                  <Input
                                    type="text"
                                    value={row.total}
                                    readOnly
                                    className="w-20 h-8 text-center bg-gray-100"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 p-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-1"
                        >
                          Previous
                        </Button>
                        <span className="font-medium">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-1"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center mt-8">
                    <Button
                      type="button"
                      onClick={() => handleSubmit(values, resetForm)}
                      disabled={submitting}
                      className="bg-blue-800 hover:bg-blue-900 px-8"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmEmpLeaveList;
