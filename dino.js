/**
 * Wrapper for dinoservices om de JSON output en verwerking te vereenvoudigen
 * Eigenlijk vooral ontstaan omdat ik wat moeite had met de $-tekens en
 * de base64 afbeeldingen
 */
var http = require('http');
var querystring = require('querystring');
var restify = require('restify'); //npm install restify
var fs = require('fs');

/**
 * Dit REST endpoint verzoekt de dinoservices om een model description en
 * wijzigt de json zodat deze eenvoudiger wordt. Daarna wordt het nieuwe
 * JSON formaat geretourneerd
 */
exports.modeldescribe = function (req, res, next){
    var options = {
        host: 'www.dinoservices.nl',
        port: 80,
        path: '/geo3dmodelwebservices-1/rest/models/' + req.params.name + '/' + req.params.resolution + '/describe'
    };
    http.get(options, function(remote_res){
        var mybuf = '';
        remote_res.on('error', function(e) {
            res.send(e);
        });
        remote_res.on('data',function(chunk){
            mybuf += chunk;
        });
        remote_res.on('end',function(){
            if (remote_res.headers['content-type'].indexOf('json') > -1){
                var result = {};
                result.units = [];
                result.properties = [];
                myResult = JSON.parse(mybuf);
        
                //Meta informatie
                result.name = myResult.describeModelResponse.geo3DModel.modelMetadata.model["$"];
                result.version = myResult.describeModelResponse.geo3DModel.modelMetadata.version["$"];
                result.resolution = myResult.describeModelResponse.geo3DModel.modelMetadata.resolution["$"];
                result.description = myResult.describeModelResponse.geo3DModel.modelMetadata.description["$"];
                result.onlinereference = myResult.describeModelResponse.geo3DModel.modelMetadata.onlineReference["$"];
                result.coordinatesystem = myResult.describeModelResponse.geo3DModel.modelMetadata.coordinateSystem["$"];
                result.depthunit = myResult.describeModelResponse.geo3DModel.modelMetadata.depthUnit["$"];
                result.depthreference = myResult.describeModelResponse.geo3DModel.modelMetadata.depthreference["$"];
        
                //Area
                var poslist = myResult.describeModelResponse.geo3DModel.area["ns2:exterior"]["ns2:LinearRing"]["ns2:posList"]["$"].split(" ");
        
                //console.log(poslist);
                var coordinatelist = [];
                for (var h = 0; h < poslist.length ; h++) {
                    var pnt = [parseFloat(poslist[h]), parseFloat(poslist[h+1])];
                    coordinatelist.push(pnt);
                    h = h + 1;
                }
                result.area = {};
                result.area.geometry = {
                    type: "Polygon", 
                    coordinates: coordinatelist
                };
                result.area.geometry.crs = {
                    "type": "name", 
                    "properties": {
                        "name": myResult.describeModelResponse.geo3DModel.area["ns2:exterior"]["ns2:LinearRing"]["@srsName"]
                    }
                }
        
                //Units
                for (var i = 0; i < myResult.describeModelResponse.geo3DModel.geo3DModelUnits.geo3DModelUnit.length ; i++) {
                    var unit = {}
                    unit.name = myResult.describeModelResponse.geo3DModel.geo3DModelUnits.geo3DModelUnit[i].name["$"];
                    unit.description = myResult.describeModelResponse.geo3DModel.geo3DModelUnits.geo3DModelUnit[i].description["$"];
                    var r = myResult.describeModelResponse.geo3DModel.geo3DModelUnits.geo3DModelUnit[i].color.red["$"];
                    var g = myResult.describeModelResponse.geo3DModel.geo3DModelUnits.geo3DModelUnit[i].color.green["$"];
                    var b = myResult.describeModelResponse.geo3DModel.geo3DModelUnits.geo3DModelUnit[i].color.blue["$"];
                    var rgb = b | (g << 8) | (r << 16);
                    unit.color = '#' + rgb.toString(16);
                    result.units.push(unit);
                }
                //Properties
                for (var j = 0; j < myResult.describeModelResponse.geo3DModel.geo3DModelProperties.geo3DModelProperty.length ; j++) {
                    var property = {}
                    property.name = myResult.describeModelResponse.geo3DModel.geo3DModelProperties.geo3DModelProperty[j].name["$"];
                    property.description = myResult.describeModelResponse.geo3DModel.geo3DModelProperties.geo3DModelProperty[j].description["$"];
                    property.unit = property.description = myResult.describeModelResponse.geo3DModel.geo3DModelProperties.geo3DModelProperty[j].unit["$"];
                    result.properties.push(property);
                }
                res.send(result);
            } else {
                res.send(new restify.InvalidContentError(mybuf.toString()));
            }
        });
        return next();
    });
}

/**
 * Dit REST endpoint verzoekt de dinoservices om een lijst met modellen
 * wijzigt de json zodat deze eenvoudiger wordt. Daarna wordt het nieuwe
 * JSON formaat geretourneerd
 */
exports.listmodels = function (req, res, next) {
    var options = {
        host: 'www.dinoservices.nl',
        port: 80,
        path: '/geo3dmodelwebservices-1/rest/models/list'
    };
    http.get(options, function(remote_res){
        var mybuf = '';
        remote_res.on('error', function(e) {
    
            res.send(e);
        });
        remote_res.on('data',function(chunk){
            mybuf += chunk;
        });
        remote_res.on('end',function(){
            if (remote_res.headers['content-type'].indexOf('json') > -1){
                var result = {};
                result.models = [];
                myResult = JSON.parse(mybuf);
                for (var i = 0; i < myResult.listModelsResponse.geo3DModels.geo3DModel.length ; i++) {
                    var model = {};
                    model.name = myResult.listModelsResponse.geo3DModels.geo3DModel[i].modelMetadata.model["$"];
                    model.version = myResult.listModelsResponse.geo3DModels.geo3DModel[i].modelMetadata.version["$"];
                    model.resolution = myResult.listModelsResponse.geo3DModels.geo3DModel[i].modelMetadata.resolution["$"];
                    model.description = myResult.listModelsResponse.geo3DModels.geo3DModel[i].modelMetadata.description["$"];
                    model.onlinereference = myResult.listModelsResponse.geo3DModels.geo3DModel[i].modelMetadata.onlineReference["$"];
                    model.coordinatesystem = myResult.listModelsResponse.geo3DModels.geo3DModel[i].modelMetadata.coordinateSystem["$"];
                    model.depthunit = myResult.listModelsResponse.geo3DModels.geo3DModel[i].modelMetadata.depthUnit["$"];
                    model.depthreference = myResult.listModelsResponse.geo3DModels.geo3DModel[i].modelMetadata.depthreference["$"];
                    result.models.push(model);
                }
                res.send(result);
            } else {
                res.send(new restify.InvalidContentError(mybuf.toString()));
            }
        });
        return next();
    });
}

/**
 * Dit REST endpoint verzoekt de dinoservices om een profiel op basis van een
 * lijn, wijzigt de json zodat deze eenvoudiger wordt en cached de afbeeldingen
 * zodat geen base64 wordt geretourneerd. Daarna wordt het nieuwe
 * JSON formaat geretourneerd
 */
