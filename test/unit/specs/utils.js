import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
  googleChartsLoader as loadCharts,
  makeDeferred
} from 'src/utils/index'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Utils', function () {

  /**
   * makeDeferred
   *
   */
  describe('Making deferred promises', function () {
    let deferred

    beforeEach(() => {
      deferred = makeDeferred()
    })

    it('should be a promise', () => {
      return expect(deferred.promise).to.be.a('Promise')
    })

    it('can be resolved', () => {
      deferred.resolve()
      return expect(deferred.promise).to.eventually.be.fulfilled
    })

    it('can be rejected', () => {
      deferred.reject()
      return expect(deferred.promise).to.eventually.be.rejected
    })
  })

  /**
   * googleChartsLoader
   *
   */
  describe('Loading google charts library', function () {
    this.timeout(15000) // Give time for calls to Google API's and whatnot
    let chartsLoader

    beforeEach(() => {
      chartsLoader = loadCharts(['corechart'], 'current')
    })

    it('packges must be an array', () => {
      return expect(() => loadCharts('corechart')).to.throw(TypeError)
    })

    it('version must be a number, or "current"', () => {
      return expect(() => loadCharts(['corechart'], 'forty-three')).to.throw(TypeError)
    })

    it('should be a promise', () => {
      return expect(chartsLoader).to.be.a('Promise')
    })

    it('can be resolved', () => {
      return expect(chartsLoader).to.eventually.be.fulfilled
    })
  })
})
