import type { Driver } from "../models/driver"
import type { Location } from "../models/location"
import type { VehicleType } from "../types/enums"

export interface DriverMatchingStrategy {
  findBestDriver(pickupLocation: Location, availableDrivers: Driver[], vehicleType: VehicleType): Driver | null
}

export class NearestDriverStrategy implements DriverMatchingStrategy {
  findBestDriver(pickupLocation: Location, availableDrivers: Driver[], vehicleType: VehicleType): Driver | null {
    const eligibleDrivers = availableDrivers.filter((driver) => driver.available && driver.vehicle.type === vehicleType)

    if (eligibleDrivers.length === 0) return null

    return eligibleDrivers.reduce((nearest, current) => {
      const nearestDistance = pickupLocation.distanceTo(nearest.location)
      const currentDistance = pickupLocation.distanceTo(current.location)
      return currentDistance < nearestDistance ? current : nearest
    })
  }
}

export class BestRatedDriverStrategy implements DriverMatchingStrategy {
  findBestDriver(pickupLocation: Location, availableDrivers: Driver[], vehicleType: VehicleType): Driver | null {
    const eligibleDrivers = availableDrivers.filter(
      (driver) =>
        driver.available && driver.vehicle.type === vehicleType && pickupLocation.distanceTo(driver.location) <= 10, // Within 10km radius
    )

    if (eligibleDrivers.length === 0) return null

    return eligibleDrivers.reduce((bestRated, current) => {
      return current.rating > bestRated.rating ? current : bestRated
    })
  }
}

// UNIQUE FEATURE: Smart Hybrid Strategy
export class SmartHybridStrategy implements DriverMatchingStrategy {
  findBestDriver(pickupLocation: Location, availableDrivers: Driver[], vehicleType: VehicleType): Driver | null {
    const eligibleDrivers = availableDrivers.filter((driver) => driver.available && driver.vehicle.type === vehicleType)

    if (eligibleDrivers.length === 0) return null

    // Score based on distance (40%) + rating (40%) + completion rate (20%)
    return eligibleDrivers.reduce((best, current) => {
      const bestScore = this.calculateDriverScore(pickupLocation, best)
      const currentScore = this.calculateDriverScore(pickupLocation, current)
      return currentScore > bestScore ? current : best
    })
  }

  private calculateDriverScore(pickupLocation: Location, driver: Driver): number {
    const distance = pickupLocation.distanceTo(driver.location)
    const maxDistance = 20 // 20km max consideration

    const distanceScore = Math.max(0, (maxDistance - distance) / maxDistance) * 0.4
    const ratingScore = (driver.rating / 5.0) * 0.4
    const completionRate =
      driver.getTotalRides() > 0 ? (driver.getTotalRides() / (driver.getTotalRides() + 1)) * 0.2 : 0.1

    return distanceScore + ratingScore + completionRate
  }
}
