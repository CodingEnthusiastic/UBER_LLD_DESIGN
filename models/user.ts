import type { Location } from "./location"

export abstract class User {
  constructor(
    public readonly id: string,
    public name: string,
    public phone: string,
    public location: Location,
  ) {}

  abstract getType(): string

  updateLocation(newLocation: Location): void {
    this.location = newLocation
  }
}
