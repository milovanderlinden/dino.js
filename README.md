# dino.js #

node js wrapper voor de TNO dinoservices (http://www.dinoservices.nl/geo3dmodelwebservices-1/) (versie 1.4.3)

## Gereed ##

+  GET localhost:8080/models/list
+  GET localhost:8080/models/{model}/{resolution}/describe
+  GET localhost:8080/models/{model}/{resolution}/verticalsectionpicture


## Bezig ##

+  GET localhost:8080/models/{model}/{resolution}/rasters/{modellayer}
+  GET localhost:8080/models/{model}/{resolution}/documents/{modellayer}
+  GET localhost:8080/models/{model}/{resolution}/columnsample
+  GET localhost:8080/models/{model}/{resolution}/columnpicture

## Voorbeelden ##

http://localhost:8080/models/GEOTOPlayer/100/describe
http://localhost:8080/models/GEOTOPlayer/100/verticalsectionpicture?ih=570&iw=570&line=91441.80001966399%2C432355.66503012076%2C86503.96055611213%2C430911.1822420663&leg=false&max=100&min=-30
