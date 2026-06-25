import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import ShadCNTable from "@/components/ui/table";

const FrmLeaveList = () => {
  const navigate = useNavigate();

  const { token, user } = useAuth();

  const [leaveList, setLeaveList] = useState([]);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const corpId = user?.ulbId;



  /* -------------------------------------------------------------------------- */
  /*                                   TABLE                                    */
  /* -------------------------------------------------------------------------- */

  const headers = ["Action", "Leave Name"];

  const keyMapping = {
    Action: "action",
    "Leave Name": "leaveName",
  };

  /* -------------------------------------------------------------------------- */
  /*                                API CALL                                    */
  /* -------------------------------------------------------------------------- */

  const getLeaveList = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        text: "Fetching Leave List",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `${baseUrl}/api/LeaveMaster/leavelist`,
        {
          corpId,
        },
        {
                    headers: {Authorization: `Bearer ${token}`},
                },
      );

      setLeaveList(response?.data?.data?.data || []);
    } catch (error) {
      console.error("Leave List Error", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to load leave list",
      });
    } finally {
      Swal.close();
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               PAGE LOAD                                    */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!token || !corpId) return;

    const loadData = async () => {
      await getLeaveList();
    };

    loadData();
  }, [token, corpId]);

  /* -------------------------------------------------------------------------- */
  /*                               TABLE DATA                                   */
  /* -------------------------------------------------------------------------- */

  const tableData = leaveList.map((item) => ({
    leaveName: item.VAR_LEAVE_NAME,

    action: (
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          navigate("/Masters/FrmLeaveMst", {
            state: {
              leaveId: item.NUM_LEAVE_LEAVEID,
            },
          })
        }
      >
        Select
      </Button>
    ),
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Leave List</CardTitle>

          <Button onClick={() => navigate("/Masters/FrmLeaveMst")}>
            Add New
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ShadCNTable
          headers={headers}
          data={tableData}
          keyMapping={keyMapping}
          pagination
          rowsPerPage={10}
        />
      </CardContent>
    </Card>
  );
};

export default FrmLeaveList;
