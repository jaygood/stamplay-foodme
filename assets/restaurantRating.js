'use strict';


/*
AngularJS directives are what controls the rendering of the HTML 
inside an AngularJS application. 
Examples of directives are the interpolation directive ( {{ }} ), 
the ng-repeat directive and ng-if directive.

It is possible to implement your own directives too. 
This is what AngularJS refers to as "teaching HTML new tricks". 
This piece of code that follow show you how to do that.

Here a custom directive called `fm-rating` has been 
declard and it will display the rating controls. 
Rating controls are displayed to filter restaurants 
in the homepage or to let users assign a rating 
in the restaurant profile page.
*/

angular.module('stamplayFood').directive('fmRating', function($http) {
  return {
    restrict: 'E',
    scope: {
      symbol: '@',
      max: '@',
      readonly: '@',
      deleted: '@'
    },
    require: 'ngModel',

    link: function(scope, element, attrs, ngModel) {

      //max number of star or another element use for rating
      attrs.max = scope.max = parseInt(scope.max || 5, 10); 
      
      //default symbol is a star 
      if (!attrs.symbol) {
        attrs.symbol = scope.symbol = '\u2605';
      }

      var styles = [];
      scope.styles = styles;
    
      //attribute use for hide or show element in template 
      if(scope.readonly == 'true'){
        scope.readonly = true
      }else{
        scope.readonly = false
      }
      if(scope.deleted == 'true'){
        scope.deleted = true
      }else{
        scope.deleted = false
      }
      scope.alreadyVoted = false;

      for(var i = 0; i < scope.max; i ++) {
        styles.push({ 'fm-selected': false, 'fm-hover': false });
      }

      // function for enter event 
      scope.enter = function(index) {
        if (scope.readonly || scope.alreadyVoted || attrs.disabled) return;
        angular.forEach(styles, function(style, i) {
          style['fm-hover'] = i <= index;
        });
      };

      // function for leave event 
      scope.leave = function(index) {
        if (scope.readonly || scope.alreadyVoted || attrs.disabled) return;
        angular.forEach(styles, function(style, i) {
          style['fm-hover'] = false;
        });
      };

      // view -> model
      // function trigger when select value on element 
      scope.select = function(index) {
        if (scope.readonly || scope.alreadyVoted || attrs.disabled) return;
        ngModel.$setViewValue((index == null) ? null : index + 1);
        udpateSelectedStyles(index);
        //  if clear link is not present an user doesn't rate 
        if(scope.deleted && !scope.alreadyVoted){
          var id = attrs.model;
          //rate 'id' restaurant
          $http({method:'PUT', data: {rate: index+1}, url:'/api/cobject/v0/restaurant/'+id+'/rate'})
          .success(function(data){
            scope.alreadyVoted = true;
          })
          .error(function(data){
            console.log(data)
          })
        }
      };

      scope.getValue = function(){
        var value = 0;
        angular.forEach(styles, function(style, i) {
          if(style['fm-selected'] == true)
            value++
        });
        return value;
      }

      // model -> view
      ngModel.$render = function() {
        udpateSelectedStyles(ngModel.$viewValue - 1);
      };

      function udpateSelectedStyles(index) {
        if (index == null) index = -1;
        angular.forEach(styles, function(style, i) {
          style['fm-selected'] = i <= index;
        });
      }
    },
    template:
      '<ul class="fm-rating" ng-class="{\'fm-rating-pointer\':!readonly}">' +
        '<li ng-repeat="style in styles" ng-class="style" ' +
            'ng-click="select($index)" ng-mouseenter="enter($index)" ng-mouseleave="leave($index)">' +
          '{{symbol}}' +
        '</li>' +
      '</ul>' +
      '<a ng-show="!readonly && !deleted" ng-click="select(null)">clear</a>'
  };
});
