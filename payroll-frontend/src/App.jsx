import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import useDynamicFavicon from './utils/useDynamicFavicon';
import Layout from '@/layout/main-layout';
import { Label } from '@/components/ui/label';
import Login from '@/pages/Login';
import FrmCastListMst from '@/pages/Masters/FrmCastListMst';
import FrmCastMaster from '@/pages/Masters/FrmCastMaster';
import FrmDeptListMst from '@/pages/Masters/FrmDeptListMst';
import FrmDeptMst from '@/pages/Masters/FrmDeptMst';
import FrmRelegionList from '@/pages/Masters/FrmRelegionList';
import FrmRelegionMst from '@/pages/Masters/FrmRelegionMst';
import FrmRelationMst from './pages/Masters/FrmRelationMst';
import FrmRelListMst from './pages/Masters/FrmRelListMst';
import FrmInsuranceMstList from "@/pages/Masters/FrmInsuranceMstList"
import FrmInsuranceMst from '@/pages/Masters/FrmInsuranceMst';
import FrmDeptSelect from '@/pages/Masters/FrmDeptSelect';
import FrmDeptMaster from '@/pages/Masters/FrmDeptMst';
import FrmEmpLeaveList from '@/pages/Masters/FrmEmpLeaveList';
import FrmLeaveApprove from '@/pages/Masters/FrmLeaveApprove';
import FrmLeaveApprovalList from '@/pages/Masters/FrmLeaveApprovalList';
import FrmLeaveApplication from '@/pages/Masters/FrmLeaveApplication';
import FrmLeaveList from '@/pages/Masters/FrmLeaveList';
import FrmLeaveMaster from '@/pages/Masters/FrmLeaveMst';
import FrmBankBranchList from '@/pages/Masters/FrmBankBranchList';
import FrmBankBranchMst from '@/pages/Masters/FrmBankBranchMst';
import FrmPayCommMst from '@/pages/Masters/FrmPayCommMst';
import FrmPayCommList from '@/pages/Masters/FrmPayCommList';
import FrmDesgMst from '@/pages/Masters/FrmDesgMst';
import FrmDesgListMst from '@/pages/Masters/FrmDesgListMst';
import FrmBankMst from '@/pages/Masters/FrmBankMst';
import FrmBankList from '@/pages/Masters/FrmBankList';
import FrmPayHeadMst from '@/pages/Masters/FrmPayHeadMst';
import FrmPayHeadListMst from '@/pages/Masters/FrmPayHeadListMst';
import FrmSalaryEditCalulation from '@/pages/Transaction/FrmSalaryEditCalulation';
import FrmBankBranchConfig from "@/pages/Configuration/FrmBankBranchConfig";
import FrmBankConfig from "@/pages/Configuration/FrmBankConfig";
import FrmLeaveConfig from "@/pages/Configuration/FrmLeaveConfig";
import FrmPayConfig from "@/pages/Configuration/FrmPayScaleConfig";
import FrmPayCommissionConfig from "@/pages/Configuration/FrmPayCommConfig";
import FrmRelationConfig from "@/pages/Configuration/FrmRelationConfig";
import FrmReligionConfig from "@/pages/Configuration/FrmReligionConfig";
import FrmDepartmentConfig from "@/pages/Configuration/FrmDepartmentConfig";
import FrmDesignationConfig from "@/pages/Configuration/FrmDesignationConfig";
import FrmBankRecovery from "@/pages/Configuration/FrmBankRecovery";
import FrmRecoveryUpload from "@/pages/Configuration/FrmRecoveryUpload";
import FrmPayHeadConfigList from "@/pages/Configuration/FrmPayHeadConfigList";
import FrmPayHeadConfigMst from "@/pages/Configuration/FrmPayHeadConfigMst";
import FrmEmployeeMstList from '@/pages/Masters/FrmEmployeeMstList';
import FrmEmployeeMstNewTest from '@/pages/Masters/FrmEmployeeMstNewTest';
import FrmPayScaleList from '@/pages/Masters/FrmPayScaleList';
import FrmPayScaleMst from '@/pages/Masters/FrmPayScaleMst';
import FrmMonthClose from '@/pages/Transaction/FrmMonthClose';
import FrmSalaryCalculation from '@/pages/Transaction/FrmSalaryCalculation';
import FrmSalaryConsolidationBanks from '@/pages/Reports/FrmSalaryConsolidationBanks';
import FrmEmpSalPayheadsReport from '@/pages/Reports/FrmEmpSalPayheadsReport';
import FrmOTherEarnEntryRpt from '@/pages/Reports/FrmOTherEarnEntryRpt';
import FrmYearlyPayeadRpt from "@/pages/Reports/FrmYearlyPayeadRpt";
import FrmRecoveryDeductionReport from "@/pages/Reports/FrmRecoveryDeduRpt";
import FrmEmployeeListReport from "@/pages/Reports/FrmEmpLstRpt";
import RptIncPromotion from '@/pages/Reports/RptIncPromotion';
import RptLeaveStatus from './pages/Reports/RptLeaveStatus';
import FrmDepSalBill from './pages/Reports/FrmDepSalBill';
import FrmEmpPayHeadListRpt from './pages/Reports/FrmEmpPayHeadListRpt';
import FrmPayrollDashbordMst from './pages/Reports/FrmPayrollDashbordMst';
import FrmPaySlip from './pages/Reports/FrmPaySlip';
import FrmPayHeadList from './pages/Reports/FrmPayHeadList';
import FrmPayrollReport from './pages/Reports/FrmPayrollReport';
import FrmEsevaReport from '@/pages/Reports/FrmEsevaReport';
import FrmLoansAndAdvancesRpt from '@/pages/Reports/FrmLoansAndAdvancesRpt';
import FrmLoansAndAdvancesReceived from '@/pages/Reports/FrmLoansAndAdvancesReceived';
import FrmDeductionPayheadsDtls from '@/pages/Reports/FrmDeductionPayheadsDtls';
import FrmNetPayRpt from '@/pages/Reports/FrmNetPayRpt';
import FrmRetiredEmpRpt from '@/pages/Reports/FrmRetiredEmpRpt';
import FrmAttendanceEntry from './pages/Transaction/FrmAttendanceEntry';
import FrmGenericSearch from './pages/Search/FrmGenericSearch';

