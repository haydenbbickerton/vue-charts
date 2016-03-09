import _ from 'lodash'

export default (vue, props) => {
  /*
    Watch our props. Every time they change, redraw the chart.
   */
  _.each(props, ({
    type: type
  }, attribute) => {
    vue.$watch(attribute, () => {
      vue.drawChart()
    }, {
      deep: _.isObject(type)
    })
  })
}
