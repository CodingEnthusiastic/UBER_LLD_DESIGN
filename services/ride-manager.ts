import type { Rider } from "../models/rider"
import type { Driver } from "../models/driver"
import { Ride } from "../models/ride"
import type { Location } from "../models/location"
import { type VehicleType, RideStatus, RideType } from "../types/enums"
import { type DriverMatchingStrategy, NearestDriverStrategy } from "../strategies/driver-matching-strategy"
import { type FareCalculator, BaseFareCalculator } from "./fare-calculator"
import { NotificationService } from "./notification-service"

export class RideManager {
  private static instance: RideManager
  private availableDrivers: Driver[] = []
  private activeRides: Map<string, Ride> = new Map()
  private completedRides: Ride[] = []
  private matchingStrategy: DriverMatchingStrategy = new NearestDriverStrategy()
  private fareCalculator: FareCalculator = new BaseFareCalculator()
  private notificationService: NotificationService = new NotificationService()
  private rideCounter = 1

  private constructor() {}

  static getInstance(): RideManager {
    if (!RideManager.instance) {
      RideManager.instance = new RideManager()
    }
    return RideManager.instance
  }

  // Driver Management
  registerDriver(driver: Driver): void {
    this.availableDrivers.push(driver)
    console.log(`✅ Driver ${driver.name} registered with ${driver.vehicle.toString()}`)
  }

  removeDriver(driverId: string): void {
    this.availableDrivers = this.availableDrivers.filter((d) => d.id !== driverId)
  }

  // Strategy Pattern - Set matching strategy
  setMatchingStrategy(strategy: DriverMatchingStrategy): void {
    this.matchingStrategy = strategy
  }

  setFareCalculator(calculator: FareCalculator): void {
    this.fareCalculator = calculator
  }

  getNotificationService(): NotificationService {
    return this.notificationService
  }

  // Core Ride Management
  requestRide(
    rider: Rider,
    pickup: Location,
    dropoff: Location,
    vehicleType: VehicleType,
    rideType: RideType = RideType.REGULAR,
    scheduledTime?: Date,
  ): Ride | null {
    const rideId = `RIDE_${this.rideCounter++}`
    const ride = new Ride(rideId, rider, pickup, dropoff, vehicleType, rideType, scheduledTime)

    this.notificationService.notifyRideRequested(ride)

    // Find available driver
    const driver = this.matchingStrategy.findBestDriver(pickup, this.availableDrivers, vehicleType)

    if (!driver) {
      this.notificationService.notifyNoDriverAvailable(ride)
      return null
    }

    // Simulate driver acceptance
    if (!driver.acceptRide()) {
      console.log(`❌ Driver ${driver.name} declined the ride`)
      // Try to find another driver (simplified - in real system, would retry with next best)
      this.notificationService.notifyNoDriverAvailable(ride)
      return null
    }

    // Assign driver and update ride
    ride.assignDriver(driver)
    this.activeRides.set(rideId, ride)

    this.notificationService.notifyDriverAssigned(ride)

    // Simulate ride progression
    this.simulateRideProgression(ride)

    return ride
  }

  private simulateRideProgression(ride: Ride): void {
    // Simulate driver arriving at pickup
    setTimeout(() => {
      ride.updateStatus(RideStatus.DRIVER_ARRIVING)
      this.notificationService.notifyObservers(`🚗 Driver is arriving at pickup location`, ride)
    }, 1000)

    // Simulate ride start
    setTimeout(() => {
      ride.updateStatus(RideStatus.IN_PROGRESS)
      this.notificationService.notifyRideStarted(ride)
    }, 2000)

    // Simulate ride completion
    setTimeout(() => {
      this.completeRide(ride.rideId)
    }, 3000)
  }

  completeRide(rideId: string): void {
    const ride = this.activeRides.get(rideId)
    if (!ride || !ride.driver) return

    ride.updateStatus(RideStatus.COMPLETED)

    // Calculate fare
    ride.fare = this.fareCalculator.calculateFare(ride)

    // Update driver earnings (assuming 80% goes to driver)
    const driverEarnings = ride.fare * 0.8
    ride.driver.completeRide(ride, driverEarnings)

    // Update rider history
    ride.rider.addToHistory(ride)

    // Move to completed rides
    this.activeRides.delete(rideId)
    this.completedRides.push(ride)

    this.notificationService.notifyRideCompleted(ride)
  }

  cancelRide(rideId: string, reason = "User cancelled"): void {
    const ride = this.activeRides.get(rideId)
    if (!ride) return

    ride.updateStatus(RideStatus.CANCELLED)

    if (ride.driver) {
      ride.driver.available = true
    }

    this.activeRides.delete(rideId)
    this.notificationService.notifyObservers(`❌ Ride cancelled: ${reason}`, ride)
  }

  // UNIQUE FEATURE: Schedule Ride for Later
  scheduleRide(
    rider: Rider,
    pickup: Location,
    dropoff: Location,
    vehicleType: VehicleType,
    scheduledTime: Date,
  ): string {
    const rideId = `SCHEDULED_${this.rideCounter++}`
    const timeUntilRide = scheduledTime.getTime() - Date.now()

    if (timeUntilRide <= 0) {
      throw new Error("Scheduled time must be in the future")
    }

    console.log(`📅 Ride scheduled for ${scheduledTime.toLocaleString()}`)

    setTimeout(() => {
      this.requestRide(rider, pickup, dropoff, vehicleType, RideType.SCHEDULED, scheduledTime)
    }, timeUntilRide)

    return rideId
  }

  // Analytics and Reporting
  getActiveRides(): Ride[] {
    return Array.from(this.activeRides.values())
  }

  getCompletedRides(): Ride[] {
    return [...this.completedRides]
  }

  getAvailableDrivers(): Driver[] {
    return this.availableDrivers.filter((d) => d.available)
  }

  getDriversByVehicleType(vehicleType: VehicleType): Driver[] {
    return this.availableDrivers.filter((d) => d.available && d.vehicle.type === vehicleType)
  }

  // UNIQUE FEATURE: Real-time Analytics
  getAnalytics() {
    const totalRides = this.completedRides.length
    const totalRevenue = this.completedRides.reduce((sum, ride) => sum + ride.fare, 0)
    const avgRideDistance =
      totalRides > 0 ? this.completedRides.reduce((sum, ride) => sum + ride.distance, 0) / totalRides : 0
    const avgFare = totalRides > 0 ? totalRevenue / totalRides : 0

    return {
      totalRides,
      activeRides: this.activeRides.size,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgRideDistance: Math.round(avgRideDistance * 100) / 100,
      avgFare: Math.round(avgFare * 100) / 100,
      availableDrivers: this.getAvailableDrivers().length,
      totalDrivers: this.availableDrivers.length,
    }
  }
}