import FrmBankLoanMst from './pages/LoanAndAdv/FrmBankLoanMst';
import FrmBankLoanMstList from './pages/Loan/FrmBankLoanMstList';
import FrmIncreamentPramotionMst from './pages/Loan/FrmIncrementPromotion';
import FrmEmpTransferApprList from './pages/Transaction/FrmEmpTransferApprList';
import FrmEmpTransferApproval from './pages/Transaction/FrmEmpTransferApproval';
import FrmOtherEarnEntryList from './pages/Transaction/FrmOtherEarnEntryList';
import FrmOtherEarningEnrty from './pages/Transaction/FrmOtherEarningEnrty';
import FrmDeptOrder from './pages/Masters/FrmDeptOrder';
import FrmEmployeeTransfer from './pages/Transaction/FrmEmployeeTransfer';
import FrmEmployeeDtls from './pages/Search/FrmEmployeeDtls'
import FrmMonthlyBankDeductionUpload from './pages/Transaction/FrmMonthlyBankDeductionUpload';
import FrmSalDeduction from './pages/Transaction/FrmSalDeduction';
import FrmEmployeeRetire from './pages/Transaction/FrmEmployeeRetire';
import FrmBillGeneration from './pages/Transaction/FrmBillGeneration';
import FrmMonthlyBankDeductionUploadAuthList from "./pages/Transaction/FrmMonthlyBankDeductionUploadAuthList"
import FrmMonthlyBankDeductionUploadAuthMst from "./pages/Transaction/FrmMonthlyBankDeductionUploadAuthMst"



