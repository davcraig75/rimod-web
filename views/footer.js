var accordion = function () {
    var $accordion = jQuery('.jsa');
    var $accordion_header = $accordion.find('.jsa-header');
    var $accordion_item = jQuery('.jsa-item'); // default settings 
    var settings = {
        speed: 400,
        oneOpen: true
    };
    return {
        // pass configurable object literal
        init: function init($settings) {
            $accordion_header.on('click', function () {
                accordion.toggle($(this));
            });
            $.extend(settings, $settings); // ensure only one accordion is active if oneOpen is true
            
            jQuery('.jsa-item.active').find('> .jsa-body').show();
        },
        toggle: function toggle($this) {
            //if (settings.oneOpen && $this[0] != $this.closest('.jsa').find('> .jsa-item.active > .jsa-header')[0]) {
                $this.closest('.jsa').find('> .jsa-item').removeClass('active').find('.jsa-body').slideUp();
            //} // show/hide the clicked accordion item
            $this.closest('.jsa-item').toggleClass('active');
            $this.next().stop().slideToggle(settings.speed);
        }
    };
}();

var pages=['#Home','#Genes',"#Browser"];
var parents={
    "#Rnaseq":"#Rnaseq",
    '#Home':"#Home",
    '#Foundinpd':'#Home',
    '#Genes':"#Genes",
    "#Browser":"#Browser"
};

var menufunction=function(selected) {
    
    browser.selected=selected;    
    Object.keys(parents).forEach(function (key) {
        if (selected!= key){
            jQuery(key+'Button').removeClass('active');
            jQuery(key).hide();
        }
     });
     jQuery(selected+'Button').addClass('active');
     jQuery(parents[selected]+'Button').addClass('active');
     jQuery(selected).show();
     if (selected=="#Genes") {
         jQuery("#Browser").show();  
         jQuery("#ExpressionButton").addClass('active');
         jQuery('#ExpressionBody').show();
     }
};

var readurl=function() {
    loader(1,"redurl");
    var url_hash = window.location.hash.substr();
    var found=0;
    jQuery.each(parents, function( index, value ) {
        if (url_hash == value) {
            
            menufunction(value);
            found=1;
        }
    });
    if (found==0) {menufunction("#Home");}
    var url_search = window.location.search.substr();
    if (url_hash == "#Genes" || url_hash == "#Browser") {
        
        if (window.location.search.indexOf("?gene=") > -1) {
            var res = window.location.search.split("?gene=");
            if (typeof res[1]) {            
                browser.search.gene=res[1];
                window.location.replace("?gene=" + browser.search.gene+"#Genes");
                //jQuery("#gene").val(browser.search.gene);
                browser=get_gene(browser);               
                menufunction('#Genes');
            }
        } else if (window.location.search.indexOf("?coord=") > -1) {
            var textfield=window.location.search;
            var urlPattern=/\?coord=(chr)*(.*?):(.*?)-(.*)/;
            var matches=textfield.match(urlPattern);
            //console.log(matches);
            if (matches[2] in chrgpos) {
                var g0=chrgpos[matches[2]]+Number(matches[3]);
                var g1=chrgpos[matches[2]]+Number(matches[4]);
                browser.search.chr =matches[2];
                var range = (g1 - g0);
                browser.search.g38 = [g0 - round(range*0.2),g1+ round(range*0.2)];
                browser.window.g38 = [g0 - round(range*2.2),g1+ round(range*2.2)];
                browser.g38=[g0,g1];  
                //console.log(browser); 
                browser=render_browser_full(browser);

                menufunction('#Browser');
            }
        }else if (window.location.search.indexOf("?dbsnp=") > -1) {
            var snpsearch=window.location.search.toUpperCase();
            var rsPattern=/(RS[0-9]*)/;
            var dbmatch=snpsearch.match(rsPattern);
            browser.search.value=dbmatch[1]               
            get_snp(browser.search.value);
            browser=render_browser_full(browser);
            menufunction('#Browser');
        }else {
            browser.search.value="rs356129";
            get_snp(browser.search.value);
        }
    }
    loader(0,"read url end");
};

function cincludes(container, value) {
    var returnValue = false;
    var pos = container.indexOf(value);
    if (pos >= 0) {
        returnValue = true;
    }
    return returnValue;
}

var pathname = window.location.search;

accordion.init({
    speed: 300,
    oneOpen: true
});   

jQuery.each(pages, function( index, value ) {
    var aval=value+'Button';
    jQuery(value+'Button').on('click', function () {
        var myclickedbutton = "#"+jQuery(this).attr('id');
        var mypage = myclickedbutton.replace("Button", "");
        jQuery(mypage).hide();
        menufunction(mypage);
        window.location.replace(mypage);
    });           
});


jQuery.fn.scrollView = function () {
    return this.each(function () {
        jQuery('html, body').animate({
            scrollTop: jQuery(this).offset().top
        }, 0);
    });
};

jQuery("#gene").on("keypress", function (e) {
    if (e.which == 13) {
        var textfield=jQuery("#gene").val().toUpperCase();
        //console.log(textfield);
        var urlPattern=/CHR(.*?):(.*?)-(.*)/;
        var rsPattern=/RS([0-9]*)/;
        var genePattern=/,?([a-zA-Z][a-zA-Z0-9-]*),?/g;
        //console.log('genePattern',genePattern,'textfield',textfield);
        
        //console.log(matches);
        if (urlPattern.test(textfield)) {
            
            var matches=textfield.match(urlPattern);
            //console.log('matches chr',matches);
            if (matches.length>=2) {
                if (matches[1] in chrgpos) {
                    var g0=chrgpos[matches[1]]+Number(matches[2]);
                    var g1=chrgpos[matches[1]]+Number(matches[3]);
                    browser.search.chr =matches[1];
                    var range = (g1 - g0)+1000;                    
                    browser.search.g38 = [g0 - round(range*0.2),g1+ round(range*0.2)];
                    //console.log('found',browser.search.g38 );
                    browser.window.g38 = [g0 - round(range*2.2),g1+ round(range*2.2)];
                    browser.g38=[g0,g1];  
                    menufunction('#Browser');
                }
            }
        } else if (rsPattern.test(textfield)) {
                var dbmatch=textfield.match(rsPattern);
                //console.log('dbmatch',dbmatch);
                browser.search.value=dbmatch[1];                
                get_snp(browser.search.value);
                menufunction('#Browser');
       // } else if (genePattern.test(textfield)) {
       //         var genes=textfield.match(genePattern);
       //         console.log('mygenes',genes);
       //         get_genes(genes);
                //menufunction('#Genes');
        }    else {
            //console.log('no match'+textfield);
            browser.search.value=textfield;
            browser.search.gene=browser.search.value;
            browser=get_gene(browser);
            menufunction('#Genes');
        }
    }
});    
readurl();
//window.onhashchange = function() { 
//    readurl();
//    console.log('location changed!');
//};

