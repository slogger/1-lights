var config = {
    green : {
        timeout : 4
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
        timeout : null
    };

      /** @private */
    _config = config;

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
        _timeoutId = setTimeout(
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
        if(_timeoutId) {
            clearTimeout(_timeoutId);
        }
        this.current = {
            color : 'Green',
            timeout : timeout || 4
        };
        this.tick();
    };

      /**
       * Переключение в желтый
       *
       * @param {Number} timeout время свечения в секундах
       */
    this.toYellow = function(timeout) {
        if(_timeoutId) {
            clearTimeout(_timeoutId);
        }
        this.current = {
            color : 'Yellow',
            timeout : timeout || 3
        };
        this.tick();
    };

      /**
       * Переключение в красный
       *
       * @param {Number} timeout время свечения в секундах
       */
    this.toRed = function(timeout) {
        if(_timeoutId) {
            clearTimeout(_timeoutId);
        }
        this.current = {
            color : 'Red',
            timeout : timeout || 5
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
        clearTimeout(_timeoutId);
    };

      /**
       * Автостарт светофора
       */
    (this.run());
};

var trafic = new TraficLight(config);
var intervalId = setInterval(function() { console.log(trafic.state()); }, 1000);
