import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShadCNTable from "@/components/ui/table";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmCastList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [castList, setCastList] = useState([]);
  const headers = ["Select", "Cast ID", "Cast Name"];

  const keyMapping = {
    Select: "select",
    "Cast ID": "id",
    "Cast Name": "name",
  };

  const fetchCasts = async () => {
    try {
      Swal.fire({
        title: "Loading Casts...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get(
        `${BASE_URL}/api/CastMst/castlist`,    
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      Swal.close();
      if (res.data?.ok && res.data?.data?.data) {
        setCastList(res.data.data.data);
      } else {
        setCastList([]);
      }
    } catch (err) {
      Swal.close();
      console.error("Cast list error:", err);
      Swal.fire("Error loading casts");
    }
  };

  useEffect(() => {
      fetchCasts();
  }, [user]);

  const tableData = castList.map((row, index) => ({
    id: row.CASTID ?? index,
    select: (
      <Button
        variant="link"
        className="text-blue-700 px-0"
        onClick={() =>
          navigate("/Masters/FrmCastMaster", {
            state: { mode: 2, 
                     data: {
                          castid: row.CASTID,
                          castName: row.CASTNAME
                    }},
          })
        }
      >
        Select
      </Button>
    ),
    name: row.CASTNAME?.trim() || "-",
  }));

  const finalData =
    tableData.length > 0
      ? tableData
      : [
          {
            id: 0,
            select: "",
            name: "Data not found",
          },
        ];

  return (
    <>
       <Card className="shadow-sm border rounded-lg">
        <CardHeader className="border-b flex justify-between items-center p-4">
           <CardTitle className="text-2xl font-bold">Cast List</CardTitle>
        </CardHeader>
          <CardTitle className="border-b text-sm text-gray-500 p-4">
          <Button onClick={() => navigate("/Masters/FrmCastMaster")}>
            Add New
          </Button>
        </CardTitle>
        <CardContent className="p-6">
          <div className="border rounded-md overflow-hidden">
            <ShadCNTable
              headers={headers}
              data={finalData}
              keyMapping={keyMapping}
              pagination={tableData.length > 0}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default FrmCastList;