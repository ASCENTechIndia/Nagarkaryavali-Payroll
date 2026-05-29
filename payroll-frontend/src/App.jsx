import './App.css'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from '@/layout/main-layout';
import { Label } from '@/components/ui/label';
import Login from './pages/Login';
import FrmCastListMst from './Masters/FrmCastListMst';
import FrmCastMaster from './Masters/FrmCastMaster';
import FrmDeptListMst from './Masters/FrmDeptListMst';
import FrmDeptMst from './Masters/FrmDeptMst';
import FrmInsuranceMstList from "@/pages/Masters/FrmInsuranceMstList"
import FrmInsuranceMst from '@/pages/Masters/FrmInsuranceMst';
import FrmDeptList from '@/pages/Masters/FrmDeptSelect';
import FrmDeptMaster from '@/pages/Masters/FrmDeptMst';
import FrmEmpLeaveList from '@/pages/Masters/FrmEmpLeaveList';
import FrmLeaveApprove from '@/pages/Masters/FrmLeaveApprove';
import FrmLeaveApprovalList from '@/pages/Masters/FrmLeaveApprovalList';
import FrmLeaveApplication from '@/pages/Masters/FrmLeaveApplication';
import FrmLeaveList from '@/pages/Masters/FrmLeaveList';
import FrmLeaveMaster from '@/pages/Masters/FrmLeaveMst';
import FrmBankBranchList from './pages/Masters/FrmBankBranchList';
import FrmBankBranchMst from './pages/Masters/FrmBankBranchMst';
import FrmPayCommMst from './Masters/FrmPayCommMst';
import FrmPayCommList from './Masters/FrmPayCommList';
import FrmDesgMst from './Masters/FrmDesgMst';
import FrmDesgListMst from './Masters/FrmDesgListMst';
import FrmBankMst from './Masters/FrmBankMst';
import FrmBankList from './Masters/FrmBankList';
import FrmPayHeadMst from './Masters/FrmPayHeadMst';
import FrmPayHeadListMst from './Masters/FrmPayHeadListMst';


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


const Home = () => {
  return (
    <>
      <section id="center" >
        <Label text="HELLO" />
        <Button path="/home">CLICK HERE</Button>
        <Input />
      </section>
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      // {
      //   path: "/HomePage/FrmHomePage",
      //   element: <Home />,
      // },
      {
        index: true,
        element: <Home />,
      },
      {
        path: "Masters/FrmCastListMst",
        element: <FrmCastListMst />,
      },
      {
        path: "Masters/FrmCastMaster",
        element: <FrmCastMaster />,
      },
      {
        path: "Masters/FrmDeptListMst",
        element: <FrmDeptListMst />,
      },
      {
        path: "Masters/FrmDeptMst",
        element: <FrmDeptMst />,
      },
      {
        path: "Masters/FrmInsuranceMstList",
        element: <FrmInsuranceMstList />
      },
      {
        path: "Masters/FrmInsuranceMst",
        element: <FrmInsuranceMst />
      },

      {
        path: "Masters/FrmDeptMst",
        element: <FrmDeptMaster />
      },
      {
        path: "Masters/FrmDeptList",
        element: <FrmDeptList />
      },
      {
        path: "Masters/FrmEmpLeaveList",
        element: <FrmEmpLeaveList />
      },
      {
        path: "Masters/FrmLeaveApprove",
        element: <FrmLeaveApprove />
      },
      {
        path: "Masters/FrmLeaveApprovalList",
        element: <FrmLeaveApprovalList />
      },
      {
        path: "Masters/FrmLeaveApplication",
        element: <FrmLeaveApplication />
      },

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
        element: <FrmPayHeadListMst />,
      },
      {
        path: "/Masters/FrmPayHeadMst",
        element: <FrmPayHeadMst />,
      },
      {
        path: "/Masters/FrmBankList",
        element: <FrmBankList />,
      },
      {
        path: "/Masters/FrmBankMst",
        element: <FrmBankMst />,
      },
      {
        path: "/Masters/FrmDesgListMst",
        element: <FrmDesgListMst />,
      },
      {
        path: "/Masters/FrmDesgMst",
        element: <FrmDesgMst />,
      },
      {
        path: "/Masters/FrmPayCommList",
        element: <FrmPayCommList />,
      },
      {
        path: "/Masters/FrmPayCommMst",
        element: <FrmPayCommMst />,
      },


      {
        path: "Masters/FrmBankBranchConfig",
        element: <FrmBankBranchConfig />,
      },

      {
        path: "Masters/FrmBankConfig",
        element: <FrmBankConfig />,
      },

      {
        path: "Masters/FrmLeaveConfig",
        element: <FrmLeaveConfig />,
      },
      {
        path: "Masters/FrmPayScaleConfig",
        element: <FrmPayConfig />,
      },
      {
        path: "Masters/FrmPayCommConfig",
        element: <FrmPayCommissionConfig />,
      },
      {
        path: "Masters/FrmRelationConfig",
        element: <FrmRelationConfig />,
      },
      {
        path: "Masters/FrmReligionConfig",
        element: <FrmReligionConfig />,
      },
      {
        path: "Masters/FrmDepartmentConfig",
        element: <FrmDepartmentConfig />,
      },

      {
        path: "Masters/FrmDesignationConfig",
        element: <FrmDesignationConfig />,
      },
      {
        path: "Masters/FrmBankRecovery",
        element: < FrmBankRecovery />,
      },

      {
        path: "Masters/FrmRecoveryUpload",
        element: <FrmRecoveryUpload />,
      },

      {
        path: "Masters/FrmPayHeadConfigList",
        element: <FrmPayHeadConfigList />,
      },
      {
        path: "Masters/FrmPayHeadConfigMst",
        element: <FrmPayHeadConfigMst />,
      },
    ]
  }
])

function App() {
  return <RouterProvider router={router} />;
}

export default App
