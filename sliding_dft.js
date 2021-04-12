"use strict"

var ndarray = require("ndarray")
var fft = require("ndarray-fft")

function hannWindowAnalysis(t) {
  return 0.5 * (1.0 - Math.cos(2.0 * Math.PI * t));
}

function hannWindowSynthesis(t) {
  return hannWindowAnalysis(t) * 2.0 / 3.0
}

function initWindow(frame_size, window_func) {
  var ftwindow = new Float32Array(frame_size)
  for(var i=0; i<frame_size; ++i) {
    ftwindow[i] = window_func(i / (frame_size-1))
  }
  return ftwindow
}

function forwardSlidingDFT(frame_size, onstft, options) {
  options = options || {}
  
  var hop_size = 1
  var buffer   = new Float32Array(frame_size * 2)
  var ptr      = 0
  var window   = initWindow(frame_size, options.window_func||hannWindowAnalysis)
  var out_x    = new Float32Array(frame_size)
  var out_y    = new Float32Array(frame_size)
  var real     = ndarray(out_x)
  var imag     = ndarray(out_y)
  var new_x    = new Float32Array(frame_size)
  var new_y    = new Float32Array(frame_size)
  
  return function stft(input) {
    //var n = frame_size
    var i, j, k, f
    var a, b
    var W = window, B = buffer, X = out_x, Y = out_y
   
    // calculate first frame using fft
    for(i = 0; i < frame_size; i++) {
        X[i] = input[i]
        Y[i] = 0.0
    }
    // console.log(Array.prototype.slice.call(X))
    // console.log(Array.prototype.slice.call(Y))
    // console.log(real)
    // console.log(imag)
    fft(1, real, imag)
    onstft(X, Y)
    console.log(Array.prototype.slice.call(X))
    console.log(Array.prototype.slice.call(Y))
    // slide through rest of the input frame
    for(k = 0; k < input.length - frame_size; k++) {
        for(f = 0; f < frame_size; f++) {
            a = Math.cos(2 * Math.PI * f / frame_size)
            b = Math.sin(2 * Math.PI * f / frame_size)
            // console.log("a: " + a)
            // console.log("b: " + b)
            // console.log("xn+k: " + input[k+frame_size])
            // console.log("xk: " + input[k])
            // console.log("delta: " + X[f])
            new_x[f] = a * (X[f] + input[k+frame_size] - input[k]) - b * Y[f]
            new_y[f] = a * Y[f] + b * (X[f] + input[k+frame_size] - input[k])
        }
        console.log(Array.prototype.slice.call(new_x))
        console.log(Array.prototype.slice.call(new_y))
        for(i = 0; i < frame_size; i++) {
            X[i] = new_x[i]
            Y[i] = new_y[i]
        }
        //onstft(X, Y)
    }
  }
}

function inverseSlidingDFT(frame_size, onistft, options) {
  options = options || {}
  
  var hop_size = 1
  var buffer   = new Float32Array(frame_size * 2)
  var output   = buffer.subarray(0, frame_size)
  var sptr     = 0
  var eptr     = 0
  var window   = initWindow(frame_size, options.window_func||hannWindowSynthesis)
  var real     = ndarray(window)
  var imag     = ndarray(window)
  
  return function istft(X, Y) {
    var n = frame_size
    var i, j, k
    var W = window, B = buffer
    
    //FFT input signal
    real.data = X
    imag.data = Y
    fft(-1, real, imag)

    //Overlap-add
    k = eptr
    for(i=0, j=sptr; j<k; ++i, ++j) {
      B[j] += X[i]
    }
    for(; i < n; ++i, ++j) {
      B[j] = X[i]
    }
    sptr += hop_size
    eptr = j

    //Emit frames
    while(sptr >= n) {
      onistft(output)
      for(i=0, j=n; i<n; ++i, ++j) {
        B[i] = B[j]
      }
      eptr -= n
      sptr -= n
    }
  }
}

function SlidingDFT(dir, frame_size, ondata, options) {
  if(dir >= 0) {
    return forwardSlidingDFT(frame_size, ondata, options)
  } else {
    return inverseSlidingDFT(frame_size, ondata, options)
  }
}

module.exports = SlidingDFT
module.exports.sdft = forwardSlidingDFT
module.exports.isdft = inverseSlidingDFT