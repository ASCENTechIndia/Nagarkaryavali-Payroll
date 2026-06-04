import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { DatePicker } from "@/components/ui/calendar";

const FrmGenericSearch = () => {
  const [joiningDate, setJoiningDate] = useState(null);
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
     
    >
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold">
            Generic Search
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-x-10 gap-y-6">
            {/* Corporation Name */}
            <div>
              <Label>Corporation Name</Label>
              <Select>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select Corporation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    सांगली, मिरज आणि कुपवाड शहर महानगरपालिका
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employee English Name */}
            <div>
              <Label>Employee English Name</Label>
              <Input className="mt-2" />
            </div>

            {/* Employee Marathi Name */}
            <div>
              <Label>Employee Marathi Name</Label>
              <Input className="mt-2" />
            </div>

            {/* Employee Code */}
            <div>
              <Label>Employee Code</Label>
              <Input className="mt-2" />
            </div>

            {/* Bank Account */}
            <div>
              <Label>Bank Account No</Label>
              <Input className="mt-2" />
            </div>

            {/* Department */}
            <div>
              <Label>Department</Label>
              <Select>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="-- ALL --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- ALL --</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Designation */}
            <div>
              <Label>Designation</Label>
              <Select>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="-- ALL --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- ALL --</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile */}
            <div>
              <Label>Mobile No</Label>
              <Input className="mt-2" />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Regular</SelectItem>
                  <SelectItem value="2">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Of Joining */}
            <div>
              <Label>Date of Joining</Label>
              <div className="mt-2">
                <DatePicker
                  value={joiningDate}
                  onChange={setJoiningDate}
                />
              </div>
            </div>

            {/* Date Of Birth */}
            <div>
              <Label>Date Of Birth</Label>
              <div className="mt-2">
                <DatePicker
                  value={birthDate}
                  onChange={setBirthDate}
                />
              </div>
            </div>

            {/* Zone */}
            <div>
              <Label>Zone</Label>
              <Select>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Head Office</SelectItem>
                  <SelectItem value="2">Sangli</SelectItem>
                  <SelectItem value="3">Miraj</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div>
              <Label>Gender</Label>

              <div className="flex items-center gap-6 mt-4">
                <label className="flex items-center gap-2">
                  <Input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={gender === "Male"}
                    onChange={(e) =>
                      setGender(e.target.value)
                    }
                  />
                  Male
                </label>

                <label className="flex items-center gap-2">
                  <Input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={gender === "Female"}
                    onChange={(e) =>
                      setGender(e.target.value)
                    }
                  />
                  Female
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <Button >
              Search
            </Button>

            <Button
              variant="outline"
             
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmGenericSearch;