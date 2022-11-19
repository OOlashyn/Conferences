(function (webapi, $) {
    function safeAjax(ajaxOptions) {
        var deferredAjax = $.Deferred();

        shell
            .getTokenDeferred()
            .done(function (token) {
                // add headers for AJAX
                if (!ajaxOptions.headers) {
                    $.extend(ajaxOptions, {
                        headers: {
                            __RequestVerificationToken: token,
                        },
                    });
                } else {
                    ajaxOptions.headers["__RequestVerificationToken"] = token;
                }
                $.ajax(ajaxOptions)
                    .done(function (data, textStatus, jqXHR) {
                        validateLoginSession(
                            data,
                            textStatus,
                            jqXHR,
                            deferredAjax.resolve
                        );
                    })
                    .fail(deferredAjax.reject); //AJAX
            })
            .fail(function () {
                deferredAjax.rejectWith(this, arguments); // on token failure pass the token AJAX and args
            });

        return deferredAjax.promise();
    }
    webapi.safeAjax = safeAjax;
})((window.webapi = window.webapi || {}), jQuery);

const TIMEOUT = 500;

function timeout() {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(), TIMEOUT);
    });
}

function getCourses() {
    return webapi.safeAjax({
        type: "GET",
        url: "/_api/hero_coursesessions?$select=_hero_course_value,hero_startdate,hero_enddate",
        contentType: "application/json"
    });
}

function showContent(data) {
    console.log("data", data);
    if(data.value.length > 0) {
        let table = document.getElementById("coursesTable");
        $(table).removeClass("hidden");
        let tbody = document.createElement("tbody");
        table.appendChild(tbody);

        data.value.forEach(course => {
            let tr = document.createElement("tr");
            let courseTd = document.createElement("td");
            courseTd.textContent = course["_hero_course_value@OData.Community.Display.V1.FormattedValue"];
            tr.appendChild(courseTd);
            let startTd = document.createElement("td");
            startTd.textContent = course["hero_startdate@OData.Community.Display.V1.FormattedValue"];
            tr.appendChild(startTd);
            let endTd = document.createElement("td");
            endTd.textContent = course["hero_enddate@OData.Community.Display.V1.FormattedValue"];
            tr.appendChild(endTd);
            tbody.appendChild(tr);
        });
    }
}

function showLoader() {
    $(".loading-message").removeClass("hidden");
}

function hideLoader() {
    $(".loading-message").addClass("hidden");
}

function resetUI(){
    hideLoader();
    $("#coursesTable").addClass("hidden");
    $("#coursesTable tbody").remove();;
}

$(document).ready(function () {
    $("#resetBtn").click(resetUI);

    $("#fetchCoursesBtn").click(function() {
        Promise.race([getCourses()
            .then(showContent)
            .then(hideLoader), timeout()
        ])
        .catch(showLoader);
    });
});