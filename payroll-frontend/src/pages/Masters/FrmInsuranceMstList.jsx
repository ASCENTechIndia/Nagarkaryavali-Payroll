

import React from "react";

import {
  Formik,
  Form,
} from "formik";

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

const FrmInsuranceMstList = () => {
  const initialValues = {
    category: "",
    department: "",
    employeeName: "",
  };

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
        resetForm,
      }) => (
        <Form>
          <Card >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">
                Insurance Master
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

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
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Category 1
                      </SelectItem>

                      <SelectItem value="2">
                        Category 2
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label text="Department" />

                  <Select
                    value={values.department}
                    onValueChange={(value) =>
                      setFieldValue(
                        "department",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Department 1
                      </SelectItem>

                      <SelectItem value="2">
                        Department 2
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee */}
                <div className="space-y-2">
                  <Label
                    text="Employee Name"
                    className="min-w-[180px]"
                  />

                  <Select
                    value={values.employeeName}
                    onValueChange={(value) =>
                      setFieldValue(
                        "employeeName",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Employee 1
                      </SelectItem>

                      <SelectItem value="2">
                        Employee 2
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-3 pt-2">

                <Button type="submit">
                  Search
                </Button>

                <Button
                  type="button"
                  variant="default"
                  path="/Masters/FrmInsuranceMst"
                >
                  Add New
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    resetForm()
                  }
                  path="/Dashboard"
                >
                  Close
                </Button>

              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmInsuranceMstList;