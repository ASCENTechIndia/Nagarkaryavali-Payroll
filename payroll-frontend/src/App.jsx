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
import FrmPayCommMst from './Masters/FrmPayCommMst';
import FrmPayCommList from './Masters/FrmPayCommList';
import FrmDesgMst from './Masters/FrmDesgMst';
import FrmDesgListMst from './Masters/FrmDesgListMst';
import FrmBankMst from './Masters/FrmBankMst';
import FrmBankList from './Masters/FrmBankList';
import FrmPayHeadMst from './Masters/FrmPayHeadMst';
import FrmPayHeadListMst from './Masters/FrmPayHeadListMst';

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
      ]
    }
])

function App() {
  return <RouterProvider router={router} />;
}

export default App
