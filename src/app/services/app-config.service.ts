import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private config = {
    production: false,
    apiUrl: 'https://localhost:7109/api',
    productionApiUrl: 'http://thutonetapi-prod.westeurope.azurecontainer.io/api',

    netcash: {
      apiUrl: 'https://paynow.netcash.co.za/site/paynow.aspx',
      paymentApiUrl: 'https://ws.Netcash.co.za/PayNow',
      serviceKey: '055018da-2b31-4f51-81cc-236a2012484e',
      softwareVendorKey: '24ade73c-98cf-47b3-99be-cc7b867b3080'
    }
  };

  constructor() { }

  get apiUrl(): string {
    return this.config.production? this.config.productionApiUrl : this.config.apiUrl;
  }

  get netcashApiUrl(): string {
    return this.config.netcash.apiUrl;
  }

  get netcashPaymentApiUrl(): string {
    return this.config.netcash.paymentApiUrl;
  }

  get netcashServiceKey(): string{
    return this.config.netcash.serviceKey;
  }

  get netcashSoftwareVendorKey(): string {
    return this.config.netcash.softwareVendorKey;
  }

  get isProduction(): boolean {
    return this.config.production;
  }

  setProduction(isProd: boolean): void {
    this.config.production = isProd;
  }
}
