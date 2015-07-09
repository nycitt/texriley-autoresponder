/*
 Client: textriley.com
 Developer: Jeffrey Valdehueza (www.dyeprey.com)
 Date: 07.10.2015
 */

var AppMaster = {

    prettyPhoto : function () {
        $("a[rel^='prettyPhoto']").prettyPhoto();
    },

    ButtonTriggers : function() {
        $('#btn-1').on('click', function(){
            console.log('#btn-1');
        });
    }

};


(function ($) {

    AppMaster.prettyPhoto();
    AppMaster.ButtonTriggers();

})(jQuery);
