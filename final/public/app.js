
let app = angular.module('myApp', ['ngRoute', 'LocalStorageModule','oitozero.ngSweetAlert']);
let servPath = 'http://localhost:5000';
//-------------------------------------------------------------------------------------------------------------------
app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('node_angular_App');
});
//-------------------------------------------------------------------------------------------------------------------
app.controller('mainController', ['userService','$location','$window', function (userService, $location, $window) {
    let vm = this;
    vm.greeting = 'Have a nice day';
    vm.userService = userService;
    vm.userService.getCookie();

    vm.loginReDirect = function () {
        $location.path("/Signin");
    }
    vm.rgisterReDirect = function () {
        $location.path("/Register");
    }

}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService', '$location', '$window',
    function(UserService, $location, $window) {
        let self = this;
        self.user = {username: '', password: ''};

        self.login = function(valid) {
            if (valid) {
                UserService.login(self.user).then(function (success) {
                    $window.alert('You are logged in');
                    $location.path('/');
                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('log-in has failed');
                })
            }
        };
}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('citiesController', ['$http', 'CityModel', function($http, CityModel) {
        let self = this;
        self.fieldToOrderBy = "name";
        // self.cities = [];
        self.getCities = function () {
            $http.get('/cities')
                .then(function (res) {
                    // self.cities = res.data;
                    //We build now cityModel for each city
                    self.cities = [];
                    angular.forEach(res.data, function (city) {
                        self.cities.push(new CityModel(city));
                    });
                });
        };
        self.addCity = function () {
          let city = new CityModel(self.myCity);
          if (city) {
              city.add();
              self.getCities();
          }
        };
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.factory('UserService', ['$http', function($http) {
    let service = {};
    service.isLoggedIn = false;
    service.login = function(user) {
        return $http.post('/login', user)
            .then(function(response) {
                let token = response.data;
                $http.defaults.headers.common = {
                    'my-Token': token,
                    'user' : user.username
                };
                service.isLoggedIn = true;
                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
}]);
app.config( ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "views/home.html",

        })
        .when("/login", {
            templateUrl : "views/login.html",

        })
        .when("/cities", {
            templateUrl : "views/cities.html",

        })
        .when("/StorageExample", {
            templateUrl : "views/StorageExample.html",

        })
        .when("/Register", {
            templateUrl : "views/register.html",

        })
        .when("/Products", {
            templateUrl : "views/products.html",

        })
        .when("/Countries", {
            templateUrl : "views/countries.html",

        })
        .when("/Signin", {
            templateUrl : "views/signin.html",

        })
        .otherwise({redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------

app.controller('categoriesController', function($http) {
    let self = this;
        $http.get(servPath + '/GetAllCategory')
            .then(function (res) {
                self.categories = res.data;
            })
            .catch(function (e) {
                console.log(e);
            });
});

//-------------------------------------------------------------------------------------------------------------------

app.controller('productController', ['$http','cartService',function($http, cartService) {
    let self = this;
    self.order = 'Productname';
    self.ordrBy = function (cat) {
        if(cat == 1){
            self.order = 'Productname';
        }
        else if(cat == 2){
            self.order = 'price';
        }
        else if(cat == 3){
            self.order = 'ProductID';
        }

    }


    self.addToCart = function (product) {
        product.quantity = 1;
        cartService.cartList.push(product);

    }

    self.selected = '';
    self.changeSelected = function (item) {
        self.selected = item.Categoryname;
    }



        $http.get(servPath + '/GetAllProduct')
            .then(function (res) {
                self.products = res.data;
                return Promise.resolve($http.get(servPath + '/GetAllCategory'));
            })
            .then(function (res) {
                self.categories = res.data;
                return Promise.resolve($http.get(servPath + '/ShowHotProducts'));
            })
            .then(function (res) {
                self.recommended = res.data;
            })
            .catch(function (e) {
                console.log(e);
            });

}]);


//-------------------------------------------------------------------------------------------------------------------

app.controller('countriesController', function($http) {
    let self = this;
    self.getCountries = function () {
        $http.get(servPath + '/getCountries')
            .then(function (res) {
                self.countries = res.data;
            })
            .catch(function (e) {
                console.log(e);
            });
    };
    self.getCountries();
});

//-------------------------------------------------------------------------------------------------------------------

app.controller('newProductsController', ['$http','$window','newProductsService', function($http, $window, newProductsService) {
    let self = this;
    //self.newProducts = newProductsService.newProducts;
    //self.hotProducts = newProductsService.hotProducts;
    //self.first = newProductsService.first;

    self.getHomeProducts = function () {

        if(true)
        {
            //newProductsService.first = false;
            //$window.alert("i'm in!" );
            $http.get(servPath + '/ShowHotProducts')
                .then(function (res) {
                    self.hotProducts = res.data;
                    //$window.alert('new: ' + self.newProducts[0].price );
                    return Promise.resolve($http.get(servPath + '/ShowNewProducts' ));
                })
                .then(function (res) {
                    self.newProducts = res.data;
                    //$window.alert('hot: ' +self.hotProducts[0].price );
                })
                .catch(function (e) {
                    console.log(e);
                });
        }
    };
    self.getHomeProducts();

}]);

app.factory('newProductsService', ['$http' , function($http) {
    let service = {};
    service.newProducts = [];
    service.hotProducts = [];
    service.first = true;
    return service;
}]);


//-------------------------------------------------------------------------------------------------------------------

app.controller('userController',['userService','$window','$http', '$location', function(userService, $window, $http, $location) {
    let self = this;

    self.forgot = false;



    self.logIn = function (userName, password) {
        user = {Username: userName, Password: password};
        $http.post(servPath + '/Login',user)
            .then(function (res) {
                if(res.data == true)
                {
                    userService.userName = userName;
                    userService.isLoggedIn = true;
                    userService.setCookie();
                    userService.getCookie();
                    //$window.alert(userService.date);
                    $location.path('/');
                }
                else
                {
                    $window.alert(res.data);
                }

            })
            .catch(function (e) {
                $window.alert(e.data);
            });
    };

    self.showPassword = function () {

        self.user = { "Username": self.userName ,"Answer": self.security};

        $http.post(servPath + '/ShowPassword',self.user)
            .then(function (res) {
                $window.alert("Your Password: " + res.data);
                self.forgot = false;
            })
            .catch(function (e) {
                $window.alert("from catch: "+ e.data);
            });
    }


}]);

app.factory('userService', ['$http' , 'localStorageService','$window',  function($http, localStorageService, $window) {
    let service = {};
    service.userName = 'guest';
    service.isLoggedIn = false;

    service.setCookie = function () {
        let date = getDate();
        localStorageService.cookie.set('userName',service.userName);
        localStorageService.cookie.set('lastLogIn',date);

    };

    service.getCookie = function () {
        let date = getDate();
        service.userName = localStorageService.cookie.get('userName');
        service.date = localStorageService.cookie.get('lastLogIn');
        if(service.userName){
            service.isLoggedIn = true;
        }


    };

    return service;
}]);


app.controller('registerController',['$http','$window','$location', function($http,$window,$location) {
    let self = this;

     self.register = function (valid) {

            self.user = {
                "Username"  : self.Username,
                "Password" : self.Password,
                "Firsname" : self.Firsname,
                "Lastname" : self.Lastname,
                "Address" : self.Address,
                "City" : self.City,
                "Country" : self.Country.Name,
                "Phone" : self.Phone,
                "Cellular" : self.Cellular,
                "Mail" : self.Mail,
                "Creditcard" : self.Creditcard,
                "Answer" : self.Answer,
                "categoriesArray" :
                    [
                        { "Categoryname": "lala"},
                        { "Categoryname": "b"}
                    ]
            };

        /*
         $window.alert('username: ' + self.Username + ', Password: ' + self.Password +  ', Country: ' +  self.Country.Name
             + ', Firsname: ' + self.Firsname + ', Lastname: ' + self.Lastname +  ', Address: ' +  self.Address
             + ', City: '+self.City + ', Phone ' + self.Phone+  ', Cellular ' +  self.Cellular
             + ', Mail : '+ self.Mail  + ', Creditcard: ' + self.Creditcard+  ', Answer :' +  self.Answer);
        */

            if(valid)
            {
                $http.post(servPath + '/addCustomer',self.user)

                    .then(function (res) {

                    if(res.data == true)
                    {
                        //$window.alert(res.data);
                        $window.alert('registration completed successfully');
                        $location.path("/Signin");
                    }
                    else
                    {
                        $window.alert(res.data);
                    }

                    })
                    .catch(function (e) {
                        $window.alert('error')
                        console.log(e);
                    });
            }
            else {
                $window.alert('invalid parameters');
            }

        };






}]);

app.factory('cartService', ['$http' , function($http) {
    let service = {};
    service.cartList = [];
    service.totalPrice = 0;
    return service;
}]);





app.controller('cartController',['$window','cartService', function($window, cartService) {
    let self = this;
    self.service = cartService;
    self.cartList = cartService.cartList;
    self.removeFromCart = function (product) {
        var index = self.cartList.indexOf(product);
        cartService.cartList.splice(index, 1);
        self.calcTotal();
    }

    self.calcTotal = function () {
        cartService.totalPrice = 0;
        for(let i=0; i<self.cartList.length; i++){
            cartService.totalPrice += Number(self.cartList[i].price)*Number(self.cartList[i].quantity);
        }
    }
    self.calcTotal();

    self.updateQuantity = function (product,q) {
        console.log(product);
        var index = self.cartList.indexOf(product);
        cartService.cartList[index].quantity = q;
        self.calcTotal();
    }

    //$window.alert(self.cartList.length);


}]);

function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    }
    if(mm<10) {
        mm = '0'+mm
    }
    today = dd + '/' + mm + '/' + yyyy;
    return today;
}

app.controller('demoCtrl',['SweetAlert', function(SweetAlert){
    var vm = this;

    vm.alert = function(Productname, Details){ //simple alert
        SweetAlert.swal({
            title:Productname,
            text:Details
        });
    }


    vm.about = 'This project was done by Or baum, Shira levi, and Miri hazanov. ' +
        'The most challenging task in this project was working with a azure database ' +
        'with a single connection at the time. We had to find creative solutions for the server is not shut down while using the site.';

    vm.confirm = function(){
        SweetAlert.swal({
                title: "Are you sure?", //Bold text
                text: "Your will not be able to recover this imaginary file!", //light text
                type: "warning", //type -- adds appropiriate icon
                showCancelButton: true, // displays cancel btton
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false, //do not close popup after click on confirm, usefull when you want to display a subsequent popup
                closeOnCancel: false
            },
            function(isConfirm){ //Function that triggers on user action.
                if(isConfirm){
                    SweetAlert.swal("Deleted!");
                } else {
                    SweetAlert.swal("Your file is safe!");
                }
            });
    }

}]);