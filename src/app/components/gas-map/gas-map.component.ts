import { Component } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { highlightEconomicStations } from '../maplibre/utils';
import { Map } from 'maplibre-gl';

@Component({
  selector: 'app-gas-map',
  templateUrl: './gas-map.component.html',
  styleUrl: './gas-map.component.css'
})
export class GasMapComponent {
  constructor(private srvc: BackendService) { }
  protected map: Map;
  protected gas_stations: any;
  protected filtered_gas_stations: any;
  protected filters: any = {
    price: 'Lowest',
    brand: [],
    gasType: 1
  };


  ngOnInit(): void {
    this.srvc.getGasStations_aws(-66, 18).subscribe((response) => {
      const data = response;
      data.features = highlightEconomicStations(data.features);
      this.gas_stations = data;
      this.applyFilters();
    });
  }

  loadAllGasStations() {
    this.srvc.getallGasStations().subscribe((response) => {
      const data = response;
      data.features = highlightEconomicStations(data.features);
      this.gas_stations = data;
      this.applyFilters();
    });
  }

  // Method to handle the list emitted from the child
  receiveListFromChild(map: Map) {
    this.map = map;
    this.enableMapClickToLoadStations();
  }

  enableMapClickToLoadStations() {
    this.map.on("click", (e) => {
      const [lng, lat] = e.lngLat.toArray();
      this.srvc.getGasStations_aws(lng, lat).subscribe((response) => {
        const data = response;
        data.features = highlightEconomicStations(data.features);
        this.gas_stations = data;
        this.applyFilters();
      });
    });
  }


  public flyToStation(lng: number, lat: number) {
    if (this.map.loaded() == false) return;
    this.map.flyTo({ center: [lng, lat], zoom: 17 })
  }

  // Handle price filter selection
  onPriceFilterSelected(order: string) {
    this.filters.price = order;
    this.applyFilters();
  }

  // Handle brand filter selection
  onBrandFilterToggled(brand: string, isChecked: boolean) {
    if (isChecked) {
      this.filters.brand.push(brand);
    } else {
      this.filters.brand = this.filters.brand.filter((b: any) => b !== brand);
    }
    console.log(brand, this.filters);

    this.applyFilters();
  }

  // Handle gas type filter selection
  onGasTypeFilterToggled(type: number) {
    this.filters.gasType = type;
    this.applyFilters();
  }

  applyFilters() {
    const tmp = structuredClone(this.gas_stations);
    let data = tmp.features;

    // Filter by price
    if (this.filters.price) {
      data.sort((a: any, b: any) =>
        this.filters.price === 'Lowest'
          ? parseFloat(a.properties.Station_Gas_Price) - parseFloat(b.properties.Station_Gas_Price)
          : parseFloat(b.properties.Station_Gas_Price) - parseFloat(a.properties.Station_Gas_Price)
      );
    }

    // Filter by brand (using Station_Name to infer brand, adjust as necessary)
    if (this.filters.brand.length > 0) {
      data = data.filter((station: any) =>
        this.filters.brand.some((brand: any) => station.properties.Station_Name.includes(brand))
      );
    }

    // Filter by gas type
    data.forEach((station: any) => {
      let price: any = 0;

      if (this.filters.gasType == 1) {
        price = station.properties.Station_Gas_Price;
      }
      else if (this.filters.gasType == 2) {
        price = station.properties.Station_Premium_Price;
      } else if (this.filters.gasType == 3) {
        price = station.properties.Station_Diesel_Price;
      }
      station.properties.priceHighlight = price;
    });


    // Exclude stations with invalid prices
    data = data.filter((station: any) => parseFloat(station.properties.Station_Gas_Price) > 0);
    tmp.features = data;
    this.filtered_gas_stations = tmp;
    console.log(this.gas_stations, this.filtered_gas_stations);
  }

}
