import makeDeferred from './makeDeferred'
let isLoading = false
let isLoaded = false

// Our main promise
let googlePromise = makeDeferred()

export function googleChartsLoader (packages = ['corechart'], version = 'current', mapsApiKey = false) {
  if (!Array.isArray(packages)) {
    throw new TypeError('packages must be an array')
  }

  if (version !== 'current' && typeof version !== 'number' && version !== 'upcoming') {
    throw new TypeError('version must be a number, "upcoming" or "current"')
  }

  // Google only lets you load it once, so we'll only run once.
  if (isLoading || isLoaded) {
    return googlePromise.promise
  }

  isLoading = true

  let script = document.createElement('script')
  script.setAttribute('src', 'https://www.gstatic.com/charts/loader.js')

  script.onreadystatechange = script.onload = () => {
    // After the 'loader.js' is loaded, load our version and packages
    var options = {
      packages: packages
    }

    if (mapsApiKey) {
      options['mapsApiKey'] = mapsApiKey
    }

    google.charts.load(version, options)

    // After we've loaded Google Charts, resolve our promise
    google.charts.setOnLoadCallback(() => {
      isLoading = false
      isLoaded = true
      googlePromise.resolve()
    })
  }

  // Insert our script into the DOM
  document.getElementsByTagName('head')[0].appendChild(script)

  return googlePromise.promise
}

export default googleChartsLoader
