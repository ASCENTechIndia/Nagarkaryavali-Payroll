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
  deptId: "",
  deptnameE: "",
  deptnameM: "",
};

const FrmDeptMst = () => {
  const { user } = useAuth();
  const token = user?.token;
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, data } = location.state || {};
  const [formValues, setFormValues] = useState(initialValues);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchDeptById = async (id) => {
    try {
      Swal.fire({
        title: "Loading ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmDeptListMst/department-details`,
        {
          deptId: id,
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
          deptId: apiData.DEPTID,
          deptnameE: apiData.DEPTNAMEE?.trim() || "",
          deptnameM: apiData.DEPTNAMEM?.trim() || "",
        });
      }
      Swal.close();
    } catch (err) {
      console.error("Error:", err);
      Swal.close();
    }
  };

  useEffect(() => {}, [formValues]);

  const handleSubmit = async (values) => {
    try {
      console.log('Form values:', values);
      console.log('Mode:', mode);
      console.log('User object:', user);

      const payload = {
        mode: mode === 2 ? 2 : 1,
        deptnameE: values.deptnameE,
        deptnameM: values.deptnameM,
        userId: user?.userId || user?.id || user?.user_id,
        deptId: values.deptId || null,
      };

      console.log("Submitting payload:", payload);

      Swal.fire({
        title: "Saving...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmDeptListMst/save-department`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.close();

      const errorCode = res.data?.errorCode;
      const message = res.data?.message || res.data?.data?.message;

      if (res.data?.ok || errorCode === 0 || errorCode === -100) {
        let successMessage = mode === 2 ? 'Department updated successfully!' : 'Department added successfully!';

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: successMessage,
          confirmButtonColor: "#1e3a8a",
          confirmButtonText: 'OK',
        }).then(() => {
          navigate("/Masters/FrmDeptListMst");
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: message || 'Failed to save department',
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (err) {
      console.error("Save Error:", err);

      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.message || "Saving error. Please try again",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  useEffect(() => {
    if (mode === 2 && data?.deptId) {
      fetchDeptById(data.deptId);
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
                  <CardTitle className="text-lg font-semibold">Department Master</CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="flex justify-center mt-10">
                    <div className="grid grid-cols-3 gap-4 w-full">
                      <Label className="font-bold whitespace-nowrap required"> Department ID :</Label>
                      <Label className="font-bold whitespace-nowrap required"> Department Name (Marathi) :</Label>
                      <Label className="font-bold whitespace-nowrap required"> Department Name :</Label>
                      <Input
                        name="deptId"
                        value={values.deptId}
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
                        name="deptnameM"
                        value={values.deptnameM}
                        onChange={handleChange}
                        required
                        className="w-full sm:flex-1"
                      />
                      <Input
                        name="deptnameE"
                        value={values.deptnameE}
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
                      <Button 
                        className="bg-gray-200 text-black hover:bg-gray-200" 
                        type="button"
                        onClick={() => navigate("/Masters/FrmDeptListMst")}
                      >
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

export default FrmDeptMst;