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
  relid: "",
  relname: "",
};

const FrmRelationMst = () => {
  const { user } = useAuth();
  const token = user?.token;
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, data } = location.state || {};
  const [formValues, setFormValues] = useState(initialValues);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchRelationById = async (id) => {
    try {
      Swal.fire({
        title: "Loading ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const relId = Number(id);
      if (isNaN(relId)) {
        Swal.close();
        Swal.fire({
          text: "Invalid Relation ID",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      const res = await axios.post(
        `${BASE_URL}/api/FrmRelationListMst/relation-details`,
        {
          relid: relId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const apiData = res.data?.[0];

      if (apiData) {
        setFormValues({
          relid: apiData.RELID?.toString() || "",
          relname: apiData.RELNAME?.trim() || "",
        });
      }
      Swal.close();
    } catch (err) {
      console.error("Error:", err);
      Swal.close();
      Swal.fire({
        text: "Error loading relation details",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const userId = user?.userId || null;
      const corpId = user?.ulbId ? Number(user.ulbId) : null;
      
      if (!userId) {
        Swal.fire({
          text: "User ID is required",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      if (!corpId || isNaN(corpId)) {
        Swal.fire({
          text: "Corporation ID is required and must be a valid number",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      if (!values.relname || !values.relname.trim()) {
        Swal.fire({
          text: "Relation Name is required",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      const payload = {
        mode: mode === 2 ? 2 : 1,        
        relid: values.relid ? Number(values.relid) : null, 
        relname: values.relname.trim(), 
        userId: userId,                 
        corpId: corpId,                 
      };

      console.log("Final payload:", payload);
      console.log("Payload types:", {
        mode: typeof payload.mode,
        relid: typeof payload.relid,
        relname: typeof payload.relname,
        userId: typeof payload.userId,
        corpId: typeof payload.corpId, 
      });

      Swal.fire({
        title: "Saving...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmRelationListMst/save-relation`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.close();

      if (res.data?.errorCode === -100) {
        Swal.fire({
          text: res.data?.errorMsg || "Successfully saved",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          navigate("/Masters/FrmRelListMst");
        });
      } else if (res.data?.errorCode && res.data.errorCode < 0) {
        Swal.fire({
          text: res.data?.errorMsg || "Error saving relation",
          confirmButtonColor: "#1e3a8a",
        });
      } else if (res.data?.ok || res.data?.success) {
        Swal.fire({
          text: res.data?.data?.message || "Successfully saved",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          navigate("/Masters/FrmRelListMst");
        });
      } else {
        Swal.fire({
          text: res.data?.errorMsg || "Unknown error occurred",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (err) {
      console.error("Save Error:", err);
      Swal.close();
      
      const errorMsg = err.response?.data?.error || err.message || "An error occurred";
      Swal.fire({
        text: errorMsg,
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  useEffect(() => {
    if (mode === 2 && data?.relid) {
      fetchRelationById(data.relid);
    }
  }, [mode, data]);

  return (
    <Formik 
      initialValues={formValues} 
      enableReinitialize 
      onSubmit={(values) => handleSubmit(values)}
    >
      {({ values, handleChange }) => {
        return (
          <Form>
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-semibold">Relation Master</CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="flex justify-center mt-10">
                  <div className="grid grid-cols-2 gap-4 w-[800px]">
                    <Label className="font-bold whitespace-nowrap required"> Relation ID</Label>
                    <Label className="font-bold whitespace-nowrap required"> Relation Name</Label>
                  
                    <Input
                      name="relid"
                      value={values.relid}
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
                      name="relname"
                      value={values.relname}
                      onChange={handleChange}
                      required
                      className="w-full sm:flex-1"
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <Button 
                    className="bg-blue-600 text-white hover:bg-gray-300 hover:text-blue-600" 
                    type="submit"
                  >
                    Save
                  </Button>
                  <Button 
                    className="bg-gray-200 text-black hover:bg-gray-200" 
                    type="button"
                    onClick={() => navigate("/Masters/FrmRelListMst")}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmRelationMst;