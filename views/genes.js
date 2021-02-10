
function make_browser(browser, genes) {
    loader(1,"make_browser");
    browser=BrowserSearchWindow(browser);
    browser.transcripts.values.length = 0;
    browser.genes.values.length = 0;
    browser.utrs.values.length = 0;
    browser.cds.values.length = 0;
    browser.exons.values.length = 0;
    browser.views.values.length = 0;
    browser.location.values.length = 0; 
    browser.scrn_summaries.values.length = 0;
    browser.rnab_summaries.values.length = 0;
    var WindowSize=browser.search.gwin[1]-browser.search.gwin[0];
    var MinPosSize=Math.round(0.05*WindowSize);
    //console.log('MinPosSize',MinPosSize);
    if (genes) {
        min_track_count=40;
        genes.sort((a, b) => parseFloat(a.g38[0]) - parseFloat(b.g38[0]));
        var tracks=[[{'g0':0,'g1':0}]];
        var posCur=0;
        var trackCur=1;
        for (var g = 0; g < genes.length; g++) {
            var gene=genes[g];
            if (gene.g38[0]>gene.g38[1]){
                var a=gene.g38[0];
                gene.g38[0]=gene.g38[1];
                gene.g38[1]=a;
            }
            browser.views.values.push(gene.g38);
            browser.location.values.push(gene.g38);   
            var biotype=gene.biotype;         
            var chr = gene.chr; 
            chr = chr.replace("chr", "");
            var geneDir='+';    
            if ( "transcripts" in gene) {
                if (gene.transcripts[0]) {
                    if ("dir" in gene.transcripts[0]) {
                        geneDir=gene.transcripts[0].dir;
                    }                  
                }
            } else {                
                //console.log('No transcripts in', gene.gene);
                break;
            }                            
            gene.transcripts.sort((a, b) => parseFloat(b.g38[0]) - parseFloat(a.g38[0]));
            var inserted=false;
            for (t=0;t<tracks.length;++t) {
                var InsertGene=true;
                for (var j=0;j<tracks[t].length;++j) {
                    if (gene.g38[0]>tracks[t][j].g0 && gene.g38[0]<tracks[t][j].g1) { 
                        InsertGene=false;                        
                    }                                        
                }
                for (var zz=t;zz<=t+gene.transcripts.length+6;++zz) {
                    if (zz<tracks.length) {
                        for (var jz=0;jz<tracks[zz].length;++jz) {
                            if (gene.g38[0]>tracks[zz][jz].g0 && gene.g38[0]<tracks[zz][jz].g1) { 
                                InsertGene=false;                        
                            }                                        
                        }
                    } else {
                        break;
                    }                                                    
                }                   
                if (!InsertGene && t==tracks.length-1) {
                    tracks.push([{'g0':0,'g1':0}]);
                }
                if (InsertGene) {
                    for (var i = 0; i < gene.transcripts.length; i++) {                                                                                    
                        var g0=gene.transcripts[i].g38[0];
                        var gend=g0+Math.max(MinPosSize,Math.abs(gene.transcripts[i].g38[1]-gene.transcripts[i].g38[0]));
                        
                        if ( (t+i) > (tracks.length-1) ) {
                            tracks[i+t]=[{'g0':g0,'g1':gend}];
                        } else {
                            tracks[i+t][tracks[i+t].length]={'g0':g0,'g1':gend};
                        }
                        browser.transcripts.values.push({
                            "transcript_name": gene.transcripts[i].transcript_name,
                            "pos": (gene.transcripts[i].g38[1] - gene.transcripts[i].g38[0]) / 2 + gene.transcripts[i].g38[0],
                            "g": (gene.transcripts[i].g38[1] - gene.transcripts[i].g38[0]) / 2 + gene.transcripts[i].g38[0],
                            'g0':gene.transcripts[i].g38[0],
                            'g1':gene.transcripts[i].g38[1],
                            'gfp':gene.transcripts[i].g38[0],
                            'glp':gene.transcripts[i].g38[1],
                            'fp':gene.transcripts[i].pos38[0],
                            'lp':gene.transcripts[i].pos38[1],  
                            "exon_id": "Transcript",                                             
                            "chr": chr,  
                            "biotype": biotype,
                            "dir":gene.transcripts[i].dir,              
                            "transcript": gene.transcripts[i].transcript,
                            "track": t+i,
                            "gene": gene.gene
                        });
                        if (!!gene.transcripts[i].exons) {
                            for (var j = 0; j < gene.transcripts[i].exons.length; j++) {
                                browser.exons.values.push({
                                    "exon_id": "EXON",
                                    "biotype": biotype,
                                    'gfp':gene.transcripts[i].exons[j].g38[0],
                                    'g0':gene.transcripts[i].exons[j].g38[0],
                                    'g1':gene.transcripts[i].exons[j].g38[1],  
                                    'glp':gene.transcripts[i].exons[j].g38[1],
                                    'fp':gene.transcripts[i].exons[j].pos38[0],
                                    'lp':gene.transcripts[i].exons[j].pos38[1],                                     
                                    "chr": chr,"dir":geneDir, 
                                    "end_pos": gene.transcripts[i].exons[j].end_pos,
                                    "transcript": gene.transcripts[i].transcript,
                                    "track": t+i,
                                    "gene": gene.gene
                                });
                            }        
                        }
                        if (!!gene.transcripts[i].UTRS) {
                            for (var j = 0; j < gene.transcripts[i].UTRS.length; j++) {
                                browser.utrs.values.push({
                                    "exon_id": "UTR",
                                    "biotype": biotype,
                                    'gfp':gene.transcripts[i].UTRS[j].g38[0],
                                    'g0':gene.transcripts[i].UTRS[j].g38[0],
                                    'g1':gene.transcripts[i].UTRS[j].g38[1],  
                                    'glp':gene.transcripts[i].UTRS[j].g38[1],
                                    'fp':gene.transcripts[i].UTRS[j].pos38[0],
                                    'lp':gene.transcripts[i].UTRS[j].pos38[1],   
                                    "chr": chr,"dir":geneDir, 
                                    "transcript": gene.transcripts[i].transcript,
                                    "track": t+i,
                                    "gene": gene.gene
                                });
                            }
                        }
                        if (!!gene.transcripts[i].CDS) {
                            for (var j = 0; j < gene.transcripts[i].CDS.length; j++) {
                                if (!!gene.transcripts[i].CDS[j]) {
                                    browser.cds.values.push({
                                        'gfp':gene.transcripts[i].CDS[j].g38[0],
                                        "biotype": biotype,
                                        'g0':gene.transcripts[i].CDS[j].g38[0],
                                        'g1':gene.transcripts[i].CDS[j].g38[1], 
                                        'glp':gene.transcripts[i].CDS[j].g38[1],
                                        'fp':gene.transcripts[i].CDS[j].pos38[0],
                                        'lp':gene.transcripts[i].CDS[j].pos38[1],  
                                        "chr": chr,"dir":geneDir, 
                                        "exon_id": "CDS",  
                                        "transcript": gene.transcripts[i].transcript,
                                        "track": t+i,
                                        "gene": gene.gene
                                    });
                                }
                            }
                        }
                    }
                    var s=t+gene.transcripts.length;
                    if (gene.clusters_summaries) {
                        for (var n = 0; n < gene.clusters_summaries.length; n++) {
                            gene.clusters_summaries[n]['Annotation']=cluster_defs[gene.clusters_summaries[n]['cluster']];
                            gene.clusters_summaries[n]['g0']=gene.g38[0];
                            gene.clusters_summaries[n]['track']=s;
                            gene.clusters_summaries[n]['gene']=gene.gene;
                            browser.scrn_summaries.values.push( gene.clusters_summaries[n]);
                        }
                    }
                    if (gene.summaries_BulkRNA,gene.summaries_BulkRNA) {
                        //console.log('bulk rna summary found');
                        for (var o = 0; o < gene.summaries_BulkRNA.length; o++) {
                            gene.summaries_BulkRNA[o]['g0']=gene.g38[0];
                            gene.summaries_BulkRNA[o].track=s;
                            gene.summaries_BulkRNA[o]['gene']=gene.gene; 
                            browser.rnab_summaries.values.push( gene.summaries_BulkRNA[o]);
                        }
                    }
                    var gg0=gene.g38[0];
                    var ggend=gg0+Math.max(MinPosSize,Math.abs(gene.g38[1]-gene.g38[0]));
                    if (gene.clusters_summaries_BulkRNA||gene.summaries_BulkRNA) { 
                        for (x=0;x<=6;++x) {
                            if ( (t+gene.transcripts.length+x) > (tracks.length-1) ) {
                                tracks[t+gene.transcripts.length+x]=[{'g0':gg0,'g1':ggend}];
                            } else {
                                tracks[t+gene.transcripts.length+x][tracks[t+gene.transcripts.length+x].length]={'g0':gg0,'g1':ggend};
                            }                                    
                        }
                    }
                    t=5000; 
                }
            }
        }
    }
    loader(0,"done_make_browser");
    return browser;
}

var insert_API=function(result,name_values,url){    
    jQuery.ajax({
        type: 'GET',url: url,async: true,dataType: 'json',
        beforeSend: function beforeSend() {loader(1,'insert_API');},
        error: function error(xhr) {},
        complete: function complete() {loader(0,'jQuery');},
        success: function success(my_array) {            
            if (my_array.length>0) {
                browser.vgSpec.data[browser.vgSpec.data.findIndex(function(a) {return a.name == name_values;})].values=my_array;
                result.view.change(name_values, vega.changeset().remove(function () {return true;}).insert(my_array)).runAsync();
            }
            
        }
    });
};

var gpos_search=function(result,gene_url) {
    jQuery.ajax({
        type: 'GET',
        url: gene_url,
        async: true,
        dataType: 'json',
        beforeSend: function beforeSend() {loader(1,'gpos_search');},
        error: function error(xhr) {},
        complete: function complete() {loader(0,'gpos_search');},
        success: function success(Genes_array) {
            Genes_array = JSON.parse(itgz.decompressFromBase64(decodeURI(Genes_array.genepos)));
            browser = make_browser(browser, Genes_array); 
            browser.vgSpec.data[browser.vgSpec.data.findIndex(function(a) {return a.name == "geneDetail"})].values=browser.genes.values;
            browser.vgSpec.data[browser.vgSpec.data.findIndex(function(a) {return a.name == "exons"})].values=browser.exons.values;
            browser.vgSpec.data[browser.vgSpec.data.findIndex(function(a) {return a.name == "cds"})].values=browser.cds.values;
            browser.vgSpec.data[browser.vgSpec.data.findIndex(function(a) {return a.name == "utrs"})].values=browser.utrs.values;
            browser.vgSpec.data[browser.vgSpec.data.findIndex(function(a) {return a.name == "transcripts"})].values=browser.transcripts.values;
            browser.vgSpec.data[browser.vgSpec.data.findIndex(function(a) {return a.name == "RNAB_summary_values"})].values=browser.rnab_summaries.values;
            result.view.change('geneDetail', vega.changeset().insert(browser.genes.values).remove(function () {return true})).run();
            result.view.change('RNAB_summary_values', vega.changeset().insert(browser.rnab_summaries.values).remove(function () {return true})).run();
            result.view.change('exons', vega.changeset().insert(browser.exons.values).remove(function () {return true})).run();
            result.view.change('cds', vega.changeset().insert(browser.cds.values).remove(function () {return true})).run();
            result.view.change('utrs', vega.changeset().insert(browser.utrs.values).remove(function () {return true})).run();
            result.view.change('transcripts', vega.changeset().insert(browser.transcripts.values).remove(function () {return true})).run();
            return result.view.run();
        }
    });
};

