import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FrmEsevaEmpLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const ulbId = Number(user?.ulbId);

    const [empId, setEmpId] = useState(location.state?.empId || null);
    const [stageId, setStageId] = useState(Number(location.state?.stageId) || 0);

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
    }, [location.state]);

    const getActiveStage = () => {
        const stage = stages.find(x => x.route === location.pathname);
        return stage ? String(stage.id) : String(location.state?.nextStage || 1);
    };

    const navigateToStage = (stage) => {
        if (!empId) return;

        const isReached = stage.id <= stageId;
        const route = isReached ? `${stage.route}?@=1` : stage.route;

        navigate(route, { state: { empId, stageId, nextStage: stage.id } });
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

    const renderTabs = () => (
        <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
            <Tabs value={getActiveStage()} className="w-max">
                <TabsList className="w-max h-auto flex items-start justify-start gap-0 bg-transparent p-0">
                    {stages.map((stage, index) => {
                        const active = getActiveStage() === String(stage.id);
                        const completed = stage.id <= stageId;
                        const status = getStatus(stage);

                        return (
                            <React.Fragment key={stage.id}>
                                <TabsTrigger
                                    value={String(stage.id)}
                                    onClick={() => navigateToStage(stage)}
                                    className="w-40 shrink-0 flex flex-col items-center gap-1 rounded-none bg-transparent px-2 py-1 text-gray-600 hover:bg-transparent hover:text-[#083c76] data-[state=active]:bg-transparent data-[state=active]:text-[#083c76] focus-visible:ring-0"
                                >
                                    <span className="w-full h-9 flex items-center justify-center text-center text-xs sm:text-sm font-semibold leading-tight">
                                        {stage.name}
                                    </span>

                                    <span className={`text-xs leading-none ${completed ? "text-green-600" : active ? "text-[#083c76]" : "text-gray-500"}`}>
                                        {status}
                                    </span>

                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white font-semibold ${active ? "border-[#083c76] text-[#083c76]" : completed ? "border-green-500 text-green-600" : "border-gray-300 text-gray-500"}`}>
                                        {stage.id}
                                    </span>
                                </TabsTrigger>

                                {index < stages.length - 1 && (
                                    <div className="w-6 min-w-6 shrink-0 pt-14.5">
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
                <Outlet context={{ empId, stageId }} />
            </div>
        </div>
    );
};

export default FrmEsevaEmpLayout;