var BrowserSearchWindow=function(browser) {    
    var range = (browser.g38[1] - browser.g38[0]);
    browser.search.chr =browser.chr.replace("chr", "");
    browser.search.gwin = [browser.g38[0] - round(range*3),browser.g38[1] + round(range*3)];
    browser.search.g38 = [browser.g38[0]- round(range*0.3),browser.g38[1]+ round(range*0.3)];
    browser.vgSpec.signals[Index(browser.vgSpec.signals, "gdom")].update = "[" + browser.search.g38[0] +"," +round(browser.search.g38[1])+"]";
    browser.vgSpec.signals[Index(browser.vgSpec.signals, "gwin")].update = "[" + browser.search.gwin[0] +"," +round(browser.search.gwin[1])+"]";
    
    return(browser);
};

function pulls (result,browser) {
    loader(1,"pulls");
    gpos_search(result,browser.global_api + '/genePos/first_pos/' + browser.search.gwin[0] + '/last_pos/' + browser.search.gwin[1]);
    insert_API(result,'cage_summary_values',browser.global_api + '/cage_summary/g0/' + browser.search.gwin[0]+ '/g1/' + browser.search.gwin[1]);
    //insert_API(result,'meth_summary_values',browser.global_api + '/meth_summary/g0/' + browser.search.gwin[0]+ '/g1/' + browser.search.gwin[1]);
    insert_API(result,'meth_summary_values',browser.global_api + '/meth_summary/g0/' + browser.search.gwin[0]+ '/g1/' + browser.search.gwin[1]);
    if (browser.vgSpec.signals[browser.vgSpec.signals.findIndex(function(a) {return a.name == 'meth_show_individual';})].value==true) {
        insert_API(result,'meth_values',browser.global_api + '/meth/g0/' + browser.search.gwin[0]+ '/g1/' + browser.search.gwin[1]);
    }
    loader(0,"pnoulls");
}

function render_browser_full(browser) {    
    browser=BrowserSearchWindow(browser);
    var range = (browser.g38[1] - browser.g38[0]);
    var res=range>10000000?10000000:range>1000000?1000000:range>100000?100000:range>10000?10000:range>1000?1000:1
    browser.res=res;
    //jQuery("#browser_accordian").addClass('active');
    //jQuery("#browser_accordian > div.accd-body.jsa-body").show();    
    var selectedIndex=Index(browser.vgSpec.signals, "selected");
    browser.vgSpec.signals[selectedIndex].update = "{'gene':'" + browser.search.gene+"'}";
    loader(1,"render browser");
    vegaEmbed("#foundinpd_browser_window", browser.vgSpec, {
            renderer: 'canvas',
            width: setWidth("menu"),
            tooltip: true,
            actions: {
                export: true,
                source: false,
                editor: false,
                scaleFactor: 2
            }
    }).then(function (result) {
        loader(1,"in middle of browser");
        browser.loaded = true;
        browser.lastCall = 0;
        pulls(result,browser);
        result.view.addSignalListener('trigger_load', function (name, value) {

            var m=value.match(/\"res\":\"(.*)\"/);

            if (/neg/i.test(value) ) {
            
                    browser.g38=result.view.signal('gdom');
                    browser=BrowserSearchWindow(browser);
                    pulls(result,browser);
                    browser.res=m[1];
                    result.view.signal('sgdom',browser.search.gwin).runAsync();                    
            } else if (m!=browser.res) {  
                
                browser.g38=result.view.signal('gdom');
                browser=BrowserSearchWindow(browser);
                pulls(result,browser);
                browser.res=m[1];
                result.view.signal('sgdom',browser.search.gwin).runAsync();                    
            }     
        });
        result.view.addSignalListener('user_click', function (name, value) {
            if (value.constructor === Object) {
                
                if (/Show_Individual_METH/i.test(value.e)) {
                    if (/Show/i.test(value.v)) {
                        result.view.signal('meth_show_individual',true);
                        insert_API(result,'meth_values',browser.global_api + '/meth/g0/' + browser.search.gwin[0]+ '/g1/' + browser.search.gwin[1]);
                    } else if (/Hide/i.test(value.v)) {
                        result.view.signal('meth_show_individual',false);
                        insert_API(result,'meth_values',browser.global_api + '/meth/g0/0/g1/0');
                    }
                }
                if (/Show_Individual_CAGE/i.test(value.e)) {
                    if (/Show/i.test(value.v)) {
                        result.view.signal('cage_show_individual',true);
                        insert_API(result,'cage_values',browser.global_api + '/cage/g0/' + browser.search.gwin[0]+ '/g1/' + browser.search.gwin[1]);
                        //insert_API(result,'atac_bed_values',browser.global_api + '/atac_bed/g0/' + browser.search.gwin[0]+ '/g1/' + browser.search.gwin[1]);
                    } else if (/Hide/i.test(value.v)) {
                        result.view.signal('cage_show_individual',false);            
                        insert_API(result,'cage_values',browser.global_api + '/cage/g0/0/g1/0');
                        //insert_API(result,'atac_bed_values',browser.global_api + '/atac_bed/g0/0/g1/0');
                    }
                }               
            }
        });
        jQuery(window).resize(function () {
            result.view.resize().width(setWidth("menu")).renderer('canvas').hover().run();
        });
        loader(0, "done with that"); 
        return result.view.run();    
                         
    }).catch(console.error);
    loader(0,"done rendering browser");
}   
