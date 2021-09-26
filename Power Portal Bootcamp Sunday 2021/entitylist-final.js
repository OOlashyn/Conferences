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

function attendSelectedCourses() {
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
            const courseId = checkBox.getAttribute("data-courseid");
           
            console.log("courseId", courseId);

            let courseToCreate = {
                "hero_Course@odata.bind": `/hero_courses(${courseId})`,
                "hero_enddate": "2021-06-08",
                "hero_startdate": "2021-06-01",
                "hero_Student@odata.bind": `/contacts(${userId})`
            };
            
            // add async call to array
            deffereds.push(
                webapi.safeAjax({
                    type: "POST",
                    url: "/_api/hero_coursesessions",
                    contentType: "application/json",
                    data: JSON.stringify(courseToCreate),
                    success: function (res, status, xhr) {
                        //print id of newly created entity record
                        console.log("entityID: " + xhr.getResponseHeader("entityid"));
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

function attendCourse(courseId) {

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
        let courseSessionToCreate = {
            "hero_Course@odata.bind": `/hero_courses(${courseId})`,
            "hero_enddate": "2021-06-08",
            "hero_startdate": "2021-06-01",
            "hero_Student@odata.bind": `/contacts(${userId})`
        };

        // create new Course Session
        webapi.safeAjax({
            type: "POST",
            url: "/_api/hero_coursesessions",
            contentType: "application/json",
            data: JSON.stringify(courseSessionToCreate),
            success: function (res, status, xhr) {
                $.LoadingOverlay("hide");

                //print id of newly created entity record
                console.log("entityID: " + xhr.getResponseHeader("entityid"));

                showSuccessDialog();
            },
            error: function (xhr, status, error) {
                $.LoadingOverlay("hide");
                showErrorDialog(xhr.responseText);
            }
        });
    }, 3000);
}

function attendExtendedCourse(courseId) {

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
        let courseSessionToCreate = {
            "hero_Course@odata.bind": `/hero_courses(${courseId})`,
            "hero_enddate": "2021-06-08",
            "hero_startdate": "2021-06-01",
            "hero_Student@odata.bind": `/contacts(${userId})`,
            "hero_coursesession_task_coursesession_her" : [
                {
                    "hero_name": "Task For Extended Course"
                },
                {
                    "hero_name": "Additional Task For Extended Course"
                }
            ]
        };

        // create new Course Session
        webapi.safeAjax({
            type: "POST",
            url: "/_api/hero_coursesessions",
            contentType: "application/json",
            data: JSON.stringify(courseSessionToCreate),
            success: function (res, status, xhr) {
                $.LoadingOverlay("hide");

                //print id of newly created entity record
                console.log("entityID: " + xhr.getResponseHeader("entityid"));

                showSuccessDialog();
            },
            error: function (xhr, status, error) {
                $.LoadingOverlay("hide");
                showErrorDialog(xhr.responseText);
            }
        });
    }, 3000);
}

function createAttendButton(currentRow, courseId) {
    let attendBtn = document.createElement("button");

    attendBtn.className = "btn btn-primary";
    attendBtn.textContent = "Attend";

    // remove event listener added by web page itself
    $(attendBtn).off();

    if(courseId) {
        attendBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            attendCourse(courseId);
        });
    } else {
        // table header row
        attendBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            attendSelectedCourses();
        });
    }

    let btnWrapper = courseId ? document.createElement("td") : document.createElement("th");

    btnWrapper.appendChild(attendBtn);

    currentRow.append(btnWrapper);
}

function createAttendExtendedButton(currentRow, courseId) {
    let attendBtn = document.createElement("button");

    attendBtn.className = "btn btn-info";
    attendBtn.textContent = "Extended";

    // remove event listener added by web page itself
    $(attendBtn).off();

    if(courseId) {
        attendBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            attendExtendedCourse(courseId);
        });
    } else {
        // table header row
        attendBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            attendSelectedCourses();
        });
    }

    let btnWrapper = courseId ? document.createElement("td") : document.createElement("th");

    btnWrapper.appendChild(attendBtn);

    currentRow.append(btnWrapper);
}

function createCheckBox(currentRow, courseId) {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    // pass course id to checkbox so we can read it later
    checkbox.setAttribute('data-courseid', courseId);

    let checkBoxWrapper = courseId ? document.createElement("td") : document.createElement("th");
    checkBoxWrapper.appendChild(checkbox);
    checkbox.className = "entity-list-checkbox";

    let firstTd = courseId ? currentRow.find("td:eq(0)") : currentRow.find("th:eq(0)");
    firstTd.before(checkBoxWrapper);
}

$(document).ready(function () {
    $(".entitylist.entity-grid").on("loaded", function () {
        $(this).children(".view-grid").find("tr").each(function () {
            let currentRow = $(this);

            let courseId = currentRow.data("id");

            createAttendButton(currentRow, courseId);

            createAttendExtendedButton(currentRow, courseId);

            createCheckBox(currentRow, courseId);
        });
    });
});