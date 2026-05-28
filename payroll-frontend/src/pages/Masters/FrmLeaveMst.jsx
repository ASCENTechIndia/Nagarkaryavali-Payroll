import React from "react";

import { Formik, Form } from "formik";

import { useLocation } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

const FrmLeaveMaster = () => {
  const location = useLocation();

  const initialValues = {
    leaveName: location.state?.leaveName || "",
  };

  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, resetForm }) => (
        <Form>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">Leave Master</CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Form */}
              <div className="flex justify-center">
                <div className="w-full max-w-xl space-y-2">
                  <Label text="Leave Name" required />

                  <Input
                    name="leaveName"
                    value={values.leaveName}
                    onChange={handleChange}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4">
                <Button type="submit">Save</Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => resetForm()}
                  path="/Masters/FrmLeaveList"
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
