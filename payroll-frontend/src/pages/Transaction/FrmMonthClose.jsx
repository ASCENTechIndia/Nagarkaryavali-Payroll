import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const FrmMonthClose = () => {
    const { user } = useAuth();
    const token = user?.token;
    const ulbId = user?.ulbId;
    const userId = user?.userId;
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const [zoneId, setZoneId] = useState("");
    const [zoneOptions, setZoneOptions] = useState([]);
    const currentYear = new Date().getFullYear();
    const [month, setMonth] = useState(String(new Date().getMonth() + 1));
    const [year, setYear] = useState(String(currentYear)
);
    const yearOptions = [
        currentYear,
        currentYear - 1,
        currentYear - 2,
        currentYear - 3,
    ];

    useEffect(() => {
        fetchZoneList();
    }, []);

    const fetchZoneList = async () => {
        try {
            Swal.fire({
                title: "Loading Zones...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(`${BASE_URL}/api/FrmEmployeeMstList/zone-list`,
                {ulbid: Number(ulbId)},
                {headers: {Authorization: `Bearer ${token}`}}
            );

            const rows = res?.data?.data?.data || [];
            setZoneOptions(
                rows.map((item) => ({
                    value: item.ZONEID.toString(),
                    label: item.ZONENAME,
                }))
            );
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                text: "Failed To Fetch Zone List",
            });
        } finally {
            Swal.close();
        }
    };

    const handleProcess = async () => {
        try {
            if (!zoneId) {
                Swal.fire({
                    icon: "warning",
                    text: "Please Select Zone",
                });
                return;
            }

            const lastDate = new Date(Number(year),Number(month),0);

            const payload = {
                userId,
                ulbid: Number(zoneId),
                date: lastDate.toISOString().split("T")[0],
            };

            Swal.fire({
                title: "Processing...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmMonthClose/month-close`,
                payload,
                {headers: {Authorization: `Bearer ${token}`}}
            );
            Swal.close();
            Swal.fire({
                icon:res?.data?.data?.success? "success" : "warning",
                text:res?.data?.data?.message || res?.data?.message,
            });
        } catch (error) {
            console.error(error);
            Swal.close();
            Swal.fire({
                icon: "error",
                text: error?.response?.data?.message || "Failed To Process Month Close",
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold">
                        Month Close
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Zone" required />
                                <span>:</span>
                            </div>

                            <Select
                                value={zoneId}
                                onValueChange={setZoneId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Select Option --" />
                                </SelectTrigger>

                                <SelectContent>
                                    {zoneOptions.map((zone) => (
                                        <SelectItem
                                            key={zone.value}
                                            value={zone.value}
                                        >
                                            {zone.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                                <Label text="Salary Date" required />
                                <span>:</span>
                            </div>

                            <div className="flex gap-3 w-full">
                                <Select
                                    value={month}
                                    onValueChange={setMonth}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="1">January</SelectItem>
                                        <SelectItem value="2">February</SelectItem>
                                        <SelectItem value="3">March</SelectItem>
                                        <SelectItem value="4">April</SelectItem>
                                        <SelectItem value="5">May</SelectItem>
                                        <SelectItem value="6">June</SelectItem>
                                        <SelectItem value="7">July</SelectItem>
                                        <SelectItem value="8">August</SelectItem>
                                        <SelectItem value="9">September</SelectItem>
                                        <SelectItem value="10">October</SelectItem>
                                        <SelectItem value="11">November</SelectItem>
                                        <SelectItem value="12">December</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={year}
                                    onValueChange={setYear}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {yearOptions.map((yr) => (
                                            <SelectItem
                                                key={yr}
                                                value={String(yr)}
                                            >
                                                {yr}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 flex-wrap">
                        <Button
                            type="button"
                            onClick={handleProcess}
                        >
                            Process
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            path="/"
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmMonthClose;