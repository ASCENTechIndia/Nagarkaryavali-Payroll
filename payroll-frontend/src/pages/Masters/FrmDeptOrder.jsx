import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ShadCNTable from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import axios from "axios";
import Swal from "sweetalert2";
import { FrmDeptOrderValidationSchema } from "@/validations/global.validation";

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08 },
  },
};

const FrmDeptOrder = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [deptOrder, setDeptOrder] = useState("");
  const [designations, setDesignations] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [deptId, setDeptId] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const tableHeaders = [
    "Select",
    "Designation ID",
    "Designation Name",
    "Order"
  ];

  const keyMapping = {
    Select: "select",
    "Designation ID": "designationId",
    "Designation Name": "designationName",
    Order: "order"
  };

  useEffect(() => {
    if (location.state?.data) {
      const { deptId, deptName } = location.state.data;
      setDeptId(deptId);
      setDepartmentName(deptName || "");
      fetchData(deptId);
    } else {
      Swal.fire({
        text: "Please select a department first",
        confirmButtonColor: "#1e3a8a",
      }).then(() => {
        navigate("/Masters/FrmDeptSelect");
      });
    }
  }, [location.state]);

  const fetchData = async (deptId) => {
    try {
        setLoading(true);
        const deptOrderRes = await axios.post(
        `${BASE_URL}/api/FrmDeptSelect/department-order`,
        { ulbId, deptId },
        { headers: { Authorization: `Bearer ${token}` } }
        );

        const designationsRes = await axios.post(
        `${BASE_URL}/api/FrmDeptSelect/designation-list`,
        { ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
        );

        const existingRes = await axios.post(
        `${BASE_URL}/api/FrmDeptSelect/existing-designation-order`,
        { ulbId, deptId },
        { headers: { Authorization: `Bearer ${token}` } }
        );

        if (deptOrderRes.data && deptOrderRes.data.length > 0) {
        setDeptOrder(String(deptOrderRes.data[0].NUM_SALARYORDER_DEPTORDER || ""));
        }

        const allDesignations = designationsRes.data || [];
        const existingOrders = existingRes.data || [];

        const orderMap = {};
        existingOrders.forEach(item => {
        orderMap[item.DESIG_ID] = String(item.DESIGORDER || "");
        });

        const mergedData = allDesignations.map(desig => {
        const hasOrder = orderMap[desig.DESIGNATIONID] !== undefined && 
                        orderMap[desig.DESIGNATIONID] !== "";
        return {
            ...desig,
            DESIGORDER: orderMap[desig.DESIGNATIONID] || "", 
            IsChecked: hasOrder ? 1 : 0
        };
        });

        mergedData.sort((a, b) => {
        if (a.IsChecked !== b.IsChecked) return b.IsChecked - a.IsChecked;
        if (a.DESIGORDER && b.DESIGORDER) {
            return parseInt(a.DESIGORDER) - parseInt(b.DESIGORDER);
        }
        return 0;
        });

        setDesignations(mergedData);

    } catch (err) {
        console.error("Error fetching data:", err);
        Swal.fire({
        text: "Failed to load department data",
        confirmButtonColor: "#1e3a8a",
        });
    } finally {
        setLoading(false);
    }
  };
  
  const handleCheckboxChange = (index) => {
    const updated = [...designations];
    const current = updated[index];
    
    const newChecked = current.IsChecked === 1 ? 0 : 1;
    updated[index] = {
        ...current,
        IsChecked: newChecked,
        DESIGORDER: newChecked === 1 ? String(current.DESIGORDER || "") : ""
    };
    
    updated.sort((a, b) => {
        if (a.IsChecked !== b.IsChecked) return b.IsChecked - a.IsChecked;
        if (a.DESIGORDER && b.DESIGORDER) {
        return parseInt(a.DESIGORDER) - parseInt(b.DESIGORDER);
        }
        return 0;
    });
    setDesignations(updated);
  };

  const handleOrderChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const updated = [...designations];
    updated[index] = {
        ...updated[index],
        DESIGORDER: String(value || "")
    };
    setDesignations(updated);
  };

  const handleSubmit = async () => {
    try {
        const deptOrderStr = String(deptOrder || "");
        
        const validationResult = FrmDeptOrderValidationSchema.safeParse({
        deptOrder: deptOrderStr,
        designations: designations
        });

        if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        await Swal.fire({
            text: firstError.message,
            confirmButtonColor: "#1e3a8a",
        });
        return;
        }

        const selectedItems = designations.filter(d => d.IsChecked === 1);
        const desigStr = selectedItems
        .map(d => `${d.DESIGNATIONID}#${String(d.DESIGORDER || "")}`)
        .join("$");

        if (!desigStr) {
        Swal.fire({
            text: "Please select at least one designation",
            confirmButtonColor: "#1e3a8a",
        });
        return;
        }

        setLoading(true);

        const payload = {
        userId: user?.userId,
        ulbId: ulbId,
        deptId: deptId,
        deptOrder: parseInt(deptOrderStr),
        desigStr: desigStr
        };

        const response = await axios.post(
        `${BASE_URL}/api/FrmDeptSelect/save`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
        Swal.fire({
            text: response.data.errorMsg || "Department order saved successfully",
            confirmButtonColor: "#1e3a8a",
        }).then(() => {
            navigate("/Masters/FrmDeptSelect");
        });
        } else {
        Swal.fire({
            text: response.data.errorMsg || "Failed to save department order",
            confirmButtonColor: "#1e3a8a",
        });
        }

    } catch (err) {
        console.error("Submit error:", err);
        Swal.fire({
        text: err.response?.data?.message || "Failed to save department order",
        confirmButtonColor: "#1e3a8a",
        });
    } finally {
        setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/Masters/FrmDeptSelect");
  };

  const tableData = designations.map((item, index) => ({
    select: (
      <Input
        type="checkbox"
        checked={item.IsChecked === 1}
        onChange={() => handleCheckboxChange(index)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
    ),
    designationId: item.DESIGNATIONID,
    designationName: item.DESIGNATIONNAME,
    order: (
      <Input
        type="text"
        value={item.DESIGORDER || ""}
        onChange={(e) => handleOrderChange(index, e.target.value)}
        disabled={item.IsChecked !== 1}
        className={`form-control w-full text-right px-2 py-1 border rounded-md text-sm
          ${item.IsChecked === 1 
            ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
            : 'bg-gray-100 border-gray-200 cursor-not-allowed'
          }`}
      />
    )
  }));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-3 sm:p-4 md:p-5 min-h-screen"
    >
      <Card className="border-0 shadow-none rounded-none bg-transparent">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold">
            Order Designations for <span>{departmentName}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pt-4 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-1/2">
                <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Department Order" />
                    <span>:</span>
                </div>
                <Input
                  type="text"
                  value={deptOrder}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setDeptOrder(e.target.value);
                    }
                  }}
                  className="flex-1 h-9"
                  placeholder="Enter order"
                />
              </div>

              <div className="rounded-xl bg-white overflow-hidden">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Loading data...</span>
                  </div>
                ) : (
                  <ShadCNTable
                    headers={tableHeaders}
                    data={tableData}
                    keyMapping={keyMapping}
                    className="min-w-[900px] lg:min-w-full"
                  />
                )}
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-800 hover:bg-blue-900"
                >
                  {loading ? "Submitting..." : "Submit Order"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 px-6"
                >
                  Cancel
                </Button>
              </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmDeptOrder;