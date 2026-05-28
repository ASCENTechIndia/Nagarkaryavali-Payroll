import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShadCNTable from "@/components/ui/table";
import {Label} from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmDeptListMst = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deptList, setDeptList] = useState([]);
  const headers = ["Select", "Department ID", "Department Name (English)", "Department Name (Marathi)"];

  const keyMapping = {
    Select: "select",
    "Department ID": "id",
    "Department Name (English)": "name",
    "Department Name (Marathi)": "name_mr",
  };

  const fetchDepts = async () => {
    try {
      Swal.fire({
        title: "Loading Departments...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get(
        `${BASE_URL}/api/`,                         //ADD API ENDPOINT
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      Swal.close();

      if (res.data?.ok && res.data?.data?.list) {
        setDeptList(res.data.data.list);
      } else {
        setDeptList([]);
      }
    } catch (err) {
      Swal.close();
      console.error("Department list error:", err);
      Swal.fire("Error loading departments");
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchDepts();
    }
  }, [user]);

  const tableData = deptList.map((row, index) => ({
    id: row.DEPT_ID || index,
    select: (
      <Button
        variant="link"
        className="text-blue-700 px-0"
        onClick={() =>
          navigate("/Masters/FrmDeptMst", {
            state: { mode: 2, data: row },
          })
        }
      >
        Select
      </Button>
    ),
    name: row.DEPT_NAME_ENG?.trim() || "-",
    name_mr: row.DEPT_NAME_MR?.trim() || "-",
  }));

  const finalData =
    tableData.length > 0
      ? tableData
      : [
          {
            id: 0,
            select: "",
            name: "Data not found",
          },
        ];

  return (
    <>
       <Card className="shadow-sm border rounded-lg">
        <CardHeader className="border-b flex justify-between items-center p-4">
           <CardTitle className="text-2xl font-semibold">Department List</CardTitle>
        </CardHeader>

          <CardHeader className="p-4 flex items-center justify-between">
            <CardTitle className="text-lg">Department List</CardTitle>
            <div className="mt-3">
            <Input className="w-64 h-8 text-sm" placeholder="Search..." />
            </div>
          </CardHeader>
          <CardTitle className="border-b text-sm text-gray-500 p-4">
          <Button onClick={() => navigate("/Masters/FrmDeptMst")}>
            Add New
          </Button>
        </CardTitle>
        <CardContent className="p-6">
          <div className="border rounded-md overflow-hidden">
            <ShadCNTable
              headers={headers}
              data={finalData}
              keyMapping={keyMapping}
              pagination={tableData.length > 0}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default FrmDeptListMst;