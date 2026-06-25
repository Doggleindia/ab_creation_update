// ProductInformation.tsx
"use client";

import { motion } from "framer-motion";

export default function ProductInformation({
  product,
}: {
  product?: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* ================= PRODUCT DETAILS ================= */}
      <div className="mt-14">
        <h3 className="text-[22px] font-bold text-[#171717]">
          Product Details
        </h3>

        <div className="mt-4 text-[13px] text-[#666]">
          {product?.description ? (
            <p className="leading-[22px]">{product.description}</p>
          ) : (
            <ul className="space-y-2 list-disc pl-5">
              <li>Blue T-shirt for men</li>
              <li>Typography Printed</li>
              <li>Regular Length</li>
              <li>Short Sleeves, regular sleeves</li>
              <li>Round neckline</li>
              <li>Knitted cotton</li>
              <li>Slip-on closure</li>
            </ul>
          )}
        </div>
      </div>

      {/* ================= MATERIAL ================= */}
      <div className="mt-12">
        <h3 className="text-[22px] font-bold text-[#171717] uppercase">
          Material & Care
        </h3>

        <div className="mt-5">
          <h4 className="font-semibold text-[14px] text-[#171717]">
            Material:
          </h4>

          <p className="text-[13px] text-[#666] mt-1">
            Upper: Synthetic, Sole: Rubber
          </p>
        </div>

        <div className="mt-5">
          <h4 className="font-semibold text-[14px] text-[#171717]">
            Care Instructions:
          </h4>

          <p className="text-[13px] text-[#666] mt-1 leading-[22px]">
            Wipe with a clean, dry cloth to remove dust. Use a branded leather conditioner if needed. Avoid washing in a machine.
          </p>
        </div>
      </div>

      {/* ================= SPECS ================= */}
      <div className="mt-12">
        <h3 className="text-[22px] font-bold text-[#171717] uppercase">
          Specifications
        </h3>

        <div className="mt-5 border-t border-[#E8E6E3]">
          {product?.sizes && product.sizes.length > 0 && (
            <div className="grid grid-cols-2 border-b border-[#E8E6E3] py-3">
              <p className="text-[13px] font-semibold text-[#333]">
                Available Sizes
              </p>

              <p className="text-[13px] text-[#666] text-right">
                {product.sizes.join(", ")}
              </p>
            </div>
          )}

          {product?.category && (
            <div className="grid grid-cols-2 border-b border-[#E8E6E3] py-3">
              <p className="text-[13px] font-semibold text-[#333]">
                Category
              </p>

              <p className="text-[13px] text-[#666] text-right">
                {product.category.name}
              </p>
            </div>
          )}

          {product?.basePrice && (
            <div className="grid grid-cols-2 border-b border-[#E8E6E3] py-3">
              <p className="text-[13px] font-semibold text-[#333]">
                Base Price
              </p>

              <p className="text-[13px] text-[#666] text-right">
                ₹ {product.basePrice}
              </p>
            </div>
          )}

          {product?.discountPercentage > 0 && (
            <div className="grid grid-cols-2 border-b border-[#E8E6E3] py-3">
              <p className="text-[13px] font-semibold text-[#333]">
                Discount
              </p>

              <p className="text-[13px] text-[#666] text-right">
                {product.discountPercentage}%
              </p>
            </div>
          )}

          {!product?.sizes && !product?.category && !product?.basePrice && (
            <>
              {[
                ["Fabrics", "Cotton, Cotton"],
                ["Fashion Trends", "Typography or Slogan Print"],
                ["Fit", "Relaxed Fit"],
                ["Type", "Long Sleeve Tee"],
                ["Neck", "Round Neck"],
              ].map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 border-b border-[#E8E6E3] py-3"
                >
                  <p className="text-[13px] font-semibold text-[#333]">
                    {item[0]}
                  </p>

                  <p className="text-[13px] text-[#666] text-right">
                    {item[1]}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ================= RATINGS & REVIEWS ================= */}
      <div className="mt-16">
        <h2 className="text-[34px] font-[800] uppercase text-[#171717] tracking-[-1px]">
          Ratings & Reviews
        </h2>

        {/* TOP */}
        <div className="flex items-start gap-6 mt-6">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-[54px] leading-none font-[800] text-[#171717]">
                4.3
              </h3>

              <div>
                <div className="flex items-center gap-[2px]">
                  {[1, 2, 3, 4].map((item) => (
                    <svg
                      key={item}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="#B87D4C"
                      className="w-4 h-4"
                    >
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321 1.01l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.386a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 21.56a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557L3.04 11.407a.562.562 0 01.321-1.01l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  ))}

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#E8E6E3"
                    className="w-4 h-4"
                  >
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321 1.01l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.386a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 21.56a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557L3.04 11.407a.562.562 0 01.321-1.01l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>

                <p className="text-[13px] text-[#666] mt-1">
                  54.3k Verified Buyers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BARS */}
        <div className="mt-8 space-y-4 max-w-[560px]">
          {[
            {
              star: 5,
              value: "39k",
              width: "w-[78%]",
              color: "bg-[#22c55e]",
            },
            {
              star: 4,
              value: "9.8k",
              width: "w-[20%]",
              color: "bg-[#22c55e]",
            },
            {
              star: 3,
              value: "3.2k",
              width: "w-[6%]",
              color: "bg-[#CBAA75]",
            },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-[12px] font-semibold text-[#222] w-[10px]">
                {item.star}
              </span>

              <div className="flex-1 h-[4px] bg-[#E8E6E3] rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.width} ${item.color}`}
                />
              </div>

              <span className="text-[12px] text-[#666] w-[40px]">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* REVIEW CARDS */}
        <div className="mt-10 space-y-5">
          {[
            {
              initials: "RA",
              name: "Rupam Adhikary",
              date: "OCT 20, 2023",
              review:
                "Extremely comfortable and stylish. The padding is really good for all-day wear. The print quality on the polo is excellent and hasn't faded after several washes.",
              bg: "bg-[#f7d9c9]",
            },
            {
              initials: "SK",
              name: "Suresh Kumar",
              date: "SEP 15, 2023",
              review:
                "Perfect for our corporate event. The team was very helpful with the design approval process. Highly recommended for bulk orders!",
              bg: "bg-[#E8E6E3]",
            },
          ].map((review, index) => (
            <div
              key={index}
              className="border border-[#E8E6E3] rounded-[14px] p-6 bg-white"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-[42px] h-[42px] rounded-full flex items-center justify-center text-[13px] font-bold text-[#444] ${review.bg}`}
                  >
                    {review.initials}
                  </div>

                  <div>
                    <h4 className="text-[16px] font-[700] text-[#171717]">
                      {review.name}
                    </h4>

                    <div className="flex items-center gap-[2px] mt-1">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <svg
                          key={item}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="#B87D4C"
                          className="w-3 h-3"
                        >
                          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321 1.01l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.386a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 21.56a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557L3.04 11.407a.562.562 0 01.321-1.01l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] uppercase text-[#999] font-medium">
                  {review.date}
                </p>
              </div>

              {/* REVIEW */}
              <p className="text-[15px] leading-[30px] text-[#555] mt-5">
                "{review.review}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
