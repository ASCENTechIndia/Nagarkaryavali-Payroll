import React from "react";
import { Formik, Form } from "formik";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FrmYearlyPayheadReport = () => {
  const initialValues = {
    department: "-1",
    designation: "-1",
    employee: "-1",
    year: "",
    payhead: "",
  };

  const handleSubmit = (values) => {
    console.log(values);
  };

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue, resetForm }) => (
        <Form>
          <Card >
             <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-bold">
                Yearly Month Wise Report
              </CardTitle>

            
            </CardHeader>

            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Department */}
                <div className="space-y-2">
                  <Label text="Department" required />

                  <Select
                    value={values.department}
                    onValueChange={(v) =>
                      setFieldValue("department", v)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- ALL --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="-1">
                        -- ALL --
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <Label text="Designation" required />

                  <Select
                    value={values.designation}
                    onValueChange={(v) =>
                      setFieldValue("designation", v)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="-1">
                        -- Select Option --
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee */}
                <div className="space-y-2">
                  <Label text="Employee Name" className="min-w-[180px]" />

                  <Select
                    value={values.employee}
                    onValueChange={(v) =>
                      setFieldValue("employee", v)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="-1">
                        -- Select Option --
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label text="Year" />

                  <Select
                    value={values.year}
                    onValueChange={(v) =>
                      setFieldValue("year", v)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Year --" />
                    </SelectTrigger>

                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem
                          key={year}
                          value={String(year)}
                        >
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payhead */}
                <div className="space-y-2">
                  <Label text="Payhead" />

                  <Select
                    value={values.payhead}
                    onValueChange={(v) =>
                      setFieldValue("payhead", v)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Basic Pay
                      </SelectItem>

                      <SelectItem value="2">
                        DA
                      </SelectItem>

                      <SelectItem value="3">
                        HRA
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-12">
                <Button
                  type="submit"
                  
                >
                  Submit
                </Button>

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

export default FrmYearlyPayheadReport;