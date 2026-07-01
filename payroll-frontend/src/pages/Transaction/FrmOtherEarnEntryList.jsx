import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShadCNTable from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08 },
  },
};

const FrmOtherEarnEntryList = () => {
  const { authUser } = useAuth();
  const authToken = authUser?.token;
  const storedToken = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const token = storedToken || authToken;
  const user = storedUser || authUser;
  const ulbId = user?.orgId || user?.ulbId;
  
  const navigate = useNavigate();

  const [earningList, setEarningList] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const tableHeaders = [
    "Select", 
    "Id",
    "Employee Name",
    "Pay Head Name",
    "Department",
    "Designation",
    "Amount",
    "Date",
    "Remark"
  ];

  const keyMapping = {
    Select: "select",
    Id: "id",
    "Employee Name": "empName",
    "Pay Head Name": "payHeadName",
    Department: "department",
    Designation: "designation",
    Amount: "amount",
    Date: "date",
    Remark: "remark"
  };

  const handleAddNew = () => {
    navigate("/Transactions/FrmOtherEarningEnrty", { state: { mode: 1 } });
  };

  const handleSelectItem = (item) => {
    navigate("/Transactions/FrmOtherEarningEnrty", {
      state: {
        mode: 2,
        empId: item.EMPID,
        detId: item.ID,
      },
    });
  };

  const fetchEarningList = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/api/FrmOtherEarnEntryList/earning-list`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEarningList(res.data.data.data || res.data.data || []);
    } catch (err) {
      console.error("Pay Scale List Error :", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const tableData = earningList.map((item) => ({
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
    id: item.ID,
    empName: item.EMP_NAME,
    payHeadName: item.PAYHEAD_NAME,
    department: item.DEPARTMENT,
    designation: item.DESIGNATION,
    amount: item.AMOUNT,
    date: formatDateTime(item.AMT_DATE),
    remark: item.OTHER_REMARK,
  }));

  useEffect(() => {
    fetchEarningList();
  }, []);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-3 sm:p-4 md:p-5 min-h-screen"
    >
      <Card className="border-0 shadow-none rounded-none bg-transparent">
        <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="text-lg font-semibold">Other Earning Entry</CardTitle>
          <Button
            className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
            onClick={handleAddNew}
          >
            Add New
          </Button>
        </CardHeader>

        <CardContent className="px-4 pt-3 sm:pt-8 space-y-6">
          <div className="rounded-xl bg-white overflow-hidden">
            <ShadCNTable
              headers={tableHeaders}
              data={tableData}
              keyMapping={keyMapping}
              pagination={true}
              rowsPerPage={5}
              className="min-w-[900px] lg:min-w-full"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmOtherEarnEntryList;
