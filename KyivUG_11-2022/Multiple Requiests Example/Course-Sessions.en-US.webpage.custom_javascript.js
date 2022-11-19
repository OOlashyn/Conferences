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


var userId = "{{user.id}}";

function showSuccessDialog() {
    Swal.fire({
        title: 'Success!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
    });
}

function showErrorDialog(error) {
    const errorsJson = JSON.stringify(error);
    const file = new Blob([errorsJson], {
        type: "text/plain"
    });
    const url = window.URL || window.webkitURL;
    const errorFileName = `Error.json`;

    Swal.fire({
        title: 'Oops...',
        icon: 'error',
        text: 'Something went wrong. If this message will appear again please download file below and sent to support@dancingwithcrm.com',
        footer: `<a style="font-size:18px;" href="${url.createObjectURL(file)}" download="${errorFileName}">Download error logs</a>`
    });
}

function completeSelectedCourses() {
    let loaderSvg = document.createElement("img");
    loaderSvg.src = "/loader.svg";

    let loaderWrapper = document.createElement("div");

    loaderWrapper.appendChild(loaderSvg);

    $.LoadingOverlay("show", {
        image: "",
        custom: loaderWrapper
    })

    // array that will contain our async web api calls
    let deffereds = [];

    let checkBoxes = document.querySelectorAll(".entity-list-checkbox");

    for (let index = 0; index < checkBoxes.length; index++) {
        const checkBox = checkBoxes[index];

        if (checkBox.checked) {
            const courseSessionId = checkBox.getAttribute("data-coursesessionid");
           
            let courseToUpdate = {
                "dwcrm_sessionstatus": 860150003,
            };
            
            // add async call to array
            deffereds.push(
                webapi.safeAjax({
                    type: "PATCH",
                    url: `/_api/hero_coursesessions(${courseSessionId})`,
                    contentType: "application/json",
                    data: JSON.stringify(courseToUpdate),
                    success: function (res) {
                        console.log(res);
                    },
                    error: function (xhr, status, error) {
                        console.error("Error in Web API Call:", xhr.responseText);
                    }
                })
            )
        }
    }

    // pass array of async calls to wait until thet will all finish
    Promise.allSettled(deffereds).then(
        function (results) {
            $.LoadingOverlay("hide");

            // array of errors
            let errors = [];

            results.forEach((result) => {
                if (result.status == "rejected") {
                    errors.push(result.reason.responseText);
                }
            });

            if (errors.length == 0) {
                showSuccessDialog();
            } else {
                showErrorDialog(errors);
            }
        });

}

function completeCourse(courseSessionId) {

    let loaderSvg = document.createElement("img");
    loaderSvg.src = "/loader.svg";

    let loaderWrapper = document.createElement("div");

    loaderWrapper.appendChild(loaderSvg);

    // show loading overlay
    $.LoadingOverlay("show", {
        image: "",
        custom: loaderWrapper
    })

    // simulate a 3s delay with timeout
    setTimeout(function () {
        let courseToUpdate = {
            "dwcrm_sessionstatus": 860150003,
        };

        // create new Course Session
        webapi.safeAjax({
            type: "PATCH",
            url: `/_api/hero_coursesessions(${courseSessionId})`,
            contentType: "application/json",
            data: JSON.stringify(courseToUpdate),
            success: function (res) {
                $.LoadingOverlay("hide");

                console.log(res);

                showSuccessDialog();
            },
            error: function (xhr, status, error) {
                $.LoadingOverlay("hide");
                showErrorDialog(xhr.responseText);
            }
        });
    }, 3000);
}

function createCompleteButton(currentRow, courseSessionId) {
    let completeBtn = document.createElement("button");

    completeBtn.className = "btn btn-primary";
    completeBtn.textContent = "Complete";

    // remove event listener added by web page itself
    $(completeBtn).off();

    if(courseSessionId) {
        completeBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            completeCourse(courseSessionId);
        });
    } else {
        // table header row
        completeBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            completeSelectedCourses();
        });
    }

    let btnWrapper = courseSessionId ? document.createElement("td") : document.createElement("th");

    btnWrapper.appendChild(completeBtn);

    currentRow.append(btnWrapper);
}

function createCheckBox(currentRow, courseSessionId) {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    // pass course id to checkbox so we can read it later
    checkbox.setAttribute('data-coursesessionid', courseSessionId);

    let checkBoxWrapper = courseSessionId ? document.createElement("td") : document.createElement("th");
    checkBoxWrapper.appendChild(checkbox);
    checkbox.className = "entity-list-checkbox";

    let firstTd = courseSessionId ? currentRow.find("td:eq(0)") : currentRow.find("th:eq(0)");
    firstTd.before(checkBoxWrapper);
}

$(document).ready(function () {
    $(".entitylist.entity-grid").on("loaded", function () {
        $(this).children(".view-grid").find("tr").each(function () {
            let currentRow = $(this);

            let courseSessionId = currentRow.data("id");

            createCompleteButton(currentRow, courseSessionId);

            createCheckBox(currentRow, courseSessionId);
        });
    });
});