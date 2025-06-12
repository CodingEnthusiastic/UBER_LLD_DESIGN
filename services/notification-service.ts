import type { Ride } from "../models/ride"

export interface Observer {
  update(message: string, ride?: Ride): void
}

export class NotificationService {
  private observers: Observer[] = []

  addObserver(observer: Observer): void {
    this.observers.push(observer)
  }

  removeObserver(observer: Observer): void {
    const index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }

  notifyObservers(message: string, ride?: Ride): void {
    this.observers.forEach((observer) => observer.update(message, ride))
  }

  // Specific notification methods
  notifyRideRequested(ride: Ride): void {
    this.notifyObservers(`🚗 Ride requested from ${ride.pickup.address} to ${ride.dropoff.address}`, ride)
  }

  notifyDriverAssigned(ride: Ride): void {
    const eta = ride.estimatedArrival ? Math.round((ride.estimatedArrival.getTime() - Date.now()) / 60000) : "N/A"
    this.notifyObservers(
      `✅ Driver ${ride.driver!.name} assigned! Vehicle: ${ride.driver!.vehicle.toString()}, ETA: ${eta} mins`,
      ride,
    )
  }

  notifyRideStarted(ride: Ride): void {
    this.notifyObservers(`🚀 Ride started! Enjoy your journey.`, ride)
  }

  notifyRideCompleted(ride: Ride): void {
    this.notifyObservers(
      `🎉 Ride completed! Fare: ₹${ride.fare}, Duration: ${ride.getDuration().toFixed(1)} mins`,
      ride,
    )
  }

  notifyNoDriverAvailable(ride: Ride): void {
    this.notifyObservers(`❌ No drivers available for ${ride.vehicleType}. Please try again later.`, ride)
  }
}

export class RiderApp implements Observer {
  constructor(private riderId: string) {}

  update(message: string, ride?: Ride): void {
    if (ride && ride.rider.id === this.riderId) {
      console.log(`📱 [Rider App - ${ride.rider.name}] ${message}`)
    }
  }
}

export class DriverApp implements Observer {
  constructor(private driverId: string) {}

  update(message: string, ride?: Ride): void {
    if (ride && ride.driver && ride.driver.id === this.driverId) {
      console.log(`🚗 [Driver App - ${ride.driver.name}] ${message}`)
    }
  }
}

// UNIQUE FEATURE: Admin Dashboard Observer
export class AdminDashboard implements Observer {
  private rideStats = {
    totalRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    totalRevenue: 0,
  }

  update(message: string, ride?: Ride): void {
    console.log(`📊 [Admin Dashboard] ${message}`)

    if (ride) {
      if (message.includes("requested")) {
        this.rideStats.totalRides++
      } else if (message.includes("completed")) {
        this.rideStats.completedRides++
        this.rideStats.totalRevenue += ride.fare
      } else if (message.includes("cancelled")) {
        this.rideStats.cancelledRides++
      }
    }
  }

  getStats() {
    return { ...this.rideStats }
  }
}
