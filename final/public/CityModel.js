/**
 * Created by Hasidi on 20/06/2017.
 */

app.factory('CityModel', ['$http', function($http) {
    function CityModel(city) {
        if (city)
            this.setData(city);
    }
    CityModel.prototype = {
        setData: function(cityData) {
            angular.extend(this, cityData);
        },
        load: function(cityID) {
            $http.get('/cities/' + cityID).then(function(cityData) {
                this.setData(cityData);
            });
        },
        add: function () {
            $http.post('/cities', this).then(function(res) {
            });
        },
        delete: function() {
            $http.delete('cities/delete/' + this.id); //not implemented
        }
    };
    return CityModel;
}]);