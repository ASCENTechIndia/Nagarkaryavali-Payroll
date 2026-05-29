
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
import { Textarea } from "@/components/ui/textarea";

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
  department: "",
  subDepartment: "",
  employeeName: "",
  deductionType: "",
  recoveryAmount: "",
  isWorking: true,
  fromYear: "",
  toYear: "",
  fromMonth: "",
  toMonth: "",
  remark: "",
};

const FrmRecoveryUpload = () => {
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
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-2xl font-bold">
                Recovery Upload
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">

                {/* Corporation */}
                <div className="space-y-2">
                  <Label text="Corporation" required />

                  <Select
                    value={values.corporation}
                    onValueChange={(value) =>
                      setFieldValue("corporation", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="870">
                        Sangli Miraj Kupwad Corporation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label text="Department" required />

                  <Select
                    value={values.department}
                    onValueChange={(value) =>
                      setFieldValue("department", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Department 1
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub Department */}
                <div className="space-y-2">
                  <Label text="Sub-Department" required  className="min-w-[180px]"/>

                  <Select
                    value={values.subDepartment}
                    onValueChange={(value) =>
                      setFieldValue("subDepartment", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Sub Department 1
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Name */}
                <div className="space-y-2">
                  <Label text="Employee Name" required className="min-w-[180px]"/>

                  <Select
                    value={values.employeeName}
                    onValueChange={(value) =>
                      setFieldValue("employeeName", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Employee 1
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Deduction Type */}
                <div className="space-y-2">
                  <Label text="Deduction Type" required className="min-w-[180px]"/>

                  <Select
                    value={values.deductionType}
                    onValueChange={(value) =>
                      setFieldValue("deductionType", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Deduction Type 1
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Recovery Amount */}
                <div className="space-y-2">
                  <Label text="Recovery Amount" required className="min-w-[180px]" />

                  <Input
                    type="number"
                    name="recoveryAmount"
                    value={values.recoveryAmount}
                    onChange={handleChange}
                  />
                </div>

                {/* Is Working */}
                <div className="space-y-2">
                  <Label text="Is Working?" />

                  <div className="flex items-center h-9">
                    <Input
                      type="checkbox"
                      checked={values.isWorking}
                      onChange={(e) =>
                        setFieldValue(
                          "isWorking",
                          e.target.checked
                        )
                      }
                    />
                  </div>
                </div>

                {/* From Year */}
                <div className="space-y-2">
                  <Label text="From Year" required />

                  <Select
                    value={values.fromYear}
                    onValueChange={(value) =>
                      setFieldValue("fromYear", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="2025">
                        2025
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* To Year */}
                <div className="space-y-2">
                  <Label text="To Year" required />

                  <Select
                    value={values.toYear}
                    onValueChange={(value) =>
                      setFieldValue("toYear", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="2025">
                        2025
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* From Month */}
                <div className="space-y-2">
                  <Label text="From Month" required />

                  <Select
                    value={values.fromMonth}
                    onValueChange={(value) =>
                      setFieldValue("fromMonth", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        January
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* To Month */}
                <div className="space-y-2">
                  <Label text="To Month" required />

                  <Select
                    value={values.toMonth}
                    onValueChange={(value) =>
                      setFieldValue("toMonth", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        January
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Remark */}
                <div className="space-y-2">
                  <Label text="Remark" />

                  <Textarea
                    name="remark"
                    value={values.remark}
                    onChange={handleChange}
                    className="min-h-[42px]"
                  />
                </div>

              </div>

              <div className="flex justify-center gap-3 mt-8">

                <Button type="submit">
                  Accumulation
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => resetForm()}
                >
                  Reset
                </Button>

                <Button
                  type="button"
                  variant="secondary"
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

export default FrmRecoveryUpload;