exports.getverticalsectionpicture = function(req, res, next) {
    var params = {};
    var model = req.params.model;
    var resolution = parseInt(req.params.resolution);
  
    if (req.params.p){
        params.p = req.params.p;
    }
    if (req.params.line){
        params.line = req.params.line;
    }
    if (req.params.c){
        params.c = req.params.c;
    }

    params.iw = parseInt(req.params.iw);//breedte van de afbeelding
    params.ih = parseInt(req.params.ih);//hoogte van de afbeelding
  
    if (req.params.leg){
        params.leg = req.params.leg;
    }
    if (req.params.bnd){
        params.bnd = req.params.bnd;
    }
    if (req.params.lab){
        params.lab = req.params.lab;
    }
    params.max = parseFloat(req.params.max);
    params.min = parseFloat(req.params.min);
    if (req.params.exp){
        params.exp = req.params.exp;
    }
  
    var options = {
        host: 'www.dinoservices.nl',
        port: 80,
        path: '/geo3dmodelwebservices-1/rest/models/' + model + '/' + resolution + '/verticalsectionpicture/?' + querystring.stringify(params)
    };

    http.get(options, function(remote_res){
        var mybuf = '';
        remote_res.on('error', function(e) {
            res.send(e);
        });
        remote_res.on('data',function(chunk){
            mybuf += chunk;
        });
        
        remote_res.on('end',function(){
            if (remote_res.headers['content-type'].indexOf('json') > -1){
                myResult = JSON.parse(mybuf);
                var result = {};
                result.verticalsectionmodel = {};
                myResult = JSON.parse(mybuf);
                var filename = require('crypto').createHash('md5').update(querystring.stringify(params)).digest("hex");

                getTempImg(myResult.drawVerticalSectionResponse.sectionPicture.sectionPicture["$"], 'cache/' + filename + '_s.jpg');
                getTempImg(myResult.drawVerticalSectionResponse.sectionPicture.legendPicture["$"], 'cache/' + filename + '_l.jpg');
                result.verticalsectionmodel.sectionpicture = 'cache/' + filename + '_s.jpg';
                result.verticalsectionmodel.legendpicture = 'cache/' + filename + '_l.jpg';
                result.type = myResult.drawVerticalSectionResponse.sectionPicture.pictureMetadata.sectionType["$"];
                
                //Model Meta informatie
                result.model = {};
                result.model.name = myResult.drawVerticalSectionResponse.sectionPicture.modelMetadata.model["$"];
                result.model.version = myResult.drawVerticalSectionResponse.sectionPicture.modelMetadata.version["$"];
                result.model.resolution = myResult.drawVerticalSectionResponse.sectionPicture.modelMetadata.resolution["$"];
                result.model.description = myResult.drawVerticalSectionResponse.sectionPicture.modelMetadata.description["$"];
                result.model.onlinereference = myResult.drawVerticalSectionResponse.sectionPicture.modelMetadata.onlineReference["$"];
                result.model.coordinatesystem = myResult.drawVerticalSectionResponse.sectionPicture.modelMetadata.coordinateSystem["$"];
                result.model.depthunit = myResult.drawVerticalSectionResponse.sectionPicture.modelMetadata.depthUnit["$"];
                result.model.depthreference = myResult.drawVerticalSectionResponse.sectionPicture.modelMetadata.depthreference["$"];
                
                result.picture = {};
                //Picture Meta informatie
                result.picture.reference = {};
                result.picture.reference.origin = {
                    px: myResult.drawVerticalSectionResponse.sectionPicture.pictureMetadata.worldReference.originXImagePixel["$"], 
                    py: myResult.drawVerticalSectionResponse.sectionPicture.pictureMetadata.worldReference.originYImagePixel["$"],
                    x: myResult.drawVerticalSectionResponse.sectionPicture.pictureMetadata.worldReference.originXRealWorldCoordinate["$"],
                    y: myResult.drawVerticalSectionResponse.sectionPicture.pictureMetadata.worldReference.originYRealWorldCoordinate["$"]
                  };
                result.picture.reference.width = {
                  px: myResult.drawVerticalSectionResponse.sectionPicture.pictureMetadata.worldReference.widthImagePixel["$"],
                  m: myResult.drawVerticalSectionResponse.sectionPicture.pictureMetadata.worldReference.widthRealWorldCoordinate["$"]
                };
                result.picture.reference.height = {
                  px: myResult.drawVerticalSectionResponse.sectionPicture.pictureMetadata.worldReference.heightImagePixel["$"],
                  m: myResult.drawVerticalSectionResponse.sectionPicture.pictureMetadata.worldReference.heightRealWorldCoordinate["$"]
                };
                
                //Areas
                
                result.picture.areas = [];
                for (var i = 0; i < myResult.drawVerticalSectionResponse.sectionPicture.pictureAreas.pictureArea.length ; i++) {
                    var area = {};
                    area.name = myResult.drawVerticalSectionResponse.sectionPicture.pictureAreas.pictureArea[i].areaname["$"];
                    var poslist = myResult.drawVerticalSectionResponse.sectionPicture.pictureAreas.pictureArea[i].area["ns2:exterior"]["ns2:LinearRing"]["ns2:posList"]["$"].split(" ");
        
                    //console.log(poslist);
                    var coordinatelist = [];
                    for (var h = 0; h < poslist.length ; h++) {
                        var pnt = [parseFloat(poslist[h]), parseFloat(poslist[h+1])];
                        coordinatelist.push(pnt);
                        h = h + 1;
                    }
                    area.geometry = {
                        type: "Polygon", 
                        coordinates: coordinatelist
                    };
                    area.geometry.crs = {
                        "type": "name", 
                        "properties": {
                            "name": myResult.drawVerticalSectionResponse.sectionPicture.pictureAreas.pictureArea[i].area["ns2:exterior"]["ns2:LinearRing"]["@srsName"]
                        }
                    }
                        result.picture.areas.push(area);
                    }
                    
                 res.send(result);
            } else {
                res.send(new restify.InvalidContentError(mybuf.toString()));
            }
        });
        return next();
    });
}

function getTempImg(base64Image, filename) {
    var decodedImage = new Buffer(base64Image, 'base64');
    fs.writeFile(filename, decodedImage, function(err) { })
}
