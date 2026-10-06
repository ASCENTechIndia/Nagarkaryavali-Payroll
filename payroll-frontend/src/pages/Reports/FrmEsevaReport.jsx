import React, { useState } from "react";
import { Formik, Form } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";
const FrmEsevaReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [loading, setLoading] = useState(false);

  const initialFormValues = {
    empCode: "",
  };

  const handleDownload = async (values) => {
    const empCode = values.empCode?.trim();

    if (!empCode) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please enter employee code",
      });
      return;
    }

    setLoading(true);

    try {
      const corporationName =
        user?.brNameMar || localStorage.getItem("BrNameMar");

      const brNameMar = user?.brNameMar || localStorage.getItem("BrNameMar");

      const brAddMar = user?.brAddMar || localStorage.getItem("BrAddMar");

      const userId = user?.userId || localStorage.getItem("UserId");

      const payload = {
        ulbId: Number(ulbId),
        empCode,
        corporationName,
        brNameMar,
        brAddMar,
        userId,
        userName: user?.userName || localStorage.getItem("UserName"),
      };

      const response = await axios.post(
        `${BASE_URL}/api/FrmEsevaReport/generate-report`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data?.success && response.data?.pdfUrl) {
        window.open(response.data.pdfUrl, "_blank");
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          response.data?.error ||
          response.data?.message ||
          "Failed to generate E-Seva report",
      });
    } catch (error) {
      console.error("E-Seva Report Error:", error);

      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate E-Seva report";

      Swal.fire({
        // icon: "error",
        // title: "Employee Not Found",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik initialValues={initialFormValues} onSubmit={handleDownload}>
      {({ values, handleChange }) => (
        <Form>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-5 min-h-screen"
          >
            <Card className="border shadow-sm">
              <CardHeader className="px-4 pb-6 border-b border-[#d7d7d7]">
                <CardTitle className="text-xl font-bold">
                  E-Seva Report
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold whitespace-nowrap">
                      Employee Code :
                    </Label>

                    <Input
                      id="empCode"
                      name="empCode"
                      type="text"
                      value={values.empCode}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        handleChange({
                          target: {
                            name: "empCode",
                            value,
                          },
                        });
                      }}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <Button type="submit" disabled={loading || !values.empCode}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Downloading...
                      </>
                    ) : (
                      "Download"
                    )}
                  </Button>

                  <Button type="button" path={"/HomePage/FrmHomePage"} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

export default FrmEsevaReport;
