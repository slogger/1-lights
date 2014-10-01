var events = require('events'),
    eventEmitter = new events.EventEmitter();

var config = {
    green : {
        timeout : 3
    },
    yellow : {
        timeout : 2
    },
    red : {
        timeout : 3
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

      /** @private */
    _config = config;

      /**
       * Геттер для конфига
       *
       * @return {Object} config
       */
    this.getConfig = function() {
      return _config;
    };

      /** @private */
    _timeoutId = null;

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
       * @private
       * @this {TraficLight}
       */
    this.next = function() {
        var nextColor;
        for( var i = 0; i < _config.order.length; i++ ) {
            if( this.current.color === _config.order[i] ) {
                if( i !== _config.order.length - 1 ) {
                    nextColor = _config.order[i + 1];
                } else {
                    nextColor = _config.order[0];
                }
            }
        }
        this['to' + nextColor](_config[ nextColor.toLowerCase() ].timeout);
    };

      /**
       * Момент работы
       */
    this.tick = function() {
        this._timeoutId = setTimeout(
          function() {
              this.next();
          }.bind(this),
          this.current.timeout * 1000
        );
    };

      /**
       * Переключение в зеленый
       *
       * @param {Number} timeout время свечения в секундах
       */
    this.toGreen = function(timeout) {
        if(this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
        this.current = {
            color : 'Green',
            timeout : timeout || 4,
            startTime : new Date()
        };
        this.tick();
    };

      /**
       * Переключение в желтый
       *
       * @param {Number} timeout время свечения в секундах
       */
    this.toYellow = function(timeout) {
        if(this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
        this.current = {
            color : 'Yellow',
            timeout : timeout || 3,
            startTime : new Date()
        };
        this.tick();
    };

      /**
       * Переключение в красный
       *
       * @param {Number} timeout время свечения в секундах
       */
    this.toRed = function(timeout) {
        if(this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
        this.current = {
            color : 'Red',
            timeout : timeout || 5,
            startTime : new Date()
        };
        this.tick();
    };

      /**
       * Время полного цикла светофора
       *
       * @return {number} Время полного цикла светофора
       */
    this.getTime = function() {
        var time = 0;
        for( var i = 0; i < _config.order.length; i++ ) {
            time += _config[( _config.order[i].toLowerCase() )].timeout;
        }
        return time * 1000;
    };

      /**
       * Запуск светофора
       *
       * @param {string} color
       */
    this.run = function(color) {
        this['to' + ( color || _config.order[0] )]();
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
   * 2) Запоминаем сколько ему еще гореть
   * 3) Высчитываем разницу между
   * 4) Через 3 секунды переключаемся на зеленый на 10 сек
   * 5) После того как трамвай проехал, говорим что можно востановится
   */
eventEmitter.on('tram', function() {
  var currentTime = new Date();
  var previousColor = trafic.state();
  var restTime = (trafic.current.timeout * 1000) - (currentTime - trafic.current.startTime);
  setTimeout(function() {
    trafic.toGreen(10);
  }, 3000);
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
  setTimeout(function() {
    var traficConfig = trafic.getConfig();
    var timeout = traficConfig[color.toLowerCase()].timeout * 1000;
    var controlTime = ((timeout / 100) * (percent || 25));
    if(restTime > controlTime) {
      trafic['to' + color](restTime / 1000);
    } else {
      trafic.current.color = color;
      trafic.next();
    }
  }, 13000);
});

var trafic = new TraficLight(config);
var intervalId = setInterval(function() { console.log(trafic.state()); }, 1000);

// Делает программу не вечной
setTimeout(function() {eventEmitter.emit('stop');}, 40000);

// Указываем через сколько поедет трамвай
setTimeout(function() {eventEmitter.emit('tram');}, 8000);
