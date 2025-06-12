import type { Rider } from "./rider"
import type { Driver } from "./driver"
import type { Location } from "./location"
import { RideStatus, type VehicleType, RideType } from "../types/enums"

export class Ride {
  public status: RideStatus = RideStatus.REQUESTED
  public driver?: Driver
  public fare = 0
  public distance = 0
  public readonly requestTime: Date = new Date()
  public startTime?: Date
  public endTime?: Date
  public estimatedArrival?: Date

  constructor(
    public readonly rideId: string,
    public readonly rider: Rider,
    public readonly pickup: Location,
    public readonly dropoff: Location,
    public readonly vehicleType: VehicleType,
    public readonly rideType: RideType = RideType.REGULAR,
    public readonly scheduledTime?: Date,
  ) {
    this.distance = pickup.distanceTo(dropoff)
  }

  assignDriver(driver: Driver): void {
    this.driver = driver
    this.status = RideStatus.CONFIRMED
    driver.available = false

    // Calculate estimated arrival (assuming 30 km/h average speed)
    const timeToPickup = (this.pickup.distanceTo(driver.location) / 30) * 60 // minutes
    this.estimatedArrival = new Date(Date.now() + timeToPickup * 60000)
  }

  updateStatus(newStatus: RideStatus): void {
    this.status = newStatus

    if (newStatus === RideStatus.IN_PROGRESS) {
      this.startTime = new Date()
    } else if (newStatus === RideStatus.COMPLETED) {
      this.endTime = new Date()
    }
  }

  getDuration(): number {
    if (this.startTime && this.endTime) {
      return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60) // minutes
    }
    return 0
  }

  isCompleted(): boolean {
    return this.status === RideStatus.COMPLETED
  }

  isCancelled(): boolean {
    return this.status === RideStatus.CANCELLED
  }
}
