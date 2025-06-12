import type { VehicleType } from "../types/enums"

export class Vehicle {
  constructor(
    public readonly vehicleId: string,
    public readonly type: VehicleType,
    public readonly capacity: number,
    public readonly baseFarePerKm: number,
    public readonly licensePlate: string,
    public readonly model: string,
  ) {}

  getBaseFare(): number {
    return this.baseFarePerKm
  }

  getCapacity(): number {
    return this.capacity
  }

  toString(): string {
    return `${this.model} (${this.licensePlate}) - ${this.type}`
  }
}
