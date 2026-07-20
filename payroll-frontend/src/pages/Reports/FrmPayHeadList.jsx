import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Form, Formik } from "formik";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FrmPayHeadListValidationSchema } from "../../validations/global.validation";

const initialValues = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear().toString(),
  zone: "",
  department: "-1",
  payHead: "",
  category: "",
};

const FrmPayHeadList = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode;
  const headId = location.state?.headId;

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [zoneOptions, setZoneOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [payHeadOptions, setPayHeadOptions] = useState([]);

  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  
  const yearOptions = [
    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
    { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
    { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() },
  ];

  const formatDateForAPI = (year, month) => {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const date = new Date(yearNum, monthNum - 1, lastDay);
    
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthAbbr = monthNames[monthNum - 1];
    
    return `${day}-${monthAbbr}-${yearNum}`;
  };


  const fetchZones = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
        { ulbid: ulbId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setZoneOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmEmployeeMstList/department-list`,
        { ulbid: ulbId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDepartmentOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmSalaryCalulation/category`,
        { ulbid: ulbId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCategoryOptions(res.data?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPayHeads = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmPayHeadConfigList/payheadmst-dropdown`,
        {
          ulbId: ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Pay Head Response: ", res);

      setPayHeadOptions(res.data || []);
    } catch (error) {
      console.error("Pay Head API Error:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadDropdowns = async () => {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await Promise.allSettled([
          fetchZones(),
          fetchDepartments(),
          fetchCategories(),
          fetchPayHeads(),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        Swal.close();
      }
    };

    loadDropdowns();
  }, [token]);

  const handleSubmit = async (values) => {
    const validationResult = FrmPayHeadListValidationSchema.safeParse(values);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      await Swal.fire({
        text: firstError.message,
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    try {
        Swal.fire({
            title: "Generating PDF...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const payload = {
            ulbid: Number(ulbId),
            month: Number(values.month),
            year: values.year,
            categoryId: values.category,
            zoneId: values.zone,
            payHeadId: values.payHead,
            deptId: values.department || "-1",
            departmentName: departmentOptions.find(d => d.DEPTID.toString() === values.department)?.DEPTNAME || "सर्व विभाग",
            payHeadName: payHeadOptions.find(p => p.NUM_PAYHEADS_ID.toString() === values.payHead)?.VAR_PAYHEADS_ENAME || "विविध कपात"
        };

        const res = await axios.post(
            `${BASE_URL}/api/FrmPayHeadList/generate-pdf`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        Swal.close();


        if (res.data?.hasData === false || res.data?.success === false) {
            Swal.fire({
                icon: "warning",
                title: "No Data Found",
                text: res.data?.message || "No records found for the selected criteria. Please change your search parameters.",
                confirmButtonColor: "#1e3a8a",
            });
            return;
        }

        if (res.data?.success && res.data?.pdfUrl) {
            window.open(res.data.pdfUrl, "_blank");
          
            
            Swal.fire({
                text: "PDF generated successfully!",
                confirmButtonColor: "#1e3a8a",
                timer: 2000,
            });
        } else {
            Swal.fire({
              text: res.data?.message || "Failed to generate PDF",
              confirmButtonColor: "#1e3a8a",
            });
        }

    } catch (error) {
        console.error("PDF Generation Error:", error);
        Swal.close();
        
        const errorMessage = error.response?.data?.message || "Failed to generate PDF";
        
        Swal.fire({
            text: errorMessage,
            confirmButtonColor: "#1e3a8a",
        });
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue }) => {
        return (
          <Form>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 md:p-5 min-h-screen"
            >
              <Card className="border-0 shadow-none rounded-none bg-transparent">
                <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                  <CardTitle className="text-xl font-bold">
                    Pay Head wise List
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                            <Label text="Date" required />
                            <span>:</span>
                        </div>
                        <div className="flex gap-2 flex-1">
                            <Select
                            value={values.month.toString()}
                            onValueChange={(v) => setFieldValue("month", parseInt(v))}
                            >
                            <SelectTrigger className="w-full h-9">
                                <SelectValue placeholder="Select Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <Select
                            value={values.year}
                            onValueChange={(v) => setFieldValue("year", v)}
                            >
                            <SelectTrigger className="w-28 h-9">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Zone" required />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.zone}
                        onValueChange={(value) => setFieldValue("zone", value)}
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          {zoneOptions.map((item) => (
                            <SelectItem
                              key={item.ZONEID}
                              value={item.ZONEID.toString()}
                            >
                              {item.ZONENAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Department" required />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.department}
                        onValueChange={(value) =>
                          setFieldValue("department", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="-1">-- ALL --</SelectItem>

                          {departmentOptions.map((item) => (
                            <SelectItem
                              key={item.DEPTID}
                              value={item.DEPTID.toString()}
                            >
                              {item.DEPTNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label
                                                    text="Sub Department"
                                                    className="text-[15px] font-semibold text-black "
                                                    required
                                                />
                                                <span>:</span>
                                            </div>

                                            <Select
                                                value={values.subDepartment}
                                                onValueChange={(value) =>
                                                    setFieldValue("subDepartment", value)
                                                }
                                            >
                                                <SelectTrigger className="w-full h-9">
                                                    <SelectValue placeholder="-- Select Option --" />
                                                </SelectTrigger>

                                                <SelectContent> */}
                    {/* {subDepartmentOptions?.map((item) => (
                                                        <SelectItem
                                                            key={item.id}
                                                            value={item.id.toString()}
                                                        >
                                                            {item.name}
                                                        </SelectItem>
                                                    ))} */}
                    {/* </SelectContent>
                                            </Select>
                                        </div> */}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="PayHead" required />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.payHead}
                        onValueChange={(value) =>
                          setFieldValue("payHead", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent>
                          {payHeadOptions.map((item) => (
                            <SelectItem
                              key={item.NUM_PAYHEADS_ID}
                              value={item.NUM_PAYHEADS_ID.toString()}
                            >
                              {item.VAR_PAYHEADS_ENAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Category" required />
                        <span>:</span>
                      </div>

                      <Select
                        value={values.category}
                        onValueChange={(value) =>
                          setFieldValue("category", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 overflow-hidden">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>

                        <SelectContent> 

                          {categoryOptions.map((item) => (
                            <SelectItem
                              key={item.NUM_CATEGORY_ID}
                              value={item.NUM_CATEGORY_ID.toString()}
                            >
                              {item.VAR_CATEGORY_NAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="sm:w-44 shrink-0 flex justify-start sm:justify-between items-center">
                                                <Label
                                                    text="Employee Type"
                                                    required
                                                    className="text-[15px] font-semibold text-black"
                                                />
                                                <span>:</span>
                                            </div>

                                            <Select
                                                value={values.empType}
                                                onValueChange={(value) => setFieldValue("empType", value)}
                                            >
                                                <SelectTrigger className="w-full h-9">
                                                    <SelectValue placeholder="-- Select Option --" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="ALL">ALL</SelectItem>
                                                    <SelectItem value="OLD">OLD</SelectItem>
                                                    <SelectItem value="NEW">NEW</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div> */}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <Button
                      type="submit"
                      className="bg-blue-900 hover:bg-blue-800 text-white px-8"
                    >
                      Process
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
        );
      }}
    </Formik>
  );
};

export default FrmPayHeadList;
