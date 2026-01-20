"use client"

import { useEffect, useRef, useState } from "react"

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const stats = [
    { value: "500,000+", label: "Successful Closings", suffix: "" },
    { value: "50+", label: "Years of Excellence", suffix: "" },
    { value: "6", label: "California Offices", suffix: "" },
    { value: "4.9", label: "Client Satisfaction", suffix: "/5.0" },
  ]

  return (
    <section ref={sectionRef} className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary mb-4">Proven Track Record</h2>
          <p className="text-xl text-gray-600">Trusted by thousands across California</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center space-y-2 p-6 rounded-2xl bg-gray-50 hover:bg-primary/5 transition-all hover:scale-105"
            >
              <div className="text-4xl sm:text-5xl font-bold text-primary">
                {isVisible ? <CountUp end={stat.value} suffix={stat.suffix} /> : "0"}
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CountUp({ end, suffix }: { end: string; suffix: string }) {
  const [count, setCount] = useState(0)
  const numericValue = Number.parseFloat(end.replace(/[^0-9.]/g, ""))

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = numericValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setCount(numericValue)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [numericValue])

  const displayValue = end.includes("+") ? `${Math.floor(count).toLocaleString()}+` : count.toFixed(1)

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  )
}
