import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ShadCNTable from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import axios from "axios";
import Swal from "sweetalert2";

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08 },
  },
};

const FrmDeptSelect = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [deptSelectList, setDeptSelectList] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const tableHeaders = [
    "Select",
    "Department ID",
    "Department Name"
  ];

  const keyMapping = {
    Select: "select",
    "Department ID": "deptId",
    "Department Name": "deptName"
  }

  const handleAddNew = () => {
    navigate("/Masters/FrmDeptMst", { state: { mode: 1 } });
  };

  const handleSelectItem = (item) => {
    navigate("/Masters/FrmDeptOrder", {
      state: {
        mode: 2,
        data: {
          deptId: item.DEPTID,
          deptName: item.DEPTNAME
        },
      },
    });
  };

  const fetchDeptSelectList = async (name = "") => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${BASE_URL}/api/FrmDeptSelect/list`,
        {
          ulbId,
          name: name.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      )
      setDeptSelectList(res.data || []);
    }catch(err) {
      console.error("Dept Select List Error: ", err);
    }finally {
      setLoading(false);
    }
  }

  const tableData = deptSelectList.map((item) => ({
    select: (
      <Button
        variant="link"
        size="sm"
        className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
        onClick={() => handleSelectItem(item)}
      >
        Select
      </Button>
    ),
    deptId: item.DEPTID,
    deptName: item.DEPTNAME
  }))

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeptSelectList(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-3 sm:p-4 md:p-5 min-h-screen"
    >   
      <Card className="border-0 shadow-none rounded-none bg-transparent">
        <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="text-lg font-semibold">
            Select Department
          </CardTitle>
          <Button
            className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
            onClick={handleAddNew}
          >
            Add New
          </Button>
        </CardHeader>

        <CardContent className="px-4 pt-3 sm:pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-1/2">
            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="Department List" />
                <span>:</span>
            </div>
            <Input
              placeholder="Search Here..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="flex-1 h-9"
            />
            {/* <Button
              variant="default"
              className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
             onClick={() => fetchDeptSelectList(search)}
            >
              Search
            </Button> */}
          </div>

          <div className="rounded-xl bg-white overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600">
                  Loading data...
                </span>
              </div>
            ) : (
              <ShadCNTable
                headers={tableHeaders}
                data={tableData}
                keyMapping={keyMapping}
                pagination={true}
                rowsPerPage={5}
                className="min-w-[900px] lg:min-w-full"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmDeptSelect;