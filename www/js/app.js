(function(){
  'use strict';
  var module = angular.module('app', ['onsen']);

  module.controller('AppController', function($scope, $data) {
    $scope.showNew = function() {
      $scope.navi.pushPage('new.html', {title : 'Nuevo'});
    };

    $scope.init = function () {
      //First, open our db
      var dbShell = window.openDatabase("DataPet", 2, "Data from Pets", 5*1024 * 1024);
      //run transaction to create initial tables
      dbShell.transaction(setupTable,dbErrorHandler);
    };

    //I just create our initial table - all one of em
    function setupTable(tx){
      //tx.executeSql("DROP TABLE pets");
      tx.executeSql("CREATE TABLE IF NOT EXISTS pets(id INTEGER PRIMARY KEY,petName TEXT,petPicture BLOB, sex INTEGER,type INTEGER,ownerName TEXT, ownerPicture BLOB, address TEXT,phone TEXT,comments TEXT,status INTEGER,notes TEXT)");
    }

    function dbErrorHandler(err){
      alert("Create DB Error: "+err.message + "\nCode="+err.code);
    }
  });

  module.controller('DetailController', function($scope, $data) {
    $scope.item = $data.selectedItem;

    $scope.temp = {};
    $scope.temp.status = $scope.item.status;
    $scope.temp.notes = $scope.item.notes;

    $scope.addNote = function() {
      ons.notification.prompt({
        message: 'Enter your comment',
        callback: function(comment) {
          ons.notification.alert({
            message: comment
          });
        }
      });
    };

    $scope.update = function() {
      var dbShell = window.openDatabase("DataPet", 2, "Data from Pets", 5*1024 * 1024);
      dbShell.transaction(function(tx) {
        tx.executeSql("update pets set status=?, notes=? where id = ?",
          [$scope.temp.status,$scope.temp.notes,$scope.item.id]);
        }, dbErrorHandler,success);
      
      function dbErrorHandler(err){
        alert("DB Error: "+err.message + "\nCode="+err.code);
      }

      function success() {        
        $scope.navi.popPage();
      }
    };
  });

  module.controller('NewController', function($scope, $data) {
      $scope.pet = {
        petName: "",
      };

    $scope.save = function() {
      var dbShell = window.openDatabase("DataPet", 2, "Data from Pets", 5*1024*1024);
      dbShell.transaction(function(tx) {
        tx.executeSql("insert into pets(petName,petPicture,sex,type,ownerName,ownerPicture,address,phone,comments,status) values(?,?,?,?,?,?,?,?,?,?)",
          [$scope.pet.petName,$scope.pet.petImage,$scope.pet.sex,$scope.pet.type,$scope.pet.ownerName,$scope.pet.ownerImage,$scope.pet.address,$scope.pet.phone,
          $scope.pet.comments,0]);
        }, dbErrorHandler,success);
      
      function dbErrorHandler(err){
        alert("DB Error: "+err.message + "\nCode="+err.code);
      }

      function success() {
        $scope.pet.petName= "";
        $scope.pet.sex= "";
        $scope.pet.type= "";
        $scope.pet.ownerName= "";
        $scope.pet.address= "";
        $scope.pet.phone= "";
        $scope.pet.comments= "";
        $scope.pet.status= "";
        
        $scope.navi.popPage();
      }
    };

    $scope.takePetPhoto = function() {

      var pictureSource;   // picture source
      var destinationType; // sets the format of returned value

      // Wait for device API libraries to load
      //
      document.addEventListener("deviceready",onDeviceReady,false);

      // device APIs are available
      //
      function onDeviceReady() {
          pictureSource=navigator.camera.PictureSourceType;
          destinationType=navigator.camera.DestinationType;
      }

      navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
        destinationType: destinationType.DATA_URL, correctOrientation: true });

      function onPhotoDataSuccess(imageData) {
        $scope.pet.petImage= "data:image/jpeg;base64," +imageData;
      }

      function onFail() {
        //alert("FALLO");
      }
    };

    $scope.takeOwnerPhoto = function() {

      var pictureSource;   // picture source
      var destinationType; // sets the format of returned value

      // Wait for device API libraries to load
      //
      document.addEventListener("deviceready",onDeviceReady,false);

      // device APIs are available
      //
      function onDeviceReady() {
          pictureSource=navigator.camera.PictureSourceType;
          destinationType=navigator.camera.DestinationType;
      }

      navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
        destinationType: destinationType.DATA_URL, correctOrientation: true });

      function onPhotoDataSuccess(imageData) {
        $scope.pet.ownerImage= "data:image/jpeg;base64," +imageData;
      }

      function onFail() {
        //alert("FALLO");
      }
    };
  });

  module.controller('MasterController', function($scope, $data) {
    $scope.items = $data.items;  
    
    $scope.showDetail = function(index) {
      var selectedItem = $data.items[index];
      $data.selectedItem = selectedItem;
      $scope.navi.pushPage('detail.html', {title : selectedItem.title});
    };
  });

  module.factory('$data', function() {

    var data = {};
    data.items = [
      { 
          id: "",
          petName: "",
          petPicture: "",
          sex: "",
          type: "",
          ownerName: "",
          ownerPicture: "",
          address: "",
          phone: "",
          comments: "",
          status: "",
          notes: ""
      }
   ]; 

    var dbShell = window.openDatabase("DataPet", 2, "Data from Pets", 5*1024 * 1024);
      dbShell.transaction(function(tx) {tx.executeSql("select * from pets order by status, petName",[], loadEntries);
        }, dbErrorHandler);
      
    function dbErrorHandler(err){
      alert("Select DB Error: "+err.message + "\nCode="+err.code);
    }

    function loadEntries(tx,results){
      if (results.rows.length > 0) {
        for(var i=0; i<results.rows.length; i++) {
          data.items[i] = {
            id: results.rows.item(i).id,
            petName: results.rows.item(i).petName,
            petPicture: results.rows.item(i).petPicture,
            sex: results.rows.item(i).sex,
            type: results.rows.item(i).type,
            ownerName: results.rows.item(i).ownerName,
            ownerPicture: results.rows.item(i).ownerPicture,
            address: results.rows.item(i).address,
            phone: results.rows.item(i).phone,
            comments: results.rows.item(i).comments,
            status: results.rows.item(i).status,
            notes: results.rows.item(i).notes
          };
        }
      }
    }      
    
    return data;
  });
})();

