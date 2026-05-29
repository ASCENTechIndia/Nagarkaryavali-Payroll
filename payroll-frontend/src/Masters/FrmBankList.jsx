
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ShadCNTable from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
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

const FrmBankList = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");


  const tableHeaders = ["Select", "Serial No.", "Bank Name"];
  const keyMapping = {
    Select: "select",
    "Serial No.": "serialNo",
    "Bank Name": "bankName",
  };

  const handleAddNew = () => {
    navigate("/Masters/FrmBankMst", { state: { mode: 1 } });
  };

  const handleSelectItem = (item) => {
    navigate("/Masters/FrmBankMst", {
      state: { mode: 2, data: item },
    });
  };

  const fetchBankList = async (searchValue = "") => {
    try {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const payload = {};
      if (searchValue.trim()) {
        payload.searchText = searchValue;
      }

      const res = await axios.post(
        `${BASE_URL}/api/BankList/banklist`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiData = res.data?.data?.data || res.data?.data || [];
      const formattedData = apiData.map((item) => ({
        serialNo: item.ROWNUM,
        bankName: item.BANKNAME,
        select: (
          <Button
            variant="link"
            size="sm"
            className="text-blue-700 font-medium px-0 cursor-pointer hover:text-blue-900"
            onClick={() =>
              handleSelectItem({
                bankCode: item.BANKCODE,
                bankName: item.BANKNAME,
              })
            }
          >
            Select
          </Button>
        ),
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error("Bank List API Error:", error);
      setTableData([]);
    } finally {
      Swal.close();
    }
  };


  useEffect(() => {
    if (token) {
      fetchBankList();
    }
  }, [token]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-3 sm:p-4 md:p-5 min-h-screen"
    >
      <Card className="border-0 shadow-none rounded-none bg-transparent">
        <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="text-xl font-bold">Bank List</CardTitle>
          <Button
            className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
            onClick={handleAddNew}
          >
            Add New
          </Button>
        </CardHeader>

        {/* Search Section */}
        <CardContent className="px-4 pt-3 sm:pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-1/2">
            <Label className="font-medium text-gray-700">Bank Name :</Label>
            <Input
              placeholder="Enter bank name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 h-9"
            />
            <Button
              variant="default"
              className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
              onClick={() => fetchBankList(searchText)}
            >
              Search
            </Button>
          </div>

          <div className="rounded-xl bg-white overflow-hidden">
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

export default FrmBankList;
