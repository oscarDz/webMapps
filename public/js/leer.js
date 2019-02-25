var app = angular.module('myApp',['ui.bootstrap']);
app.controller('MyController',function($scope,$http,$uibModal){
	 'use strict';
		$scope.Anombre = 'Elegir un archivo';
		$scope.buscaLugar = "";

		$scope.isObjectEmpty = function(card){
 		  return Object.keys(card).length === 0;
		}

		$scope.subir = function() {
			  console.log($scope.lugares);
			  $http.post('/api/lugares', $scope.lugares
			  	).then(function(response) {
			    console.log(response);
			    if (response.status === 200) {
			    	if (response.data.status===1) {
			    		alert("Se realizaron "+response.data.total+" inserciones");
				    }else{
				    	alert("Error al insertar "+response.data.error);
				    }
			    }else{
			    	alert("Error al insertar error al consumir servicio");
			    }
			    
			  });
			};


		$scope.getCoords = function(){
			var x = $scope.lugares.length
			//var location = "centenario 119, CP 03660, Benito Juares, cmdx";
			for (var i = 0; i < $scope.lugares.length; i++) {
				(function(i){
					var location = {"location" : $scope.lugares[i].CALLE+" "
						  +$scope.lugares[i].NUM_EXT+", "
						  +$scope.lugares[i].NOM_COLONIA+", "
						  +$scope.lugares[i].CP+", "
						  +$scope.lugares[i].NOM_EDO};
					$http.post("api/coord",JSON.stringify(location))
					.then(function(response) {
						if (response.data.status===1) {
							$scope.lugares[i].COORDENADAS.lat = response.data.lat;
							$scope.lugares[i].COORDENADAS.lng = response.data.lng;
							$scope.lugares[i].COORDENADAS.tipo = response.data.tipo;
						}
		      		}).catch(function(error) {
		      			console.log("error ",error );
		      		}).finally(function(infos) {
		        	//Do stuff regardless of call's success or failure
		      		});

				})(i);
				
			}
		}

		$scope.leer = function(){	
				var myFile = document.getElementById('file');
				myFile.files[0];
			  	var reader = new FileReader();
			  	reader.onload = function() {
			    // The file's text will be printed here
			    //console.log(reader.result)
			    //var data = reader.result;
			    	var data = reader.result; 
			    	var rowObject;
			    	var workbook = XLSX.read(data,{type:'binary'});
							workbook.SheetNames.forEach(function(sheetName){
								rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
								for (var i = 0; i < rowObject.length; i++) {
									rowObject[i].COORDENADAS = {};
								}
								$scope.lugares = rowObject;
								$scope.getCoords();
							});
					
					//console.log($scope.lugares);

					//$scope.$apply();
					};
				reader.readAsBinaryString(myFile.files[0]);
		}
		$scope.fileName = function(){
			//console.log("asdfasdfds");
			var myFile = document.getElementById('file').value;
			if (myFile) {
		    	var startIndex = (myFile.indexOf('\\') >= 0 ? myFile.lastIndexOf('\\') : myFile.lastIndexOf('/'));
		    	var filename = myFile.substring(startIndex);
		    	if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
		        	$scope.Anombre = filename.substring(1);
		    	}
		    	//console.log($scope.Anombre)
			}

		
			$scope.leer();
			
		}


		$scope.buscar = function(){
			var rowObject=[];
			var nombre = $scope.buscaLugar
			var busqueda = {"nombre" : nombre.toUpperCase()}
			 $http.post("/api/buscaLugares", JSON.stringify(busqueda)
			  	).then(function(response) {
			    console.log("respuesta ",response);

      				for (var i = 0; i < response.data.length; i++) {
			    	 rowObject[i] = {"NOM_CORTO_PRESTATARIO":response.data[i].NOM_CORTO_PRESTATARIO,
			    	 "NOM_LARGO_PRESTATARIO":response.data[i].NOM_LARGO_PRESTATARIO,
			    	 "CALLE":response.data[i].CALLE,
			    	 "NUM_EXT":response.data[i].NUM_EXT,
			    	 "NUM_INT":response.data[i].NUM_INT,
			    	 "NOM_COLONIA":response.data[i].NOM_COLONIA,
			    	 "CP":response.data[i].CP,
			    	 "NOM_MUNICIPIO":response.data[i].NOM_MUNICIPIO,
			    	 "NOM_EDO":response.data[i].NOM_EDO,
			    	 "COORDENADAS":{"lat":response.data[i].COORDENADAS.lat,
			    	                "lng":response.data[i].COORDENADAS.lng,
			    	                "tipo":response.data[i].COORDENADAS.tipo},
			    	 "NOM_TRATAMIENTO_RESPONSABLE":response.data[i].NOM_TRATAMIENTO_RESPONSABLE,
			    	 "APATERNO_RESPONSABLE":response.data[i].APATERNO_RESPONSABLE,
			    	 "AMATERNO_RESPONSABLE":response.data[i].AMATERNO_RESPONSABLE,
			    	 "NOMBRE_RESPONSABLE":response.data[i].NOMBRE_RESPONSABLE,
			    	 "CARGO_RESPONSABLE":response.data[i].CARGO_RESPONSABLE}
			    }
			    $scope.lugares = rowObject;
			  });
		}


		$scope.showModal =function(e){
			$uibModal.open({
			      templateUrl: "modal/modModificar.html",
			      controller: function ($scope, $uibModalInstance) {
			        $scope.ok = function () {
			          $uibModalInstance.close();
			        };
			      
			        $scope.cancel = function () {
			          $uibModalInstance.dismiss('cancel');
			        };
			      }
			    }).result.catch(function(res) {
					  if (!(res === 'cancel' || res === 'escape key press')) {
					    throw res;
					  }
					});
		};

});



