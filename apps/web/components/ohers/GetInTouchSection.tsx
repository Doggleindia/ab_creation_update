"use client"

import { MapPin, Phone, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "../ui/ToastProvider"
import { contactUs } from "@/lib/api"

export default function GetInTouchSection() {
  const [data,setData] = useState({
    name:"",
    email:"",
    subject:"",
    message:"" 
  })
  const { toast } = useToast();
  const handlechange = (e:React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setData((prev) => ({...prev,[e.target.name]:e.target.value}))
  }

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
   try{
    const res = await contactUs(data.name, data.email, data.message, data.subject);
    if(res?.status === "success"){
      toast("success", res?.message || "Message sent successfully");
      setData({name:"",email:"",subject:"",message:""})
    } else {
      toast("error", res?.message || "Failed to send message");
    }
   }
    catch(err){
      console.error(err)
      toast("error", (err as any)?.response?.data?.message || (err as any)?.message || "Failed to send message")
    }

  }

  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-xl font-semibold">
            GET IN TOUCH WITH US
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
            For more information about our products & services, please feel free
            to drop us an email. Our staff is always here to help you out. Do not
            hesitate!
          </p>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {/* LEFT INFO */}
          <div className="space-y-10">
            {/* Address */}
            <div className="flex gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  2365 5th Ave, New York<br />
                  NY10000, United States
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <Phone className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  Mobile: (+84) 546-6789<br />
                  Hotline: (+84) 456-6789
                </p>
              </div>
            </div>

            {/* Working Time */}
            <div className="flex gap-4">
              <Clock className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Working Time</p>
                <p className="text-sm text-muted-foreground">
                  Monday–Friday: 9:00 – 22:00<br />
                  Saturday–Sunday: 9:00 – 21:00
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Your name</Label>
              <Input value={data.name} onChange={handlechange} name="name" placeholder="Abc" />
            </div>

            <div className="space-y-2">
              <Label>Email address</Label>
              <Input value={data.email} onChange={handlechange} name="email" placeholder="abc@def.com" />
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={data.subject} onChange={handlechange} name="subject" placeholder="This is optional" />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={data.message}
                onChange={handlechange}
                name="message"
                placeholder="Hi! I'd like to ask about..."
                className="min-h-[120px]"
              />
            </div>

            <Button type="submit" className="w-40 bg-[#7a3a2e] hover:bg-[#682f25]">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
