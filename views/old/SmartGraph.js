function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

var initAndListen=function initAndListen(listener,id,result) {
  if(result.view.signal(listener)==true) {
      document.getElementById(id).style.display = "block";                
  } else {
      document.getElementById(id).style.display = "none";    
  }
  result.view.addSignalListener(listener, function (name, value) {
      if(value) {
          document.getElementById(id).style.display = "block";                
      } else {
          document.getElementById(id).style.display = "none";                
      }
  });
};

var SmartGraph=function SmartGraph(element,widthid,data,new_signals) {  
    var element_node=document.getElementById(element);
    var mysmarthtml=itg_decomp("<%=smartplothtml%>");
    var smartplot_spec = itg_decomp("<%=smartplot%>");
    loader(1,'Smart_Graph_start');
    var mymax=110; 
    var mysmarthtmlRes=mysmarthtml.replace(/\-itgnm/g, element);
    element_node.innerHTML=mysmarthtmlRes;
    var myspecStr=JSON.parse(JSON.stringify(smartplot_spec)); 
    var res = myspecStr.replace(/\-itgnm/g, element);
    var spec=JSON.parse(res);
    var new_signalsString=JSON.stringify(new_signals);  
    
    if (new_signalsString != null) {
        repSignalsJson=JSON.parse(new_signalsString.replace(/\-itgnm/g, element));
        for (var i in repSignalsJson) {
            var index = Index(spec.signals, repSignalsJson[i].name);
            spec.signals[index].value = repSignalsJson[i].value;
            if (repSignalsJson[i].bind != null) {
                if(repSignalsJson[i].bind.element != null) {
                    spec.signals[index].bind.element = repSignalsJson[i].bind.element;
                }
                if(repSignalsJson[i].bind.options != null) {
                  var headers=repSignalsJson[i].bind.options;
                  var finalheaders=[];
                  headers.forEach(function(element){
                      
                    var distinct =[...new Set(data.map(x =>x[element]))];
                    var ln=distinct.length;                    
                    if (ln>1) {
                      if (repSignalsJson[i].name == "Facet_By" && ln<mymax) {
                        finalheaders.push(element); 
                      } else if (repSignalsJson[i].name == "Filter_Out_From" && ln<mymax) {
                        finalheaders.push(element); 
                      } else if (repSignalsJson[i].name == "Filter_Additional" && ln<mymax) {
                        finalheaders.push(element); 
                      } else if (repSignalsJson[i].name == "X_Axis") {
                        if (typeof(data[0][element])==='string' && ln<mymax) {
                          finalheaders.push(element); 
                        } else if (typeof(data[0][element])==='number') { 
                          finalheaders.push(element); 
                        }
                      } else if (repSignalsJson[i].name == "Y_Axis") {
                        //console.log('el'+ element);
                        if (typeof(data[0][element])==='string' && ln<mymax) {
                          finalheaders.push(element); 
                        } else if (typeof(data[0][element])==='number') { 
                          finalheaders.push(element); 
                        }
                      } else if (repSignalsJson[i].name == "Color_By") {
                        if (typeof(data[0][element])==='string' && ln<mymax) {
                          finalheaders.push(element); 
                        } else if (typeof(data[0][element])==='number') { 
                          finalheaders.push(element); 
                        }
                      } 
                    } 
                  });
                  if (!finalheaders.includes.None) {
                    finalheaders.push("None"); 
                  }
                  spec.signals[index].bind.options = JSON.parse(JSON.stringify(finalheaders));
                }                
            }
            if (repSignalsJson[i].value != null) {
                spec.signals[index].value = repSignalsJson[i].value;
            }
        }
    } 
    if (data != null) {
        spec.data[Index(spec.data, "mydata")].values = JSON.parse(JSON.stringify(data));
    }       
    document.getElementById("defaultOpen"+element).click();
    vegaEmbed('#view_smartplot'+element, spec, {
        renderer: 'canvas',
        width: setWidth(widthid)-180,
        tooltip: true,warn:false,
        actions: {
            export: true,
            source: true,
            editor: true,
            editorURL: "https://itg.usc.edu/editor",
            scaleFactor: 2
        },
        defaultStyle: true
    }).then(function (result) {    
        loader(1,'Smart_Graph_Vega');
        result.view.run();
        initAndListen('show_scatter_graph','Scatter_Options'+element,result);
        initAndListen('show_hist_graph','Scatter_Options'+element,result);
        initAndListen('show_grid_graphs','Grid_Options'+element,result);
        initAndListen('show_stacked_graphs','Stacked_Options'+element,result);
        initAndListen('show_box_graphs','Violin_Options'+element,result);                             
        window.addEventListener('resize', function(event){
            result.view.width(setWidth(widthid)-180).run();
        });   
        loader(0,'Smart_Graph_Vega_Ends');
    }).catch(console.error);
    loader(0,'Smart_Graph_Ends');
};