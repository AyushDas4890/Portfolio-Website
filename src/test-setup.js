import '@testing-library/jest-dom/vitest'

if (!window.matchMedia) {
  window.matchMedia = (q) => ({
    matches: false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false },
  })
}
class IO { constructor(cb) { this.cb = cb } observe() {} unobserve() {} disconnect() {} }
window.IntersectionObserver = window.IntersectionObserver || IO
window.scrollTo = () => {}
HTMLMediaElement.prototype.play = function () { return Promise.reject(new Error('blocked')) }
HTMLMediaElement.prototype.pause = function () {}
class RO { observe() {} unobserve() {} disconnect() {} }
window.ResizeObserver = window.ResizeObserver || RO
