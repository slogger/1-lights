var TraficLight = require('./TraficLight.js'),
    events = require('events'),
    eventEmitter = new events.EventEmitter();

var config = {
    timeout : {
        green : 3000,
        yellow : 2000,
        red : 3000,
        tram : {
          arrival : 3000,
          passage : 10000,
        }
    },
    order : ['Green', 'Yellow', 'Red']
};

  /**
   * Переключение в зеленый
   *
   * @param {Number} timeout время свечения в мсек
   */
TraficLight.prototype.toGreen = function(timeout) {
    this.switch("Green", timeout );
};

  /**
   * Переключение в желтый
   *
   * @param {Number} timeout время свечения в мсек
   */
TraficLight.prototype.toYellow = function(timeout) {
    this.switch("Yellow", timeout );
};

  /**
   * Переключение в красный
   *
   * @param {Number} timeout время свечения в мсек
   */
TraficLight.prototype.toRed = function(timeout) {
    this.switch("Red", timeout );
};

  /**
   * Обработчик события 'stop'
   */
eventEmitter.on('stop', function() {
  trafic.stop();
  clearInterval(intervalId);
});

  /**
   * Обработчик события 'tram'
   *
   * 1) Запоминаем цвет который горит сейчас
   * 2) Высчитываем сколько ему еще гореть
   * 3) Через config.timeout.tram.arrival мсек переключаемся в зеленый на config.timeout.tram.passage мсек
   * 4) После того как трамвай проехал, говорим что можно востановится
   */
eventEmitter.on('tram', function() {
  var currentTime = new Date();
  var previousColor = trafic.state();
  var restTime = trafic.current.timeout - (currentTime - trafic.current.startTime);
  var tramTime = trafic.getConfig().timeout.tram;

  setTimeout(function() {
    trafic.toGreen( tramTime.passage );
  }, tramTime.arrival);

  eventEmitter.emit('restore', previousColor, restTime);
});

  /**
   * Обработчик события 'restore'
   *
   * Если гореть остается меньше percent % от изначального времени, переключаемся на следующий цвет
   *
   * @param {string} color цвет в котором мы были до трамвая
   * @param {number} restTime остаток времени
   * @param {number} percent
   */
eventEmitter.on('restore', function(color, restTime, percent) {
  var tramTime = trafic.getConfig().timeout.tram,
      tramTimeAll = tramTime.arrival + tramTime.passage;

  setTimeout(function() {
    var traficConfig = trafic.getConfig();
    var timeout = traficConfig.timeout[ color.toLowerCase() ];
    var controlTime = ((timeout / 100) * (percent || 25));

    if(restTime > controlTime) {
      trafic['to' + color](restTime);
    } else {
      trafic.current.color = color;
      trafic.next();
    }
  }, tramTimeAll);
});

var trafic = new TraficLight(config);
trafic.run();

var intervalId = setInterval(function() { console.log(trafic.state()); }, 1000);

// Делает программу не вечной
setTimeout(function() {eventEmitter.emit('stop');}, 40000);

// Указываем через сколько поедет трамвай
setTimeout(function() {eventEmitter.emit('tram');}, 8000);
