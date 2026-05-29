import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ShadCNTable from "@/components/ui/table";
import { Label } from "@/components/ui/label";

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08 },
  },
};

const FrmPayScaleList = () => {
  const { user } = useAuth();
  const token = user?.token;
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const tableHeaders = ["Select", "Pay Scale"];
  const keyMapping = {
    Select: "select",
    "Pay Scale": "serialNo",
  };

  const handleAddNew = () => {
    navigate("/Masters/FrmPayScaleMst", { state: { mode: 1 } });
  };

  const handleSelectItem = (item) => {
    navigate("/Masters/FrmPayScaleMst", {
      state: { mode: 2, data: item },
    });
  };

  const rawData = [
    { serialNo: 1, bankName: "A test bank,." },
    { serialNo: 2, bankName: "AADHAR SAHAKARI PATPEDHI" },
    { serialNo: 3, bankName: "AADHAR SAKARI PATPEDHI LTD." },
    { serialNo: 4, bankName: "ABHINAV SAHAKARI BANK" },
    { serialNo: 5, bankName: "ABHINAV SAHAKARI BANK (BADLAPUR)" },
  ];

  const filteredData = rawData.filter((item) =>
    item.bankName.toLowerCase().includes(appliedSearch.toLowerCase()),
  );

  const tableData = filteredData.map((item) => ({
    ...item,
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
  }));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-3 sm:p-4 md:p-5 min-h-screen"
    >
      <Card className="border-0 shadow-none rounded-none bg-transparent">
        <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="text-lg font-semibold">Pay Scale List</CardTitle>
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
                <Label text="Pay Scale" />
                <span>:</span>
            </div>
            <Input
              placeholder="Search Pay Scale"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 h-9"
            />
            <Button
              variant="default"
              className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
              onClick={() => setAppliedSearch(searchText)}
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
              rowsPerPage={5}
              className="min-w-[900px] lg:min-w-full"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmPayScaleList;
