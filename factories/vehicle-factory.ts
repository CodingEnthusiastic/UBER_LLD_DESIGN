import { Vehicle } from "../models/vehicle"
import { VehicleType } from "../types/enums"

export class VehicleFactory {
  private static vehicleConfigs = {
    [VehicleType.BIKE]: { capacity: 1, baseFare: 8, models: ["Honda Activa", "TVS Jupiter"] },
    [VehicleType.AUTO]: { capacity: 3, baseFare: 12, models: ["Bajaj Auto", "Mahindra Auto"] },
    [VehicleType.SEDAN]: { capacity: 4, baseFare: 15, models: ["Maruti Dzire", "Honda City"] },
    [VehicleType.SUV]: { capacity: 6, baseFare: 20, models: ["Mahindra XUV", "Tata Safari"] },
  }

  static createVehicle(vehicleId: string, type: VehicleType, licensePlate: string, modelIndex = 0): Vehicle {
    const config = this.vehicleConfigs[type]
    const model = config.models[modelIndex % config.models.length]

    return new Vehicle(vehicleId, type, config.capacity, config.baseFare, licensePlate, model)
  }

  static getSupportedVehicleTypes(): VehicleType[] {
    return Object.values(VehicleType)
  }

  static getVehicleConfig(type: VehicleType) {
    return this.vehicleConfigs[type]
  }
}
