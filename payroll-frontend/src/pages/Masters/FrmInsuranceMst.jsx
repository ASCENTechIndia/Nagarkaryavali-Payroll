

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

const FrmInsuranceMst = () => {
  const initialValues = {
    corporation: "",
    insuranceId: "",
    employee: "",
    insuranceNumber: "",
    premiumAmount: "",
    active: "Y",
    remark: "",
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
        handleChange,
        setFieldValue,
        resetForm,
      }) => (
        <Form>
          <Card className="mt-5 shadow-sm border">
           <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Insurance Master
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

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
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select Corporation" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Sangli Miraj Kupwad Corporation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Insurance ID */}
                <div className="space-y-2">
                  <Label
                    text="Insurance ID"
                    required
                  />

                  <Input
                    name="insuranceId"
                    value={values.insuranceId}
                    onChange={handleChange}
                    className="h-10"
                  />
                </div>

                {/* Employee */}
                <div className="space-y-2">
                  <Label
                    text="Employee"
                    required
                  />

                  <Select
                    value={values.employee}
                    onValueChange={(value) =>
                      setFieldValue(
                        "employee",
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

                {/* Insurance Number */}
                <div className="space-y-2">
                  <Label
                    text="Insurance Number"
                    required
                    className="min-w-[180px]"
                  />

                  <Input
                    name="insuranceNumber"
                    value={values.insuranceNumber}
                    onChange={handleChange}
                    className="h-10"
                  />
                </div>

                {/* Premium Amount */}
                <div className="space-y-2">
                  <Label
                    text="Premium Amount"
                    required
                    className="min-w-[180px]"
                  />

                  <Input
                    type="number"
                    name="premiumAmount"
                    value={values.premiumAmount}
                    onChange={handleChange}
                    className="h-10"
                  />
                </div>

                {/* Active */}
                <div className="space-y-2">
                  <Label text="Active" />

                  <div className="flex items-center gap-6 h-10 border rounded-md px-4">

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="active"
                        value="Y"
                        checked={
                          values.active === "Y"
                        }
                        onChange={handleChange}
                        className="h-4 w-4"
                      />

                      <span className="text-sm">
                        Yes
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="active"
                        value="N"
                        checked={
                          values.active === "N"
                        }
                        onChange={handleChange}
                        className="h-4 w-4"
                      />

                      <span className="text-sm">
                        No
                      </span>
                    </div>

                  </div>
                </div>

                {/* Remark */}
                <div className="md:col-span-3 space-y-2">
                  <Label
                    text="Remark"
                    required
                  />

                  <Textarea
                    rows={4}
                    name="remark"
                    value={values.remark}
                    onChange={handleChange}
                    placeholder="Enter remark..."
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-3 pt-2">

                <Button type="submit">
                  Save
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    resetForm()
                  }
                  path="/Masters/FrmInsuranceMstList"
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

export default FrmInsuranceMst;