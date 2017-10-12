export function propsWatcher (vue, props) {
  /*
    Watch our props. Every time they change, redraw the chart.
   */
  Object.entries(props).forEach(([attribute, {type: type}]) => {
    vue.$watch(attribute, () => {
      vue.drawChart()
    }, {
      deep: type instanceof Object
    })
  })
}

export default propsWatcher
