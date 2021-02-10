
var startX, startY, startWidth, startHeight, p, myresult, myid,ccPanel,ccPanelProxy;
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

function setWidth_smart(id,element) {
	var width = document.getElementById(id).offsetWidth-50;
	if (ccPanelProxy[element]>0) {
		width=width-ccPanelProxy[element];
	}
	return width;
}

function ccOpenCity(evt, cityName) {

	cc_tabcontent = document.getElementsByClassName("cc_tabcontent");
	var max_width=0;
	var child = document.getElementById(cityName);
	var parentName=child.parentElement.getAttribute('id');
	var myel=parentName.match(/cc_graph(.*)/)[1];
	if (cityName.includes('None')) {
		ccPanelProxy[myel]=0;
	} else {
		ccPanelProxy[myel]=100;
	}
	for (i = 0; i < cc_tabcontent.length; i++) {
		cc_tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("cc_tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(cityName).style.display = "block";
	evt.currentTarget.className += " active";
}
function initAndListen(listener, id, result,element) {
	if (result.view.signal(listener) == true) {
		document.getElementById(id).style.display = "block";
	} else {
		document.getElementById(id).style.display = "none";
	}
	result.view.addSignalListener(listener, function(name, value) {
		if (value) {
			document.getElementById(id).style.display = "block";
		} else {
			document.getElementById(id).style.display = "none";
		}
	});
}


var CrossCorrelate = function CrossCorrelate(element, widthid, data, new_signals) {
	var loc_crosscorrelate_html =  crosscorrelate_html;
	var local_vgspec = JSON.stringify(crosscorrelate_spec);
	var element_node = document.getElementById(element);
	var mymax = 150;
	var loc_crosscorrelate_htmlRes = loc_crosscorrelate_html.replace(/\-ccnm/g, element);
	element_node.innerHTML = loc_crosscorrelate_htmlRes;
	document.getElementById("cc_css").innerHTML= itg_decomp("<%=cc_css%>");
	ccPanel={};
	ccPanelProxy={};
	ccPanelProxy[element]=0;
	
	var res = local_vgspec.replace(/\-ccnm/g, element);
	var spec = JSON.parse(res);
	var new_signalsString = JSON.stringify(new_signals);
	if (new_signalsString != null) {
		repSignalsJson = JSON.parse(new_signalsString.replace(/\-ccnm/g, element));
		for (var i in repSignalsJson) {
			var index = Index(spec.signals, repSignalsJson[i].name);
			spec.signals[index].value = repSignalsJson[i].value;
			if (repSignalsJson[i].bind != null) {
				if (repSignalsJson[i].bind.element != null) {
					spec.signals[index].bind.element = repSignalsJson[i].bind.element;
				}
				if (repSignalsJson[i].bind.options != null) {
					var headers = repSignalsJson[i].bind.options;
					var finalheaders = [];
					headers.forEach(function(element) {
						var distinct = [...new Set(data.map(x => x[element]))];
						var ln = distinct.length;
						if (ln > 1) {
							if (repSignalsJson[i].name == "Facet_By" && ln < mymax) {
								finalheaders.push(element);
							} else if (repSignalsJson[i].name == "Filter_Out_From" && ln < mymax) {
								finalheaders.push(element);
							} else if (repSignalsJson[i].name == "Facet_Rows_By" && ln < mymax) {
								finalheaders.push(element);
							} else if (repSignalsJson[i].name == "Facet_Cols_By" && ln < mymax) {
								finalheaders.push(element);
							} else if (repSignalsJson[i].name == "Filter_Additional" && ln < mymax) {
								finalheaders.push(element);
							} else if (repSignalsJson[i].name == "Marker_Size_By" ) {
									finalheaders.push(element);
							} else if (repSignalsJson[i].name == "X_Axis") {
								if (typeof(data[0][element]) === 'string' && ln < mymax) {
									finalheaders.push(element);
								} else if (typeof(data[0][element]) === 'number') {
									finalheaders.push(element);
								}
							} else if (repSignalsJson[i].name == "Y_Axis") {
								if (typeof(data[0][element]) === 'string' && ln < mymax) {
									finalheaders.push(element);
								} else if (typeof(data[0][element]) === 'number') {
									finalheaders.push(element);
								}
							} else if (repSignalsJson[i].name == "Color_By") {
								if (typeof(data[0][element]) === 'string' && ln < mymax) {
									finalheaders.push(element);
								} else if (typeof(data[0][element]) === 'number') {
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

	document.getElementById("defaultOpen" + element).click();

	vegaEmbed('#view_crosscorrelate' + element, spec, {
		renderer: 'canvas',
		width: setWidth_smart(widthid,element),
		tooltip: true,
		warn: false,
		actions: {
			export: true,
			source: true,
			editor: true,
			editorURL: "https://itg.usc.edu/editor",
			scaleFactor: 2
		},
		defaultStyle: true
	}).then(function(result) {
		result.view.run();
		ccPanelProxy = new Proxy(ccPanel, {
			set: function (target, key, value) {
				target[key] = value;
				result.view.width(setWidth_smart(widthid,element)).run();
				return true;
			}
		});					
		initAndListen('show_scatter_graph', 'Scatter_Options' + element, result,element,widthid);
		initAndListen('show_hist_graph', 'Scatter_Options' + element, result,element,widthid);
		initAndListen('show_grid_graphs', 'Grid_Options' + element, result,element,widthid);
		initAndListen('show_stacked_graphs', 'Stacked_Options' + element, result,element,widthid);
		initAndListen('show_box_graphs', 'Violin_Options' + element, result,element,widthid);
		window.addEventListener('resize', function(event) {
			result.view.width(setWidth_smart(widthid,element)).run();
		});	
	}).catch(console.error);
};
