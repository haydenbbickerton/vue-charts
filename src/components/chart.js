import _ from 'lodash'
import loadCharts from '../utils/googleChartsLoader.js'
import eventsBinder from '../utils/eventsBinder.js'
import propsWatcher from '../utils/propsWatcher.js'

let props = {
  packages: {
    type: Array,
    default: function () {
      return ['corechart']
    }
  },
  version: {
    default: 'current'
  },
  chartType: {
    required: true,
    type: String,
    default: function () {
      return 'LineChart'
    }
  },
  chartEvents: {
    type: Object,
    default: function () {
      return {}
    }
  },
  columns: {
    required: true,
    type: Array
  },
  rows: {
    type: Array,
    default: function () {
      return []
    }
  },
  options: {
    type: Object,
    default: function () {
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
      }
    }
  }
}

export default {
  name: 'vue-chart',
  props: props,
  template: '<div class="vue-chart-container">' +
              '<div class="vue-chart" id="{{ chartId }}"></div>' +
            '</div>',
  data: function () {
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
    }
  },
  ready: function () {
    let self = this
    loadCharts(self.packages, self.version)
      .then(self.drawChart)
      .then(function () {
        // we don't want to bind props because it's a kind of "computed" property
        const watchProps = props
        delete watchProps.bounds

        // watching properties
        propsWatcher(self, watchProps)

        // binding events
        eventsBinder(self, self.chart, self.chartEvents)
      })
      .catch(function (error) {
        throw error
      })
  },
  methods: {
    /**
     * Initialize the datatable and add the initial data.
     *
     * @link https://developers.google.com/chart/interactive/docs/reference#DataTable
     * @return object
     */
    buildDataTable: function () {
      let self = this

      let dataTable = new google.visualization.DataTable()

      _.each(self.columns, function (value) {
        dataTable.addColumn(value)
      })

      if (!_.isEmpty(self.rows)) {
        dataTable.addRows(self.rows)
      }

      return dataTable
    },
    /**
     * Update the datatable.
     *
     * @return void
     */
    updateDataTable: function () {
      let self = this

      // Remove all data from the datatable.
      self.dataTable.removeRows(0, self.dataTable.getNumberOfRows())
      self.dataTable.removeColumns(0, self.dataTable.getNumberOfColumns())

      // Add
      _.each(self.columns, function (value) {
        self.dataTable.addColumn(value)
      })

      if (!_.isEmpty(self.rows)) {
        self.dataTable.addRows(self.rows)
      }
    },
    /**
     * Initialize the wrapper
     *
     * @link https://developers.google.com/chart/interactive/docs/reference#chartwrapper-class
     *
     * @return object
     */
    buildWrapper: function (chartType, dataTable, options, containerId) {
      let wrapper = new google.visualization.ChartWrapper({
        chartType: chartType,
        dataTable: dataTable,
        options: options,
        containerId: containerId
      })

      return wrapper
    },
    /**
     * Build the chart.
     *
     * @return void
     */
    buildChart: function () {
      let self = this

      // If dataTable isn't set, build it
      let dataTable = _.isEmpty(self.dataTable) ? self.buildDataTable() : self.dataTable

      self.wrapper = self.buildWrapper(self.chartType, dataTable, self.options, self.chartId)

      // Set the datatable on this instance
      self.dataTable = self.wrapper.getDataTable()

      // After chart is built, set it on this instance
      google.visualization.events.addOneTimeListener(self.wrapper, 'ready', function () {
        self.chart = self.wrapper.getChart()
      })
    },
    /**
     * Draw the chart.
     *
     * @return void
     */
    drawChart: function () {
      let self = this

      // We don't have any (usable) data, or we don't have columns. We can't draw a chart without those.
      if ((!_.isEmpty(self.rows) && !_.isObjectLike(self.rows)) || _.isEmpty(self.columns)) {
        return
      }

      if (_.isNull(self.chart)) {
        // We haven't built the chart yet, so JUST. DO. IT!
        self.buildChart()
      } else {
        // Chart already exists, just update the data
        self.updateDataTable()
      }

      // Chart has been built/Data has been updated, draw the chart.
      self.wrapper.draw()
    }
  }
}
