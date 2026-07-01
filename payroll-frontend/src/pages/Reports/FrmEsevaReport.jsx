import React, { useState } from "react";
import { Formik, Form } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmEsevaReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ulbId = user?.ulbId;

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  const initialFormValues = {
    empCode: "",
  };

  const handleSearch = async (values) => {
    const { empCode } = values;
    
    if (!empCode || !empCode.trim()) {
      setErrorMessage("Please enter Employee Code");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    setSearching(true);
    setErrorMessage("");
    setSuccessMessage("");
    setEmployee(null);
    setPdfUrl(null);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmEsevaReport/search-employee`,
        {
          ulbId: Number(ulbId),
          empCode: empCode.trim()
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );

      if (response.data.success) {
        setEmployee(response.data.data);
        setSuccessMessage("Employee found successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Record not found");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setSearching(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!employee) {
      setErrorMessage("Please search for an employee first");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const corporationName = user?.brNameMar || localStorage.getItem("BrNameMar");
      const brNameMar = user?.brNameMar || localStorage.getItem("BrNameMar");
      const brAddMar = user?.brAddMar || localStorage.getItem("BrAddMar");
      const userId = user?.userId || localStorage.getItem("UserId");

      const payload = {
        ulbId: Number(ulbId),
        empCode: employee.EMPCODE || employee.empcode,
        corporationName: corporationName,
        brNameMar: brNameMar,
        brAddMar: brAddMar,
        userId: userId,
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
        }
      );

      if (response.data?.success && response.data?.pdfUrl) {
        setPdfUrl(response.data.pdfUrl);
        setSuccessMessage("PDF generated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        // Open PDF in new tab
        window.open(response.data.pdfUrl, "_blank");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Generate Report Error", error);
      setErrorMessage(error.response?.data?.message || "Failed to generate report");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <Formik initialValues={initialFormValues} enableReinitialize>
      {({ values, setFieldValue, handleChange, submitForm }) => (
        <Form>
          <Card className="shadow-sm border">
            <CardHeader className="border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-2xl font-semibold">
                E-Seva Report
              </CardTitle>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Employee Code</Label>
                <Input
                  id="empCode"
                  name="empCode"
                  type="text"
                  placeholder=""
                  value={values.empCode}
                  onChange={handleChange}
                  className="w-full"
                  disabled={searching || loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="mx-6 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            {/* Success Message Display */}
            {successMessage && (
              <div className="mx-6 mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
            )}

            {/* Employee Details Section */}
            {employee && (
              <div className="mx-6 mb-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-800">
                      Employee Details
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-500">Employee Name</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.ESEVAEMP_NAME || employee.name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Employee Code</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.EMPCODE || employee.empcode}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Designation</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.DESIGNATIONNAME}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Father's Name</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.FATHERNAME || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Mother's Name</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.MOTHERNAME || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Date of Birth</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.DOB || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Date of Joining</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.JOINDATE || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Aadhar Number</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.AADHARNO || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">PAN Number</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.PANNO || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Category</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.CATEGORY || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Nationality</Label>
                        <p className="font-medium mt-1 text-gray-800">
                          {employee.NATIONALITY || "N/A"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-gray-500">Email</Label>
                        <p className="font-medium mt-1 text-gray-800 break-all">
                          {employee.EMAIL || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <CardContent className="p-6">
              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  onClick={() => handleSearch(values)}
                  disabled={searching || loading || !values.empCode}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {searching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>

                {employee && (
                  <Button
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      "Generate Service Book"
                    )}
                  </Button>
                )}

                {pdfUrl && (
                  <Button
                    type="button"
                    onClick={() => window.open(pdfUrl, "_blank")}
                    variant="outline"
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300"
                  >
                    View PDF
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="bg-gray-200 text-black hover:bg-gray-300"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmEsevaReport;