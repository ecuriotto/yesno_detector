/*
 * JavaScript file for the application to demonstrate
 * using the API
 */

// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'read': function() {
            let ajax_options = {
                type: 'GET',
                url: 'api/letture',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        create: function(lettura) {
            let ajax_options = {
                type: 'POST',
                url: 'api/letture',
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(lettura)
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_create_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        update: function(lettura) {
            let ajax_options = {
                type: 'PUT',
                url: `api/letture/${lettura.lettura_id}`,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(lettura)
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_update_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'delete': function(lettura_id) {
            let ajax_options = {
                type: 'DELETE',
                url: `api/letture/${lettura_id}`,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_delete_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';

    let $lettura_id = $('#lettura_id'),
        $autore = $('#autore'),
        $libro = $('#libro'),
        $dataLettura = $('#dataLettura'),
        $commento = $('#commento');

    // return the API
    return {
        reset: function() {
            $lettura_id.val('');
            $libro.val('');
            $autore.val('').focus();
            $dataLettura.val('');
            $commento.val('');
        },
        update_editor: function(lettura) {
            $lettura_id.val(lettura.lettura_id);
            $libro.val(lettura.libro);
            $autore.val(lettura.autore).focus();
            $dataLettura.val(lettura.dataLettura.substring(0,7));
            $commento.val(lettura.commento);
        },
        build_table: function(letture) {
            let rows = ''

            // clear the table
            $('.letture table > tbody').empty();

            // did we get a letture array?
            if (letture) {
                for (let i=0, l=letture.length; i < l; i++) {
                    rows += `<tr data-lettura-id="${letture[i].lettura_id}">
                        <td class="autore">${letture[i].autore}</td>
                        <td class="libro">${letture[i].libro}</td>
                        <td class="dataLettura">${letture[i].dataLettura.substring(0,7)}</td>
                        <td class="commento">${letture[i].commento}</td>
                    </tr>`;
                }
                $('table > tbody').append(rows);
            }
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $lettura_id = $('#lettura_id'),
        $autore = $('#autore'),
        $libro = $('#libro'),
        $dataLettura = $('#dataLettura'),
        $commento = $('#commento');

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.read();
    }, 100)

    // Validate input
    function validate(autore, libro, dataLettura, commento) {
        return autore !== "" && libro !== "" && dataLettura !== "" && commento !== "";
    }

    // Create our event handlers
    $('#create').click(function(e) {
        let autore = $autore.val(),
            libro = $libro.val();
            var dataLettura = '';
            var commento = '';
            if($dataLettura)
                dataLettura = $dataLettura.val();
            else
                dataLettura = ''
            if($commento)
                commento = $commento.val();
            else
                commento = ''

        e.preventDefault();

        if (validate(autore, libro, dataLettura, commento)) {
            model.create({
                'autore': autore,
                'libro': libro,
                'dataLettura' : dataLettura,
                'commento' : commento
            })
        } else {
            alert('Problem with input');
        }
    });

    $('#update').click(function(e) {
        let lettura_id = $lettura_id.val(),
            autore = $autore.val(),
            libro = $libro.val();
            var dataLettura = '';
            var commento = '';
            if($dataLettura)
                dataLettura = $dataLettura.val();
            else
                dataLettura = ''
            if($commento)
                commento = $commento.val();
            else
                commento = ''
            console.log(lettura_id);
        e.preventDefault();

        if (validate(autore, libro, dataLettura, commento)) {
            model.update({
                lettura_id: lettura_id,
                autore: autore,
                libro: libro,
                dataLettura: dataLettura,
                commento: commento
            })
        } else {
            alert('Problem with input');
        }
        e.preventDefault();
    });

    $('#delete').click(function(e) {
        let lettura_id = $lettura_id.val();

        e.preventDefault();

        if (validate('placeholder', libro)) {
            model.delete(lettura_id)
        } else {
            alert('Problem with  input');
        }
        e.preventDefault();
    });

    $('#reset').click(function() {
        view.reset();
    })

    $('table > tbody').on('dblclick', 'tr', function(e) {
        let $target = $(e.target),
            lettura_id,
            autore,
            libro,
            dataLettura,
            commento;

        lettura_id = $target
            .parent()
            .attr('data-lettura-id');

        autore = $target
            .parent()
            .find('td.autore')
            .text();

        libro = $target
            .parent()
            .find('td.libro')
            .text();
        dataLettura = $target
            .parent()
            .find('td.dataLettura')
            .text(); 
        commento = $target
            .parent()
            .find('td.commento')
            .text();               

        view.update_editor({
            lettura_id: lettura_id,
            autore: autore,
            libro: libro,
            dataLettura: dataLettura,
            commento: commento
        });
    });

    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        $("#header_container").load("./navBar");
        view.build_table(data);
        view.reset();
    });

    $event_pump.on('model_create_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_update_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_delete_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        let error_msg = textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));