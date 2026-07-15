import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as BarTooltip,
    Legend as BarLegend,
} from "recharts";
import ShadCNTable from "@/components/ui/table";
import { Label } from "@/components/ui/label";

const FrmDashboard = () => {
    const { user } = useAuth();
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const ulbId = user?.ulbId;
    const token = user?.token;
    const [tab, setTab] = useState("balance");
    const [balanceTableData, setBalanceTableData] = useState([]);
    const [budgetTableData, setBudgetTableData] = useState([]);
    const [grantTableData, setGrantTableData] = useState([]);
    const [amountType, setAmountType] = useState("crores");

    const COLORS = [
        "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
        "#06b6d4", "#84cc16", "#f97316", "#14b8a6", "#6366f1",
        "#eab308", "#ec4899", "#10b981", "#64748b", "#a855f7",
        "#0ea5e9", "#d946ef", "#f43f5e", "#65a30d", "#475569"
    ];

    const convertAmount = (value) => {
        if (amountType === "crores") return value / 10000000;
        if (amountType === "lakhs") return value / 100000;
        return value;
    };

    const balanceHeaders = ["Department", "Employee Count"];

    const balanceKeyMapping = {
        Department: "department",
        "Employee Count": "employeeCount",
    };

    const fetchBalanceData = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmHomepage/department-wise-employee`,
                {
                    ulbId: ulbId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const apiData = res.data?.data || [];

            const formatted = apiData.map((item) => ({
                department: item.DEPARTMENT,
                employeeCount: Number(item.EMPLOYECOUNT),
                salary: Number(item.SALARY),
            }));

            const totalEmployee = formatted.reduce(
                (sum, item) => sum + item.employeeCount,
                0
            );

            formatted.push({
                department: "एकूण",
                employeeCount: totalEmployee,
            });

            setBalanceTableData(formatted);
        } catch (err) {
            console.error("Department Wise Employee Error:", err);
            setBalanceTableData([]);
        } finally {
            Swal.close();
        }
    };

    const renderCustomizedLabel = ({
        percent,
        x,
        y,
        name,
        employeeCount,
    }) => {
        if (percent < 0.08) return null; // Hide labels below 1%

        return (
            <text
                x={x}
                y={y}
                fill="#000"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${name}: ${employeeCount}`}
            </text>
        );
    };


    const budgetHeaders = ["Grade", "Employee Count"];

    const budgetKeyMapping = {
        Grade: "grade",
        "Employee Count": "employeeCount",
    };

    const fetchBudgetData = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmHomepage/grade-wise-employee`,
                {
                    ulbId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const apiData = res.data?.data || [];

            const formatted = apiData.map((item) => ({
                grade: item.GRADE,
                employeeCount: Number(item.EMPLOYECOUNT),
            }));

            const total = formatted.reduce(
                (sum, item) => sum + item.employeeCount,
                0
            );

            formatted.push({
                grade: "Total",
                employeeCount: total,
            });

            setBudgetTableData(formatted);
        } catch (err) {
            console.error("Grade Wise Employee Error:", err);
            setBudgetTableData([]);
        } finally {
            Swal.close();
        }
    };

    const grantHeaders = ["Department", "Salary"];

    const grantKeyMapping = {
        Department: "department",
        Salary: "salary",
    };

    const fetchGrantData = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await axios.post(
                `${BASE_URL}/api/FrmHomepage/department-wise-salary`,
                {
                    ulbId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const apiData = res.data?.data || [];

            const formatted = apiData.map((item) => ({
                department: item.DEPARTMENT,
                salary: Number(convertAmount(item.SALARY).toFixed(2)),
            }));

            const totalSalary = formatted.reduce(
                (sum, item) => sum + item.salary,
                0
            );

            formatted.push({
                department: "Total",
                salary: Number(totalSalary.toFixed(2)),
            });

            setGrantTableData(formatted);
        } catch (err) {
            console.error("Department Salary Error:", err);
            setGrantTableData([]);
        } finally {
            Swal.close();
        }
    };

    useEffect(() => {
        if (!ulbId || !token) return;

        fetchBalanceData();
        fetchBudgetData();
        fetchGrantData();

    }, [ulbId, token, amountType]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4"
        >
            <Card className="shadow-md rounded-xl">
                <CardHeader className="border-b">
                    <Tabs
                        value={tab}
                        onValueChange={(val) => {
                            setTab(val);
                        }}
                    >
                        <TabsList className="grid grid-cols-3 w-full max-w-xl">
                            <TabsTrigger value="balance">Department Wise Count</TabsTrigger>
                            <TabsTrigger value="budget">Grade Wise Count</TabsTrigger>
                            <TabsTrigger value="grant">Department Wise Salary</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>

                <CardContent className="p-4">

                    {tab === "balance" && (
                        <div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ShadCNTable
                                    headers={balanceHeaders}
                                    data={balanceTableData}
                                    keyMapping={balanceKeyMapping}
                                />

                                <div className="border rounded-lg p-4 flex justify-center items-center">
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={balanceTableData.filter(
                                                    (item) => item.department !== "एकूण"
                                                )}
                                                dataKey="employeeCount"
                                                nameKey="department"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                innerRadius={0} // Change to 50 if you want a donut chart
                                                label={renderCustomizedLabel}
                                                labelLine={false}
                                                isAnimationActive
                                            >
                                                {balanceTableData
                                                    .filter((item) => item.department !== "एकूण")
                                                    .map((entry, index) => (
                                                        <Cell
                                                            key={index}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                            </Pie>

                                            <Tooltip
                                                formatter={(value, name, props) => [
                                                    `${value} Employees`,
                                                    props.payload.department,
                                                ]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                    )}

                    {tab === "budget" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <ShadCNTable
                                headers={budgetHeaders}
                                data={budgetTableData}
                                keyMapping={budgetKeyMapping}
                            />

                            <div className="border rounded-lg p-4 flex justify-center items-center">
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={budgetTableData.filter(
                                                item => item.grade !== "Total"
                                            )}
                                            dataKey="employeeCount"
                                            nameKey="grade"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={120}
                                            label={({ grade, employeeCount, percent }) => `${grade}: ${employeeCount}`}
                                            labelLine={true}
                                        >
                                            {budgetTableData
                                                .filter(item => item.grade !== "Total")
                                                .map((entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                        </Pie>

                                        <Tooltip
                                            formatter={(value) => [`${value}`, "Employee Count"]}
                                            labelFormatter={(_, payload) =>
                                                payload?.[0]?.payload?.grade
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="col-span-2 text-red-500 text-sm mt-2">
                                * Amounts in Crores
                            </div>

                        </div>
                    )}

                    {tab === "grant" && (
                        <div>
                            <div className="mb-4 flex items-center gap-3">
                                <Label className="font-medium" text="Amount In * :" />
                                <Select value={amountType} onValueChange={setAmountType}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rupees">Rupees</SelectItem>
                                        <SelectItem value="lakhs">Lakhs</SelectItem>
                                        <SelectItem value="crores">Crores</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <ShadCNTable
                                    headers={grantHeaders}
                                    data={grantTableData}
                                    keyMapping={grantKeyMapping}
                                />

                                <div className="border rounded-lg p-4">
                                    <ResponsiveContainer width="100%" height={420}>
                                        <BarChart
                                            data={grantTableData.filter(
                                                item => item.department !== "Total"
                                            )}
                                            margin={{
                                                top: 30,
                                                right: 20,
                                                left: 20,
                                                bottom: 110,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />

                                            <XAxis
                                                dataKey="department"
                                                angle={-45}
                                                textAnchor="end"
                                                interval={0}
                                                height={120}
                                                tick={{
                                                    fontSize: 11,
                                                }}
                                            />

                                            <YAxis />

                                            <Tooltip
                                                formatter={(value) => [
                                                    value.toLocaleString(),
                                                    "Salary",
                                                ]}
                                            />

                                            <Legend />

                                            <Bar
                                                dataKey="salary"
                                                name="Salary"
                                                radius={[4, 4, 0, 0]}
                                            >
                                                {grantTableData
                                                    .filter(item => item.department !== "Total")
                                                    .map((entry, index) => (
                                                        <Cell
                                                            key={index}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                            </Bar>

                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FrmDashboard;