var reformat_gene_description = function reformat_gene_description(genes) {
    var wordvalues = "";
    jQuery('#GeneLookup').show();
    jQuery("#gene_info").show();
    jQuery('#gene_name').empty();
    jQuery('#gene_name2').empty();
    jQuery('#gene_name3').empty();
    jQuery('#Gene_full_name').empty();
    jQuery('#Ensembl_gene').empty();
    jQuery('#Ensembl_gene_ref').empty();
    jQuery('#Gene_other_names').empty();
    jQuery('#chr').empty();
    jQuery('#Uniprot_ref').empty();
    jQuery('#Entrez_gene').empty();
    jQuery('#GeneLookup').empty();
    jQuery('#diseasemark').empty();
    jQuery('#transcript_list').empty();
    jQuery('#start_pos').empty();
    jQuery('#dir').empty();
    if (genes) {
        genes.genetext = true;
        if (genes.pubmed_text) {
            wordvalues = wordvalues + " " + genes.pubmed_text;            
        }
        if (genes.Disease_description) {wordvalues = wordvalues + " " + genes.Disease_description;}
        if (genes.ghrCondition) {wordvalues = wordvalues + " " + genes.ghrCondition;}
        if (genes.ghrFunction) {wordvalues = wordvalues + " " + genes.ghrFunction;}
        if (genes.refseq) {wordvalues = wordvalues + " " + genes.refseq;}
        if (genes.Pathway_ConsensusPathDB) {wordvalues = wordvalues + " " + genes.Pathway_ConsensusPathDB;}
        if (genes.GO_molecular_function) {wordvalues = wordvalues + " " + genes.GO_molecular_function;}
        if (genes.GO_cellular_component) {wordvalues = wordvalues + " " + genes.GO_cellular_component;}
        if (genes.cgdCondition) {wordvalues = wordvalues + " " + genes.cgdCondition;}
        if (genes.Pathway_KEGG_full) {wordvalues = wordvalues + " " + genes.Pathway_KEGG_full;}
        if (genes.Tissue_specificity_Uniprot) {wordvalues = wordvalues + " " + genes.Tissue_specificity_Uniprot;}
        if (genes.Trait_association_GWAS) {wordvalues = wordvalues + " " + genes.Trait_association_GWAS;}       
        if (genes.Function_description) {wordvalues = wordvalues + " " + genes.Function_description;}       
        if (genes.Function_description) {wordvalues = wordvalues + " " + genes.Function_description;}       
        if (genes.Gene_other_names) {
            var text = genes.Gene_other_names;
            text = text.replace(/\;/g, '<br>');
            genes.Gene_other_names = text;
            jQuery('#Gene_other_names').empty().append(genes.Gene_other_names);
        } else {
            jQuery('#Gene_other_names').parent('tr').hide();
        }
        if (genes.Gene_old_names) {
            var text = genes.Gene_old_names;
            text = text.replace(/\;/g, '<br>');
            genes.Gene_old_names = genes.Gene_old_names + ', ' + text;
            jQuery('#Gene_other_names').append(genes.Gene_old_names);
        }

        if (genes.transcripts) {
            jQuery("#transcript_list").append(genes.transcripts[0]['transcript']);
            jQuery.each(genes.transcripts, function (i, val) {
                if (i != 0) {
                    jQuery("#transcript_list").append('<br>' + genes.transcripts[i]['transcript']);
                }
            });
        }
    } else {
        genes = [];
        jQuery('#results').hide();
        genes.genetext = false;
        jQuery("#gene_info").hide();
        jQuery('#gene_name').empty().append('Data for ' +browser.search.gene+' is not available. Use HUGO gene names.');
        jQuery('#itg-wordcloud-parent').empty().hide();
        jQuery('#view_smartplot').empty().hide();
        jQuery('#GeneLookup').hide();
        return null;
    }
    delete genes._id;
    jQuery('#gene_name').empty().append(genes.gene);
    jQuery('#gene_name2').empty().append(genes.gene);
    jQuery('#gene_name3').empty().append(genes.gene);
    jQuery('#Gene_full_name').empty().append(genes.Gene_full_name);
    jQuery('#Ensembl_gene_ref').attr("href", "https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=" + genes.Ensembl_gene).append(genes.Ensembl_gene);
    if (genes.pos38) {
        if (genes.pos38.constructor === Array) {
            jQuery('#chr').empty().append('chr'+genes.chr+':'+genes.pos38[0] + '-' + genes.pos38[1]);
        }
    }
    jQuery('#Uniprot_ref').attr("href", "http://www.uniprot.org/uniprot/" + genes['Uniprot_acc']).append(genes['Uniprot_id']);
    jQuery('#Entrez_gene_ref').attr("href", "https://www.ncbi.nlm.nih.gov/gene/" + genes['gene']).append(genes.gene);
    wordvalues = wordvalues.replace(/[^A-Za-z]/g, ' ');
    genes.wordvalues = wordvalues; 

    if (wordvalues.match(/parkinson/i)) {
     //  jQuery('#show_diseaseInsert').css('display', 'inline-block');
    } else {
        jQuery('#show_diseaseInsert').css('display', 'none');
    }

    return genes;
};

