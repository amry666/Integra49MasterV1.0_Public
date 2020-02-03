$(function() {

    var newHash      = "",
        $mainContent = $("#main-content"),
        $pageWrap = $("#page-wrapper"),
        baseHeight   = 0,
        $el;
        
    $pageWrap.height($pageWrap.height());
    baseHeight = $pageWrap.height() - $mainContent.height();
    
    $(".user-pro").nextAll().delegate("a", "click", function() {
        window.location.hash = $(this).attr("href");
        return false;
    });
    
    $(window).bind('hashchange', function(){
    
        newHash = window.location.hash.substring(1);
        //console.log('../Views/'+newHash);
        if (newHash) {
            $mainContent
                .find("#guts")
                .fadeOut(200, function() {
                    $mainContent.hide().load('../Views/' +newHash + " #guts", function() {
                        $mainContent.fadeIn(200, function() {
                            $pageWrap.animate({
                                height: baseHeight + $mainContent.height() + "px"
                            });
                        });
                        $(".user-pro").nextAll().find("a").removeClass("current");
                        $(".user-pro").nextAll().find('a[href="'+newHash+'"]').addClass("current");
                    });
                });
        };
        
    });
    
    $(window).trigger('hashchange');

});