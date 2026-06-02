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

      const res = await axios.post(
        `${BASE_URL}/api/FrmRelationListMst/relation-details`,              
        {
          relid: id,
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
          relid: apiData.RELID,                         
          relname: apiData.RELNAME?.trim() || "",
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
        relid: values.relid || null,
        relname: values.relname,
        userId: user?.userId,
        corpId: user?.ulbId,
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
        `${BASE_URL}/api/FrmRelationListMst/save-relation`,                     
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.close();

      if (res.data?.ok || res.data?.success) {
        Swal.fire({
          text: res.data?.data?.message || "Successfully saved",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          navigate("/Masters/FrmRelListMst");
        });
      }
    } catch (err) {
      console.error("Save Error:", err);

      Swal.fire({
        text: "Relation Name cannot be Deleted or Updated",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };
  useEffect(() => {
          if (mode === 2 && data?.relid) {
            fetchRelationById(data.relid, setFormValues);
          }
        }, [mode, data]);

  return (
    <Formik initialValues={formValues} enableReinitialize onSubmit={(values) => handleSubmit(values)}>
      {({ values, handleChange }) => {
        return (
          <Form>
            <>
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

                  <CardContent className="p-6">
                    <div className="flex justify-center gap-4">
                      <Button className="bg-blue-600 text-white hover:bg-gray-300 hover:text-blue-600" type="submit">
                      Save
                      </Button>
                      <Button className="bg-gray-200 text-black hover:bg-gray-200" type="button"
                      onClick={() => navigate("/Masters/FrmRelListMst")}>
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

export default FrmRelationMst;