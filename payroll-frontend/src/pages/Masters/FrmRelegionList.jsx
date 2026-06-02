import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShadCNTable from "@/components/ui/table";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmRelegionList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [relegionList, setRelegionList] = useState([]);
  const headers = ["Action", "Religion"];

  const keyMapping = {
    Action: "select",
    "Religion": "name",
  };

  const fetchRelegion = async () => {
    try {
      Swal.fire({
        title: "Loading Religions...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get(
        `${BASE_URL}/api/FrmRelegionListMst/religion-list`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      Swal.close();
      if (res.data?.success) {
        setRelegionList(res.data?.rows || []);
      } else {
          setRelegionList([]);
      } 
    } catch (err) {
      Swal.close();
      console.error("Religion list error:", err);
      Swal.fire("Error loading religions");
    }
  };
     
  useEffect(() => {
      fetchRelegion();
  }, [user]);

  const tableData = relegionList.map((row, index) => ({
    id: row.RELID ?? index,  
    select: (
      <Button
        variant="link"
        className="text-blue-700 px-0"
        onClick={() =>
          navigate("/Masters/FrmRelegionMst", {
            state: { mode: 2, 
                     data: {
                          relId: row.RELID,
                          relName: row.RELNAME
                    }},
          })
        }
      >
        Select
      </Button>
    ),
    name: row.RELNAME?.trim() || "-",     
  }));

  const finalData =
    tableData.length > 0
      ? tableData
      : [
          {
            //id: "Not Found",
            select: "",
            name: "Data not found",
          },
        ];
  return (
    <>
       <Card className="shadow-sm border rounded-lg">
        <CardHeader className="border-b flex justify-between items-center p-4">
           <CardTitle className="text-2xl font-bold">Religion List</CardTitle>
        </CardHeader>
          <CardTitle className="text-sm text-gray-500 pr-4 flex justify-end">
          <Button onClick={() => navigate("/Masters/FrmRelegionMst")}>
            Add New
          </Button>
        </CardTitle>
        <CardContent>
          <div className="border rounded-md overflow-hidden ">
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

export default FrmRelegionList;