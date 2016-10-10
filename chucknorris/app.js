var app = angular.module('app', []);

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('timestampInterceptor');
});

app.controller('JokesController', function (JokesService) {

  var self = this;

  this.count = 5;
  this.firstName = 'Chuck';
  this.lastName = 'Norris';

  this.getRandomJokes = function (firstName, lastName, count) {
    JokesService.getRandomJokes(firstName, lastName, count).then(function (jokes) {
      self.joke = null;
      self.jokes = jokes;
    });
  };

  this.getRandomJoke = function (firstName, lastName) {
    JokesService.getRandomJoke(firstName, lastName).then(function (joke) {
      self.jokes = null;
      self.joke = joke;
    });
  };
});

app.constant('API_ENDPOINT', 'http://api.icndb.com/jokes/random/');

app.service('JokesService', function ($http, $q, API_ENDPOINT) {

  function fetchJokes(firstName, lastName, count) {

    var url = count ? API_ENDPOINT + count : API_ENDPOINT;

    return $q(function (resolve, reject) {
      $http.get(url, {
        params: {
          firstName: firstName,
          lastName: lastName,
          escape: 'javascript'
        }
      }).success(function (response, code, headers, config) {
        var time = config.responseTimestamp - config.requestTimestamp;
        console.log('Request time: ' + (time/1000) + ' seconds.');
        resolve(response.value);
      }).error(function (reason, foo, bar, bazinga) {
        reject(reason);
      });
    });

  }

  this.getRandomJoke = function (firstName, lastName) {
    return fetchJokes(firstName, lastName);
  };

  this.getRandomJokes = function (firstName, lastName, count) {
    return fetchJokes(firstName, lastName, count);
  };
});

app.service('timestampInterceptor', function () {
  this.request = function (config) {
    config.requestTimestamp = new Date().getTime();
    return config;
  };

  this.response = function (response) {
    response.config.responseTimestamp = new Date().getTime();
    return response;
  };
});
