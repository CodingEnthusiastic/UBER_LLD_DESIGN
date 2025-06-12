"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Car,
  MapPin,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Zap,
  Shield,
  Star,
  Smartphone,
  Navigation,
  Play,
  RotateCcw,
  Activity,
} from "lucide-react"

// Import our ride-sharing system (keeping existing imports)
import { RideManager } from "../services/ride-manager"
import { Rider } from "../models/rider"
import { Driver } from "../models/driver"
import { Location } from "../models/location"
import { VehicleFactory } from "../factories/vehicle-factory"
import { VehicleType, PaymentMethod } from "../types/enums"
import {
  NearestDriverStrategy,
  BestRatedDriverStrategy,
  SmartHybridStrategy,
} from "../strategies/driver-matching-strategy"
import { BaseFareCalculator, SurgePricingDecorator, LoyaltyDiscountDecorator } from "../services/fare-calculator"
import { RiderApp, DriverApp, AdminDashboard } from "../services/notification-service"

export default function RideFlowDemo() {
  const [rideManager] = useState(() => RideManager.getInstance())
  const [logs, setLogs] = useState<string[]>([])
  const [analytics, setAnalytics] = useState<any>({})
  const [isRunning, setIsRunning] = useState(false)
  const [activeService, setActiveService] = useState(0)
  const [currentDemo, setCurrentDemo] = useState(0)

  // Auto-rotate services showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Keep existing console.log override and system initialization
  useEffect(() => {
    const originalLog = console.log
    console.log = (...args) => {
      const message = args.join(" ")
      setLogs((prev) => [...prev.slice(-20), message])
      originalLog(...args)
    }
    return () => {
      console.log = originalLog
    }
  }, [])

  // Keep existing initializeSystem function
  const initializeSystem = () => {
    console.log("🚀 Initializing RideFlow System...\n")

    const locations = {
      airport: new Location(28.5562, 77.1, "Delhi Airport"),
      connaught: new Location(28.6315, 77.2167, "Connaught Place"),
      gurgaon: new Location(28.4595, 77.0266, "Gurgaon Cyber City"),
      noida: new Location(28.5355, 77.391, "Noida Sector 18"),
      karolbagh: new Location(28.6519, 77.1909, "Karol Bagh"),
      rohini: new Location(28.7041, 77.1025, "Rohini Sector 7"),
    }

    const riders = [
      new Rider("R001", "Rishabh Kumar", "9876543210", locations.connaught),
      new Rider("R002", "Priya Sharma", "9876543211", locations.gurgaon),
      new Rider("R003", "Amit Singh", "9876543212", locations.noida),
    ]

    riders[0].setPaymentMethod(PaymentMethod.CARD)
    riders[1].setPaymentMethod(PaymentMethod.WALLET)
    riders[2].setPaymentMethod(PaymentMethod.CASH)

    const drivers = [
      new Driver(
        "D001",
        "Rajesh Kumar",
        "8765432100",
        locations.airport,
        VehicleFactory.createVehicle("V001", VehicleType.SEDAN, "DL-01-AB-1234"),
      ),
      new Driver(
        "D002",
        "Suresh Yadav",
        "8765432101",
        locations.karolbagh,
        VehicleFactory.createVehicle("V002", VehicleType.BIKE, "DL-02-CD-5678"),
      ),
      new Driver(
        "D003",
        "Mohan Lal",
        "8765432102",
        locations.rohini,
        VehicleFactory.createVehicle("V003", VehicleType.SUV, "DL-03-EF-9012"),
      ),
      new Driver(
        "D004",
        "Vikram Singh",
        "8765432103",
        locations.gurgaon,
        VehicleFactory.createVehicle("V004", VehicleType.AUTO, "DL-04-GH-3456"),
      ),
      new Driver(
        "D005",
        "Ravi Gupta",
        "8765432104",
        locations.noida,
        VehicleFactory.createVehicle("V005", VehicleType.SEDAN, "DL-05-IJ-7890"),
      ),
    ]

    drivers[0].rating = 4.8
    drivers[1].rating = 4.5
    drivers[2].rating = 4.9
    drivers[3].rating = 4.2
    drivers[4].rating = 4.7

    drivers.forEach((driver) => rideManager.registerDriver(driver))

    const notificationService = rideManager.getNotificationService()
    riders.forEach((rider) => notificationService.addObserver(new RiderApp(rider.id)))
    drivers.forEach((driver) => notificationService.addObserver(new DriverApp(driver.id)))
    const adminDashboard = new AdminDashboard()
    notificationService.addObserver(adminDashboard)

    return { riders, drivers, locations, adminDashboard }
  }

  // Enhanced runDemo with progress tracking
  const runDemo = async () => {
    setIsRunning(true)
    setLogs([])
    setCurrentDemo(0)

    const { riders, drivers, locations } = initializeSystem()

    const demos = [
      { name: "Nearest Driver Strategy", color: "from-blue-500 to-cyan-500" },
      { name: "Surge Pricing Demo", color: "from-red-500 to-pink-500" },
      { name: "Smart Hybrid Matching", color: "from-purple-500 to-indigo-500" },
      { name: "Scheduled Ride", color: "from-green-500 to-emerald-500" },
    ]

    for (let i = 0; i < demos.length; i++) {
      setCurrentDemo(i)
      console.log("=".repeat(60))
      console.log(`🎯 DEMO ${i + 1}: ${demos[i].name}`)
      console.log("=".repeat(60))

      switch (i) {
        case 0:
          rideManager.setMatchingStrategy(new NearestDriverStrategy())
          rideManager.requestRide(riders[0], locations.connaught, locations.airport, VehicleType.SEDAN)
          break
        case 1:
          rideManager.setMatchingStrategy(new BestRatedDriverStrategy())
          const surgeFareCalculator = new SurgePricingDecorator(new BaseFareCalculator(), 2.0)
          rideManager.setFareCalculator(surgeFareCalculator)
          rideManager.requestRide(riders[1], locations.gurgaon, locations.noida, VehicleType.SUV)
          break
        case 2:
          rideManager.setMatchingStrategy(new SmartHybridStrategy())
          for (let j = 0; j < 15; j++) riders[2].addToHistory({} as any)
          const loyaltyFareCalculator = new LoyaltyDiscountDecorator(new BaseFareCalculator())
          rideManager.setFareCalculator(loyaltyFareCalculator)
          rideManager.requestRide(riders[2], locations.noida, locations.karolbagh, VehicleType.BIKE)
          break
        case 3:
          const futureTime = new Date(Date.now() + 5000)
          rideManager.scheduleRide(riders[0], locations.airport, locations.rohini, VehicleType.AUTO, futureTime)
          await new Promise((resolve) => setTimeout(resolve, 7000))
          break
      }

      await new Promise((resolve) => setTimeout(resolve, 4000))
    }

    setAnalytics(rideManager.getAnalytics())
    setIsRunning(false)
    setCurrentDemo(-1)
  }

  const clearLogs = () => setLogs([])

  const services = [
    {
      icon: Car,
      title: "Smart Ride Matching",
      desc: "AI-powered driver selection",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      desc: "End-to-end encryption",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      desc: "Quick driver assignment",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50",
    },
    {
      icon: Star,
      title: "Premium Quality",
      desc: "5-star rated drivers",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
    },
  ]

  const vehicleTypes = [
    { type: "BIKE", icon: "🏍️", price: "₹8/km", time: "2-5 min", color: "from-blue-500 to-cyan-500" },
    { type: "AUTO", icon: "🛺", price: "₹12/km", time: "3-7 min", color: "from-green-500 to-emerald-500" },
    { type: "SEDAN", icon: "🚗", price: "₹15/km", time: "5-10 min", color: "from-purple-500 to-indigo-500" },
    { type: "SUV", icon: "🚙", price: "₹20/km", time: "7-12 min", color: "from-red-500 to-pink-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center animate-bounce">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                RideFlow
              </h1>
              <p className="text-orange-300 font-medium">by CoderArmy</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Advanced Ride Sharing Platform</h2>
          <p className="text-xl text-gray-300 mb-6">Demonstrating SOLID Principles & Design Patterns in Action</p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["Strategy", "Factory", "Singleton", "Observer", "Decorator"].map((pattern, index) => (
              <Badge
                key={pattern}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-200 border-orange-400/30 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {pattern} Pattern
              </Badge>
            ))}
          </div>
        </div>

        {/* Services Showcase */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Our Premium Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden border-0 bg-gradient-to-br ${service.bgColor} hover:scale-105 transition-all duration-500 cursor-pointer group ${
                  activeService === index ? "ring-2 ring-orange-400 shadow-2xl shadow-orange-400/25" : ""
                }`}
                onClick={() => setActiveService(index)}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}
                  >
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">{service.title}</h4>
                  <p className="text-gray-600 text-sm">{service.desc}</p>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 to-red-400/0 group-hover:from-orange-400/10 group-hover:to-red-400/10 transition-all duration-300"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Vehicle Types */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Choose Your Ride</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vehicleTypes.map((vehicle, index) => (
              <Card
                key={vehicle.type}
                className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {vehicle.icon}
                  </div>
                  <h4 className="font-bold text-white mb-2">{vehicle.type}</h4>
                  <div
                    className={`text-sm bg-gradient-to-r ${vehicle.color} bg-clip-text text-transparent font-semibold mb-1`}
                  >
                    {vehicle.price}
                  </div>
                  <div className="text-gray-300 text-xs">{vehicle.time}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Control Panel */}
        <Card className="mb-8 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              Demo Control Center
              {isRunning && (
                <div className="flex items-center gap-2 ml-auto">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Live Demo Running</span>
                </div>
              )}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Experience all design patterns with our comprehensive demo system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button
                onClick={runDemo}
                disabled={isRunning}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {isRunning ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Running Demo...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Start Complete Demo
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={clearLogs}
                className="border-white/30 text-black hover:bg-red/10 px-6 py-3 rounded-xl"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Logs
              </Button>
            </div>

            {/* Demo Progress */}
            {isRunning && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm">Demo Progress</span>
                  <span className="text-orange-400 text-sm">{currentDemo + 1}/4</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((currentDemo + 1) / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Live Logs */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                Live System Logs
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs">LIVE</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 backdrop-blur-sm text-green-400 p-4 rounded-xl h-96 overflow-y-auto font-mono text-sm border border-green-500/20">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-gray-400" />
                    </div>
                    Click "Start Complete Demo" to see live logs...
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className="mb-1 animate-fade-in-up opacity-0"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards`,
                      }}
                    >
                      <span className="text-gray-500 text-xs mr-2">{new Date().toLocaleTimeString()}</span>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Analytics Dashboard */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                Real-time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  {
                    icon: Car,
                    label: "Total Rides",
                    value: analytics.totalRides || 0,
                    color: "from-blue-500 to-cyan-500",
                    bg: "from-blue-500/20 to-cyan-500/20",
                  },
                  {
                    icon: DollarSign,
                    label: "Revenue",
                    value: `₹${analytics.totalRevenue || 0}`,
                    color: "from-green-500 to-emerald-500",
                    bg: "from-green-500/20 to-emerald-500/20",
                  },
                  {
                    icon: Users,
                    label: "Active Rides",
                    value: analytics.activeRides || 0,
                    color: "from-purple-500 to-pink-500",
                    bg: "from-purple-500/20 to-pink-500/20",
                  },
                  {
                    icon: MapPin,
                    label: "Avg Distance",
                    value: `${analytics.avgRideDistance || 0} km`,
                    color: "from-orange-500 to-red-500",
                    bg: "from-orange-500/20 to-red-500/20",
                  },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`bg-gradient-to-br ${stat.bg} p-4 rounded-xl border border-white/10 hover:scale-105 transition-all duration-300`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}
                      >
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{stat.label}</span>
                    </div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4 bg-white/20" />

              <div className="space-y-3">
                {[
                  { label: "Available Drivers", value: analytics.availableDrivers || 0 },
                  { label: "Average Fare", value: `₹${analytics.avgFare || 0}` },
                ].map((item, index) => (
                  <div key={item.label} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm">{item.label}:</span>
                    <span className="text-white font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Features Showcase */}
        <Card className="mt-8 bg-white/5 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              🌟 Unique Features Implemented
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Smart Hybrid Matching",
                  desc: "Combines distance, rating, and completion rate for optimal driver selection",
                  color: "from-blue-500 to-cyan-500",
                  icon: Zap,
                },
                {
                  title: "Loyalty Rewards",
                  desc: "Automatic discounts based on ride history (5%, 10%, 15% tiers)",
                  color: "from-green-500 to-emerald-500",
                  icon: Star,
                },
                {
                  title: "Scheduled Rides",
                  desc: "Book rides in advance with automatic driver assignment",
                  color: "from-purple-500 to-pink-500",
                  icon: Clock,
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className={`bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-xl border border-white/20 hover:scale-105 transition-all duration-300 group cursor-pointer`}
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Architecture Highlights */}
        <Card className="mt-8 bg-white/5 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              🏗️ Architecture Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  SOLID Principles Applied
                </h3>
                <ul className="space-y-3 text-sm">
                  {[
                    { principle: "SRP", desc: "Each class has single responsibility" },
                    { principle: "OCP", desc: "Open for extension via strategies & decorators" },
                    { principle: "LSP", desc: "All implementations are substitutable" },
                    { principle: "ISP", desc: "Focused interfaces for specific roles" },
                    { principle: "DIP", desc: "Depends on abstractions, not concretions" },
                  ].map((item, index) => (
                    <li key={item.principle} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{item.principle[0]}</span>
                      </div>
                      <div>
                        <strong className="text-green-400">{item.principle}:</strong>
                        <span className="text-gray-300 ml-1">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                  Design Patterns Used
                </h3>
                <ul className="space-y-3 text-sm">
                  {[
                    { pattern: "Strategy", desc: "Driver matching algorithms", icon: "🎯" },
                    { pattern: "Factory", desc: "Vehicle creation", icon: "🏭" },
                    { pattern: "Singleton", desc: "RideManager instance", icon: "🔒" },
                    { pattern: "Observer", desc: "Notification system", icon: "👁️" },
                    { pattern: "Decorator", desc: "Fare calculation enhancements", icon: "🎨" },
                  ].map((item, index) => (
                    <li key={item.pattern} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">{item.icon}</span>
                      </div>
                      <div>
                        <strong className="text-orange-400">{item.pattern}:</strong>
                        <span className="text-gray-300 ml-1">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-8 border border-orange-400/30">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Experience RideFlow?</h3>
            <p className="text-gray-300 mb-6">Built with ❤️ for the LLD Hackathon Challenge</p>
            <div className="flex justify-center gap-4">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl">
                <Smartphone className="h-4 w-4 mr-2" />
                Download App
              </Button>
              <Button variant="outline" className="border-white/30 text-black hover:bg-white/10 px-8 py-3 rounded-xl">
                <Navigation className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-fade-in {
          animation: fadeInUp 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
