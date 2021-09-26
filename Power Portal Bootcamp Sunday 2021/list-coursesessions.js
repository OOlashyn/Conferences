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

function createDeleteButton(currentRow, courseSessionId) {
    if(courseSessionId) {
        let attendBtn = document.createElement("button");

        attendBtn.className = "btn btn-danger";
        attendBtn.textContent = "Delete";
    
        // remove event listener added by web page itself
        $(attendBtn).off();

        attendBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            deleteCourseSession(courseSessionId);
        });

        let btnWrapper = document.createElement("td");

        btnWrapper.appendChild(attendBtn);
    
        currentRow.append(btnWrapper);
    }
}

async function deleteCourseSession(courseSessionId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

    if(result.isConfirmed){
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
            // create new Course Session
            webapi.safeAjax({
                type: "DELETE",
                url: `/_api/hero_coursesessions(${courseSessionId})/hero_Student/$ref`,
                contentType: "application/json",
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
}

function createEditButton(currentRow, courseSessionId) {
    if(courseSessionId) {
        let attendBtn = document.createElement("button");

        attendBtn.className = "btn btn-primary";
        attendBtn.textContent = "Comment";
    
        // remove event listener added by web page itself
        $(attendBtn).off();

        attendBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            editCourseSession(courseSessionId);
        });

        let btnWrapper = document.createElement("td");

        btnWrapper.appendChild(attendBtn);
    
        currentRow.append(btnWrapper);
    }
}

async function editCourseSession(courseSessionId) {

    const { value: comment } = await Swal.fire({
        title: 'Add comment',
        input: 'text',
        inputLabel: 'Your comment',
        showCancelButton: true,
      })

      if (comment) {
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
            let courseSessionToUpdate = {
                "value": comment
            };
    
            // create new Course Session
            webapi.safeAjax({
                type: "PUT",
                url: `/_api/hero_coursesessions(${courseSessionId})/hero_comment`,
                contentType: "application/json",
                data: JSON.stringify(courseSessionToUpdate),
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
}

$(document).ready(function () {
    $(".entitylist.entity-grid").on("loaded", function () {
        $(this).children(".view-grid").find("tr").each(function () {
            let currentRow = $(this);

            let courseSessionId = currentRow.data("id");

            createEditButton(currentRow, courseSessionId);

            createDeleteButton(currentRow, courseSessionId);
        });
    });
});