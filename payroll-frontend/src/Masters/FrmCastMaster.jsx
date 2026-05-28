import React, { useEffect } from "react";
import { Formik, Form } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

const initialValues = {
  castId: "",
  castName: "",
};

const FrmCastMaster = () => {
  const { user } = useAuth();
  const token = user?.token;
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, data } = location.state || {};

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchCastById = async (id, setValues) => {
    try {

      Swal.fire({
        title: "Loading ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/`,                      //ADD API ENDPOINT
        {
          castId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const apiData = res.data?.data?.data?.[0];

      if (apiData) {
        setValues({
          castId: apiData.CASTID,
          castName: apiData.CASTNAME?.trim() || "",
        });
      }
      Swal.close();
    } catch (err) {
      console.error("Error:", err);
      Swal.close();
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        mode: mode === 2 ? 2 : 1,
        castName: values.castName,
        userId: user?.userId,
        castId: values.castId || null,
      };

      Swal.fire({
        title: "Saving...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/`,                     //ADD API ENDPOINT
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.close();

      if (res.data?.ok) {
        Swal.fire({
          text: res.data?.data?.message || "Success",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          navigate("/Masters/FrmCastListMst");
        });
      }
    } catch (err) {
      console.error("Save Error:", err);

      Swal.fire({
        text: "Something went wrong",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  return (
    <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
      {({ values, handleChange, setValues }) => {
        useEffect(() => {
          if (mode === 2 && data?.id) {
            fetchCastById(data.id, setValues);
          }
        }, [mode, data]);

        return (
          <Form>
            <>
              <Card className="border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-2xl font-semibold">Cast Master</CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                 
                    <div className="flex justify-center mt-10">

                    <div className="grid grid-cols-2 gap-4 w-[800px]">
                      <Label className="font-bold whitespace-nowrap"><span className="text-red-500">*</span> Cast ID :</Label>
                      <Label className="font-bold whitespace-nowrap"><span className="text-red-500">*</span> Cast Name :</Label>
                   
                      <Input
                        name="castId"
                        value={values.castId}
                        onChange={handleChange}
                        disabled
                        style={{
                          backgroundColor: "#cce5ff",
                          color: "#003366",
                          opacity: 1
                        }}
                        className="w-full sm:flex-1"
                      />

                      <Input
                        name="castName"
                        value={values.castName}
                        onChange={handleChange}
                        required
                        className="w-full sm:flex-1"
                      />
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex justify-center gap-4">
                  <Button className="bg-blue-600 text-white hover:bg-gray-300 hover:text-blue-600" type="submit">
                  Save
                  </Button>
                  <Button className="bg-gray-200 text-black hover:bg-gray-200" 
                  onClick={() => navigate("/Masters/FrmCastListMst")}>
                  Cancel
                  </Button>
                  </div>
                  </CardContent>
                 
                  </CardContent>
                  </Card>
            </>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmCastMaster;