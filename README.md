# vue-charts
[![Version](https://img.shields.io/npm/v/vue-charts.svg?style=flat-square)](https://www.npmjs.com/package/vue-charts)
[![License](https://img.shields.io/npm/l/vue-charts.svg?style=flat-square)](LICENSE)

Google Charts plugin for Vue.js

## Demo
- [Basic Line Chart](https://haydenbbickerton.github.io/vue-charts/basic.html)
- [Multiple Sets of Data, with Update](https://haydenbbickerton.github.io/vue-charts/sets.html)

## Installation

```shell
npm install --save vue-charts
```

### Usage

```js
Vue.use(VueCharts)
```
```html
<!-- Props can be literal, or dynamic (like they are here) -->
<vue-chart
    :chart-type="chartType"
    :columns="columns"
    :rows="rows"
    :options="options"
></vue-chart>
```

## Props

<table>
    <thead>
        <tr>
            <th width="160">Name</th>
            <th width="160">Default</th>
            <th width="100">Type</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>packages</td>
            <td><code>['corechart']</code></td>
            <td>Array</td>
            <td>Google Chart Packages to load.</td>
        </tr>
        <tr>
            <td>version</td>
            <td><code>current</code></td>
            <td>String</td>
            <td>Google Chart Version to load.</td>
        </tr>
        <tr>
            <td>chart-type</td>
            <td><em>none, required</em></td>
            <td>String</td>
            <td>Required. The type of chart to create.</td>
        </tr>
        <tr>
            <td>columns</td>
            <td><em>none, required</em></td>
            <td>Array</td>
            <td>Required. Chart columns.</td>
        </tr>
        <tr>
            <td>rows</td>
            <td><code>[]</code></td>
            <td>Array</td>
            <td>Chart rows.</td>
        </tr>
        <tr>
            <td>options</td>
            <td>Too much, check <a href="https://github.com/haydenbbickerton/vue-charts/blob/master/src/components/chart.js">chart.js</a>.</td>
            <td>Object</td>
            <td><a href="http://developers.google.com/chart/interactive/docs/customizing_charts">Google Charts Options</a></td>
        </tr>
    </tbody>
</table>


# Credits

This plugin is heavily based off of:

- [vue-plugin-boilerplate](https://github.com/kazupon/vue-plugin-boilerplate)
- [vue-google-maps](https://github.com/GuillaumeLeclerc/vue-google-maps/)
- [react-google-charts](https://github.com/RakanNimer/react-google-charts)

# License

[MIT](http://opensource.org/licenses/MIT)
