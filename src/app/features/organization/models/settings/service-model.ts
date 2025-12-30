import { Services } from "../../../../interfaces/schools/settings/services";

export class ServiceModel implements Services{
    constructor(
    public id: string,
    public name: string,
    public type: string,
    public enabled: boolean,
    public description?: string,
    public price?: number | null
  ) {}

  static fromJson(json: any): ServiceModel {
    return new ServiceModel(
      json.id,
      json.name,
      json.type,
      json.enabled,
      json.description,
      json.price
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      enabled: this.enabled,
      description: this.description,
      price: this.price
    };
  }

  toggle(): void {
    this.enabled = !this.enabled;
  }
}
