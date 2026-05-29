"use client";

import React from "react";
import { Formik, Form } from "formik";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  department: "",
  subDepartment: "",
  employee: "",
  bank: "",
  branch: "",
  recoveryAmount: "",
  isWorking: true,
  fromYear: "",
  toYear: "",
  fromMonth: "",
  toMonth: "",
};

const FrmBankRecovery = () => {
  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue, resetForm }) => (
        <Form>
          <Card >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">
                Employee Policy Form
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Corporation */}
                <div className="space-y-2">
                  <Label text="Corporation Name" required className="min-w-[180px]" />

                  <Select
                    value={values.corporation}
                    onValueChange={(value) =>
                      setFieldValue("corporation", value)
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

                {/* Department */}
                <div className="space-y-2">
                  <Label text="Department" required />

                  <Select
                    value={values.department}
                    onValueChange={(value) =>
                      setFieldValue("department", value)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">Department 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub Department */}
                <div className="space-y-2">
                  <Label text="Sub-Department" required className="min-w-[180px]" />

                  <Select
                    value={values.subDepartment}
                    onValueChange={(value) =>
                      setFieldValue("subDepartment", value)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">Sub Department 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee */}
                <div className="space-y-2">
                  <Label text="Employee Name" required className="min-w-[180px]" />

                  <Select
                    value={values.employee}
                    onValueChange={(value) => setFieldValue("employee", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">Employee 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bank */}
                <div className="space-y-2">
                  <Label text="Bank Name" required />

                  <Select
                    value={values.bank}
                    onValueChange={(value) => setFieldValue("bank", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">SBI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <Label text="Branch Name" required />

                  <Select
                    value={values.branch}
                    onValueChange={(value) => setFieldValue("branch", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">Main Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Recovery Amount */}
                <div className="space-y-2">
                  <Label text="Recovery Amount" required className="min-w-[180px]"/>

                  <Input
                    name="recoveryAmount"
                    value={values.recoveryAmount}
                    onChange={handleChange}
                    type="number"
                  />
                </div>

                {/* Working */}
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center gap-2 h-9">
                    <Input
                      type="checkbox"
                      checked={values.isWorking}
                      onChange={(e) =>
                        setFieldValue("isWorking", e.target.checked)
                      }
                    />

                    <Label text="Is Working?" className="w-auto" />
                  </div>
                </div>

                {/* From Year */}
                <div className="space-y-2">
                  <Label text="From Year" required />

                  <Select
                    value={values.fromYear}
                    onValueChange={(value) => setFieldValue("fromYear", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* To Year */}
                <div className="space-y-2">
                  <Label text="To Year" required />

                  <Select
                    value={values.toYear}
                    onValueChange={(value) => setFieldValue("toYear", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* From Month */}
                <div className="space-y-2">
                  <Label text="From Month" required />

                  <Select
                    value={values.fromMonth}
                    onValueChange={(value) => setFieldValue("fromMonth", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* To Month */}
                <div className="space-y-2">
                  <Label text="To Month" required />

                  <Select
                    value={values.toMonth}
                    onValueChange={(value) => setFieldValue("toMonth", value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-8">
                <Button type="submit">Accumulation</Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => resetForm()}
                >
                  Reset
                </Button>

                <Button type="button" variant="secondary">
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

export default FrmBankRecovery;
