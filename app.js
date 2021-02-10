//////////////////////////////////////////////////////////////////////////////////
// Copyright David Wesley Craig 2020, University of Southern California
//////////////////////////////////////////////////////////////////////////////////
var pjson = require('./package.json');
var express = require('express');
var compression = require("compression");
var bodyParser = require("body-parser");
var path = require("path");
var mongoose = require('mongoose');
var http = require("http");
var dotenv = require("dotenv");
var cookieParser = require('cookie-parser');
var morgan       = require('morgan');
var debug = require("debug")("ripple:server");
var fs = require("fs");
var app = express();
require("dotenv").config();
var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
itgz = require("./src/lz-string.js");
var itg_comp = function(file) {
  return itgz.compressToEncodedURIComponent(fs.readFileSync(file, "utf8"));
};
var itg_engz = function(data) {
  return itgz.compressToEncodedURIComponent(JSON.stringify(data)).toString();
};
 
app.set('port', port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

 // ALLOW CORS (Modify as appropriate)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}); 
var max_range_10M = 10000000;
var max_range_1M = 1000000;
var max_range_100K = 100000;
var max_range_10K = 10000;
var max_range_1K = 1000;

// Start server
app.use(express.static(path.join(__dirname, 'public')));
app.use('/',express.static(path.join(__dirname, 'public')));
app.use('/public',express.static(path.join(__dirname, 'public')));
app.use(morgan('dev')); // log every request to the console
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


/////////////////////////////////////////////////////////////////////////////////
// Convert csv to json
//////////////////////////////////////////////////////////////////////////////////
d3 = require("./src/d3-dsv.v1.min.js");
samples_data=d3.csvParse(fs.readFileSync("src/RiMod_master_sample_file.csv", "utf8"), d3.autoType);
var samples={json:samples_data,columns:samples_data.columns};

//////////////////////////////////////////////////////////////////////////////////
// Compression and Data
//////////////////////////////////////////////////////////////////////////////////  
    var document = {
        gene_wordcloud:itg_comp("views/json/geneview.wordcloud.042119.v30.json"),
        logos:itg_comp("src/logos.css"),
        samples:itg_engz(samples),
        genomebrowser:itg_comp("views/json/browser.020921.json"),
        genes:itg_comp("views/genes.ejs"),     
        browser:itg_comp("views/browser.ejs"),    
        landing:itg_comp("views/home.ejs"), 
        menu:itg_comp("views/menu.ejs"),  
        autocomplete:itg_comp("./src/autocomplete.css"),   
        rimodcss:itg_comp("./views/styles-rimod.css"),
        rimodcss:itg_comp("./views/styles-rimod.css"),
        jquerycss:itg_comp("src/jquery-ui.css"),
        footer:itg_comp("views/footer.ejs"),
        abstractdiagram:itg_comp("src/abstractdiagram.svg"),
        loader:itg_comp("src/dna.css"),
        genelist:itg_comp("src/genelist.json"),
        itgversion: pjson.version,
        global_api: process.env.APP_GLOBAL_API,
        app_name:pjson.name        
    };

/////////////////////////////////////////////////////////////////////////////////
// Webpage From Node
//////////////////////////////////////////////////////////////////////////////////
      app.get(process.env.NODE_PRIVATE, function(req, res) {
          res.render('body.ejs',  document);
      });

//////////////////////////////////////////////////////////////////////////////////
// END API  Server
//////////////////////////////////////////////////////////////////////////////////
        function onError(error) {
            if (error.syscall !== 'listen') {
                throw error;
            }
            var bind = typeof port === 'string' ?
                'Pipe ' + port :
                'Port ' + port;
            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }
        function normalizePort(val) {
            var port = parseInt(val, 10);
            if (isNaN(port)) {
                return val;
            }
            if (port >= 0) {
                return port;
            }
            return false;
        }
        function onListening() {
            var addr = server.address();
            var bind = typeof addr === 'string' ?
                'pipe ' + addr :
                'port ' + addr.port;
            debug('Listening on ' + bind);
        }
        app.use(compression());
        app.set('port', process.env.PORT);
        var server = http.createServer(app);
        server.listen(process.env.PORT);
        server.on('error', onError);
        server.on('listening', onListening);

//////////////////////////////////////////////////////////////////////////////////
// Compile Javascript
//////////////////////////////////////////////////////////////////////////////////
    app.get(process.env.NODE_PRIVATE+'/compile', function(req, res) { 
        res.render('wrapper.ejs', document, function(err,list){
            fs.writeFile("'public/" + pjson.name+".js",list,function(err){
                if(err)
                    console.error(err);
                res.send(list);
                return ;
            });
            return ;
        });
    });
    if (process.argv[2] == "build") {
        app.render("wrapper.ejs", document, function(err, javascript) {
          fs.writeFile("public/" + pjson.name+".js", javascript, function(err) {
            if (err) console.error(err);
            //console.log("Built javascript");
            process.exit();
          });      
        });
      }   
//////////////////////////////////////////////////////////////////////////////////
// MongoDB API
//////////////////////////////////////////////////////////////////////////////////
var db = mongoose.connection;
//var CoordSchema = mongoose.Schema({},{collection: "coord38" });
//var CoordCollection =  db.model('coord38', CoordSchema);

var GenePosSchema = mongoose.Schema({chr:String,first_pos:Number,last_pos:Number},{collection: "gene_summary"});   
var Private_Gene_Schema = mongoose.Schema({chr:String,first_pos:Number,last_pos:Number},{collection: "gene_detail"});   
var url = 'mongodb://localhost:'+process.env.MONGODB_PRIVATE_PORT+'/'+process.env.MONGODB_PRIVATE_DB;
mongoose.connect(url, { useNewUrlParser: true });


 

//////////////////////////////////////////////////////////////////////////////////
// GeneInfo API
//////////////////////////////////////////////////////////////////////////////////
    
var GenePosCollection = db.model('gene_summary', GenePosSchema);
function search_genepos(req, res) {
    var chr=req.params.chr;
    var first_pos=Math.round(req.params.first_pos);
    var last_pos=Math.round(req.params.last_pos);
    var startTime = Date.now();
    var range=Math.abs(last_pos-first_pos);
    if(range<max_range_10M) {   
        GenePosCollection.find({"g38.0": { "$gte": first_pos,"$lte": last_pos },"summaries_BulkRNA":{"$exists":1} }, function(err, pos) {
            if (err) { console.log ("error");res.json({})}
            if (pos) {
                res.json({genepos:encodeURI(itgz.compressToBase64(JSON.stringify(pos)))}); 
            }
        }).limit(500);
    } else {
            res.json([]); 
    }       
}
app.get(process.env.NODE_PRIVATE+'/genePos/first_pos/:first_pos/last_pos/:last_pos',search_genepos); // Public


var Private_Gene_Connection = db.model('gene_detail', Private_Gene_Schema);
function private_search_gene(req, res) {
    var mygene=req.params.gene;
    Private_Gene_Connection.findOne({'gene':req.params.gene}, function(err, gene) {
        if (err) { console.log('err'+err)}
        if (gene) {
            res.json({gene:encodeURI(itgz.compressToBase64(JSON.stringify(gene)))});
        } else {
            res.json({});
        }
    });
}
app.get(process.env.NODE_PRIVATE+'/gene/:gene', private_search_gene); 



//////////////////////////////////////////////////////////////////////////////////
// METH
//////////////////////////////////////////////////////////////////////////////////
var methCollectionName="METHAR";
var METHSchema = mongoose.Schema({},{collection: "METHAR" });
var METHCollection = db.model("METHAR", METHSchema);
function search_METH(req, res) {
    var g0=Math.round(req.params.g0);
    var g1=Math.round(req.params.g1);
    var range=Math.abs(g1-g0);
    var startTime = Date.now();
    if(range<max_range_10M) {
        METHCollection.aggregate([
            {"$match":{"g0":{"$gt":g0,"$lt":g1}}},
            {$unwind:"$samples"},
            {$project:{"_id":0,"g0":1,"g1":"$g0","Full":"$samples.F","UID":"$samples.Sa","Pathology":"$samples.P","Disease":"$samples.D","Mutation":"$samples.M","Sex":"$samples.S","v0":"$samples.v0"}}
        ], function(err, dat) {
            if (err) { console.log ("error");res.json({});}        
            if (dat) {
                console.log('METHAR:\t',g1-g0,'c:\t',Object.keys(dat).length,',MS:\t', Date.now() - startTime);
                res.json(dat); 
            }
        });
    } else {res.json([]);}
}   
app.get(process.env.NODE_PRIVATE+'/meth/g0/:g0/g1/:g1',search_METH); // Public

function search_METH_summary(req, res) {
    var g0=Math.round(req.params.g0);var g1=Math.round(req.params.g1);var range=Math.abs(g1-g0);var startTime = Date.now();
    if(range<max_range_10M) {
        METHCollection.aggregate([
            {"$match":{"g0":{"$gt":g0,"$lt":g1}}},{$unwind:"$summaries"},
            {$project:{"_id":0,"g0":1,"g1":"$g0","min":"$summaries.min","q1":"$summaries.q1","median":"$summaries.median","q3":"$summaries.q3","event":"$summaries.event","variable":"$summaries.variable","max":"$summaries.max","n":"$summaries.n"}}
        ], function(err, dat) {
            if (err) { console.log ("error");res.json({});}        
            if (dat) {
                
                console.log('METHSUMMARY:\t',g1,g0,'c:\t',Object.keys(dat).length,',MS:\t', Date.now() - startTime);
                res.json(dat); 
            }
        });
    } else {res.json([]);}
}   
app.get(process.env.NODE_PRIVATE+'/meth_summary/g0/:g0/g1/:g1',search_METH_summary); // Public


//////////////////////////////////////////////////////////////////////////////////
// CAGE API
//////////////////////////////////////////////////////////////////////////////////
var cageCollectionName="CAGE";
var CAGESchema = mongoose.Schema({},{collection: cageCollectionName });
var CAGECollection = db.model(cageCollectionName, CAGESchema);     
function search_CAGE_summary(req, res) {

    var g0=Math.round(req.params.g0);var g1=Math.round(req.params.g1);var range=Math.abs(g1-g0);var startTime = Date.now();
    console.log('range'+range+'g0 '+g0+'g1 '+g1);
    if(range<max_range_10M) {
        CAGECollection.aggregate([
            {"$match":{"g0":{"$gt":g0,"$lt":g1}}},
            {$unwind:"$summaries"},
            {$project:{"_id":0,"g0":1,"g1":1,"count":"$summaries.count","event":"$summaries.event","variable":"$summaries.variable","v0":"$summaries.v0"}}
        ], function(err, dat) {
            if (err) { console.log ("error");res.json({"err":err});}        
            if (dat) {
                console.log('CAGE:\t',g1-g0,'c:\t',Object.keys(dat).length,',MS:\t', Date.now() - startTime);     
                //console.log(dat)               
                res.json(dat); 
            }
        });
    } else {res.json([]);}
}       
app.get(process.env.NODE_PRIVATE+'/cage_summary/g0/:g0/g1/:g1',search_CAGE_summary); // Public

function search_CAGE(req, res) {
    var g0=Math.round(req.params.g0);var g1=Math.round(req.params.g1);var range=Math.abs(g1-g0);var startTime = Date.now();
    if(range<max_range_10M) {
        CAGECollection.aggregate([
            {"$match":{"g0":{"$gt":g0,"$lt":g1}}},
            {$unwind:"$k"},
            {$project:{"_id":0,"g0":1,"g1":1,"Full":"$k.F","UID":"$k.U","Pathology":"$k.P","Disease":"$k.D","Mutation":"$k.M","Sex":"$k.S","v0":"$k.v0"}}
        ], function(err, dat) {
            if (err) { console.log ("error");res.json({});}        
            if (dat) {
                console.log('CAGE:\t',g1-g0,'c:\t',Object.keys(dat).length,',MS:\t', Date.now() - startTime);
                
                res.json(dat); 
            }
        });
    } else {res.json([])}
}   
app.get(process.env.NODE_PRIVATE+'/cage/g0/:g0/g1/:g1',search_CAGE); // Public





