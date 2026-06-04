import React from "react";
import { Formik, Form } from "formik";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FrmRecoveryDeductionReport = () => {
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) =>
    String(2018 + i),
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const initialValues = {
    department: "-1",
    designation: "-1",
    employee: "-1",
    month: "January",
    year: "2018",
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
                Recovery Deduction Report
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Department */}
                <div className="space-y-2">
                  <Label text="Department" required />

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
                  <Label text="Designation" required />

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

                {/* Employee */}
                <div className="space-y-2">
                  <Label text="Employee Name" className="min-w-[180px]" />

                  <Select
                    value={values.employee}
                    onValueChange={(v) => setFieldValue("employee", v)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="-1">-- Select Option --</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Month Of Installment */}
                <div className="space-y-2">
                  <Label
                    text="Start Month of Installment"
                    required
                    className="block w-full whitespace-nowrap"
                  />

                  <div className="flex gap-4">
                    <Select
                      value={values.month}
                      onValueChange={(v) => setFieldValue("month", v)}
                    >
                      <SelectTrigger className="w-40 h-9">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={values.year}
                      onValueChange={(v) => setFieldValue("year", v)}
                    >
                      <SelectTrigger className="w-28 h-9">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-16">
                <Button type="submit">Submit</Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => resetForm()}
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

export default FrmRecoveryDeductionReport;
