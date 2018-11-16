$(document).ready(function () {
    var playing = false;
    let running = appConfig.running;
    if (running === 'running')
        toggle_play(true);

    $('svg').click(function () {
        playing = !playing;
        let form_data = {'action': 'pause'};
        if (playing)
            form_data['action'] = 'run';
        form_data['resume_from'] = '';
        if (document.getElementById("resume_training").checked === true)
            form_data['resume_from'] = get_checkpoint_selected();
        playing = !playing;
        $.ajax({
            url: "/run",
            type: 'POST',
            data: form_data,
            success: function () {
                playing = !playing;
                var animation = playing ? 'stop' : 'play';
                $('#animate_to_' + animation).get(0).beginElement();
                $('#resume_training').prop('checked', false);
            }
        })

    });

    function toggle_play(val) {
        playing = val;
        let animation = playing ? 'stop' : 'play';
        $('#animate_to_' + animation).get(0).beginElement();
    }

    $("#predict_button").click(function (e) {
        $.ajax({
            url: "/predict",
            type: 'POST',
            data: serialize_form(),
            success: function (data) {
                if ('error' in data) {
                    alert('Model\'s structure does not match the new parameter configuration');
                } else {
                    $('#predict_val').empty();

                    $.each(data, function (key, val) {
                        $('#predict_val')
                            .append(key)
                            .append(' : ')
                            .append(val)
                            .append('<br>');
                    });
                }
            }
        })
    });

    function test_success(href, result) {
        if (result !== 'ok')
            alert(result);
        else
            $("<a>").attr({"href": href, "target": '_blank'})[0].click();
    }

    $("#explain_button").click(function (e) {
        $.ajax({
            url: "/explain",
            type: 'POST',
            data: serialize_form(),
            success: function (data) {
                test_success('explain', data.explanation);
            }
        })
    });

    $("#test_from_file").click(function (e) {
        let $input = $('#upload-file');
        if ($input[0].files.length === 0) {
            alert("Please select a file.")
        } else {
            let fReader = new FileReader();
            fReader.readAsBinaryString($input[0].files[0]);
            fReader.onloadend = function (event) {
                $.ajax({
                    url: "/test",
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json;charset=UTF-8',
                    accepts: {
                        json: 'application/json',
                    },
                    data: JSON.stringify({
                        'file': event.target.result,
                        'filename': document.getElementById('upload-file').files[0].name,
                        'model': get_checkpoint_selected()
                    }),
                    success: function (data) {
                        test_success('show_test', data.result);
                    }
                })
            }
        }
    });


    $("#test_from_split").click(function (e) {
        $.ajax({
            url: "/test",
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
            accepts: {
                json: 'application/json',
            },
            data: JSON.stringify({
                'model': get_checkpoint_selected()
            }),
            success: function (data) {
                test_success('show_test', data.result);
            }
        })
    });

    function set_epochs(val) {
        if (val !== null) {
            let str = val.toString().padStart(6, "0");
            let txt = str.slice(0, 3) + ',' + str.slice(3);
            $("#iter-number").text(txt);
        }
    }

    setInterval(function () {
        if (playing) {
            $.ajax({
                url: "/refresh",
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json;charset=UTF-8',
                accepts: {
                    json: 'application/json',
                },
                data: JSON.stringify("checkpoints"),
                success: function (data) {
                    set_epochs(data.epochs);
                    if (playing !== data.running)
                        toggle_play(data.running);
                    if (data.data !== '')
                        $('#log').append(data.data).scrollTop($('#log')[0].scrollHeight);
                    let $checkp_table = $('#checkp_table').DataTable();
                    let row_selected = $checkp_table.rows({selected: true});
                    let rows = get_rows(data.checkpoints);
                    $checkp_table
                        .clear().rows.add(rows).draw()
                        .row(row_selected).select();
                }
            })
        }
    }, 1000);
});

function ConfirmDelete(elem, all) {
    let message = "Are you sure you want to delete the selected model?";
    if (all === true) {
        message = "Are you sure you want to delete all saved models?";
    }
    if (confirm(message)) {
        $.ajax({
            url: "/delete",
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
            accepts: {
                json: 'application/json',
            },
            data: JSON.stringify({'deleteID': $(elem).attr('data-id')}),
            success: function (data) {
                en_disable_objs(true);
                data = get_rows(data.checkpoints);
                $('#checkp_table').DataTable().clear().rows.add(data).draw();
            }
        })
    }
}

function serialize_form() {
    let data_form = $("#predict_form").serializeArray();
    data_form.push({name: 'radiob', value: get_checkpoint_selected()});
    return data_form;
}

function get_checkpoint_selected() {
    let model = $('#checkp_table').DataTable().rows({selected: true}).data();
    return model[0][0];
}
