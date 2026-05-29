"use client";

import React from "react";
import { Formik, Form } from "formik";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

const initialValues = {
  corporation: "",
  payHead: "",
  calculation: "fix",
  value: "",
  designation: "",
  designationAll: false,
  grade: "",
  gradeAll: false,
  category: "",
  categoryAll: false,
  maxLimit: "",
};

const FrmPayHeadConfigMst = () => {
  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({
        values,
        handleChange,
        setFieldValue,
      }) => (
        <Form>
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-2xl font-bold">
                PayHead Config Master
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">

                {/* Corporation */}
                <div className="space-y-2">
                  <Label
                    text="Corporation Name"
                    required
                    className="min-w-[180px]"
                  />

                  <Select
                    value={values.corporation}
                    onValueChange={(value) =>
                      setFieldValue(
                        "corporation",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="870">
                        Sangli Miraj Kupwad Corporation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pay Head */}
                <div className="space-y-2">
                  <Label
                    text="Pay Head"
                    required
                  />

                  <Select
                    value={values.payHead}
                    onValueChange={(value) =>
                      setFieldValue(
                        "payHead",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Pay Head 1
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Calculation */}
                <div className="space-y-2">
                  <Label
                    text="Calculation"
                    required
                  />

                  <div className="flex items-center gap-8 h-10">

                    <label className="flex items-center gap-2">
                      <Input
                        type="radio"
                        name="calculation"
                        checked={
                          values.calculation ===
                          "fix"
                        }
                        onChange={() =>
                          setFieldValue(
                            "calculation",
                            "fix"
                          )
                        }
                      />
                      <span>Fix</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <Input
                        type="radio"
                        name="calculation"
                        checked={
                          values.calculation ===
                          "percentage"
                        }
                        onChange={() =>
                          setFieldValue(
                            "calculation",
                            "percentage"
                          )
                        }
                      />
                      <span>Percentage</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <Input
                        type="radio"
                        name="calculation"
                        checked={
                          values.calculation ===
                          "slab"
                        }
                        onChange={() =>
                          setFieldValue(
                            "calculation",
                            "slab"
                          )
                        }
                      />
                      <span>Slab</span>
                    </label>

                  </div>
                </div>

                {/* Value */}
                <div className="space-y-2">
                  <Label
                    text="Value"
                    required
                  />

                  <Input
                    name="value"
                    value={values.value}
                    onChange={handleChange}
                  />
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <Label
                    text="Designation"
                    required
                  />

                  <div className="flex items-center gap-2">

                    <Select
                      value={
                        values.designation
                      }
                      onValueChange={(
                        value
                      ) =>
                        setFieldValue(
                          "designation",
                          value
                        )
                      }
                    >
                      <SelectTrigger className="w-full h-9" >
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">
                          Designation 1
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Input
                        type="checkbox"
                        checked={
                          values.designationAll
                        }
                        onChange={(e) =>
                          setFieldValue(
                            "designationAll",
                            e.target.checked
                          )
                        }
                      />
                      <span>All</span>
                    </div>

                  </div>
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <Label
                    text="Grade"
                    required
                  />

                  <div className="flex items-center gap-2">

                    <Select
                      value={values.grade}
                      onValueChange={(value) =>
                        setFieldValue(
                          "grade",
                          value
                        )
                      }
                    >
                      <SelectTrigger className="w-full h-9" >
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">
                          Grade 1
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Input
                        type="checkbox"
                        checked={
                          values.gradeAll
                        }
                        onChange={(e) =>
                          setFieldValue(
                            "gradeAll",
                            e.target.checked
                          )
                        }
                      />
                      <span>All</span>
                    </div>

                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label
                    text="Category"
                    required
                  />

                  <div className="flex items-center gap-2">

                    <Select
                      value={values.category}
                      onValueChange={(value) =>
                        setFieldValue(
                          "category",
                          value
                        )
                      }
                    >
                      <SelectTrigger className="w-full h-9" >
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">
                          Category 1
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Input
                        type="checkbox"
                        checked={
                          values.categoryAll
                        }
                        onChange={(e) =>
                          setFieldValue(
                            "categoryAll",
                            e.target.checked
                          )
                        }
                      />
                      <span>All</span>
                    </div>

                  </div>
                </div>

                {/* Max Limit */}
                <div className="space-y-2">
                  <Label text="Maxlimit" />

                  <Input
                    name="maxLimit"
                    value={values.maxLimit}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="flex justify-center gap-3 mt-8">

                <Button type="submit">
                  Save
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  path="/Masters/FrmPayHeadConfigList"
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

export default FrmPayHeadConfigMst;