import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShadCNTable from "@/components/ui/table";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmRelListMst = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [relList, setRelList] = useState([]);
  const headers = ["Action", "Relation ID", "Relation"];

  const keyMapping = {
    Action: "select",
    "Relation ID": "id",
    "Relation": "name",
  };

  const fetchRelations = async () => {
    try {
      Swal.fire({
        title: "Loading Casts...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get(
        `${BASE_URL}/api/FrmRelationListMst/relation-list`,                        
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      Swal.close();
      //console.log("res",res.data);
      if (Array.isArray(res.data)) {
        setRelList(res.data);
    } else {
        setRelList([]);
      }
    } catch (err) {
      Swal.close();
      console.error("Relation list error:", err);
      Swal.fire("Error loading relations");
    }
  };

  useEffect(() => { 
      fetchRelations();
  }, [user]);

  const tableData = relList.map((row, index) => ({
    id: row.RELID || index,           
    select: (
      <Button
        variant="link"
        className="text-blue-700 px-0"
        onClick={() =>
          navigate("/Masters/FrmRelationMst", {
            state: { mode: 2, 
                     data: {
                          relid: row.RELID,
                          relname: row.RELNAME
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
            id: 0,
            select: "",
            name: "Data not found",
          },
        ];

  return (
    <>
       <Card className="shadow-sm border rounded-lg">
        <CardHeader className="border-b flex justify-between items-center p-4">
           <CardTitle className="text-2xl font-bold">Relation List</CardTitle>
        </CardHeader>
          <CardTitle className="border-b text-sm text-gray-500 p-4 flex justify-end">
          <Button onClick={() => navigate("/Masters/FrmRelationMst")}>
            Add New
          </Button>
        </CardTitle>
        <CardContent className="p-1">
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

export default FrmRelListMst;