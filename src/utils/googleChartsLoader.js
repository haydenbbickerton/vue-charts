let is_loading = false
let is_loaded = false

/*
    This lets us resolve the promise outside the
    promise function itself.
 */
let makeDeferred = function () {
  let resolvePromise = null
  let rejectPromise = null

  let promise = new Promise(function (resolve, reject) {
    resolvePromise = resolve
    rejectPromise = reject
  })

  return {
    promise: promise,
    resolve: resolvePromise,
    reject: rejectPromise
  }
}

// Our main promise
let google_promise = makeDeferred()

export default (packages, version) => {
  // Google only lets you load it once, so we'll only run once.
  if (is_loading || is_loaded) {
    return google_promise.promise
  }

  is_loading = true

  let script = document.createElement('script')
  script.setAttribute('src', 'https://www.gstatic.com/charts/loader.js')

  script.onreadystatechange = script.onload = function () {
    // After the 'loader.js' is loaded, load our version and packages
    google.charts.load(version, {
      packages: packages
    })

    // After we've loaded Google Charts, resolve our promise
    google.charts.setOnLoadCallback(function () {
      is_loading = false
      is_loaded = true
      google_promise.resolve()
    })
  }

  // Insert our script into the DOM
  document.getElementsByTagName('head')[0].appendChild(script)

  return google_promise.promise
}
