// Simple Functions
var capitalizeFirstLetter = function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

var titleCase = function titleCase(str) {
  return str.replace(/\w\S/g, function (t) {
      return t.toUpperCase();
  });
};

var delete_row = function delete_row(e) {
  e.parentNode.parentNode.parentNode.removeChild(e.parentNode.parentNode);
};

var round = function (value, exp) {
  if (typeof exp === 'undefined' || +exp === 0) return Math.round(value);
  value = +value;
  exp = +exp;
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) return NaN;
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] + exp : exp)));
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp));
};

var chrgpos={'1':0,'2':250000000,'3':495000000,'4':695000000,'5':890000000,'6':1075000000,'7':1250000000,'8':1412000000,'9':1560000000,'10':1700000000,'11':1835000000,'12':1972000000,'13':2107000000,'14':2223000000,'15':2333000000,'16':2438000000,'17':2533000000,'18':2618000000,'19':2700000000,'20':2760000000,'21':2826000000,'22':2876000000,'X':2928000000,'Y':3088000000,'M':3148000000};
  
var browser = {
    'vgSpec': JSON.parse(itg_decomp("<%=genomebrowser%>")),
    'header': {},
    'genenames': null,
    'table_render':false,
    'loaded': false,
    'LoadState': 0,
    'chr': 'chr1',
    'pos38':[-1,-1],
    'g38':[1,3200000000],
    'genetext': false,
    'state': [0, 0, 0],
    'gwas': [],
    'throttle':500,
    'eqtl': [],
    'samples': [],
    'gene_anchors':{"values":[]},
    'rnab_summaries':{"values":[]},
    'scrn_summaries':{"values":[]},
    'transcripts': {
        "values": []
    },
    'exons': {
        "values": []
    },
    'genes': {
        "values": []
    },
    'utrs': {
        "values": []
    },
    'cds': {
        "values": []
    },
    'junctions': {
        "values": []
    },
    "views": {
        "values": [1,320000000]
    },
    "location": {
        "values": [{
            "chr": "Un",
            "pos": 300000000,
            'pos38':[-1,-1],
            'g38':[-1,-1],
            "gene": "Un"
        }]
    },
    "global_api": global_api,
    'window': {g38:[1,3200000000]},
    'search': {
        
        'pos38':[89000000,89100000],
        'g38':[1,3200000000],
        
        'toLoad': true,
        'gene': "none",
        'chr': "none",
        'buffer': 1000000,
        'left': 89000000,
        'right': 89100000,
        'pleft': 8,
        'pright': 8
    }
};

var cluster_defs={"c0":"Astrocytes,EpendymalCells,ConnectiveTissue,Niche_Astrocytes_2,FloorPlateProgenitors,Niche_Astrocytes_1,Unknown_Neurons_2,NeuroepithelialCells,SerotoninergicNeurons,ChoroidPlexus,NPCs",
"c1":"ConnectiveTissue,Niche_Astrocytes_1,Unknown_Neurons_2,ChoroidPlexus,Astrocytes,SerotoninergicNeurons,ImmatureNeurons ,MuscleCells,Niche_Astrocytes_2,NeuroepithelialCells,FloorPlateProgenitors,NPCs,EpendymalCells",
"c2":"ImmatureNeurons ,Unknown_Neurons_1,Unknown_Neurons_2,DopaminergicNeurons,Niche_Astrocytes_1,NPCs,Niche_Astrocytes_2,SerotoninergicNeurons",
"c3":"DopaminergicNeurons,Unknown_Neurons_1,Unknown_Neurons_2,ImmatureNeurons ,Astrocytes,FloorPlateProgenitors,SerotoninergicNeurons",
"c4":"SerotoninergicNeurons,NPCs,Unknown_Neurons_2,DopaminergicNeurons,ImmatureNeurons ,NeuroepithelialCells,FloorPlateProgenitors,Unknown_Neurons_1,Astrocytes,ConnectiveTissue,Niche_Astrocytes_1,ChoroidPlexus",
"c5":"Astrocytes,EpendymalCells,NPCs,Unknown_Neurons_2,Niche_Astrocytes_1,ImmatureNeurons ,FloorPlateProgenitors,Niche_Astrocytes_2,ConnectiveTissue,NeuroepithelialCells",
"c6":"FloorPlateProgenitors,ImmatureNeurons ,Astrocytes,ConnectiveTissue,Niche_Astrocytes_1,EpendymalCells",
"c7":"Niche_Astrocytes_2,Unknown_Neurons_2,Niche_Astrocytes_1,Astrocytes,SerotoninergicNeurons,ImmatureNeurons ,ConnectiveTissue",
"c8":"NeuroepithelialCells,Unknown_Neurons_2,Astrocytes,ConnectiveTissue,ChoroidPlexus,Niche_Astrocytes_1",
"c9":"EpendymalCells,ChoroidPlexus,DopaminergicNeurons,Niche_Astrocytes_1,Astrocytes,NeuroepithelialCells",
"c10":"Unknown_Neurons_2,ConnectiveTissue,Astrocytes,SerotoninergicNeurons"};

