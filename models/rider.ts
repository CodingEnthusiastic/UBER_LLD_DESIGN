import { User } from "./user"
import type { Location } from "./location"
import { PaymentMethod } from "../types/enums"
import type { Ride } from "./ride"

export class Rider extends User {
  private rideHistory: Ride[] = []
  public paymentMethod: PaymentMethod = PaymentMethod.CARD
  public rating = 5.0

  constructor(id: string, name: string, phone: string, location: Location) {
    super(id, name, phone, location)
  }

  getType(): string {
    return "RIDER"
  }

  addToHistory(ride: Ride): void {
    this.rideHistory.push(ride)
  }

  getRideHistory(): Ride[] {
    return [...this.rideHistory]
  }

  getTotalRides(): number {
    return this.rideHistory.length
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod = method
  }
}
