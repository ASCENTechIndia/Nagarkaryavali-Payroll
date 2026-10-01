import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";

const FrmEsevaEmpLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const ulbId = Number(user?.ulbId);
    const token = user?.token;
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [empId, setEmpId] = useState(location.state?.empId || null);
    const [stageId, setStageId] = useState(Number(location.state?.stageId) || 0);
    const [esevaEmployeeID, setEsevaEmployeeID] = useState((location.state?.esevaEmployeeID) || 0);

    const stages = [
        { id: 1, name: "Personal Information", route: ulbId === 870 ? "/Transactions/FrmESevaEmpMasterSMKC" : "/Transactions/FrmESevaEmpMaster" },
        { id: 2, name: "Educational Information", route: ulbId === 870 ? "/Transactions/FrmESevaEmpEducationalInformationSMKC" : "/Transactions/FrmESevaEmpEducationalInformation" },
        { id: 3, name: "Nominee Details", route: ulbId === 870 ? "/Transactions/FrmEsevaNominationDetailsSmkc" : "/Transactions/FrmESevaEmpNomin" },
        { id: 4, name: "Posting Record", route: ulbId === 870 ? "/Transactions/FrmESevaEmpPostingRecordSMKC" : "/Transactions/FrmESevaEmpPostingRecord" },
        { id: 5, name: "Leave Record", route: "/Transactions/FrmESevaEmpLeaveRecord" },
        { id: 6, name: "Increment & Promotion", route: ulbId === 870 ? "/Transactions/FrmESevaIncrAndPromotionsmkc" : "/Transactions/FrmESevaIncrAndPromotion" },
        { id: 7, name: "Loan & Advances", route: ulbId === 870 ? "/Transactions/FrmESevaLoanNAdvanceSMKC" : "/Transactions/FrmESevaLoanNAdvance" },
        { id: 8, name: "Penal Action", route: ulbId === 870 ? "/Transactions/FrmEsevaEmpPenalActionSMKC" : "/Transactions/FrmEsevaEmpPenalAction" }
    ];

    useEffect(() => {
        if (location.state?.empId !== undefined) setEmpId(location.state.empId);
        if (location.state?.stageId !== undefined) setStageId(Number(location.state.stageId) || 0);
        if (location.state?.esevaEmployeeID !== undefined) setEsevaEmployeeID(Number(location.state.esevaEmployeeID) || 0);
    }, [location.state]);

    useEffect(() => {
        getEsevaEmployeeID()
    }, [ulbId, empId])

    const getActiveStage = () => {
        const stage = stages.find(x => x.route === location.pathname);
        return stage ? String(stage.id) : String(location.state?.nextStage || 1);
    };

    const navigateToStage = (stage) => {
        if (!empId) return;

        const isReached = stage.id <= stageId;
        const route = isReached ? `${stage.route}?@=1` : stage.route;

        navigate(route, { state: { empId, stageId, nextStage: stage.id, esevaEmployeeID } });
    };

    const getStatus = (stage) => {
        if (stage.id < stageId) return "Completed";
        if (stage.id === stageId && stageId > 0) return "Completed";
        if (stage.id === getActiveStageNumber()) return "Current";
        return "Pending";
    };

    const getActiveStageNumber = () => {
        const stage = stages.find(x => x.route === location.pathname);
        return stage?.id || Number(location.state?.nextStage) || 1;
    };

    const getEsevaEmployeeID = async () => {
        if (!ulbId || !empId) return;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/FrmESevaEmpMaster/eSeva-EmpID`,
                { ulbid: Number(ulbId), empId: Number(empId) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const id = Number(res.data?.data?.NUM_ESEVAEMP_ID) || 0;

            console.log("API esevaEmployeeID:", id);

            setEsevaEmployeeID(id);
        } catch (err) {
            console.error("Error fetching esevaEmployeeID:", err);
            setEsevaEmployeeID(0);
        }
    };

    const renderTabs = () => (
        <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
            <Tabs value={getActiveStage()} className="w-max min-w-full">
                <TabsList className="w-max min-w-full h-auto flex items-start justify-center gap-0 bg-transparent p-0">
                    {stages.map((stage, index) => {
                        const active = getActiveStage() === String(stage.id);
                        const completed = stage.id <= stageId;
                        const status = getStatus(stage);

                        return (
                            <React.Fragment key={stage.id}>
                                <TabsTrigger
                                    value={String(stage.id)}
                                    onClick={() => navigateToStage(stage)}
                                    className="w-[140px] cursor-pointer min-w-[140px] sm:w-[150px] sm:min-w-[150px] md:w-[155px] md:min-w-[155px] shrink-0 flex flex-col items-center gap-1 rounded-none bg-transparent px-1 sm:px-2 py-1 text-gray-600 hover:bg-transparent hover:text-[#083c76] data-[state=active]:bg-transparent data-[state=active]:text-[#083c76] focus-visible:ring-0"
                                >
                                    <span className="w-full min-h-10 px-1 flex items-center justify-center text-center text-[11px] sm:text-xs md:text-sm font-semibold leading-tight whitespace-normal break-words">
                                        {stage.name}
                                    </span>

                                    <span className={`text-[10px] sm:text-xs leading-none ${completed ? "text-green-600" : active ? "text-[#083c76]" : "text-gray-500"}`}>
                                        {status}
                                    </span>

                                    <span className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white text-sm sm:text-base font-semibold ${active ? "border-[#083c76] text-[#083c76]" : completed ? "border-green-500 text-green-600" : "border-gray-300 text-gray-500"}`}>
                                        {stage.id}
                                    </span>
                                </TabsTrigger>

                                {index < stages.length - 1 && (
                                    <div className="w-4 min-w-4 sm:w-5 sm:min-w-5 md:w-6 md:min-w-6 shrink-0 pt-[58px] sm:pt-[59px]">
                                        <div className={`h-0.5 w-full ${stageId > stage.id ? "bg-green-500" : "bg-gray-300"}`} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TabsList>
            </Tabs>
        </div>
    );

    return (
        <div className="w-full space-y-4">
            {renderTabs()}

            <div className="w-full">
                <Outlet context={{ empId, stageId, esevaEmployeeID }} />
            </div>
        </div>
    );
};

export default FrmEsevaEmpLayout;