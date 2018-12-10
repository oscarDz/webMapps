(function(){
	var app = angular.module('myApp',[]);
	app.controller('MyController',['$scope',myController])

	v//ar excelJSONOBJ = [];

	function myController($scope){
		$scope.uploadExcel = function(e){
			var myFile = document.getElementById('file');
			//var input = myFile;
			var reader = new FileReader();

			reader.onload = function(e){
				var fileData = reader.result;
				var workbook = XLSX.read(fileData,{type:'binary'});
				workbook.SheetNames.forEach(function(sheetName){
					var rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
					excelJSONOBJ = rowObject;
				});

				for(var i; i < excelJSONOBJ.length;i++){
					$('#myTable tbody:last-child').append("<tr><td>"+excelJSONOBJ[i].NOM_CORTO_PRESTATARIO+"</td><tr>");
				}
			};
			reader.readAsBinaryString(myFile.files[0]);
		};
	}
})();