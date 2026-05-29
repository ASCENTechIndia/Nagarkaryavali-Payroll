import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const FrmPayCommList = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState("");

    const tableHeaders = ["Action", "Pay Commission Name", "Pay Commission Code", "Active", ];
    const keyMapping = {
        Action: "select",
        "Pay Commission Name": "desigId",
        "Pay Commission Code": "desigName",
        "Active": "washAllowance",
    };

    const handleAddNew = () => {
        navigate("/Masters/FrmPayCommMst", { state: { mode: 1 } });
    };

    const handleSelectItem = (item) => {
        navigate("/Masters/FrmPayCommMst", {
            state: { mode: 2, data: item },
        });
    };

    const rawData = [
        {
            desigId: 1,
            desigName: "A test bank,.",
            washAllowance: 100,
            cleanAllowance: 50,
        },
        {
            desigId: 2,
            desigName: "AADHAR SAHAKARI PATPEDHI",
            washAllowance: 150,
            cleanAllowance: 75,
        },
        {
            desigId: 3,
            desigName: "AADHAR SAKARI PATPEDHI LTD.",
            washAllowance: 120,
            cleanAllowance: 60,
        },
        {
            desigId: 4,
            desigName: "ABHINAV SAHAKARI BANK",
            washAllowance: 130,
            cleanAllowance: 65,
        },
        {
            desigId: 5,
            desigName: "ABHINAV SAHAKARI BANK (BADLAPUR)",
            washAllowance: 140,
            cleanAllowance: 70,
        },
    ];

    const filteredData = rawData.filter((item) =>
        Object.values(item).some((value) =>
            String(value)
                .toLowerCase()
                .includes(searchText.toLowerCase())
        )
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
                Modify
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
                    <CardTitle className="text-xl font-bold">Pay Commission List</CardTitle>
                    <Button
                        className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto"
                        onClick={handleAddNew}
                    >
                        Add New
                    </Button>
                </CardHeader>

                {/* Search Section */}
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

export default FrmPayCommList;
