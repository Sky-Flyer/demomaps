//"use strict";
$(document).ready(function() {
    $('#tblpflanzen').DataTable( {
        "ajax": {
            "url": 'https://pflanzendb-94c6.restdb.io/rest/pflanzen?apikey=5dd0684c64e7774913b6ed6f',
            "dataSrc": ""
        },
        "columns": [
            { "data": "id" },
            { "data": "artname_deu" },
            { "data": "artname_lat" },
            { "data": "famname_deu" },
            { "data": "famname_lat" },
		    { "data": "spreitenrand" },
		    { "data": "blattspreite" },
		    { "data": "max_stammumfang" },
		    { "data": "max_alter" },
		    { "data": "ansprueche" },
		    { "data": "standort" },
		    { "data": "frucht"},
            { "data": "bild" },
        ],
        initComplete: function () {
            this.api().columns().every( function () {
                var column = this;
                var select = $('<select><option value=""></option></select>')
                    .appendTo( $(column.footer()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
 
                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    } );
 
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            } );
        }
    } );
} );