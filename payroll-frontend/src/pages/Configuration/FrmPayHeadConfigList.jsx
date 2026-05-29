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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

const initialValues = {
  category: "",
  payHead: "",
  designation: "",
  grade: "",
};

const FrmPayHeadConfigList = () => {
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
        setFieldValue,
      }) => (
        <Form>
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-2xl font-bold">
                PayHead Config List
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">

              {/* Add New */}
              <div className="mb-6">
                <Button path="/Masters/FrmPayHeadConfigMst">
                  Add New
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">

                {/* Category */}
                <div className="space-y-2">
                  <Label
                    text="Category"
                    required
                  />

                  <Select
                    value={values.category}
                    onValueChange={(value) =>
                      setFieldValue(
                        "category",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Category 1
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* PayHead */}
                <div className="space-y-2">
                  <Label
                    text="PayHead"
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
                        PayHead 1
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <Label
                    text="Designation"
                    required
                  />

                  <Select
                    value={values.designation}
                    onValueChange={(value) =>
                      setFieldValue(
                        "designation",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Designation 1
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <Label text="Grade" />

                  <Select
                    value={values.grade}
                    onValueChange={(value) =>
                      setFieldValue(
                        "grade",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Grade 1
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Search */}
              <div className="flex justify-center mt-8">
                <Button type="submit">
                  Search
                </Button>
              </div>

            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmPayHeadConfigList;