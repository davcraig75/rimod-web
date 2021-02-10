setTimeout(function () {
  var columns=["Age","Sex","Disease","Gene","Mutation","Pathology","Disease-Gene","Min pmd","pH"];
  var data=JSON.parse(JSON.stringify(samples.json));

  CrossCorrelate("example_graph","itg-browser-width",data,
      [
        {"name":"X_Axis","value":"Gene","bind":{"options":columns}},
        {"name":"Y_Axis","value":"None","bind":{"options":columns}},
        {"name":"Facet_Cols_By","value":"Pathology","bind":{"options":columns}},   
        {"name":"Facet_Rows_By","value":"None","bind":{"options":columns}},       
        {"name":"Color_By","value":"Mutation","bind":{"options":columns}},     
        {"name":"graph_title","value":"Sample Counts By "},
        {"name":"Dashes_","value":false},                
        {"name":"Palette","value":"Category10"},
        {"name":"Max_Plot_Height","value":150}, 
        {
          "name": "Max_Plot_Width",
          "value": 375
        },
        {"name":"Legend_Height","value":60}
      ]
    );  
}, 10);
