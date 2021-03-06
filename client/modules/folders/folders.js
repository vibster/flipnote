angular.module('app.folders',[])
  
  .controller('FoldersCtrl', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http){

    $scope.fetchFolders = function(){
      //toggle status
      $rootScope.updating = true;

      $http({
        method: 'GET',
        url: '/folders',
      })
      .success(function(data){
        $rootScope.folders = _.map(data, function(folder){
          return _.extend(folder, {
            active: false
          });
        });
        //if there are folders, make folder with most recent update time active
        if($scope.folders.length){
          $scope.getFolderNotes($rootScope.folders[0]);
        }
        console.log($scope.folders);
        $rootScope.updating = false;
      })
      .error(function(error){
        console.error(error);
      });
    };

    $scope.getFolderNotes = function(folder){
      //toggle status
      $rootScope.updating = true;

      if($rootScope.activeFolder){
        //change status of old active folder to not active
        $rootScope.activeFolder.active = false;        
      }

      //update folder status
      folder.active = true;
      $rootScope.activeFolder = folder;

      $http({
        method: 'GET',
        url: '/folders/' + folder._id + '/notes'
      })
      .success(function(data){
        $rootScope.notes = _.map(data, function(note){
          return _.extend(note, {
            flipped: false,
            unsynced: false,
            addingTag: false
          });
        });
        $rootScope.updating = false;
      })
      .error(function(error){
        console.error(error);
      });
    };

    $scope.deleteFolder = function(folder){
      //toggle status
      $rootScope.updating = true;

      $http({
        method: 'DELETE',
        url: '/folders/' + folder._id
      })
      .success(function(data){
        $rootScope.updating = false;
        $rootScope.folders.splice($rootScope.folders.indexOf(folder), 1);
      })
      .error(function(error){
        console.error(error);
      });
    };
    $scope.createNewFolder = function($event){
      if(event.keyCode === 13 && $scope.newFolder){
        //click enter

        //toggle status
        $rootScope.updating = true;
        var newFolder = $scope.newFolder;
        //close new folder box
        $scope.toggleNewFolder();

        $http({
          method: 'POST',
          url: '/folders/',
          data: {name: newFolder}
        })
        .success(function(data){
          //necessary due to _id of new folder
          $rootScope.folders = _.map(data, function(folder){
            return _.extend(folder, {
              active: false
            });
          });
          //toggle status
          $scope.getFolderNotes($rootScope.folders[0]);
          $rootScope.updating = false;
        });
      }
    };
    $scope.toggleNewFolder = function(){
      $scope.creatingFolder = !$scope.creatingFolder;

      if($scope.creatingFolder){
        //utilize focusMe directive
        $scope.newFolderFocus = true;
      }else{
        $scope.newFolderFocus = false;
      }
      $scope.newFolder = undefined;
    };

    $rootScope.updating = false;
    $scope.creatingFolder = false;
    $scope.newFolderFocus = false;
    //fetch all folders on load
    $scope.fetchFolders();
  }])

  //used to focus textboxes
  .directive('focusMe', function($timeout, $parse){
    return {
      link: function(scope, element, attrs){
        var model = $parse(attrs.focusMe);
        scope.$watch(model, function(value){
          if(value === true){ 
            $timeout(function(){
              element[0].focus(); 
            });
          }else{
            $timeout(function(){
              element[0].blur();
            });
          }
        });
        // set attribute value to 'false' on blur event:
        element.bind('blur', function(){
          scope.$apply(model.assign(scope, false));
        });
      }
    };
  });
