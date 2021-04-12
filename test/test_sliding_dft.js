var SlidingDFT = require("../sliding_dft.js")

function stftPassThru(frame_size, input) {
  var stft = SlidingDFT(1, frame_size, onfft)
  var istft = SlidingDFT(-1, frame_size, onifft)
  var output = new Float32Array(input.length)
  var in_ptr = 0
  var out_ptr = 0
 
  function onifft(v) {
    console.log(Array.prototype.slice.call(v))
    for(var i=0; i<v.length; ++i) {
      output[out_ptr++] = v[i]
    }
  }
  
  function onfft(x, y) {
    console.log("sdft finished, amplitude:")
    var z = new Float32Array(x.length)
    var i
    for(i = 0; i < x.length; i++) {
        z[i] = Math.sqrt(Math.pow(x[i], 2) + Math.pow(y[i], 2))
    }
    console.log(Array.prototype.slice.call(x))
    console.log(Array.prototype.slice.call(y))
    //istft(x, y)
    // console.log(Array.prototype.slice.call(y))
    // for(var i=0; i<v.length; ++i) {
    //   output[out_ptr++] = v[i]
    // }
  }
  
  //for(var i=0; i+frame_size<=input.length; i+=frame_size) {
  //  stft(input.subarray(i, i+frame_size))
  //}
  //stft(new Float32Array(frame_size))
  stft(input)
  return output
}

console.log(Array.prototype.slice.call(stftPassThru(8, new Float32Array([
  0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]))))

// console.log(Array.prototype.slice.call(stftPassThru(8, new Float32Array([
//     0, 0, 0, 0, 1, 0, 0, 0, 1
//   ]))))
