"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";

export default function OrderingProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <section className="bg-white py-20 md:py-32 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* HEADING */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[44px] font-bold text-[#171717] mb-4 tracking-tight">
            Our Ordering Process
          </h2>
          <p className="text-gray-500 text-[17px]">
            Get inspired from some of our happy customers showing off their custom apparel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          
          {/* LEFT - IMAGE */}
          <div className="relative rounded-[24px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">
            <img
              src="/images/home/ordering-process-image.png"
              alt="Person holding a custom t-shirt"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* RIGHT - ACCORDION STEPS */}
          <div className="flex flex-col space-y-4 pt-2">
            
            {/* Step 1 */}
            <div className={`border rounded-[16px] overflow-hidden transition-all ${activeStep === 0 ? 'border-[#B87D4C] bg-white' : 'border-gray-300 bg-white'}`}>
              <div 
                onClick={() => setActiveStep(activeStep === 0 ? -1 : 0)}
                className={`px-6 py-5 flex justify-between items-center cursor-pointer transition-colors ${activeStep === 0 ? 'bg-[#B87D4C]' : 'bg-white hover:bg-gray-50'}`}
              >
                <span className={`font-bold text-[17px] ${activeStep === 0 ? 'text-white' : 'text-[#171717]'}`}>
                  Choose Product
                </span>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center transition-transform ${activeStep === 0 ? 'bg-white rotate-180' : 'bg-gray-100'}`}>
                  <ArrowDown className={`w-5 h-5 ${activeStep === 0 ? 'text-black' : 'text-[#171717]'}`} strokeWidth={2.5} />
                </div>
              </div>
              {activeStep === 0 && (
                <div className="px-6 py-7">
                  <p className="text-gray-600 text-[15px] leading-[1.7]">
                    The garment such as a Polo Shirt or Hat is placed in a particular hoop
                    that holds the item in place during embroidery. This is an essential step
                    as it ensures that the design is embroidered in the right place and with
                    the right tension.
                  </p>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className={`border rounded-[16px] overflow-hidden transition-all ${activeStep === 1 ? 'border-[#B87D4C] bg-white' : 'border-gray-300 bg-white'}`}>
              <div 
                onClick={() => setActiveStep(activeStep === 1 ? -1 : 1)}
                className={`px-6 py-5 flex justify-between items-center cursor-pointer transition-colors ${activeStep === 1 ? 'bg-[#B87D4C]' : 'bg-white hover:bg-gray-50'}`}
              >
                <span className={`font-bold text-[17px] ${activeStep === 1 ? 'text-white' : 'text-[#171717]'}`}>
                  Design your art
                </span>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center transition-transform ${activeStep === 1 ? 'bg-white rotate-180' : 'bg-gray-100'}`}>
                  <ArrowDown className={`w-5 h-5 ${activeStep === 1 ? 'text-black' : 'text-[#171717]'}`} strokeWidth={2.5} />
                </div>
              </div>
              {activeStep === 1 && (
                <div className="px-6 py-7">
                  <p className="text-gray-600 text-[15px] leading-[1.7]">
                    Upload your custom design or choose from our templates. You can customize colors,
                    placement, and size to match your exact vision. Our design tools make it easy to
                    create professional-looking artwork without any design experience.
                  </p>
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div className={`border rounded-[16px] overflow-hidden transition-all ${activeStep === 2 ? 'border-[#B87D4C] bg-white' : 'border-gray-300 bg-white'}`}>
              <div 
                onClick={() => setActiveStep(activeStep === 2 ? -1 : 2)}
                className={`px-6 py-5 flex justify-between items-center cursor-pointer transition-colors ${activeStep === 2 ? 'bg-[#B87D4C]' : 'bg-white hover:bg-gray-50'}`}
              >
                <span className={`font-bold text-[17px] ${activeStep === 2 ? 'text-white' : 'text-[#171717]'}`}>
                  Order
                </span>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center transition-transform ${activeStep === 2 ? 'bg-white rotate-180' : 'bg-gray-100'}`}>
                  <ArrowDown className={`w-5 h-5 ${activeStep === 2 ? 'text-black' : 'text-[#171717]'}`} strokeWidth={2.5} />
                </div>
              </div>
              {activeStep === 2 && (
                <div className="px-6 py-7">
                  <p className="text-gray-600 text-[15px] leading-[1.7]">
                    Review your design, select quantity, choose delivery options, and proceed to checkout.
                    We offer secure payment options and various delivery speeds to suit your needs.
                  </p>
                </div>
              )}
            </div>

            {/* Step 4 */}
            <div className={`border rounded-[16px] overflow-hidden transition-all ${activeStep === 3 ? 'border-[#B87D4C] bg-white' : 'border-gray-300 bg-white'}`}>
              <div 
                onClick={() => setActiveStep(activeStep === 3 ? -1 : 3)}
                className={`px-6 py-5 flex justify-between items-center cursor-pointer transition-colors ${activeStep === 3 ? 'bg-[#B87D4C]' : 'bg-white hover:bg-gray-50'}`}
              >
                <span className={`font-bold text-[17px] ${activeStep === 3 ? 'text-white' : 'text-[#171717]'}`}>
                  Delivery/pick up
                </span>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center transition-transform ${activeStep === 3 ? 'bg-white rotate-180' : 'bg-gray-100'}`}>
                  <ArrowDown className={`w-5 h-5 ${activeStep === 3 ? 'text-black' : 'text-[#171717]'}`} strokeWidth={2.5} />
                </div>
              </div>
              {activeStep === 3 && (
                <div className="px-6 py-7">
                  <p className="text-gray-600 text-[15px] leading-[1.7]">
                    Your order is manufactured with precision and care. Choose from our delivery options
                    or pick up your custom products from our store. Track your order in real-time and
                    enjoy your finished items!
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}