var events = require('events'),
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
   * Светофор
   *
   * @this {TraficLight}
   * @param {Object} config
   */
var TraficLight = function(config) {
    this.current = {
        color : null,
        timeout : null,
        startTime : null
    };

    _config = config;
    _timeoutId = null;

      /**
       * Геттер для конфига
       *
       * @return {Object} config
       */
    this.getConfig = function() {
      return _config;
    };

      /**
       * Показывает состояние светофора
       *
       * @return {string} Цвет светофора
       */
    this.state = function() {
        return this.current.color;
    };

      /**
       * Переключение светофора
       *
       * @this {TraficLight}
       */
    this.next = function() {
        var nextColor;
        var numberColors = _config.order.length;

        for( var i = 0; i < numberColors; i++ ) {
            if( this.current.color === _config.order[i] ) {
                nextColor = _config.order[ (++i % numberColors) ];
            }
        }
        
        var timeout = _config.timeout[ nextColor.toLowerCase() ];
        this.switch(nextColor, timeout);
    };

      /**
       * Переключение цветов
       *
       * @param {string} color
       * @param {Number} timeout время свечения в мсек
       */
    this.switch = function(color, timeout) {
      if(this._timeoutId) {
          clearTimeout(this._timeoutId);
      }

      this.current = {
          color : color,
          timeout : timeout,
          startTime : new Date()
      };

      this._timeoutId = setTimeout(
        function() {
            this.next();
        }.bind(this),
        this.current.timeout
      );
    };

      /**
       * Переключение в зеленый
       *
       * @param {Number} timeout время свечения в мсек
       */
    this.toGreen = function(timeout) {
        this.switch("Green", timeout || 4000 );
    };

      /**
       * Переключение в желтый
       *
       * @param {Number} timeout время свечения в мсек
       */
    this.toYellow = function(timeout) {
        this.switch("Yellow", timeout || 3000 );
    };

      /**
       * Переключение в красный
       *
       * @param {Number} timeout время свечения в мсек
       */
    this.toRed = function(timeout) {
        this.switch("Red", timeout || 5000 );
    };

      /**
       * Время полного цикла светофора
       *
       * @return {number} Время полного цикла светофора
       */
    this.getTime = function() {
        var time = 0;
        for( var i = 0; i < _config.order.length; i++ ) {
            time += _config.timeout[ i.toLowerCase() ];
        }
        return time;
    };

      /**
       * Запуск светофора
       *
       * @param {string} color
       */
    this.run = function(color) {
        this[ 'to' + ( color || _config.order[0] ) ]();
    };

      /**
       * Остановка светофора
       */
    this.stop = function() {
        clearTimeout(this._timeoutId);
    };

      /**
       * Автостарт светофора
       */
    (this.run());
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
var intervalId = setInterval(function() { console.log(trafic.state()); }, 1000);

// Делает программу не вечной
setTimeout(function() {eventEmitter.emit('stop');}, 40000);

// Указываем через сколько поедет трамвай
setTimeout(function() {eventEmitter.emit('tram');}, 8000);
