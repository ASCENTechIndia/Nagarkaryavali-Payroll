import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ShadCNTable from "@/components/ui/table";

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08 },
  },
};

const FrmAttendenceExcellAuthList = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [tableData, setTableData] = useState([]);

  const tableHeaders = [
    "Category",
    "Zone",
    "Department",
    "Year",
    "Month",
    "Employees count",
    "Select",
  ];

  const keyMapping = {
    Category: "category",
    Zone: "zone",
    Department: "department",
    Year: "year",
    Month: "month",
    "Employees count": "employeesCount",
    Select: "select",
  };

  const fetchAttendanceSummary = async () => {
    try {
      Swal.fire({
        title: "Loading ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmAttendenceExcellAuthListMst/attendance-summary`,
        {
          ulbId: ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiData = res.data?.data?.rows || [];

      const formattedData = apiData.map((item) => ({
        category: item.VAR_CATEGORY_NAME,
        zone: item.VAR_ZONE_NAME,
        department: item.DEPTNAME,
        year: item.VAR_YEAR,
        month: item.VAR_ATTENDENTRY_MONTH || item.MONTH,
        employeesCount: item.EMPCOUNT,

        select: (
          <Button
            variant="link"
            size="sm"
            className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
            onClick={() =>
              navigate("/Transactions/FrmAttendenceEntryAuth", {
                state: {
                  mode: 2,
                  category: item.NUM_ATTENDENTRY_CATEGORY,
                  categoryName: item.VAR_CATEGORY_NAME,
                  zone: item.NUM_ATTENDENTRY_ZONE,
                  zoneName: item.VAR_ZONE_NAME,
                  department: item.NUM_ATTENDENTRY_DEPARTMENT,
                  departmentName: item.DEPTNAME,
                  year: item.NUM_ATTENDENTRY_YEAR,
                  yearName: item.VAR_YEAR,
                  month: item.MONTH,
                  monthName: item.NUM_ATTENDENTRY_MONTH,
                },
              })
            }
          >
            Select
          </Button>
        ),
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error("Attendance Summary API Error:", error);

      setTableData([]);

      Swal.fire({
        text:
          error?.response?.data?.message ||
          "Failed to fetch attendance summary.",
      });
    } finally {
      Swal.close();
    }
  };

  useEffect(() => {
    if (ulbId) {
      fetchAttendanceSummary();
    }
  }, [ulbId]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-3 sm:p-4 md:p-5 min-h-screen"
    >
      <Card className="border-0 shadow-none rounded-none bg-transparent">
        <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="text-xl font-bold">
            Attendance Excel Authorization List
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pt-3 sm:pt-8 space-y-6">
          <div className="rounded-xl bg-white">
            <ShadCNTable
              headers={tableHeaders}
              data={tableData}
              keyMapping={keyMapping}
              pagination={true}
              rowsPerPage={10}
              className="min-w-[900px] lg:min-w-full"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmAttendenceExcellAuthList;
