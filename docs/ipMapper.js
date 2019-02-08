if (Cookies.get('__ipmapperredirected__') === 'true') {
    $.toast({
        heading: 'Redirected',
        text: "You have been redirected from 'https' to 'http'",
        icon: 'info',
        hideAfter: 6500,
        showHideTransition: 'slide'
    });
    $.toast({
        text: "Due to 'Mixed Content' issues, this site can only be used with 'http'. We apologize for any inconvenience.",
        icon: 'info',
        hideAfter: 6500,
        showHideTransition: 'slide',
        afterShown: function() {
            Cookies.remove('__ipmapperredirected__');
        }
    });
}

if (location.protocol === "https:") {
    Cookies.set('__ipmapperredirected__', 'true', {
        expires: 1
    });
    location.replace("http://" + location.hostname);
}

let slideControlUp = function(id) {
    if (Array.isArray(id)) {
        for (let i = 0; i < id.length; i++) {
            $(String(id[i])).slideUp('slow');
        }
    } else {
        $(id).slideUp('slow');
    }
};

let slideControlDown = function(id) {
    if (Array.isArray(id)) {
        for (let i = 0; i < id.length; i++) {
            $(String(id[i])).slideDown('slow');
        }
    } else {
        $(id).slideDown('slow');
    }
}

let slideUpDownOrdered = function(up, down) {
    $(up).slideUp('slow', function() {
        $(down).slideDown('slow', function() {
            scrollTo(down);
        });
    });
};

let slideUpDown = function(up, down) {
    $(up).slideUp('slow');
    $(down).slideDown('slow', function() {
        scrollTo(down);
    });
};

let clearVal = function(id) {
    if (Array.isArray(id)) {
        for (let i = 0; i < id.length; i++) {
            $(String(id[i])).val("");
        }
    } else {
        $(id).val("");
    }
}

let clearHtml = function(id) {
    if (Array.isArray(id)) {
        for (let i = 0; i < idArray.length; i++) {
            $(String(id[i])).html("");
        }
    } else {
        $(id).html("");
    }
}

let disableControl = function(id) {
    if (Array.isArray(id)) {
        for (let i = 0; i < id.length; i++) {;
            console.log(id);
            $(String(id[i])).addClass('disabled').attr('disabled', 'disabled');
        }
    } else {
        $(id).addClass('disabled').attr('disabled', 'disabled');
    }
}

let enableControl = function(id) {
    if (Array.isArray()) {
        for (let i = 0; i < id.length; i++) {
            $(String(id[i])).removeClass('disabled').removeAttr('disabled');
        }
    } else {
        $(id).removeClass('disabled').removeAttr('disabled');
    }
}

let setCheckbox = function(id, isChecked) {
    $(id).prop('checked', isChecked);
}

let scrollTo = function(e) {
    let p = $(e).offset().top;
    $("body, html").animate({
        scrollTop: p
    });
};

let getIpData = function() {
    let provider = $('#select-ip-api-provider').val();
    /* IP API */
    if (provider === "http://ip-api.com") {
        let h = $('#use-current-connection-checkbox')
            .prop("checked") === true ? '' : $('#hostname-or-ip-textbox').val();
        getIpJsonFromIpApi(h);
    } /**/
    /* IP STACK */
    if (provider === "http://ipstack.com") {
        let a = $('#api-key-textbox').val();
        let h = $('#use-current-connection-checkbox')
            .prop("checked") === true ? 'check' : $('#hostname-or-ip-textbox').val();
        getIpJsonFromIpStack(h, a);
    } /**/
};

let getIpJsonFromIpApi = function(ipOrHostname) {
    let h = "http://ip-api.com/json/" + String(ipOrHostname);
    $.ajax(h, {
        dataType: "json",
        success: function(result) {
            let r = stageMapData(result);
            mapLatLong(r.lat, r.lon, 'map-display');
            scrollTo('#results-map-card');
        },
        error: function() {
            showToastApiError(h);
        }
    });
};

let getIpJsonFromIpStack = function(ipOrHostname, apiKey) {
    let h = "http://api.ipstack.com/" + String(ipOrHostname) + "?access_key=" + String(apiKey);
    $.ajax(h, {
        dataType: "json",
        success: function(result) {
            let r = stageMapData(result);
            mapLatLong(r.latitude, r.longitude, 'map-display');
            scrollTo('#results-map-card');
        },
        error: function() {
            showToastApiError(h);
        }
    });
}

let stageMapData = function(data) {
    slideControlDown('#results-map-card');
    let r = JSON.stringify(data, undefined, 2);
    $('#json-results').html(r);
    $('#map-display').height($('#results-json-div').height());
    return JSON.parse(r);
}

let mapLatLong = function(lat, long, displayElement) {
    let tl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    let map = L.map(displayElement).setView([lat, long], 13);
    L.tileLayer(tl, {
        attribution: attrib
    }).addTo(map);
    L.marker([lat, long]).addTo(map);
}

let showToastApiError = function(host) {
    $.toast({
        heading: 'Error!',
        text: "Unable to query " + host + "!",
        icon: 'error',
        hideAfter: 10000,
        showHideTransition: 'slide',
        position: 'top-center'
    });
    $.toast({
        text: "If you are using adblock, it may be blocking our requests. Pause ADBLOCK for this site and try again.",
        icon: 'error',
        hideAfter: 10000,
        showHideTransition: 'slide',
        position: 'top-center'
    });
}

$('#use-current-connection-checkbox').on('change', function() {
    if (this.checked) {
        clearVal('#hostname-or-ip-textbox');
        disableControl('#hostname-or-ip-textbox');
        enableControl('#btn-generate-by-ip');
    } else {
        enableControl('#hostname-or-ip-textbox');
        disableControl('#btn-generate-by-ip');
    }
});

$('#api-key-textbox').on('input', function() {
    if ($(this).val().length > 5) {
        slideControlDown('#hostname-or-ip-slider');
    } else {
        clearVal('#hostname-or-ip-textbox');
        slideControlUp('#hostname-or-ip-slider');
        disableControl('#btn-generate-by-ip');
    }
});

/* #btn-clear-results on click */
$(document).on('click', '#btn-clear-results', function() {
    clearHtml('#results-map-card');
    scrollTo('#topbar');
});

$('#hostname-or-ip-textbox').on('input', function() {
    if ($(this).val().length > 3) {
        enableControl('#btn-generate-by-ip');
    } else {
        disableControl('#btn-generate-by-ip');
    }
});

$('#select-ip-api-provider').on('change', function() {
    setCheckbox('#use-current-connection-checkbox', false);
    disableControl('#btn-generate-by-ip');
    enableControl('#hostname-or-ip-textbox');
    clearVal(['#api-key-textbox', '#hostname-or-ip-textbox'])
    clearHtml('#results-map-card');
    let provider = $(this).val();
    if (provider != "-") {
        if (provider === "http://ip-api.com") {
            slideUpDown('#api-key-slider', '#hostname-or-ip-slider');
        }
        if (provider === "http://ipstack.com") {
            slideUpDown('#hostname-or-ip-slider', '#api-key-slider');
        }
    } else {
        slideControlUp(['#api-key-slider', '#hostname-or-ip-slider']);
        scrollTo('#topbar');
    }
});

$('#btn-generate-by-ip').on('click', function() {
    $('#results-map-card').html("").append(`
                <div class='card m-t-20'>
                    <div class='card-header'>
                        <h5 class='m-b-0'>Results</h5>
                    </div>
                    <div class='card-body'>
                        <div class='row'>
                            <div class='col-md-4 results-json' id='results-json-div'>
                                <pre id='json-results'></pre>
                            </div>
                            <div class='col-md-8 results-map'>
                                <div id='map-display'></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer text-center">
                        <button class="btn btn-danger" id="btn-clear-results">Clear Results</button>
                    </div>
                </div>`);
    getIpData();
});


/*






*









*










*








*








*









*







*







*







*







*







*







*







*






*





*




*




*




*



*/
