$(document).ready(function () {
    let handle_key = appConfig.handle_key;
    let hh = appConfig.hh;
    let targets = appConfig.targets;
    let check_table = $('#checkp_table').DataTable({
        data: get_rows(appConfig.handle_key.checkpoints),
        columns: [{title: 'Model'}, {title: appConfig.metric}, {title: 'Loss'}, {
            title: '',
            width: "5%"
        }],
        'select': 'single',
        "searching": false,
        fixedHeader: false,
        "paging": false,
        "bInfo": false //showNEntries : false
    })
        .on('select', function () {
            en_disable_objs(false)
        })
        .on('deselect', function () {
            en_disable_objs(true)
        });

    //create_test_features_values
    $.each(handle_key.features, function (key, value) {
        add_input_number(handle_key.types[key], key, value, 0.001);
    });
    $.each(handle_key.categoricals, function (key, value) {
        add_input_select(key, handle_key.categoricals[key], appConfig.handle_key.features[key]);
    });

    show_error_has_hash(hh);
    let explain_select_target = add_select("exp_target", targets);
    $('#exp_label').append(explain_select_target);

    if (!appConfig.has_test) {
        document.getElementById("opt3").className = "hidden";
    }


    //TODO OPTIONS SELECT
    $(".custom-select").each(function () {
        var classes = $(this).attr("class"),
            id = $(this).attr("id"),
            name = $(this).attr("name");
        var template = '<div  class="' + classes + '">';
        template += '<span id="selector" class="custom-select-trigger-disabled">' + $(this).attr("placeholder") + '</span>';
        template += '<div class="custom-options">';
        $(this).find("option").each(function () {
            template += '<span class="custom-option ' + $(this).attr("class") + '" data-value="' + $(this).attr("value") + '">' + $(this).html() + '</span>';
        });
        template += '</div></div>';

        $(this).wrap('<div class="custom-select-wrapper"></div>');
        $(this).hide();
        $(this).after(template);
    });
    $(".custom-option:first-of-type").hover(function () {
        $(this).parents(".custom-options").addClass("option-hover");
    }, function () {
        $(this).parents(".custom-options").removeClass("option-hover");
    });
    $(".custom-select-trigger").on("click", function () {
        $('html').one('click', function () {
            $(".custom-select").removeClass("opened");
        });
        $(this).parents(".custom-select").toggleClass("opened");
        event.stopPropagation();
    });
    $(".custom-select-trigger-disabled").on("click", function () {
        $('html').one('click', function () {
            $(".custom-select").removeClass("opened");
        });
        $(this).parents(".custom-select").toggleClass("opened");
        event.stopPropagation();
    });
    $(".custom-option").on("click", function () {
        $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
        $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
        $(this).addClass("selection");
        $(this).parents(".custom-select").removeClass("opened");
        $(this).parents(".custom-select").find(".custom-select-trigger").text($(this).text());
        selectOption();
    });
});

function selectOption() {
    $("#feature-div").removeAttr('class').attr('class', 'hidden');
    $("#upload-div").removeAttr('class').attr('class', 'hidden');
    $("#test-split-div").removeAttr('class').attr('class', 'hidden');
    let div = $('#options').val();
    $('#' + div).removeAttr('class');
}

function hide_show() {
    let $log = $('#log');
    if ($log.css("display") === "none")
        $log.css("display", "block");
    else
        $log.css("display", "none");
}

function en_disable_objs(bool_opt) {
    $('#predict_button').prop('disabled', bool_opt);
    $('#resume_training').prop('disabled', bool_opt);
    $("#col-features :input").attr("disabled", bool_opt);
    $("#explain_form :input").attr("disabled", bool_opt);

    if (bool_opt) {
        $("#col-predict").addClass('pre-trained');
        $("#col-features").addClass('pre-trained');
        $("#col-explain").addClass('pre-trained');
    } else {
        $("#col-predict").removeClass('pre-trained');
        $("#col-features").removeClass('pre-trained');
        $("#col-explain").removeClass('pre-trained');
    }
}

function add_input_number(type, label_name, value, input_step) {
    if (type === "number") {
        let x = $("<input>")
            .attr("type", type)
            .attr("id", label_name)
            .attr("name", label_name)
            .attr("value", value)
            .attr("step", input_step);
        let th = $('<th></th>')
            .append(x);
        let th2 = $('<th></th>')
            .text(label_name);
        let tr = $('<tr></tr>')
            .append(th2)
            .append(th);
        $("#table_features")
            .append(tr);
    }
}

function add_select(label_name, options) {
    let selectList = $("<select>")
        .attr('id', label_name)
        .attr('name', label_name);
    let option_list = options.map((key) => $('<option>').val(key).text(key));
    selectList.append(option_list);
    return selectList
}

function add_input_select(label_name, options, value_default) {
    let selectList = add_select(label_name, options);
    let th = $('<th></th>')
        .append(selectList);
    let th2 = $('<th></th>')
        .text(label_name);
    let tr = $('<tr></tr>')
        .append(th2)
        .append(th);
    $("#table_features")
        .append(tr);
}

function get_rows(checkpoints) {
    let rows = [];
    $.each(checkpoints, function (key, value) {
        let val = 0;
        if ('accuracy' in value)
            val = value['accuracy'];
        else if ('r_squared' in value)
            val = value['r_squared'];
        rows.push([
            key,
            val,
            value['loss'],
            '<a data-id=' + key + ' onclick="ConfirmDelete(this, false)" >' + '<span class="glyphicon glyphicon-remove"></span></a>'
        ]);
    });
    return rows;
}

function show_error_has_hash(hh) {
    localStorage.setItem('has_hash', hh);
    if (hh === 'true') {
        $errormsg = "<span style='color: red'>* not available with hash features</span>";
        $("#error_exp").addClass('error').html($errormsg)
    }
}

function submitDeployForm() {
    var checkp_table = $('#checkp_table').DataTable();
    var n_ckpt = checkp_table.data().rows()[0].length;
    if (n_ckpt > 0){
         $('form#deploy').submit();
         return
    }
    alert('Please train the model before deployment.')
};