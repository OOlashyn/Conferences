$(document).ready(function(){
    // code to run on entity list load here
    $(".entity-grid.subgrid").on("loaded", function () {
        console.log("loaded");
        $(this).children(".view-grid").find("tr").each(function (i, e){
           var tableRow = $(this);
           console.log("tableRow", tableRow);
        });
     });
});