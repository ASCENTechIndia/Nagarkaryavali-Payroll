import React, { useEffect, useState } from "react";
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
  castid: "",
  castName: "",
};

const FrmCastMaster = () => {
  const { user } = useAuth();
  const token = user?.token;
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, data } = location.state || {};
  const [formValues, setFormValues] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchCastById = async (id) => {
    try {
      setIsLoading(true);
      Swal.fire({
        title: "Loading ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/CastMst/castbyid`,
        {
          castid: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const apiData = res.data?.data?.data?.[0];

      if (apiData) {
        const newValues = {
          castid: apiData.CASTID,
          castName: apiData.CASTNAME?.trim() || "",
        };
        setFormValues(newValues);
        console.log("Fetched data:", newValues); // Debug log
      }
      Swal.close();
      setIsLoading(false);
    } catch (err) {
      console.error("Error:", err);
      Swal.close();
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const castIdForUpdate = mode === 2 ? data?.castid : null;

      const payload = {
        mode: mode === 2 ? 2 : 1,
        corpId: user?.corpId || 1,
        castName: values.castName,
        userId: user?.userId,
        castId: castIdForUpdate,
        //castid: values.castid || mode === 2 ? values.castid : null || mode === 2 ? Number(values.castid) : null,
        //castid: mode === 2 ? values.castid : null,
      };

      console.log("Payload being sent:", payload); // Debug log

      Swal.fire({
        title: "Saving...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/CastMst/savecast`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.close();

      if (res.data?.ok === true || res.data?.success === true) {
        Swal.fire({
          text: res.data?.data?.message || "Successfully saved",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          navigate("/Masters/FrmCastListMst");
        });
      } else {
       let errorMessage = res.data?.out_ErrorMsg || 
                        res.data?.error || 
                        "Error saving data. Please try again.";
      
      if (errorMessage.includes("Message Code")) {
        const match = errorMessage.match(/Message Code\s*:\s*-\d+\s*-\s*(.*)/);
        if (match) {
          errorMessage = match[1];
        }
      }
      
      Swal.fire({
        text: errorMessage,
        confirmButtonColor: "#1e3a8a",
      });
      }
    } catch (err) {
      console.error("Save Error:", err);
      Swal.close();

      let errorMessage = err.response?.data?.out_ErrorMsg || 
                      err.response?.data?.error || 
                      err.response?.data?.message ||
                      "Error saving data. Please try again.";
    
    // Clean the message if it contains "Message Code"
    if (errorMessage.includes("Message Code")) {
      const match = errorMessage.match(/Message Code\s*:\s*-\d+\s*-\s*(.*)/);
      if (match) {
        errorMessage = match[1];
      }
    }
    
    Swal.fire({
      text: errorMessage,
      confirmButtonColor: "#1e3a8a",
    });
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (mode === 2 && data?.castid) {
      fetchCastById(data.castid);
    }
  }, [mode, data]);

  return (
    <Formik 
      initialValues={formValues} 
      enableReinitialize={true}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, isSubmitting }) => {
        console.log("Current form values:", values); // Debug log
        return (
          <Form>
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-semibold">
                  {mode === 2 ? "Edit Cast Master" : "Cast Master"}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="flex justify-center mt-10">
                  <div className="grid grid-cols-2 gap-4 w-[800px]">
                    <Label className="font-bold whitespace-nowrap required">Cast ID :</Label>
                    <Label className="font-bold whitespace-nowrap required">Cast Name :</Label>
                  
                    <Input
                      name="castid"
                      value={values.castid || ""}
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
                      value={values.castName || ""}
                      onChange={handleChange}
                      required
                      className="w-full sm:flex-1"
                    />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-center gap-4">
                    <Button 
                      className="bg-blue-600 text-white hover:bg-gray-300 hover:text-blue-600" 
                      type="submit"
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button 
                      className="bg-gray-200 text-black hover:bg-gray-200" 
                      type="button"
                      onClick={() => navigate("/Masters/FrmCastListMst")}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmCastMaster;