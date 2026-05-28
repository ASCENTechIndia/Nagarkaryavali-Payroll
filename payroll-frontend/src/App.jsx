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
      ]
    }
])

function App() {
  return <RouterProvider router={router} />;
}

export default App
