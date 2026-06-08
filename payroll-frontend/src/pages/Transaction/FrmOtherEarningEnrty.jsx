import React from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const FrmOtherEarningMst = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  return (
    <Formik
      initialValues={{
        department: "",
        designation: "",
        employeeId: "",
        payHead: "",
        amount: "",
        date: "",
        remark: "",
      }}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ values, handleChange, setFieldValue }) => (
        <Form>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5"
          >
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-bold">
                  Other Earning Entry
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div>
                    <Label text="Department" required />

                    <Select
                      value={values.department}
                      onValueChange={(value) =>
                        setFieldValue("department", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="security">
                          महापालिका सुरक्षा विभाग
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label text="Designation" required />

                    <Select
                      value={values.designation}
                      onValueChange={(value) =>
                        setFieldValue("designation", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Designation" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="watchman">
                          चौकीदार (वॉचमन)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label text="Employee Id" required />

                    <Select
                      value={values.employeeId}
                      onValueChange={(value) =>
                        setFieldValue("employeeId", value)
                      }
                      
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="27">
                          27 - आकाराम चंदर घाडगे
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label text="Earning Head" required />

                    <Select
                      value={values.payHead}
                      onValueChange={(value) => setFieldValue("payHead", value)}
                      className="w-full h-9 border border-gray-400 rounded-md px-3"
                    >
                      <SelectTrigger className="w-full"> 
                        <SelectValue placeholder="Select Earning Head" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">वेतन</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label text="Amount" required />

                    <Input
                      name="amount"
                      value={values.amount}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label text="Date" required />

                    <DatePicker
                      value={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);

                        if (date) {
                          setFieldValue("date", date);
                        }
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label text="Remark" />

                    <Textarea
                      rows={3}
                      name="remark"
                      value={values.remark}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-10">
                  <Button type="submit">Submit</Button>

                  <Button
                    type="button"
                    variant="outline"
                    path="/Transactions/FrmOtherEarnEntryList"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

export default FrmOtherEarningMst;