var render_gene_wordcloud = function render_gene_wordcloud(vals) {
    loader(1,"render gene cloud");
    var vgSpec = JSON.parse(itg_decomp("<%=gene_wordcloud%>"));
    var newwidth = document.getElementById("itg-wordcloud-parent").offsetWidth - 10;
    if (newwidth < 205) {
        newwidth = setWidth();
    }
    var newheight = document.getElementById('firstcol').clientHeight - 15;
    vgSpec['marks'][0]['transform'][0]['size'][0] = newwidth;
    vgSpec['marks'][0]['transform'][0]['size'][1] = newheight;
    var wordcloud_view = new vega.View(vega.parse(vgSpec)).initialize('#gene_wordcloud');
    wordcloud_view.change('myvalues', vega.changeset().insert(vals)).width(newwidth).height(newheight).renderer('canvas').hover().run();
    jQuery(window).resize(function () {
        loader(1,'resize');
        wordcloud_view.resize().width(setWidth()).height(newheight).renderer('canvas').hover().run();
        loader(0,'resize');
    });
    loader(0,"done rendering wordcloud");
};


var get_gene = function get_gene(browser) {
    var query = window.location.search;
    if (browser.search.gene) {
        browser.search.gene = browser.search.gene.toUpperCase();
        //jQuery('#SC').show();
        jQuery("#gene").val("");
        jQuery('#gene').blur();
        window.location.replace("?gene=" + browser.search.gene+"#Genes"); 
        load_geneInfo(browser);
    }
    return(browser);
};

