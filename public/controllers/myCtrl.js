var app = angular.module('myApp', ['angular.filter', 'ngFileUpload']);

app.controller('myCtrl', function ($scope, $http) {

    $scope.excelDetails = [];
    $scope.SelectFile = function (file) {
        if (file != null && file != undefined && file != '') {
            $scope.SelectedFile = file;
        }
        else {
            $scope.excelDetails = [];
            $scope.SelectedFile = null;
        }
    };

    $scope.Upload = function () {
        if ($scope.SelectedFile != null && $scope.SelectedFile != undefined && $scope.SelectedFile != '') {
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
            if (regex.test($scope.SelectedFile.name.toLowerCase())) {
                if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    //For Browsers other than IE.
                    if (reader.readAsBinaryString) {
                        reader.onload = function (e) {
                            $scope.ProcessExcel(e.target.result);
                        };
                        reader.readAsBinaryString($scope.SelectedFile);
                    } else {
                        //For IE Browser.
                        reader.onload = function (e) {
                            var data = "";
                            var bytes = new Uint8Array(e.target.result);
                            for (var i = 0; i < bytes.byteLength; i++) {
                                data += String.fromCharCode(bytes[i]);
                            }
                            $scope.ProcessExcel(data);
                        };
                        reader.readAsArrayBuffer($scope.SelectedFile);
                    }
                } else {
                    $window.alert("This browser does not support HTML5.");
                }
            } else {
                $window.alert("Please upload a valid Excel file.");
            }
        }
        else {
            alert('Please select a file to upload.');
            $scope.excelDetails = [];
            $scope.SelectedFile = null;
        }
    };

    var convertO2E = function(excelRows, i, landType, riCircle, rtName, sourceOfIrrigation, tahasil, villageOrMouza) {
        return new Promise(resolve => {
            $http.get('https://gisttransserver.in/Transliteration.aspx?itext=' + landType + '&transliteration=NAME&locale=or_in&transRev=true').then(function success(response) {
                var index = excelRows.indexOf(i);
                if (index !== -1) {
                    i.LandTypeEng = response.data;
                    $http.get('https://gisttransserver.in/Transliteration.aspx?itext=' + riCircle + '&transliteration=NAME&locale=or_in&transRev=true').then(function success(response1) {
                        var index = excelRows.indexOf(i);
                        if (index !== -1) {
                            i.RICircleEng = response1.data;
                            $http.get('https://gisttransserver.in/Transliteration.aspx?itext=' + sourceOfIrrigation + '&transliteration=NAME&locale=or_in&transRev=true').then(function success(response3) {
                                var index = excelRows.indexOf(i);
                                if (index !== -1) {
                                    i.SourceOfIrrigationEng = response3.data;
                                    $http.get('https://gisttransserver.in/Transliteration.aspx?itext=' + tahasil + '&transliteration=NAME&locale=or_in&transRev=true').then(function success(response4) {
                                        var index = excelRows.indexOf(i);
                                        if (index !== -1) {
                                            i.TahasilEng = response4.data;
                                            $http.get('https://gisttransserver.in/Transliteration.aspx?itext=' + villageOrMouza + '&transliteration=NAME&locale=or_in&transRev=true').then(function success(response5) {
                                                var index = excelRows.indexOf(i);
                                                if (index !== -1) {
                                                    i.VillageOrMouzaEng = response5.data;
                                                    if (rtName.length <= 200) {
                                                        $http.get('https://gisttransserver.in/Transliteration.aspx?itext=' + rtName + '&transliteration=NAME&locale=or_in&transRev=true').then(function success(response2) {
                                                            var index = excelRows.indexOf(i);
                                                            if (index !== -1) {
                                                                i.RTNameEng = response2.data;
                                                                resolve(i)
                                                            }
                                                        }, function error(response) {
                                                            console.log(response.status);
                                                        }).catch(function err(error) {
                                                            console.log('An error occurred...', error);
                                                        });
                                                    }
                                                    resolve(i)
                                                }
                                            }, function error(response) {
                                                console.log(response.status);
                                            }).catch(function err(error) {
                                                console.log('An error occurred...', error);
                                            });
                                        }
                                    }, function error(response) {
                                        console.log(response.status);
                                    }).catch(function err(error) {
                                        console.log('An error occurred...', error);
                                    });
                                }
                            }, function error(response) {
                                console.log(response.status);
                            }).catch(function err(error) {
                                console.log('An error occurred...', error);
                            });
                        }
                    }, function error(response) {
                        console.log(response.status);
                    }).catch(function err(error) {
                        console.log('An error occurred...', error);
                    });
                }
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        });
    };

    var ers = [];
    $scope.array = [];
    var loopFunction = async function(excelRows) {
        for (var i = 0; i < excelRows.length; i++) {
            excelRow = await convertO2E(excelRows, excelRows[i], excelRows[i].LandType, excelRows[i].RICircle, excelRows[i].RTName, excelRows[i].SourceOfIrrigation, excelRows[i].Tahasil, excelRows[i].VillageOrMouza);
            console.log(i);
            ers.push(excelRow);
        }
        $scope.$apply(function () {
            $scope.array = ers;
        });
    };

    $scope.ProcessExcel = function (data) {
        //Read the Excel File data.
        var workbook = XLSX.read(data, {
            type: 'binary'
        });
        //Fetch the name of First Sheet.
        var firstSheet = workbook.SheetNames[0];
        //Read all rows from First Sheet into an JSON array.
        var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
        //Display the data from Excel file in Table.
        $scope.$apply(function () {
            loopFunction(excelRows);
        });
    };

    $scope.submitEF = function (isValid) {
        if (isValid) {
            if ($scope.excelDetails.length > 0) {
                var myData = [];
                angular.forEach($scope.excelDetails, function (i) {
                    var k = {};
                    k.CropCode = ($filter('filter')($scope.crops, { CropName: i.Crops }, true))[0].CropCode;
                    k.CropType = (k.CropCode == 202) ? 'MS' : (k.CropCode == 201) ? 'GN' : (k.CropCode == 206) ? 'SN' : 'NA';
                    k.PestDiseaseName = i.Pests;
                    k.PesticideName = i.Pesticides;
                    k.RecommendedDose = i.RecommendedDoses200LitresperAcre;
                    myData.push(k);
                });
                $http.post('http://localhost:3000/jdapp/submitEF', { data: myData }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                    var result = response.data;
                    if (result == 'OK') {
                        alert('The Advisory details are submitted.');
                        $scope.excelDetails = [];
                        $scope.SelectedFile = null;
                    }
                    else {
                        console.log(response.status);
                        alert('Oops! An error occurred. Please try again.');
                    }
                }, function error(response) {
                    console.log(response.status);
                }).catch(function err(error) {
                    console.log('An error occurred...', error);
                });
            }
            else {
                alert('Please upload the excel file with data.');
            }
        }
        else {
            alert('Please fill all the fields.');
        }
    };

});

app.filter('capitalize', function () {
    return function (input) {
        if (input != null) {
            input = input.toLowerCase().split(' ');
            for (var i = 0; i < input.length; i++) {
                input[i] = input[i].charAt(0).toUpperCase() + input[i].substring(1);
            }
            return input.join(' ');
        }
        else {
            return false;
        }
    }
});