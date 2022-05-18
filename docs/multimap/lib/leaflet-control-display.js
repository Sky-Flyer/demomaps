/****************************************************************************
	leaflet-control-display.js,

	(c) 2016, FCOO

	https://github.com/FCOO/leaflet-control-display
	https://github.com/FCOO

****************************************************************************/
;(function ($, L, window, document, undefined) {
	"use strict";


	function classNamesToArray( classNames ){
		if ($.isArray(classNames))
		  return classNames;
		classNames = classNames.replace(" ", ",");
		return classNames.split(',');
	}

	//Extend base leaflet class
	L.ControlDisplay = L.Class.extend({

    //Default options
		options: {
			VERSION					: "0.2.0",
			controlSelector	: ".leaflet-control-container .leaflet-control",
			groups          : [	{id:'zoom',					classNames:'leaflet-control-zoom'},
													{id:'attribution',	classNames:'leaflet-control-attribution'},
													{id:'scale',				classNames:'leaflet-control-scale'},
													{id:'layers',				classNames:'leaflet-control-layers'}
												]
		},

		//initialize
		initialize: function(options) {
			L.setOptions(this, options);

			this.controlGroups = {};
			this.allControlClasses = [];
			for (var i=0; i<this.options.groups.length; i++ )
				this.add( this.options.groups[i].id, this.options.groups[i].classNames );

		},

		//add
		add: function ( id, classNames) {
			this.controlGroups[id] = this.controlGroups[id] || [];
			this.controlGroups[id] = this.controlGroups[id].concat( classNamesToArray(classNames) );
			this.allControlClasses = this.allControlClasses.concat( classNamesToArray(classNames) );

		},

		//show
		show: function( id ){ this._eachControls( id, function( $controls ){ $controls.show(); }) },

		//hide
		hide: function( id ){ this._eachControls( id, function( $controls ){ $controls.hide(); }) },


		//containerAddClass( id, classNames ) - Add classNames to the containers of all controls in group id
		containerAddClass: function( id, classNames ){
			this._eachControls( 
				id, 
				function( $controls, classNames ){ 
					if ($controls._container)
						L.DomUtil.addClass($controls._container, classNames);
				},
				classNames
			);
		},

		//containerRemoveClass( id, classNames ) - Remove classNames to the containers of all controls in group id
		containerRemoveClass: function( id, classNames ){
			this._eachControls( 
				id, 
				function( $controls, classNames ){ 
					if ($controls._container)
						L.DomUtil.removeClass($controls._container, classNames);
				},
				classNames
			);
		},


		//_hideOrShow
		_eachControls: function( id, controlFunc, arg ){
			var $controls,
					groupSelector,
					classNames,
					idList = classNamesToArray( id ),
					i, j;
			for (i=0; i<idList.length; i++ ){
				$controls = $( this.options.controlSelector );
				id = idList[i];
				groupSelector = '';
				classNames = this.controlGroups[id] || [];

				if (id == 'ALL'){
					//Ok - all controls included
				}
				else
					if (id == 'REST'){
						for (j=0; j<this.allControlClasses.length; j++ )
							$controls = $controls.filter(':not(.'+this.allControlClasses[j]+')');
					}
					else {
						for (j=0; j<classNames.length; j++ )
							groupSelector += (groupSelector ? ',' : '') + '.'+classNames[j];
						$controls = $controls.filter(groupSelector);
					}

				controlFunc( $controls, arg );
			}
		}

	});


	L.controlDisplay = function( options ){ return new L.ControlDisplay( options ); };


}(jQuery, L, this, document));



