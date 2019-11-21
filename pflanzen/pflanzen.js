//"use strict";
$(document).ready(function() {
    $.fn.dataTable.ext.errMode = 'none';       
    $('#tblpflanzen').DataTable( {
        "ajax": {
            "url": 'https://pflanzendb-94c6.restdb.io/rest/pflanzen?apikey=5dd0684c64e7774913b6ed6f',
            "dataSrc": "",
//            "url": './data/pflanze.json',
//            "dataSrc": "pflanze"
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
        columnDefs: [{ 
            orderable: true,
            targets: 12,
            render: function(data) {
                  if(data == null){
                      return null;
                  }else{
                      return '<img height="48" width="48" src="https://pflanzendb-94c6.restdb.io/media/'+data+'">'
                  }
              }
            }],
        stateSave: true,
        //scrollY: 400,
        scrollX: true,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Alle"]],
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
    
    // $('#tblpflanzen').on( 'error.dt', function ( e, settings, techNote, message ) {
    // console.log( 'An error has been reported by DataTables: ', message );
    // } ) ;

} );