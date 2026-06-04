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
                    <Label required>Department</Label>

                    <select
                      name="department"
                      value={values.department}
                      onChange={handleChange}
                      className="w-full h-9 border border-gray-400 rounded-md px-3"
                    >
                      <option>महापालिका सुरक्षा विभाग</option>
                    </select>
                  </div>

                  <div>
                    <Label required>Designation</Label>

                    <select
                      name="designation"
                      value={values.designation}
                      onChange={handleChange}
                      className="w-full h-9 border border-gray-400 rounded-md px-3"
                    >
                      <option>चौकीदार (वॉचमन)</option>
                    </select>
                  </div>

                  <div>
                    <Label required>Employee Id</Label>

                    <select
                      name="employeeId"
                      value={values.employeeId}
                      onChange={handleChange}
                      className="w-full h-9 border border-gray-400 rounded-md px-3"
                    >
                      <option>27 - आकाराम चंदर घाडगे</option>
                    </select>
                  </div>

                  <div>
                    <Label required>Earning Head</Label>

                    <select
                      name="payHead"
                      value={values.payHead}
                      onChange={handleChange}
                      className="w-full h-9 border border-gray-400 rounded-md px-3"
                    >
                      <option>Prize Money</option>
                    </select>
                  </div>

                  <div>
                    <Label required>Amount Text</Label>

                    <Input
                      name="amount"
                      value={values.amount}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label required>Date</Label>

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
                    <Label>Remark</Label>

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
