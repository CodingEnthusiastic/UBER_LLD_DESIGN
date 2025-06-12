import { User } from "./user"
import type { Vehicle } from "./vehicle"
import type { Location } from "./location"
import type { Ride } from "./ride"

export class Driver extends User {
  public available = true
  public rating = 5.0
  private completedRides: Ride[] = []
  public totalEarnings = 0

  constructor(
    id: string,
    name: string,
    phone: string,
    location: Location,
    public vehicle: Vehicle,
  ) {
    super(id, name, phone, location)
  }

  getType(): string {
    return "DRIVER"
  }

  goOnline(): void {
    this.available = true
  }

  goOffline(): void {
    this.available = false
  }

  acceptRide(): boolean {
    // Simulate driver acceptance (90% acceptance rate)
    return Math.random() > 0.1
  }

  completeRide(ride: Ride, earnings: number): void {
    this.completedRides.push(ride)
    this.totalEarnings += earnings
    this.available = true
  }

  getCompletedRides(): Ride[] {
    return [...this.completedRides]
  }

  getTotalRides(): number {
    return this.completedRides.length
  }

  updateRating(newRating: number): void {
    const totalRides = this.completedRides.length
    if (totalRides === 0) {
      this.rating = newRating
    } else {
      this.rating = (this.rating * totalRides + newRating) / (totalRides + 1)
    }
  }
}
