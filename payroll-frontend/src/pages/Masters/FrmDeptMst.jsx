"use client";

import React, { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { Formik, Form } from "formik";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

const FrmDeptMaster = () => {


  const initialValues = {
    deptId: "",
    deptNameMar: "",
    deptNameEng: "",
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ values, handleChange, resetForm }) => (
        <Form>
            <Card >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-bold">Department Master</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Department ID */}
                <div className="space-y-2">
                  <Label
                    text="Department ID"
                    required
                    className="min-w-[180px]"
                  />

                  <Input
                    name="deptId"
                    value={values.deptId}
                    onChange={handleChange}
                    disabled
                  />
                </div>

                {/* Marathi Name */}
                <div className="space-y-2">
                  <Label
                    text="Department Name (Marathi)"
                    required
                    className="min-w-[280px]"
                  />

                  <Input
                    name="deptNameMar"
                    value={values.deptNameMar}
                    onChange={handleChange}
                  />
                </div>

                {/* English Name */}
                <div className="space-y-2">
                  <Label
                    text="Department Name"
                    required
                    className="min-w-[180px]"
                  />

                  <Input
                    name="deptNameEng"
                    value={values.deptNameEng}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-3 mt-8">
                <Button type="submit">Save</Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    resetForm({
                      values: initialValues,
                    })
                  }
                  path="/Masters/FrmDeptList"
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

export default FrmDeptMaster;
