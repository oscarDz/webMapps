var app = angular.module('myApp',[]);
app.controller('MyController',function($scope,$http){
		$scope.Anombre = 'Elegir un archivo';
		console.log($scope.lugares);

		$scope.isObjectEmpty = function(card){
 		  return Object.keys(card).length === 0;
		}

		$scope.subir = function() {
			  console.log($scope.lugares);
			  $http.post('/api/lugares', $scope.lugares
			  	).then(function(response) {
			    console.log("insercion ",response);
			    if (response.status==1) {
			    	alert("Se realizaron "+response.total+"inserciones");
			    }else{
			    	alert("Error al insertar"+response.error);
			    }
			  });
			};


		$scope.getCoords = function(){
			//var location = "centenario 119, CP 03660, Benito Juares, cmdx";
			var t0 = performance.now();
			for (var i = 0; i < $scope.lugares.length; i++) {
				(function(i){
					var location = $scope.lugares[i].CALLE+" "
						  +$scope.lugares[i].NUM_EXT+", "
						  +$scope.lugares[i].NOM_COLONIA+", "
						  +$scope.lugares[i].CP+", "
						  +$scope.lugares[i].NOM_EDO;

					$http.get("api/coord/"+location.replace(/\//gi,""))
					.then(function(response) {
						if (response.data.status==1) {
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

				var t1 = performance.now();
			console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
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

					$scope.$apply();
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
		        	nombre = filename.substring(1);
		    	}
		    	$scope.Anombre = nombre;
		    	//console.log($scope.Anombre)
			}

		
			$scope.leer();
			
		}
});



