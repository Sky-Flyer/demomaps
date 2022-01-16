//"use strict";

$(document).ready(function() {
    url_plant_srv_api='data/pflanze.json'
    $.fn.dataTable.ext.errMode = 'none';

    buttonDefs = [
//     {
//         text: '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>',
//         name: 'add',        // do not change name
//         titleAttr: "Neu Pflanze anlegen",
//         key: 'Insert'
//     },
//     {
//         extend: 'selected', // Bind to Selected row
//         text: '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>',
//         name: 'edit',        // do not change name
//         titleAttr: "Pflanze bearbeiten",
//         key: 'F4'
//     },
//     {
//         extend: 'selected', // Bind to Selected row
//         text: '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>',
//         name: 'delete',        // do not change name
//         titleAttr: "Pflanze löschen",
//         key: 'Delete'
//     },
    {
        text: '<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>',
        name: 'refresh',        // do not change name
        titleAttr: "Daten neu einlesen",
        key: { shiftKey: true, key: 'R' }
    },
    {extend: 'copyHtml5', text:'<span class="glyphicon glyphicon-copy" aria-hidden="true"></span>', titleAttr: 'In die Zwischenablage kopieren'},
    {
        extend: "print",
        text: '<span class="glyphicon glyphicon-print" aria-hidden="true"></span>',
        titleAttr: 'Drucken',
        orientation: 'landscape',
        pageSize: 'A4'
    },
    {
        extend: 'colvis',
        name: 'colvis',
        text: '<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>',
        columnText: function ( dt, idx, title ) {
            return (idx+1)+': '+title;
        },
        titleAttr: 'Sichtbare Spalten auswählen'
    }
    ];

    columnDefs = [
        { "data": "id",               "title": "Nr.",                   readonly: true, unique: true, type: "hidden" },
        { "data": "artname_deu",      "title": "Artname (Deutsch)",     required: true, unique: true, uniqueMsg: "Es darf keine Pflanze 2 Mal vorhanden sein (Deutsch, Latein)!" },
        { "data": "artname_lat",      "title": "Artname (Latein)",                      unique: true, uniqueMsg: "Es darf keine Pflanze 2 Mal vorhanden sein (Deutsch, Latein)!" },
        { "data": "famname_deu",      "title": "Familie (Deutsch)" },
        { "data": "famname_lat",      "title": "Familie (Latein)" },
        { "data": "spreitenrand",     "title": "Spreitenrand" },
        { "data": "blattspreite",     "title": "Blattspreite" },
        { "data": "max_stammumfang",  "title": "Max. Stammumfang" },
        { "data": "max_alter",        "title": "Max. Alter" },
        { "data": "ansprueche",       "title": "Ansprüche",             type: "textarea" },
        { "data": "boden_ansprueche", "title": "Bodenansprüche",        type: "textarea" },
        { "data": "standort",         "title": "Standort",              type: "textarea" },
        { "data": "max_hoehe",        "title": "Max Höhe" },
        { "data": "frucht",           "title": "Frucht",                type: "textarea"},
        { "data": "bluehzeit",        "title": "Blühzeit" },
        { "data": "heilkraefte",      "title": "Heilkräfte",            type: "textarea" },
        { "data": "sonstiges",        "title": "Sonstige Notizen",      type: "textarea" }
    ];

//        columnDefs: [{
//            id: "id"
//            orderable: true,
//            targets: 12,
//            render: function(data) {
//                  if(data == null){
//                      return null;
//                  }else{
//                      return null;
//                      //return '<img height="140" width="140" src="https://pflanzendb-94c6.restdb.io/media/'+data+'">'
//                  }
//              }
//        }],
//
    onAddRowFkt=function(datatable, rowdata, success, error) {
        rowdata.id=null;
        $.ajax({
            // a tipycal url would be / with type='PUT'
            url: url_plant_srv_api,
            type: 'POST',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(rowdata),
            success: success,
            error: error
        });
    };
    onDeleteRowFkt=function(datatable, rowdata, success, error) {
        $.ajax({
            // a tipycal url would be /{id} with type='DELETE'
            url: url_plant_srv_api+'/'+rowdata.id,
            type: 'DELETE',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(rowdata),
            success: success,
            error: error
        });
    };
    onEditRowFkt=function(datatable, rowdata, success, error) {
        $.ajax({
            // a tipycal url would be /{id} with type='POST'
            url: url_plant_srv_api+'/'+rowdata.id,
            type: 'PUT',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(rowdata),
            success: success,
            error: error
        });
    };
    ajaxDefs={
        "url": url_plant_srv_api,
        "dataSrc": ""
    };
    domDefs="<'row'<'col-xs-5  col-sm-4 col-md-3 col-xl-2'l>" +
                  "<'col-xs-7  col-sm-4 col-md-4 col-xl-4'B>"+
                  "<'col-xs-12 col-sm-4 col-md-5 col-xl-6'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-5'i><'col-sm-7'p>>";
    onInitCompleteFkt=function () {
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
        };

    // Setup - add a text input to each footer cell
//    $('#tblpflanzen tfoot th').each( function (i) {
//        var title = $('#tblpflanzen tfoot th').eq( $(this).index() ).text();
//        if ($(this).index() < 5){
//            $(this).html( '<input type="text" placeholder="Suche '+title+'" data-index="'+i+'" />' );
//        }
//    } );

    var table = $('#tblpflanzen').DataTable( {
        dom: domDefs,    // Needs button container
        ajax: ajaxDefs,
        columns: columnDefs,
        select: 'single',
        altEditor: true,     // Enable altEditor
        responsive: true,
        colReorder: true,
        autoFill: false,
        rowReorder: false,
//        rowGroup: {
//            dataSrc: 'famname_lat'
//        },
        //scrollX: true,
        lengthMenu: [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "Alle"]],
        buttons: buttonDefs,
        onAddRow: onAddRowFkt,
        onDeleteRow: onDeleteRowFkt,
        onEditRow: onEditRowFkt,
        "pagingType": "full_numbers",
        "language": {
                "url": "DataTables/dataTables.german.lang.json"
        },
        fixedHeader: {
            header: true,
            footer: true
        },
        //initComplete: onInitCompleteFkt,
        stateSave: true
    } );
    // Filter event handler
//    $( table.table().container() ).on( 'keyup', 'tfoot input', function () {
//        table
//            .column( $(this).data('index') )
//            .search( this.value )
//            .draw();
//    } );

} );