const Home = () => {
  return (
    <>
      <Label text="Welcome" />
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      // {
      //   path: "/HomePage/FrmHomePage",
      //   element: <Home />
      // },
      {
        index: true,
        element: <Home />
      },
      {
        path: "Masters/FrmCastListMst",
        element: <FrmCastListMst />
      },
      {
        path: "Masters/FrmCastMaster",
        element: <FrmCastMaster />
      },
      {
        path: "Masters/FrmDeptListMst",
        element: <FrmDeptListMst />
      },
      {
        path: "Masters/FrmDeptMst",
        element: <FrmDeptMst />
      },
      {
        path: "Masters/FrmRelegionList",
        element: <FrmRelegionList />
      },
      {
        path: "Masters/FrmRelegionMst",
        element: <FrmRelegionMst />
      },
      {
        path: "Masters/FrmRelationMst",
        element: <FrmRelationMst />
      },
      {
        path: "Masters/FrmRelListMst",
        element: <FrmRelListMst />
      },
      {
        path: "Masters/FrmInsuranceMstList",
        element: <FrmInsuranceMstList />
      },
      {
        path: "Masters/FrmInsuranceMst",
        element: <FrmInsuranceMst />
      },

      // {
      //   path: "Masters/FrmDeptMst",
      //   element: <FrmDeptMaster />
      // },
      {
        path: "Masters/FrmDeptSelect",
        element: <FrmDeptSelect />
      },
      {
        path: "Masters/FrmDeptOrder",
        element: <FrmDeptOrder />
      },
      // {
      //   path: "Masters/FrmEmpLeaveList",
      //   element: <FrmEmpLeaveList />
      // },
      // {
      //   path: "Masters/FrmLeaveApprove",
      //   element: <FrmLeaveApprove />
      // },
      // {
      //   path: "Masters/FrmLeaveApprovalList",
      //   element: <FrmLeaveApprovalList />
      // },
      // {
      //   path: "Masters/FrmLeaveApplication",
      //   element: <FrmLeaveApplication />
      // },
      {
        path: "Masters/FrmLeaveList",
        element: <FrmLeaveList />
      },
      {
        path: "Masters/FrmLeaveMst",
        element: <FrmLeaveMaster />
      },
      {
        path: "Masters/FrmBankBranchList",
        element: <FrmBankBranchList />
      },
      {
        path: "Masters/FrmBankBranchMst",
        element: <FrmBankBranchMst />
      },
      {
        path: "/Masters/FrmPayHeadListMst",
        element: <FrmPayHeadListMst />
      },
      {
        path: "/Masters/FrmPayHeadMst",
        element: <FrmPayHeadMst />
      },
      {
        path: "/Masters/FrmBankList",
        element: <FrmBankList />
      },
      {
        path: "/Masters/FrmBankMst",
        element: <FrmBankMst />
      },
      {
        path: "/Masters/FrmDesgListMst",
        element: <FrmDesgListMst />
      },
      {
        path: "/Masters/FrmDesgMst",
        element: <FrmDesgMst />
      },
      {
        path: "/Masters/FrmPayCommList",
        element: <FrmPayCommList />
      },
      {
        path: "/Masters/FrmPayCommMst",
        element: <FrmPayCommMst />
      },
      {
        path: "/Masters/FrmEmployeeMstList",
        element: <FrmEmployeeMstList />
      },
      {
        path: "/Masters/FrmEmployeeMstNewTest",
        element: <FrmEmployeeMstNewTest />
      },
      {
        path: "/Masters/FrmPayScaleList",
        element: <FrmPayScaleList />
      },
      {
        path: "/Masters/FrmPayScaleMst",
        element: <FrmPayScaleMst />
      },
      {
        path: "Masters/FrmBankBranchConfig",
        element: <FrmBankBranchConfig />
      },

      {
        path: "Masters/FrmBankConfig",
        element: <FrmBankConfig />
      },

      {
        path: "Masters/FrmLeaveConfig",
        element: <FrmLeaveConfig />
      },
      {
        path: "Masters/FrmPayScaleConfig",
        element: <FrmPayConfig />
      },
      {
        path: "Masters/FrmPayCommConfig",
        element: <FrmPayCommissionConfig />
      },
      {
        path: "Masters/FrmRelationConfig",
        element: <FrmRelationConfig />
      },
      {
        path: "Masters/FrmReligionConfig",
        element: <FrmReligionConfig />
      },
      {
        path: "Masters/FrmDepartmentConfig",
        element: <FrmDepartmentConfig />
      },
      {
        path: "Masters/FrmDesignationConfig",
        element: <FrmDesignationConfig />
      },
      {
        path: "Masters/FrmBankRecovery",
        element: < FrmBankRecovery />
      },
      {
        path: "Masters/FrmRecoveryUpload",
        element: <FrmRecoveryUpload />
      },
      {
        path: "Masters/FrmPayHeadConfigList",
        element: <FrmPayHeadConfigList />
      },
      {
        path: "Masters/FrmPayHeadConfigMst",
        element: <FrmPayHeadConfigMst />
      },
      {
        path: "Masters/FrmSalaryCalulation",
        element: <FrmSalaryEditCalulation />
      },
      {
        path: "Masters/FrmEmpLeaveList",
        element: <FrmEmpLeaveList />
      },
      {
        path: "Masters/FrmLeaveApprove",
        element: <FrmLeaveApprove />
      },
      // {
      //   path: "Masters/FrmLeaveMst",
      //   element: <FrmLeaveMaster />
      // },
      {
        path: "Masters/FrmLeaveApprovalList",
        element: <FrmLeaveApprovalList />
      },
      {
        path: "Masters/FrmLeaveApplication",
        element: <FrmLeaveApplication />
      },


      //Loan
      {
        path: "Masters/FrmBankLoanMstList",
        element: <FrmBankLoanMstList />
      },
      {
        path: "Transactions/FrmIncreamentPramotionMst",
        element: <FrmIncreamentPramotionMst />
      },



      //TRANSACTION
      {
        path: "Transactions/FrmMonthClose",
        element: <FrmMonthClose />
      },
      {
        path: "Transactions/FrmSalaryCalculation",
        element: <FrmSalaryCalculation />
      },
      {
        path: "Transactions/FrmAttendanceEntry",
        element: <FrmAttendanceEntry />
      },
      {
        path: "Transactions/FrmEmpTransferApprList",
        element: <FrmEmpTransferApprList />
      },
      {
        path: "Transactions/FrmEmpTransferApproval",
        element: <FrmEmpTransferApproval />
      },
      {
        path: "Transactions/FrmOtherEarnEntryList",
        element: <FrmOtherEarnEntryList />
      },
      {
        path: "Transactions/FrmOtherEarningEnrty",
        element: <FrmOtherEarningEnrty />
      },
      {
        path: "Transactions/FrmEmployeeTransfer",
        element: <FrmEmployeeTransfer />
      },
      {
        path: "Transactions/FrmSalDeduction",
        element: <FrmSalDeduction />
      },
      {
        path: "Transactions/FrmMonthlyBankDeductionUpload",
        element: <FrmMonthlyBankDeductionUpload />
      },
      {
        path: "Transactions/FrmEmployeeRetire",
        element: <FrmEmployeeRetire />
      },
      {
        path: "Transactions/FrmBillGeneration",
        element: <FrmBillGeneration />
      },

      {
        path: "Transactions/FrmMonthlyBankDeductionUploadAuthList",
        element: <FrmMonthlyBankDeductionUploadAuthList />
      },

      {
        path: "Transactions/FrmMonthlyBankDeductionUploadAuthMst",
        element: <FrmMonthlyBankDeductionUploadAuthMst />
      },


      //Search
      {
        path: "Transactions/FrmGenericSearch",
        element: <FrmGenericSearch />
      },
      {
        path: "Transactions/FrmEmployeeDtls",
        element: <FrmEmployeeDtls />
      },


      //REPORTS
      {
        path: "ReportsForm/FrmSalaryConsolidationBanks",
        element: <FrmSalaryConsolidationBanks />
      },
      {
        path: "ReportsForm/FrmEmpSalPayheadsReport",
        element: <FrmEmpSalPayheadsReport />
      },
      {
        path: "ReportsForm/FrmOTherEarnEntryRpt",
        element: <FrmOTherEarnEntryRpt />
      },
      {
        path: "ReportsForm/FrmYearlyPayeadRpt",
        element: <FrmYearlyPayeadRpt />
      },
      {
        path: "ReportsForm/FrmRecoveryDeduRpt",
        element: <FrmRecoveryDeductionReport />
      },
      {
        path: "ReportsForm/FrmEmpLstRpt",
        element: <FrmEmployeeListReport />
      },
      {
        path: "ReportsForm/RptIncPromotion",
        element: <RptIncPromotion />
      },
      {
        path: "ReportsForm/RptLeaveStatus",
        element: <RptLeaveStatus />
      },
      {
        path: "ReportsForm/FrmDepSalBill",
        element: <FrmDepSalBill />
      },
      {
        path: "ReportsForm/FrmEmpPayHeadListRpt",
        element: <FrmEmpPayHeadListRpt />
      },
      {
        path: "ReportsForm/FrmPayrollDashbordMst",
        element: <FrmPayrollDashbordMst />
      },
      {
        path: "ReportsForm/FrmPaySlip",
        element: <FrmPaySlip />
      },
      {
        path: "ReportsForm/FrmPayHeadList",
        element: <FrmPayHeadList />
      },
      {
        path: "ReportsForm/FrmPayrollReport",
        element: <FrmPayrollReport />
      },
      {
        path: "ReportsForm/FrmEsevaReport",
        element: <FrmEsevaReport />
      },
      {
        path: "ReportsForm/FrmLoansAndAdvancesRpt",
        element: <FrmLoansAndAdvancesRpt />
      },
      {
        path: "ReportsForm/FrmLoansAndAdvancesReceived",
        element: <FrmLoansAndAdvancesReceived />
      },
      {
        path: "ReportsForm/FrmDeductionPayheadsDtls",
        element: <FrmDeductionPayheadsDtls />
      },
      {
        path: "ReportsForm/FrmNetPayRpt",
        element: <FrmNetPayRpt />
      },
      {
        path: "ReportsForm/FrmRetiredEmpRpt",
        element: <FrmRetiredEmpRpt />
      },

      // Loan and Advance 
      {
        path: "Masters/FrmBankLoanMst",
        element: <FrmBankLoanMst />
      }

    ]
  }
])

function App() {
  useDynamicFavicon()
  return <RouterProvider router={router} />;
}

export default App
