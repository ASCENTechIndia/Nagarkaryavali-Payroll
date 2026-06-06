import React, { useEffect,useState } from "react";
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
  relName: "",
  relId: "",
};

const FrmRelegionMst = () => {
  const { user } = useAuth();
  const token = user?.token;
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, data } = location.state || {};
  const [formValues, setFormValues] = useState(initialValues);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchRelegionByName = async (id) => {
    try {

      Swal.fire({
        title: "Loading ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmRelegionListMst/religion-details`,                   
        {
          relId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const apiData = res.data?.rows?.[0];
      if (apiData) {
        setFormValues({
          relName: apiData.RELNAME?.trim() || "",
          relId: apiData.RELID,
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
        relId: values.relId || null,
        relName: values.relName,
        userId: user?.userId,
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
        `${BASE_URL}/api/FrmRelegionListMst/save-religion`,                   
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
          navigate("/Masters/FrmRelegionList");
        });
      }
    } catch (err) {
      console.error("Save Error:", err);

      Swal.fire({
        text: "Saving error. Please try again.",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  useEffect(() => {
          if (mode === 2 && data?.relId) {
            fetchRelegionByName(data.relId, setFormValues);
          }
        }, [mode, data]);

  return (
    <Formik initialValues={formValues} enableReinitialize onSubmit={(values) => handleSubmit(values)}>
          {({ values, handleChange}) => {
        return (
          <Form>
            <>
              <Card className="border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-2xl font-semibold">Religion Master</CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                    <div className="grid justify-center gap-4 w-full">
                      <Label className="font-bold whitespace-nowrap required">Religion Name :</Label>
                      <Input
                        name="relName"
                        value={values.relName}
                        onChange={handleChange}
                        required
                        className="w-full sm:min-w-[400px]"
                      />
                    </div>

                  <CardContent className="p-4">
                    <div className="flex justify-center gap-4 ">
                      <Button className="bg-blue-600 text-white hover:bg-gray-300 hover:text-blue-600" type="submit">
                      Save
                      </Button>
                      <Button className="bg-gray-200 text-black hover:bg-gray-200" type="button"
                      onClick={() => navigate("/Masters/FrmRelegionList")}>
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

export default FrmRelegionMst;