angular.module('stamplayFood',['angular-md5'])
//change interpolate symbol because create conflict with handlebars server side
.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
})
//this a user factory, use for get User Status
.factory('userStatus', function($http) {
    var user = {};
    return {
      //simple call to get userStatus
      getUserCall : function(){
        var call = $http({method: 'GET', url: '/api/user/v0/getStatus'})
        return call
      },
      // Getter and Setter method
      getUser : function(){
        return user
      },  
      setUser : function(displayName, picture, _id, email, logged){
        user = {
          displayName: displayName,
          picture: picture,
          _id: _id,
          email: email,
          logged: logged
        }
      }  
    };
})
//this is a factory for global variables or functions
.factory('globalVariable', function(){
  return {
    email : /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
    cuisine:{
      african: 'African',
      american: 'American',
      barbecue: 'Barbecue',
      cafe: 'Cafe',
      chinese: 'Chinese',
      'czech/slovak': 'Czech / Slovak',
      german: 'German',
      indian: 'Indian',
      japanese: 'Japanese',
      mexican: 'Mexican',
      pizza: 'Pizza',
      thai: 'Thai',
      vegetarian: 'Vegetarian'
    },
    hideModal: function(selector){
      $(selector).modal('hide')
    },
    showModal: function(selector){
      $(selector).modal('show')
    }
  }
})
//controller for the navbar, checks the active page and the User Status 
.controller('NavbarCtrl',['$scope','$location','userStatus', function NavbarController($scope, $location, userStatus) {
  
  //method for setting active class in navbar
  $scope.routeIs = function(routeName) {
    var index =  $location.absUrl().split("/").pop();
    return index === routeName;
  };

  //default value of user Status
  $scope.logged = false;
  
  //Call service 
  //if user was defined -> update $scope
  if(userStatus.getUser().hasOwnProperty('_id')){
     var user = userStatus.getUser()
     $scope.logged = true;
     $scope.displayName = user.displayName;
     $scope.picture = user.profileImg;
     $scope._id = user._id;
  }else{
    //if user non defined, call getStatus api
    var httpCall = userStatus.getUserCall().then(function(data){
      //if user is logged -> update $scope
      if(data.status==200 && data.data.user){
        $scope.logged = true;
        $scope.displayName = data.data.user.displayName;
        $scope.picture = data.data.user.profileImg;
        $scope._id = data.data.user._id;
        userStatus.setUser(data.data.user.displayName, data.data.user.profileImg, data.data.user._id, data.data.user.email, true)
      }
   })
  }
}])
//controller for the login page
.controller('LoginCtrl',['$scope', '$http', '$location','userStatus','md5','globalVariable', function LoginController($scope, $http ,$location, userStatus, md5, globalVariable) {
  
  //setting regexp for email field
  $scope.EMAIL = globalVariable.email;
 
  //login function 
  //before send password use md5 module to encrypt it
  $scope.login = function(){
     var user = {
      email: $scope.email,
      password: $scope.password
    }
    user.password = md5.createHash(user.password)
    $http({method:'POST', data: user, url:'/auth/v0/local/login'})
    .success(function(data, status){
      window.location.href = '/index'
    })
    .error(function(data, status){
      $scope.error = data
    })
  }
}])
//controller for the registration page
.controller('RegistrationCtrl',['$scope','$http','$location','userStatus','md5','globalVariable', function RegistrationCtrl($scope, $http ,$location, userStatus, md5, globalVariable) {
  
  //setting regexp for email field
  $scope.EMAIL = globalVariable.email
  
  //register function 
  $scope.register = function(){
    if($scope.email && $scope.password){
      var user = {
        email: $scope.email,
        password: $scope.password
      }
      user.password = md5.createHash(user.password)
      var validate = { email: $scope.email }
     //first step verify email is not already used
      $http({method:'POST', data: validate, url:'/api/auth/v0/validate/email'})
      .success(function(data, status){
        //second step register user 
        //before send password use md5 module to encrypt it
        $http({method:'POST', data: user, url:'/api/user/v0/users'})
        .success(function(data,status){
          window.location.href = '/index'        
        })
        .error(function(data,status){
          $scope.error = 'Registration Failed'
        })
      })
      .error(function(data, status){
        $scope.error = 'Email Already Exist or invalid'
      })
    }
  }
}])
//controller for restaurant list
.controller('RestaurantCtrl',['$scope','$http','globalVariable', function RestaurantCtrl($scope, $http, globalVariable){
 
  $scope.search = {}
  $scope.CUISINE_OPTIONS = globalVariable.cuisine

  //watch 'search' property for build url filtering  
  $scope.$watch('search', function(search){
    
    //default url
    var url = '/api/cobject/v0/restaurant'
    var first = false;

    //support function for build parametric url 
    var setUrl = function(first, url, property, name){
      if(first || url.indexOf('?')!= -1)
        url = url + '&'+name+'='+property
      else{
        url = url + '?'+name+'='+property
        first = true 
      } 
      return url; 
    }

    if(search.price){
      url = setUrl(first, url, search.price,'price')
    }
    if(search.cusine){
      url = setUrl(first, url, search.cusine,'cusine')
    }
    if(search.rating){
     url = setUrl(first, url, search.rating, 'actions.ratings.avg')
    }

    //get the restaurant filtered
    $http({method: 'GET', url: url}).
      success(function(data, status) {
        $scope.restaurants = data.data;
        //default sorting value
        $scope.order = 'name'
      }).
      error(function(data, status) {
        $scope.error = 'Ops Something went wrong'
      });
  },true)

  //function for added class on active element for sorting restaurant in table
  $scope.orderIs = function(order){
    return order === $scope.order;
  }
}])
//controller for menu and order
.controller('MenuCtrl',['$scope','$http', 'userStatus','globalVariable' ,function MenuCtrl($scope, $http, userStatus, globalVariable){

  // function for get url parameter
  var getURLParameters = function(name) {
    var result = decodeURI((RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.href) || [, null])[1]);
    return (result === "null") ? null : result;          
  };  
  var paramValue = getURLParameters('id'); 
  
  //Call service 
  //if user was defined -> update $scope
  if(userStatus.getUser().hasOwnProperty('_id')){
    $scope.user = userStatus.getUser();
    //get resturant by id 
    getRestaurant(paramValue, false)
  }else{
   //if user non defined, call getStatus api
   var httpCall = userStatus.getUserCall().then(function(data){
    //if user is logged -> update $scope
    if(data.status == 200 && data.data.user){
      $scope.user = {}
      $scope.user.logged = true;
      $scope.user.displayName = data.data.user.displayName;
      $scope.user.picture = data.data.user.profileImg;
      $scope.user._id = data.data.user._id;
      userStatus.setUser(data.data.user.displayName, data.data.user.profileImg, data.data.user._id,data.data.user.email, true)
      //get resturant by id 
      getRestaurant(paramValue, false)
      }else{
        //if user is not logged -> get restaurant by id (without possibility to rate it)
        getRestaurant(paramValue, true)
      }
    })
  }
  //function for get Restaurant by id
  function getRestaurant(paramValue, notlogged){
    $http({method:'GET', url:'/api/cobject/v0/restaurant/'+paramValue}).
    success(function(data, status){
        $scope.restaurant = data;
        $scope.restaurant.menuItems = []
        var find = true;
        //if user is logged check if he already rate this restaurant 
        if(!notlogged){
          for(var i= 0;i<data.actions.ratings.users.length && find;i++){
            if(data.actions.ratings.users[i].userId == $scope.user._id){
              $scope.yourvote = data.actions.ratings.users[i].rating
              $scope.voted = true;
              find = false;
            }
          }
        }
        //Get all meals of restaurant
        for(var i=0;i<$scope.restaurant.meals.length; i++){
          $http({method:'GET', url:'/api/cobject/v0/meal/'+$scope.restaurant.meals[i]}).
            success(function(data, status){
               //push a meal in meals array for data binding
               $scope.restaurant.menuItems.push(data)
            }).error(function(data, status){})
        }
    }).error(function(data, status){   
      $scope.error = 'Ops something went wrong'
    })
  }

  //Set some variable
  $scope.modal = {}
  $scope.cart = {}
  $scope.cart.items = []
  $scope.cart.total = 0;
  $scope.card = {};
  $scope.delivery = {};
  $scope.email = globalVariable.email;
  $scope.cardnumber =  /^\d+$/;
  $scope.expired = /[0-9]{4}\/[0-9]{2}/
  
  //function to add element to cart and update amount of price
  $scope.addToCart = function(item){
    $scope.cart.items.push(item)
    $scope.cart.total = parseInt($scope.cart.total) + parseInt(item.price);
  }

  //function to remove element to cart and update amount of price
  $scope.removeToCart = function(item){
    var index = $scope.cart.items.indexOf(item);
    if (index >= 0) {
      $scope.cart.total = parseInt($scope.cart.total) - parseInt($scope.cart.items[index].price);
      $scope.cart.items.splice(index, 1);
    }
    if (!$scope.cart.items.length) {
      $scope.cart = {};
      $scope.cart.items = []
      $scope.cart.total = 0;
    }
  }

  //function for show or hide modal 
  $scope.showModal = function(){ globalVariable.showModal('#checkoutModal')}  
  $scope.dismiss = function(){ globalVariable.hideModal('#paymentModal')}

  //function for checkout order
  $scope.checkout = function(){
    //check if all field are not empty 
    if(Object.keys($scope.card).length != 4 || Object.keys($scope.delivery).length != 4){
      $scope.modal.error = 'All field are required'
    }else{
      //create an order 
      var meals = []
      for(var i=0; i<$scope.cart.items.length; i++){
        meals.push($scope.cart.items[i].name)
      }
      var data = {
        email: $scope.delivery.email,
        surname: $scope.delivery.surname,
        address: $scope.delivery.address,
        notes: $scope.delivery.notes,
        meals: meals,
        price: $scope.cart.total,
        delivered: false
      } 
      //Post request for create order      
      $http({method:'POST',data: data, url:'/api/cobject/v0/order'}).
        success(function(data, status){
          //close modal and reset cart
          globalVariable.hideModal('#checkoutModal')
          $scope.cart = {};
          $scope.cart.items = []
          $scope.cart.total = 0;
          setTimeout(function(){
            globalVariable.showModal('#paymentModal')
          },1000)
        }).error(function(data, status){   
          $scope.modal.error = 'Ops Something went Wrong'
        })
    }
  }
}])