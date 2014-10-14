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
      var numberColors = _config.order.length;
      var index = _config.order.indexOf(this.current.color);
      var nextColor = _config.order[ (++index % numberColors) ];
      var timeout = _config.timeout[ nextColor.toLowerCase() ];
      this.switch(nextColor, timeout);
  };

    /**
     * Момент работы
     *
     * @private
     * @param {TraficLight} ctx
     */
  tick = function(ctx) {
      if(ctx._timeoutId) { clearTimeout(ctx._timeoutId); }

      ctx._timeoutId = setTimeout(
        function() {
            this.next();
        }.bind(ctx),
        ctx.current.timeout
      );
  };
    /**
     * Переключение цветов
     *
     * @param {string} color
     * @param {Number} timeout время свечения в мсек
     */
  this.switch = function(color, timeout) {
    this.current = {
        color : color,
        timeout : timeout,
        startTime : new Date()
    };

    tick(this);
  };

    /**
     * Время полного цикла светофора
     *
     * @return {number} Время полного цикла светофора
     */
  this.getCycleTime = function() {
      var time = 0;
      _config.order.forEach(function(color) {
        time += _config.timeout[ color.toLowerCase() ];
      });
      return time;
  };

    /**
     * Запуск светофора
     *
     * @param {string} clr
     */
  this.run = function(clr) {
      color = clr || _config.order[0];
      var timeout = _config.timeout[ color.toLowerCase() ];
      this.switch( color, timeout );
  };

    /**
     * Остановка светофора
     */
  this.stop = function() {
      clearTimeout(this._timeoutId);
  };
};

module.exports = TraficLight;
