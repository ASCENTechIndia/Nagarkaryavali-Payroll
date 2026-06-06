import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmEsevaReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState([]);
  
  {/*const initialFormValues = {
    department: "",
  };*/}

//add download button func
//need to check what to download and how to show it
const handleDownload = async (values) => {
};


  const searchEmpCode = async (text) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/`,
        {
          searchCode: text,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (res.data.rows) {
        setSearchCode(res.data.rows);
      } else {
        setSearchCode([]);
      }
      } catch (err) {
        console.error("Search error:", err);
        setSearchCode([]);
      }
    };

    const handleCancel = () => {
    navigate("/");
    };

    return (
    <Formik
          //initialValues={initialFormValues}
          enableReinitialize
          //onSubmit={handleDownload}
        >
       <Card className="shadow-sm border rounded-lg">
        <CardHeader className="border-b flex justify-between items-center">
          <CardTitle className="text-2xl font-semibold">E-Seva Report</CardTitle>
        </CardHeader>

        <CardHeader className="border-b flex flex-col items-start gap-2 pl-8 py-7 justify-between items-center ">
          <div className="text-xl font-semibold">
            Report Criteria
          </div>
        </CardHeader>

        <CardHeader className="flex flex-col items-start gap-2 pl-8 justify-between items-center ">
          <div className="text-sm font-semibold pr-50">
            Employee Code
          </div>
          <Input
            className="w-full w-80 h-8 text-sm "
          />
        </CardHeader>

       <CardContent className="p-6">
        <div className="flex justify-center gap-4">
          <Button className="bg-blue-600 text-white hover:bg-gray-300 hover:text-blue-600" type="submit"
          onClick={handleDownload}>
          Download
          </Button>
          <Button className="bg-gray-200 text-black hover:bg-gray-200" type="button"
          onClick={handleCancel}>
          Cancel
          </Button>
        </div>
      </CardContent>
      </Card>
    </Formik>
  );
}
export default FrmEsevaReport;
