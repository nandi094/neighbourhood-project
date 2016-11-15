/////*Model*/////
var Locations = [
		{name: "Dayananda Sagar College of Engineering", position: {lat: 12.908733, lng: 77.566549}, id: "4e37ac166284fcf7399deb18"},
		{name: "RV college of Engineering", position: {lat: 12.923755, lng: 77.49868}, id: "4bb097c7f964a520144e3ce3"},
		{name: "BMS college of Engineering", position: {lat: 12.941608, lng: 77.566883}, id: "4f0c4089e4b0b63c74ec7645"},
		{name: "PESIT", position: {lat: 12.934089, lng: 77.534305}, id: "4c2e02c176a7ef3b73e9deb8"},
		{name: "Nitte Meenakshi Institute of Technology", position: {lat: 13.128464, lng: 77.587308}, id: "4d5643dccff7721e01c1b3f5"},
		{name: "M S Ramaiah Institute of Technology", position: {lat: 13.031122, lng: 77.565165}, id: "4c9d6c407c096dcb3967cbd1"}
];

//Declared map and infoWindow variables early to be used later downstream
	function contentString(location) {
		"use strict";
		return ('<div id="content">'+ '<div id="siteNotice">'+ '</div>'+ '<h1 id="firstHeading" class="firstHeading">' + location.title + '</h1>'+ '<div id="bodyContent">'+ '<p>' + location.formattedAddress[0] + '<br>' + location.formattedAddress[1] + '<br>' + location.formattedAddress[2] + '<br>' + '</div>'+ '</div>');
	}

var map;

var currentInfoWindow;

//Function that renders the map on screen using the Id "map" as a reference from index.html
	function initMap() {
	"use strict";
		map = new google.maps.Map(document.getElementById("map"), {
			center: {lat: 12.971599, lng: 77.594563},
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false
		});
	}

/////*VIEWMODEL*/////
function ViewModel() {
	"use strict";

	//Declared "this" as own variable so that the same instance of "this" can be used in multiple functions downstream
	var own = this;
	own.markers = [];

	//Copies the values of Locations and stores them in an observable array for knockout listview implementation
	own.Locations = ko.observableArray(Locations);

	//Adds new markers at each location in the own.Locations Array
	own.Locations().forEach(function(location) {
		var marker = new google.maps.Marker({
			position: location.position,
			map: map,
			title: location.title,
			URL: location.shortUrl,
			animation: google.maps.Animation.DROP
		});

		location.marker = marker;

		marker.setVisible(true);

	//Pushes each marker into the markers array
		own.markers.push(marker);

			/*client id and client secret for foursquare api*/
				var CLIENT_ID_Foursquare = '?client_id=QRE5EM2W1VGSEN2YHCCKT4HFOW0R31SQCUCUTC0ITKUFO51K';
				var CLIENT_SECRET_Foursquare = '&client_secret=BYUW5NQCBUNWWM5Y4AY3EP20MDF5KJ0HVMQICCJ5P5WNLRCZ';

	/*Foursquare api ajax request*/
						$.ajax({
								type: "GET",
								dataType: 'json',
								cache: false,
								url: 'https://api.foursquare.com/v2/venues/' + location.id + CLIENT_ID_Foursquare + CLIENT_SECRET_Foursquare + '&v=20130815',
								async: true,
								success: function(data) {
										console.log(data.response);
										console.log(data.response.venue.name);
										console.log(data.response.venue.location.formattedAddress);
					//Map info windows to each Location in the markers array
								var infoWindow = new google.maps.InfoWindow({
										content: contentString({title: data.response.venue.name, formattedAddress: data.response.venue.location.formattedAddress})
												});

								location.infoWindow = infoWindow;

								location.marker.addListener('click', function () {
										if (currentInfoWindow !== undefined) {
												currentInfoWindow.close();
										}
										currentInfoWindow = location.infoWindow;
										location.infoWindow.open(map, this);
										// location.infoWindow.setContent(contentString(location));
										location.marker.setAnimation(google.maps.Animation.BOUNCE); //Markers will bounce when clicked
										setTimeout(function () {
												location.marker.setAnimation(null);
										}, 1500); //Change value to null after 1.5 seconds and stop markers from bouncing
								});

										/*callback function if succes - Will add the rating received from foursquare to the content of the info window*/
										if (!data.response) {
												data.response = 'No rating in foursquare';
										}
								},
								error: function(data) {
										/*callback function if error - an alert will be activaded to notify the user of the error*/
										alert("Could not load data from foursquare.");
								}
						});
	});

	//Click on Location in list view
	own.listViewClick = function(location) {
		if (location.name) {
			map.setZoom(15); //Zoom map view
			map.panTo(location.position); // Pans the map view to selected marker when list view Location is clicked
			location.marker.setAnimation(google.maps.Animation.BOUNCE); // Bounces marker when list view Location is clicked
			 if (currentInfoWindow !== undefined) {
								currentInfoWindow.close();
						}
						currentInfoWindow = location.infoWindow;
						currentInfoWindow.open(map, location.marker); // Opens an info window on correct marker when list Location is clicked
		}
		setTimeout(function() {
			location.marker.setAnimation(null); // End animation on marker after 1.5 seconds
		}, 1500);
	};

	// Stores user input
	own.query = ko.observable('');

//Filter through observableArray and filter results using knockouts utils.arrayFilter();
own.search = ko.computed(function () {
	return ko.utils.arrayFilter(own.Locations(), function (listResult) {
	var result = listResult.name.toLowerCase().indexOf(own.query().toLowerCase());

//If-else statement used to display markers only if they meet search criteria in search bar
	if (result === -1) {
		listResult.marker.setVisible(false);
		} else {
		listResult.marker.setVisible(true);
		}
		return result >= 0;
		});
	});
}