import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class AddressFinderAU implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	// Reference to ComponentFramework Context object
	private _context: ComponentFramework.Context<IInputs>;

	// PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 
	private _notifyOutputChanged: () => void;

	private inputElement: HTMLInputElement;

	private _addressfinderScript : HTMLScriptElement;

	private _address_fullname: string;

	private _address_line_1: string;

	private _container: HTMLDivElement;

	private _address_line_2: string;

	private _suburb: string;

	private _state: string;

	private _postcode: string;

	private _country: string;

	private widget: any;

	private AddressFinder: any;

	private _refreshData: EventListenerOrEventListenerObject;

	private _domId: string;

	constructor()
	{
		this.AddressFinder = require('./Widget');
	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
		this._context = context;
		this._notifyOutputChanged = notifyOutputChanged;
		this._container = container;
		this._address_fullname = this._context.parameters.address_fullname.raw || "";
		this._refreshData = this.refreshData.bind(this);
		this._domId = Math.random().toString(10);
		this.inputElement = document.createElement("input");
		this.inputElement.setAttribute("id", "search_field"+this._domId);
		this.inputElement.setAttribute("type", "text");
		this.inputElement.setAttribute("style", "width:95%;");
		this.inputElement.addEventListener("input",this._refreshData);
		this._addressfinderScript = document.createElement("script");
		this._addressfinderScript.setAttribute("src", "https://api.addressfinder.io/assets/v3/widget.js");
		this._container.appendChild(this._addressfinderScript);
		this._container.appendChild(this.inputElement);		
		container = this._container;
		// Add control initialization code
		this.GetAddressFinderKeyandContinueCallBack(this._context.parameters.afKey.raw);
	}

	public refreshData(evt: Event): void
	{
		if(this.inputElement.value.length==0)
		{
			this._address_fullname = "";
			this._notifyOutputChanged();
		}
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		// Add code to update control view
		this._context = context;
		this.inputElement.value = this._address_fullname;
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			address_fullname: this._address_fullname,
			address_line_1: this._address_line_1,
			address_line_2: this._address_line_2,
			suburb:this._suburb,
			state:this._state,
			postcode:this._postcode,
			country:this._country
		};
	}

	loadWidget = (addressFinderKey: string | null) => {
		var searchField = document.getElementById("search_field"+ this._domId);
		this.widget = new this.AddressFinder.Widget(
			searchField,
			addressFinderKey,
			'AU',
			{
                "address_metadata_params": {
                    "gps": "1"
                },
                "address_params": {
		    "au_paf": "1"
                },
                "show_locations": true,
                "location_params": {
                    "location_types": "street, locality, state"
                },
				"max_results": "15",
				"byline": false
            }
		);
		this.widget.on('result:select', (fullAddress: any, metaData: any) => {
			//debugger;
			this.inputElement.value = fullAddress;
			//const selected = new this.AddressFinder.AUSelectedAddress(fullAddress, metaData);
			this._address_fullname = fullAddress;
			this._address_line_1 = metaData.address_line_1;
			this._address_line_2 = metaData.address_line_2;
			this._suburb = metaData.locality_name;
			this._state = metaData.state_territory;
			this._postcode = metaData.postcode;
			this._country = "Australia";
			this._notifyOutputChanged();
		});
	}

	public GetAddressFinderKeyandContinueCallBack(addressFinderKey: string | null) {		
		this.loadWidget(addressFinderKey);
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}
}