var load_geneInfo = function load_geneInfo(browser) {
    var geneview_signals=[        
    ];    
    var mygene = browser.search.gene;
    var gene_api_url = browser.global_api + "/gene/" + mygene;
    jQuery.ajax({
        'async': true,
        'crossDomain': true,
        'url': gene_api_url,
        beforeSend: function beforeSend() {loader(1,'geneInfo ajax start');},
        error: function error(xhr) {},
        complete: function complete() {loader(0,'geneinfo ajax end');},          
        "method": "GET",
        // "headers": browser.header,                                
        'dataType': "json",       
        'success': function success(data) {
            loader(1,'geneInfo just got data');
            data = JSON.parse(itgz.decompressFromBase64(decodeURI(data.gene))); 
            var Gene_array = reformat_gene_description(data);
            if (Gene_array) {
                if (Gene_array.genetext) {
                    browser.samples= data.samples_BulkRNA;
                    for (var g = 0; g < browser.samples.length; g++) {
                        browser.samples[g]['RNA Expression']=browser.samples[g]['BulkRNA_v0'];
                        browser.samples[g]['RNA Log(Expression)']=browser.samples[g]['BulkRNA_Log_v0'];
                    };

                    render_gene_wordcloud(Gene_array.wordvalues);
                    browser.search.genequery = browser.search.gene;
                    if ('chr' in Gene_array) {browser.search.chr = Gene_array.chr;}
                    if ('g38' in Gene_array) {
                      browser.g38=[Gene_array.g38[0],Gene_array.g38[1]];   
                    }
                    var cols=["RNA Expression","RNA Log(Expression)","BulkRNA_Log_v0","BulkRNA_v0","Age","Sex","Disease","Gene","Mutation","Pathology","Disease-Gene","Min pmd","pH"];
                    CrossCorrelate("expgraff","itg-browser-width",browser.samples,
                    [
                      {"name":"X_Axis","value":"Disease-Gene","bind":{"options":cols}},
                      {"name":"Y_Axis","value":"RNA Expression","bind":{"options":cols}},
                      {"name":"Facet_Cols_By","value":"None","bind":{"options":cols}},       
                      {"name":"Facet_Rows_By","value":"None","bind":{"options":cols}},       
                      {"name":"Color_By","value":"Disease-Gene","bind":{"options":cols}},    
                      {"name":"Filter_Out_From","value":"None","bind":{"options":cols}},       
                      {"name":"Filter_Additional","value":"None","bind":{"options":cols}},     
                      {"name":"graph_title","value":"Expression of "+mygene},
                      {"name":"Dash_Height","value":2},
                      {"name":"Palette","value":"tableau20"},
                      {"name":"Dash_Width","value":0.2},
                      {"name":"Dash_Radius","value":4},
                      {"name":"Max_Plot_Height","value":150},
                      {"name":"Max_Plot_Width","value":800},
                      {"name":"Opacity_","value":1},
                      {"name":"Xaxis_Height","value":120},
                      {"name":"Legend_Height","value":50},
                      {"name":"Jitter_","value":false},
                      {"name":"Violin_","value":false},
                      {"name":"Row_Header_Width","value":100},
                      {"name":"Dashes_","value":true},
                      {"name":"Feature_Size","value":30}    
                    ]
                  );  
                       
                    browser.loaded=false;
                    var newgenes=[{gene:data.gene,biotype:data.biotype,chr:data.chr,g38:data.g38,geneid:data.geneid,name:data.name,gpos:data.g38,pos38:data.pos38,t_index:data.t_index,transcripts:data.transcripts}];
                    browser=make_browser(browser,newgenes);                    
                    render_browser_full(browser);
                    jQuery("#Browser").show();
                    jQuery("#gene").val(browser.search.gene);
                    
                }
            }
            loader(0,'done with just got data');
        }
    });
    return browser;
};

var effect = function(i) {
    jQuery( "#wait" ).css("color","#660000");
    jQuery( "#wait" ).append("...Please wait...");
    return jQuery( i ).fadeTo(1000*1,0.5).delay( 1200 );    
};

jQuery( "#clickexcel" ).on( "click", function() {
  jQuery.when( effect("#gene_expression_table2") ).done(function() {
    jQuery("button.dt-button.buttons-excel.buttons-html5").click();
    jQuery( "#wait" ).css("color","black");
    jQuery( "#wait" ).append("Finished.");
    jQuery( "#gene_expression_table2" ).fadeTo(1000,1);  
  });
});