var theme = {};
var Index = function Index(items, name) {
  var index = -1;    
  for (var i = 0; i < items.length; ++i) {
    if (items[i].name == name) {
      index = i;
      break;
    }
  }
  return index;
};


var setWidth = function setWidth(id) {
  var w = jQuery('#'+id).width();
  if (w==null || w<200) {w=jQuery('#itg-master-width').width();}
  if (w==null || w<200) {w=jQuery('#Home').width();}
  if (w==null || w<200) {w=jQuery('#Genes').width();}
  return w;
};

var setHeight = function setHeight() {
  var w = window.innerHeight;
  return w;
};

function toggle(id) {
  var x = document.getElementById(id);
  if (x.style.display === "none") {
    x.style.display = "block";
    document.getElementById("graph_button").innerHTML="View Graph";
  } else {
    x.style.display = "none";
    document.getElementById("graph_button").innerHTML="View Data";
  }
}



var loadData = function loadData(data) {
  jQuery("#gene").easyAutocomplete({
    data: data,
    getValue: "gene",
    list: {
      match: {
        enabled: true
      }
    },
    template: {
      type: "custom",
      method: function method(value, item) {
        return "<a href=#Gene?gene=" + item.gene + ">" + value + "</a>";
      }
    },
    theme: "square"
  });
};




var embed_vega = function embed_vega(vgspec, vgsignals, data, element, tooltips) {
    loader(1,'embed_vega start');
    var sdata=JSON.stringify(data);
    data=JSON.parse(sdata);
    var vgSpec = JSON.parse(JSON.stringify(vgspec)); 
    if (vgsignals != null) {
        var vgSignals = JSON.parse(JSON.stringify(vgsignals));
        for (var j in vgsignals) {
            var i = Index(vgSpec.signals, vgsignals[j].name);
            vgSpec.signals[i].value = vgsignals[j].value;
            vgSpec.signals[i].bind = vgsignals[j].bind;
        }
    }
    if (data != null) {
        vgSpec.data[Index(vgSpec.data, "mydata")].values = data;
    }
    vegaEmbed(element, vgSpec, {
        renderer: 'canvas',
        width: setWidth(),
        height: setHeight(),
        actions: {
            export: true,
            source: true,
            editor: true,
            editorURL:"https://itg.usc.edu/editor",
            scaleFactor: 1
        },
        config: theme,
        defaultStyle: true,
        tooltip: tooltips
    }).then(function (result) {
        loader(1,'start embed embed vega');
        jQuery(window).resize(function () {
            result.view.resize().width(setWidth()).height(setHeight()).run();
        });
        loader(0,'end vega embed vega');
    }).catch(console.error);
    loader(0,'end draw vega');
};



function displayWindowSize(){
  var a=setHeight();
  if (a>600) {
    document.getElementById('sciframe').setAttribute("height",a-200+"px");
  } else {
    document.getElementById('sciframe').setAttribute("height",600-200+"px");
  }
}

