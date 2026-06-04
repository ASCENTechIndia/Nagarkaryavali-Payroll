import React from "react";
import { Formik, Form } from "formik";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FrmEmployeeListReport = () => {
  const initialValues = {
    department: "-1",
    designation: "-1",
    employeeType: "-1",
    employeeStatus: "working",
    gender: "male",
    employeeCode: "",
    exportType: "pdf",
  };

  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue, resetForm }) => (
        <Form>
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Employee List Report
              </CardTitle>
            </CardHeader>

            {/* Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                {/* Department */}
                <div className="space-y-2">
                  <Label text="विभाग" />

                  <Select
                    value={values.department}
                    onValueChange={(v) => setFieldValue("department", v)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="-1">-- ALL --</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <Label text="पदनाम" />

                  <Select
                    value={values.designation}
                    onValueChange={(v) => setFieldValue("designation", v)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="-1">-- ALL --</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Type */}
                <div className="space-y-2">
                  <Label text="कर्मचारी प्रकार" />

                  <Select
                    value={values.employeeType}
                    onValueChange={(v) => setFieldValue("employeeType", v)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="-1">-- Select Option --</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Status */}
                <div className="space-y-3">
                  <Label text="कर्मचारी स्थिती" />

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="employeeStatus"
                        checked={values.employeeStatus === "working"}
                        onChange={() =>
                          setFieldValue("employeeStatus", "working")
                        }
                      />
                      <span>कार्यरत</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="employeeStatus"
                        checked={values.employeeStatus === "retired"}
                        onChange={() =>
                          setFieldValue("employeeStatus", "retired")
                        }
                      />
                      <span>निवृत्त</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="employeeStatus"
                        checked={values.employeeStatus === "suspended"}
                        onChange={() =>
                          setFieldValue("employeeStatus", "suspended")
                        }
                      />
                      <span>निलंबित</span>
                    </label>
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-3">
                  <Label text="लिंग" />

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="gender"
                        checked={values.gender === "male"}
                        onChange={() => setFieldValue("gender", "male")}
                      />
                      <span>पुरुष</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="gender"
                        checked={values.gender === "female"}
                        onChange={() => setFieldValue("gender", "female")}
                      />
                      <span>स्त्री</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="gender"
                        checked={values.gender === "both"}
                        onChange={() => setFieldValue("gender", "both")}
                      />
                      <span>दोन्ही</span>
                    </label>
                  </div>
                </div>

                {/* Employee Code */}
                <div className="space-y-2">
                  <Label text="कर्मचारी क्रमांक" />

                  <Input
                    value={values.employeeCode}
                    onChange={(e) =>
                      setFieldValue("employeeCode", e.target.value)
                    }
                    placeholder="Enter Employee Code"
                  />
                </div>

                {/* Export Type */}
                <div className="space-y-3 md:col-span-3">
                  <Label text="Export To" required />

                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="exportType"
                        checked={values.exportType === "pdf"}
                        onChange={() => setFieldValue("exportType", "pdf")}
                      />
                      <span>PDF</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="radio"
                        name="exportType"
                        checked={values.exportType === "excel"}
                        onChange={() => setFieldValue("exportType", "excel")}
                      />
                      <span>EXCEL</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-12">
                <Button type="submit">Print</Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => resetForm()}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmEmployeeListReport;
