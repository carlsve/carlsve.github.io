$(document).ready(function() {

    $(".back a").hide();

    $("#card").bind("click", function() {
        $("#card").toggleClass('flipped');
        $(".front a").fadeToggle(1000);

        $(".back a").fadeToggle(1000);
    });
});
