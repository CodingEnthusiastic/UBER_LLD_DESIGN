import type { Ride } from "../models/ride"
import { RideType } from "../types/enums"

export interface FareCalculator {
  calculateFare(ride: Ride): number
}

export class BaseFareCalculator implements FareCalculator {
  private static readonly BASE_FARE = 25 // Base fare in rupees
  private static readonly BOOKING_FEE = 10

  calculateFare(ride: Ride): number {
    const distanceFare = ride.distance * ride.driver!.vehicle.getBaseFare()
    const timeFare = ride.getDuration() * 2 // ₹2 per minute

    let totalFare = BaseFareCalculator.BASE_FARE + BaseFareCalculator.BOOKING_FEE + distanceFare + timeFare

    // Carpool discount
    if (ride.rideType === RideType.CARPOOL) {
      totalFare *= 0.7 // 30% discount for carpool
    }

    return Math.round(totalFare * 100) / 100 // Round to 2 decimal places
  }
}

// Decorator Pattern Implementation
export abstract class FareDecorator implements FareCalculator {
  constructor(protected fareCalculator: FareCalculator) {}

  abstract calculateFare(ride: Ride): number
}

export class SurgePricingDecorator extends FareDecorator {
  constructor(
    fareCalculator: FareCalculator,
    private surgeMultiplier = 1.5,
  ) {
    super(fareCalculator)
  }

  calculateFare(ride: Ride): number {
    const baseFare = this.fareCalculator.calculateFare(ride)
    return Math.round(baseFare * this.surgeMultiplier * 100) / 100
  }
}

export class DiscountDecorator extends FareDecorator {
  constructor(
    fareCalculator: FareCalculator,
    private discountPercent: number,
  ) {
    super(fareCalculator)
  }

  calculateFare(ride: Ride): number {
    const baseFare = this.fareCalculator.calculateFare(ride)
    const discount = baseFare * (this.discountPercent / 100)
    return Math.round((baseFare - discount) * 100) / 100
  }
}

// UNIQUE FEATURE: Loyalty Discount Decorator
export class LoyaltyDiscountDecorator extends FareDecorator {
  calculateFare(ride: Ride): number {
    const baseFare = this.fareCalculator.calculateFare(ride)
    const riderTotalRides = ride.rider.getTotalRides()

    let discountPercent = 0
    if (riderTotalRides >= 50) discountPercent = 15
    else if (riderTotalRides >= 20) discountPercent = 10
    else if (riderTotalRides >= 10) discountPercent = 5

    const discount = baseFare * (discountPercent / 100)
    return Math.round((baseFare - discount) * 100) / 100
  }
}
