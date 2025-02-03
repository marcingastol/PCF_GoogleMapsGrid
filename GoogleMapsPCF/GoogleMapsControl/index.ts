import { IInputs, IOutputs } from "./generated/ManifestTypes";

declare var google: any;


export class GoogleMapsControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

  private _container: HTMLDivElement;
  private _context: ComponentFramework.Context<IInputs>;

  // Keep track of the script loading status to avoid loading it multiple times
  private static _googleMapsScriptLoaded = false;
  private static _googleMapsInitPromise: Promise<void> | null = null;

  // Save references to latitude/longitude if needed
  public _latitude: number = 50.2658569;  // default SF
  public _longitude: number = 19.0045351; // default SF

  /*
  public locations = [
    { lat: 50.2605634, lng: 19.0384344 },
    { lat: 50.2595071, lng: 19.0329412 },
    { lat: 50.261071, lng: 19.0321473 },
    { lat: 50.2587938, lng: 19.0261177 },
    { lat: 50.2585057, lng: 19.033306 },
  ];
  */

  /**
   * Empty constructor.
   */
  constructor() { }

  /**
   * Called when the control is initialized.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._context = context;
    this._container = container;
    console.log("[MAP] Parameters")
    console.log(this._longitude)
    console.log(this._latitude)

    //const coordinates = this._context.parameters.Coordinates.raw;

    // Read property values (if they exist)
    /*
    if (this._context.parameters.Latitude?.raw != null) {
      this._latitude = this._context.parameters.Latitude.raw;
    }
    if (this._context.parameters.Longitude?.raw != null) {
      this._longitude = this._context.parameters.Longitude.raw;
    }
    */

    // Load Google Maps script once
    this.loadGoogleMapsApi().then(() => {

      this.renderMap();
    });
  }

  /**
   * Called when any value in the property bag has changed. 
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // If lat/long changed, update map (optional).
    /*
    if (context.parameters.Latitude?.raw != null && context.parameters.Longitude?.raw != null) {
      const newLat = context.parameters.Latitude.raw;
      const newLng = context.parameters.Longitude.raw;
      if (newLat !== this._latitude || newLng !== this._longitude) {
        this._latitude = newLat;
        this._longitude = newLng;
        this.renderMap();
      }
    }
      */
    this.renderMap();
  }

  /**
   * Called when the control is to be removed from the DOM tree.
   */
  public destroy(): void {
    // Cleanup if necessary
  }

  /**
   * Utility to load Google Maps script asynchronously only once.
   */
  private loadGoogleMapsApi(): Promise<void> {
    if (GoogleMapsControl._googleMapsScriptLoaded) {
      // Already loaded
      return GoogleMapsControl._googleMapsInitPromise!;
    }

    GoogleMapsControl._googleMapsScriptLoaded = true;

    //const apiKey = this._context.parameters.GoogleMapsApiKey.raw;
    const apiKey = "";
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;

    GoogleMapsControl._googleMapsInitPromise = new Promise((resolve, reject) => {
      script.onload = () => {
        resolve();
      };
      script.onerror = (error) => {
        reject(error);
      };
    });

    document.head.appendChild(script);

    return GoogleMapsControl._googleMapsInitPromise;
  }

  /**
   * Render or re-render the Google Map in the container.
   */
  private renderMap(): void {
    // Clear container before re-rendering
    this._container.innerHTML = "";

    // Create a new div to hold the map
    const mapDiv = document.createElement("div");
    mapDiv.style.width = "100%";
    mapDiv.style.height = "1000px"; // adjust as needed
    this._container.appendChild(mapDiv);

    // Initialize the map
    const map = new google.maps.Map(mapDiv, {
      center: { lat: this._latitude, lng: this._longitude },
      zoom: 13
    });

    // Optionally add a marker
    /*
    new google.maps.Marker({
      position: { lat: this._latitude, lng: this._longitude },
      map: map,
      title: "Marker"
    });
    */

    const coordinate = this._context.parameters.Coordinates.raw;

    const infoWindow = new google.maps.InfoWindow({
      content: coordinate,
      disableAutoPan: true,
    });

    const latitudeParam = this._context.parameters.Latitude.raw;
    const longitudeParam = this._context.parameters.Longitude.raw;

    const locations = [
      { lat: latitudeParam, lng: longitudeParam }
    ];

    // Add some markers to the map.
    const markers = locations.map((position, i) => { //this.locations.map((position, i) => {
      const marker = new google.maps.Marker({
        position,
        map: map
      });

      marker.addListener("click", () => {
        infoWindow.setContent(coordinate + ", " + position.lat + ", " + position.lng);
        infoWindow.open(map, marker);
      });

      return marker;
    });

  }

  /** 
   * If your control needs to return any values to the hosting app, 
   * implement getOutputs. Otherwise, you can leave it as is.
   */
  public getOutputs(): IOutputs {
    return {};
  }
}
