/*!
 * vue-charts v0.2.1
 * (c) 2016 Hayden Bickerton
 * Released under the MIT License.
 */
'use strict';

var _ = require('lodash');
_ = 'default' in _ ? _['default'] : _;

/*
    This lets us resolve the promise outside the
    promise function itself.
 */
function makeDeferred() {
  var resolvePromise = null;
  var rejectPromise = null;

  var promise = new Promise(function (resolve, reject) {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise: promise,
    resolve: resolvePromise,
    reject: rejectPromise
  };
}

function eventsBinder(vue, googleChart, events) {
  // Loop through our events, create a listener for them, and
  // attach our callback function to that event.
  for (var event in events) {
    var eventName = event;
    var eventCallback = events[event];

    if (eventName === 'ready') {
      // The chart is already ready, so this event missed it's chance.
      // We'll call it manually.
      eventCallback();
    } else {
      google.visualization.events.addListener(googleChart, eventName, eventCallback);
    }
  }
}

var isLoading = false;
var isLoaded = false;

// Our main promise
var googlePromise = makeDeferred();

function googleChartsLoader() {
  var packages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['corechart'];
  var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'current';
  var mapsApiKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (!Array.isArray(packages)) {
    throw new TypeError('packages must be an array');
  }

  if (version !== 'current' && typeof version !== 'number' && version !== 'upcoming') {
    throw new TypeError('version must be a number, "upcoming" or "current"');
  }

  // Google only lets you load it once, so we'll only run once.
  if (isLoading || isLoaded) {
    return googlePromise.promise;
  }

  isLoading = true;

  var script = document.createElement('script');
  script.setAttribute('src', 'https://www.gstatic.com/charts/loader.js');

  script.onreadystatechange = script.onload = function () {
    // After the 'loader.js' is loaded, load our version and packages
    var options = {
      packages: packages
    };

    if (mapsApiKey) {
      options['mapsApiKey'] = mapsApiKey;
    }

    google.charts.load(version, options);

    // After we've loaded Google Charts, resolve our promise
    google.charts.setOnLoadCallback(function () {
      isLoading = false;
      isLoaded = true;
      googlePromise.resolve();
    });
  };

  // Insert our script into the DOM
  document.getElementsByTagName('head')[0].appendChild(script);

  return googlePromise.promise;
}

function propsWatcher(vue, props) {
  /*
    Watch our props. Every time they change, redraw the chart.
   */
  _.each(props, function (_ref, attribute) {
    var type = _ref.type;

    vue.$watch(attribute, function () {
      vue.drawChart();
    }, {
      deep: _.isObject(type)
    });
  });
}

var chartDeferred = makeDeferred();

var props = {
  packages: {
    type: Array,
    default: function _default() {
      return ['corechart'];
    }
  },
  version: {
    default: 'current'
  },
  mapsApiKey: {
    default: false
  },
  chartType: {
    type: String,
    default: function _default() {
      return 'LineChart';
    }
  },
  chartEvents: {
    type: Object,
    default: function _default() {
      return {};
    }
  },
  columns: {
    required: true,
    type: Array
  },
  rows: {
    type: Array,
    default: function _default() {
      return [];
    }
  },
  options: {
    type: Object,
    default: function _default() {
      return {
        chart: {
          title: 'Chart Title',
          subtitle: 'Subtitle'
        },
        hAxis: {
          title: 'X Label'
        },
        vAxis: {
          title: 'Y Label'
        },
        width: '400px',
        height: '300px',
        animation: {
          duration: 500,
          easing: 'out'
        }
      };
    }
  }
};

var Chart = {
  name: 'vue-chart',
  props: props,
  render: function render(h) {
    var self = this;
    return h('div', { class: 'vue-chart-container' }, [h('div', {
      attrs: {
        id: self.chartId,
        class: 'vue-chart'
      }
    })]);
  },
  data: function data() {
    return {
      chart: null,
      /*
          We put the uid in the DOM element so the component can be used multiple
          times in the same view. Otherwise Google Charts will only make one chart.
           The X is prepended because there must be at least
          1 character in id - https://www.w3.org/TR/html5/dom.html#the-id-attribute
      */
      chartId: 'X' + this._uid,
      wrapper: null,
      dataTable: [],
      hiddenColumns: []
    };
  },

  events: {
    redrawChart: function redrawChart() {
      this.drawChart();
    }
  },
  mounted: function mounted() {
    var self = this;
    googleChartsLoader(self.packages, self.version, self.mapsApiKey).then(self.drawChart).then(function () {
      // we don't want to bind props because it's a kind of "computed" property
      var watchProps = props;
      delete watchProps.bounds;

      // watching properties
      propsWatcher(self, watchProps);

      // binding events
      eventsBinder(self, self.chart, self.chartEvents);
    }).catch(function (error) {
      throw error;
    });
  },

  methods: {
    /**
     * Initialize the datatable and add the initial data.
     *
     * @link https://developers.google.com/chart/interactive/docs/reference#DataTable
     * @return object
     */
    buildDataTable: function buildDataTable() {
      var self = this;

      var dataTable = new google.visualization.DataTable();

      _.each(self.columns, function (value) {
        dataTable.addColumn(value);
      });

      if (!_.isEmpty(self.rows)) {
        dataTable.addRows(self.rows);
      }

      return dataTable;
    },


    /**
     * Update the datatable.
     *
     * @return void
     */
    updateDataTable: function updateDataTable() {
      var self = this;

      // Remove all data from the datatable.
      self.dataTable.removeRows(0, self.dataTable.getNumberOfRows());
      self.dataTable.removeColumns(0, self.dataTable.getNumberOfColumns());

      // Add
      _.each(self.columns, function (value) {
        self.dataTable.addColumn(value);
      });

      if (!_.isEmpty(self.rows)) {
        self.dataTable.addRows(self.rows);
      }
    },


    /**
     * Initialize the wrapper
     *
     * @link https://developers.google.com/chart/interactive/docs/reference#chartwrapper-class
     *
     * @return object
     */
    buildWrapper: function buildWrapper(chartType, dataTable, options, containerId) {
      var wrapper = new google.visualization.ChartWrapper({
        chartType: chartType,
        dataTable: dataTable,
        options: options,
        containerId: containerId
      });

      return wrapper;
    },


    /**
     * Build the chart.
     *
     * @return void
     */
    buildChart: function buildChart() {
      var self = this;

      // If dataTable isn't set, build it
      var dataTable = _.isEmpty(self.dataTable) ? self.buildDataTable() : self.dataTable;

      self.wrapper = self.buildWrapper(self.chartType, dataTable, self.options, self.chartId);

      // Set the datatable on this instance
      self.dataTable = self.wrapper.getDataTable();

      // After chart is built, set it on this instance and resolve the promise.
      google.visualization.events.addOneTimeListener(self.wrapper, 'ready', function () {
        self.chart = self.wrapper.getChart();
        chartDeferred.resolve();
      });
    },


    /**
     * Draw the chart.
     *
     * @return Promise
     */
    drawChart: function drawChart() {
      var self = this;

      // We don't have any (usable) data, or we don't have columns. We can't draw a chart without those.
      if (!_.isEmpty(self.rows) && !_.isObjectLike(self.rows) || _.isEmpty(self.columns)) {
        return;
      }

      if (_.isNull(self.chart)) {
        // We haven't built the chart yet, so JUST. DO. IT!
        self.buildChart();
      } else {
        // Chart already exists, just update the data
        self.updateDataTable();
      }

      // Chart has been built/Data has been updated, draw the chart.
      self.wrapper.draw();

      // Return promise. Resolves when chart finishes loading.
      return chartDeferred.promise;
    }
  }
};

function install(Vue) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  Vue.component('vue-chart', Chart);
}

module.exports = install;