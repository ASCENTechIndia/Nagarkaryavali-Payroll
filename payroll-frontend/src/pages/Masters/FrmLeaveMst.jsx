import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import Swal from "sweetalert2";

import { Formik, Form } from "formik";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

const FrmLeaveMaster = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const { token, user } = useAuth();

  const baseUrl =
    import.meta.env.VITE_BASE_URL;

  const corpId = user?.ulbId;

  const userId = user?.userId;

  const leaveId =
    location?.state?.leaveId || 0;

  const [initialValues, setInitialValues] =
    useState({
      leaveName: "",
    });

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  /* -------------------------------------------------------------------------- */
  /*                               LEAVE BY ID                                  */
  /* -------------------------------------------------------------------------- */

  const getLeaveById = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () =>
          Swal.showLoading(),
      });

      const response = await axios.post(
        `${baseUrl}/api/LeaveMaster/leavebyid`,
        {
          corpId,
          leaveId,
        },
        axiosConfig
      );

      const data =
        response?.data?.data?.data?.[0];

      if (data) {
        setInitialValues({
          leaveName:
            data?.VAR_LEAVE_NAME || "",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      Swal.close();
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 PAGE LOAD                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (
      leaveId > 0 &&
      token &&
      corpId
    ) {
      getLeaveById();
    }
  }, [leaveId, token, corpId]);

  /* -------------------------------------------------------------------------- */
  /*                                   SAVE                                     */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (
    values
  ) => {
    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () =>
          Swal.showLoading(),
      });

      const payload = {
        userId,
        corpId,
        leaveId,
        leaveName:
          values.leaveName,
        mode:
          leaveId > 0 ? 2 : 1,
      };

      const response = await axios.post(
        `${baseUrl}/api/LeaveMaster/saveleave`,
        payload,
        axiosConfig
      );

      if (response?.data?.ok) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text:
            response?.data?.message,
        });

        navigate(
          "/Masters/FrmLeaveList"
        );
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data
            ?.message ||
          "Something went wrong",
      });
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({
        values,
        handleChange,
        resetForm,
      }) => (
        <Form>
          <Card>
           <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Leave Master
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">

              <div className="flex justify-center">
                <div className="w-full max-w-xl space-y-2">

                  <Label
                    text="Leave Name"
                    required
                  />

                  <Input
                    name="leaveName"
                    value={
                      values.leaveName
                    }
                    onChange={
                      handleChange
                    }
                    className="h-10"
                  />

                </div>
              </div>

              <div className="flex justify-center gap-4">

                <Button type="submit">
                  {leaveId > 0
                    ? "Update"
                    : "Save"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    navigate(
                      "/Masters/FrmLeaveList"
                    )
                  }
                >
                  Cancel
                </Button>

              </div>

            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmLeaveMaster;