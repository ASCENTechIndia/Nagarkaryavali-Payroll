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
import FrmEmployeeMstList from './pages/Master/FrmEmployeeMstList';
import FrmEmployeeMstNewTest from './pages/Master/FrmEmployeeMstNewTest';
import FrmPayScaleList from './pages/Master/FrmPayScaleList';
import FrmPayScaleMst from './pages/Master/FrmPayScaleMst';

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
          path: "/Masters/FrmEmployeeMstList",
          element: <FrmEmployeeMstList />,
        },
        {
          path: "/Masters/FrmEmployeeMstNewTest",
          element: <FrmEmployeeMstNewTest />,
        },
        {
          path: "/Masters/FrmPayScaleList",
          element: <FrmPayScaleList />,
        },
        {
          path: "/Masters/FrmPayScaleMst",
          element: <FrmPayScaleMst />,
        },
        {
          index: true,
          element: <Home />,
        },
        // {
        //   path: "Masters/FrmCastListMst",
        //   element: <FrmCastListMst />,
        // },
        // {
        //   path: "Masters/FrmCastMaster",
        //   element: <FrmCastMaster />,
        // },
        // {
        //   path: "Masters/FrmDeptListMst",
        //   element: <FrmDeptListMst />,
        // },
        // {
        //   path: "Masters/FrmDeptMst",
        //   element: <FrmDeptMst />,
        // },
        //  {
        //   path:"Masters/FrmInsuranceMstList",
        //   element: <FrmInsuranceMstList />
        // },
        // {
        //   path:"Masters/FrmInsuranceMst",
        //   element : <FrmInsuranceMst/>
        // },

        //  {
        //   path:"Masters/FrmDeptMst",
        //   element: <FrmDeptMaster />
        // },
        // {
        //   path:"Masters/FrmDeptList",
        //   element : <FrmDeptList/>
        // },
        // {
        //   path:"Masters/FrmEmpLeaveList",
        //   element : <FrmEmpLeaveList/>
        // },
        //  {
        //   path:"Masters/FrmLeaveApprove",
        //   element : <FrmLeaveApprove/>
        // },
        //  {
        //   path:"Masters/FrmLeaveApprovalList",
        //   element : <FrmLeaveApprovalList/>
        // },
        //  {
        //   path:"Masters/FrmLeaveApplication",
        //   element : <FrmLeaveApplication/>
        // },

        // {
        //   path:"Masters/FrmLeaveList",
        //   element : <FrmLeaveList/>
        // },
        // {
        //   path:"Masters/FrmLeaveMst",
        //   element : <FrmLeaveMaster/>
        // }
      ]
    }
])

function App() {
  return <RouterProvider router={router} />;
}

export default App
