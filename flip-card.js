$(document).ready(function() {

    let mouseLeaveFlag = true;
    const FADE_TIME = 500;

    $(".back").hide();

    $("#card").bind("click", function() {
        toggleMouseLeaveFlag();
        $("#card").toggleClass('flipped');
        $(".front").fadeToggle(FADE_TIME);
        $(".back").fadeToggle(FADE_TIME);
        setTimeout(toggleMouseLeaveFlag, 2*FADE_TIME);
    }).bind("mouseleave", function() {
        if (mouseLeaveFlag) {
            $("#card").removeClass('flipped');
            $(".front").fadeIn(FADE_TIME);
            $(".back").fadeOut(FADE_TIME);
        }
    });

    function toggleMouseLeaveFlag() {
        mouseLeaveFlag = !mouseLeaveFlag;
    }
});
