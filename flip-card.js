$(document).ready(function() {

    let mouseLeaveFlag = true;
    const FADE_TIME = 500;

    $(".back a").hide();

    $("#card").bind("click", function() {
        toggleMouseLeaveFlag();
        $("#card").toggleClass('flipped');
        $(".front a").fadeToggle(FADE_TIME);
        $(".back a").fadeToggle(FADE_TIME);
        setTimeout(toggleMouseLeaveFlag, FADE_TIME);
    }).bind("mouseleave", function() {
        if (mouseLeaveFlag) {
            $("#card").removeClass('flipped');
            $(".front a").fadeIn(FADE_TIME);
            $(".back a").fadeOut(FADE_TIME);
        }
    });

    function toggleMouseLeaveFlag() {
        mouseLeaveFlag = !mouseLeaveFlag;
    }
});
