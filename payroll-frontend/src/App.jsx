import './App.css'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from '@/layout/main-layout';
import { Label } from '@/components/ui/label';
import Login from './pages/Login';


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
      ]
    }
])

function App() {
  return <RouterProvider router={router} />;
}

export default App
