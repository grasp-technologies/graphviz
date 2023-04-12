/* docs/graphviz.js 1.1.0 */
(function(exports){

'use strict';

var VERSION = "1.1.0", DEBUG = true;
var global=
void 0!==global?global:
"undefined"!=typeof window?window:
this;


function _stackTrace(cons){
const x={stack:""};
if(Error.captureStackTrace){
Error.captureStackTrace(x,cons);
const p=x.stack.indexOf("\n");
if(-1!=p)
return x.stack.substr(p+1)}


return x.stack}










function _parseStackFrame(sf){
let m=/^\s*at\s+([^\s]+)\s+\((?:.+\/(src\/[^\:]+)|([^\:]+))\:(\d+)\:(\d+)\)$/.exec(sf);
return m?
{
func:m[1],
file:m[2]||m[3],
line:parseInt(m[4]),
col:parseInt(m[5])}:


null}


function panic(msg){



if(console.error.apply(console,["panic:",msg].concat(Array.prototype.slice.call(arguments,1))),"undefined"==typeof process)


{
let e=new Error(msg);

throw e.name="Panic",e}console.error(_stackTrace(panic)),process.exit(2)}



function print(){
console.log.apply(console,Array.prototype.slice.call(arguments))}


const dlog=console.log.bind(console,"[debug]");

function assert(){

var cond=arguments[0],
msg=arguments[1],
cons=arguments[2]||assert;
if(!cond){
if(assert.throws||"undefined"==typeof process)























{
var e=new Error("assertion failure: "+(msg||cond));


throw e.name="AssertionError",e.stack=_stackTrace(cons),e}var stack=_stackTrace(cons);console.error("assertion failure:",msg||cond);var sf=_parseStackFrame(stack.substr(0,stack.indexOf("\n")>>>0));if(sf)try{const lines=require("fs").readFileSync(sf.file,"utf8").split(/\n/),line_before=lines[sf.line-2],line=lines[sf.line-1],line_after=lines[sf.line];let context=[" > "+line];"string"==typeof line_before&&context.unshift("   "+line_before),"string"==typeof line_after&&context.push("   "+line_after),console.error(sf.file+":"+sf.line+":"+sf.col),console.error(context.join("\n")+"\n\nStack trace:")}catch(_){}console.error(stack),exit(3)}}





function repr(obj){

try{
return JSON.stringify(obj,null,2)}
catch(_){
return String(obj)}}


Object.defineProperty(exports, '__esModule', { value: true });

/*
Viz.js 2.1.2 (Graphviz 2.40.1, Expat 2.2.5, Emscripten 1.37.36)
https://github.com/mdaines/viz.js

Copyright (c) 2014-2018 Michael Daines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This distribution contains other software in object code form:

Graphviz
Licensed under Eclipse Public License - v 1.0
http://www.graphviz.org

Expat
Copyright (c) 1998, 1999, 2000 Thai Open Source Software Center Ltd and Clark Cooper
Copyright (c) 2001, 2002, 2003, 2004, 2005, 2006 Expat maintainers.
Licensed under MIT license
http://www.libexpat.org

zlib
Copyright (C) 1995-2013 Jean-loup Gailly and Mark Adler
http://www.zlib.net/zlib_license.html
*/
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var WorkerWrapper = function () {
  function WorkerWrapper(worker) {
    var _this = this;

    classCallCheck(this, WorkerWrapper);

    this.worker = worker;
    this.listeners = [];
    this.nextId = 0;

    this.worker.addEventListener('message', function (event) {
      var id = event.data.id;
      var error = event.data.error;
      var result = event.data.result;

      _this.listeners[id](error, result);
      delete _this.listeners[id];
    });
  }

  createClass(WorkerWrapper, [{
    key: 'render',
    value: function render(src, options) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var id = _this2.nextId++;

        _this2.listeners[id] = function (error, result) {
          if (error) {
            reject(new Error(error.message, error.fileName, error.lineNumber));
            return;
          }
          resolve(result);
        };

        _this2.worker.postMessage({ id: id, src: src, options: options });
      });
    }
  }]);
  return WorkerWrapper;
}();

var ModuleWrapper = function ModuleWrapper(module, render) {
  classCallCheck(this, ModuleWrapper);

  var instance = module();
  this.render = function (src, options) {
    return new Promise(function (resolve, reject) {
      try {
        resolve(render(instance, src, options));
      } catch (error) {
        reject(error);
      }
    });
  };
};

// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding


function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

function defaultScale() {
  if ('devicePixelRatio' in window && window.devicePixelRatio > 1) {
    return window.devicePixelRatio;
  } else {
    return 1;
  }
}

function svgXmlToImageElement(svgXml) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$scale = _ref.scale,
      scale = _ref$scale === undefined ? defaultScale() : _ref$scale,
      _ref$mimeType = _ref.mimeType,
      mimeType = _ref$mimeType === undefined ? "image/png" : _ref$mimeType,
      _ref$quality = _ref.quality,
      quality = _ref$quality === undefined ? 1 : _ref$quality;

  return new Promise(function (resolve, reject) {
    var svgImage = new Image();

    svgImage.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = svgImage.width * scale;
      canvas.height = svgImage.height * scale;

      var context = canvas.getContext("2d");
      context.drawImage(svgImage, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(function (blob) {
        var image = new Image();
        image.src = URL.createObjectURL(blob);
        image.width = svgImage.width;
        image.height = svgImage.height;

        resolve(image);
      }, mimeType, quality);
    };

    svgImage.onerror = function (e) {
      var error;

      if ('error' in e) {
        error = e.error;
      } else {
        error = new Error('Error loading SVG');
      }

      reject(error);
    };

    svgImage.src = 'data:image/svg+xml;base64,' + b64EncodeUnicode(svgXml);
  });
}

function svgXmlToImageElementFabric(svgXml) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$scale = _ref2.scale,
      scale = _ref2$scale === undefined ? defaultScale() : _ref2$scale,
      _ref2$mimeType = _ref2.mimeType,
      mimeType = _ref2$mimeType === undefined ? 'image/png' : _ref2$mimeType,
      _ref2$quality = _ref2.quality,
      quality = _ref2$quality === undefined ? 1 : _ref2$quality;

  var multiplier = scale;

  var format = void 0;
  if (mimeType == 'image/jpeg') {
    format = 'jpeg';
  } else if (mimeType == 'image/png') {
    format = 'png';
  }

  return new Promise(function (resolve, reject) {
    fabric.loadSVGFromString(svgXml, function (objects, options) {
      // If there's something wrong with the SVG, Fabric may return an empty array of objects. Graphviz appears to give us at least one <g> element back even given an empty graph, so we will assume an error in this case.
      if (objects.length == 0) {
        reject(new Error('Error loading SVG with Fabric'));
      }

      var element = document.createElement("canvas");
      element.width = options.width;
      element.height = options.height;

      var canvas = new fabric.Canvas(element, { enableRetinaScaling: false });
      var obj = fabric.util.groupSVGElements(objects, options);
      canvas.add(obj).renderAll();

      var image = new Image();
      image.src = canvas.toDataURL({ format: format, multiplier: multiplier, quality: quality });
      image.width = options.width;
      image.height = options.height;

      resolve(image);
    });
  });
}

var Viz = function () {
  function Viz() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        workerURL = _ref3.workerURL,
        worker = _ref3.worker,
        Module = _ref3.Module,
        render = _ref3.render;

    classCallCheck(this, Viz);

    if (typeof workerURL !== 'undefined') {
      this.wrapper = new WorkerWrapper(new Worker(workerURL));
    } else if (typeof worker !== 'undefined') {
      this.wrapper = new WorkerWrapper(worker);
    } else if (typeof Module !== 'undefined' && typeof render !== 'undefined') {
      this.wrapper = new ModuleWrapper(Module, render);
    } else if (typeof Viz.Module !== 'undefined' && typeof Viz.render !== 'undefined') {
      this.wrapper = new ModuleWrapper(Viz.Module, Viz.render);
    } else {
      throw new Error('Must specify workerURL or worker option, Module and render options, or include one of full.render.js or lite.render.js after viz.js.');
    }
  }

  createClass(Viz, [{
    key: 'renderString',
    value: function renderString(src) {
      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref4$format = _ref4.format,
          format = _ref4$format === undefined ? 'svg' : _ref4$format,
          _ref4$engine = _ref4.engine,
          engine = _ref4$engine === undefined ? 'dot' : _ref4$engine,
          _ref4$files = _ref4.files,
          files = _ref4$files === undefined ? [] : _ref4$files,
          _ref4$images = _ref4.images,
          images = _ref4$images === undefined ? [] : _ref4$images,
          _ref4$yInvert = _ref4.yInvert,
          yInvert = _ref4$yInvert === undefined ? false : _ref4$yInvert,
          _ref4$nop = _ref4.nop,
          nop = _ref4$nop === undefined ? 0 : _ref4$nop;

      for (var i = 0; i < images.length; i++) {
        files.push({
          path: images[i].path,
          data: '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg width="' + images[i].width + '" height="' + images[i].height + '"></svg>'
        });
      }

      return this.wrapper.render(src, { format: format, engine: engine, files: files, images: images, yInvert: yInvert, nop: nop });
    }
  }, {
    key: 'renderSVGElement',
    value: function renderSVGElement(src) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return this.renderString(src, _extends({}, options, { format: 'svg' })).then(function (str) {
        var parser = new DOMParser();
        return parser.parseFromString(str, 'image/svg+xml').documentElement;
      });
    }
  }, {
    key: 'renderImageElement',
    value: function renderImageElement(src) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var scale = options.scale,
          mimeType = options.mimeType,
          quality = options.quality;


      return this.renderString(src, _extends({}, options, { format: 'svg' })).then(function (str) {
        if ((typeof fabric === 'undefined' ? 'undefined' : _typeof(fabric)) === "object" && fabric.loadSVGFromString) {
          return svgXmlToImageElementFabric(str, { scale: scale, mimeType: mimeType, quality: quality });
        } else {
          return svgXmlToImageElement(str, { scale: scale, mimeType: mimeType, quality: quality });
        }
      });
    }
  }, {
    key: 'renderJSONObject',
    value: function renderJSONObject(src) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var format = options.format;


      if (format !== 'json' || format !== 'json0') {
        format = 'json';
      }

      return this.renderString(src, _extends({}, options, { format: format })).then(function (str) {
        return JSON.parse(str);
      });
    }
  }]);
  return Viz;
}();

const version = DEBUG ? "dev-" + Date.now().toString(36) : VERSION;
const TimeoutError = new Error("timeout");
// force use of iframe proxy, even when not necessary (only active when DEBUG=true)
const DEBUG_FORCE_PROXY = false;
// Workers needs to use absolute URLs, also used for iframe proxy
const urlBase = ((s) => {
    let m = (s ? s.src : "").match(/^[^\?]+\//);
    return m ? m[0]
        : DEBUG ? "http://127.0.0.1:3009/"
            : "https://rsms.me/graphviz/";
})(document.currentScript);
// Use an iframe proxy when served over a non-http url, like file:, data: or blob:
// where Worker is restricted.
const proxy = (document.location.pathname.indexOf("iframe-proxy.html") == -1 &&
    ((DEBUG && DEBUG_FORCE_PROXY) || !(document.location.protocol in { "http:": 1, "https:": 1 }))) ? new class {
    constructor() {
        this.nextTrID = 0;
        this.trans = new Map(); // id => tr
        const timeStart = DEBUG ? Date.now() : 0;
        const timeoutTimer = setTimeout(() => { this.reject(new Error("proxy timeout")); }, 30000);
        this.loadp = new Promise((resolve, reject) => {
            this.resolve = () => {
                dlog(`proxy loaded in ${(Date.now() - timeStart).toFixed(0)}ms`);
                clearTimeout(timeoutTimer);
                resolve();
            };
            this.reject = e => {
                reject(e);
            };
        });
        // hook up message event listener
        window.addEventListener("message", ev => {
            dlog("[gv] got message from proxy:", ev.data);
            let msg = ev.data;
            if (msg && typeof msg == "object")
                switch (msg.type) {
                    case "graphviz.proxy.ready":
                        ev.stopPropagation();
                        this.resolve();
                        break;
                    case "graphviz.proxy.response": {
                        let t = this.trans.get(msg.trid);
                        if (t) {
                            this.trans.delete(msg.trid);
                            if (msg.error) {
                                t.reject(new Error(String(msg.error)));
                            }
                            else {
                                t.resolve(msg.result);
                            }
                        }
                        ev.stopPropagation();
                        break;
                    }
                }
        });
        this.createIframe();
    }
    transaction(msg) {
        return this.loadp.then(() => new Promise((resolve, reject) => {
            let t = { id: this.nextTrID++, resolve, reject };
            this.trans.set(t.id, t);
            this.w.postMessage(Object.assign(Object.assign({}, msg), { trid: t.id }), "*");
        }));
    }
    layout(source, format, engine, timeout) {
        return this.transaction({
            type: "layout",
            args: [source, format, engine, timeout]
        });
    }
    createIframe() {
        let proxyUrl = urlBase + "iframe-proxy.html?v=" + version;
        let iframe = this.iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.visibility = "hidden";
        iframe.style.pointerEvents = "none";
        iframe.src = proxyUrl;
        iframe.sandbox =
            "allow-same-origin allow-scripts allow-popups allow-forms allow-modals";
        iframe.border = "0";
        document.documentElement.appendChild(iframe);
        this.w = iframe.contentWindow;
        assert(this.w);
    }
} : null; // proxy
// main API function
const layout = proxy ? proxy.layout.bind(proxy) : (() => {
    let _viz;
    function restartWorker() {
        if (_viz) {
            // kill existing worker
            _viz.wrapper.worker.terminate();
        }
        _viz = new Viz({ workerURL: urlBase + "viz-worker.js?v=" + version });
        // warm up
        _viz.renderString("digraph G {}", { format: "svg", engine: "dot" }).catch(() => { });
    }
    restartWorker();
    return (source, format, engine, timeout) => new Promise((resolve, reject) => {
        let timeoutTimer;
        if (timeout && timeout > 0) {
            timeoutTimer = setTimeout(() => {
                restartWorker();
                reject(TimeoutError);
            }, timeout);
        }
        return _viz.renderString(source, {
            format: format || "svg",
            engine: engine || "dot",
        }).then(resolve).catch(err => {
            clearTimeout(timeoutTimer);
            restartWorker();
            reject(err);
        });
    });
})();

exports.TimeoutError = TimeoutError;
exports.layout = layout;
exports.version = version;
})(typeof exports != "undefined" ? exports : (typeof global != "undefined" ? global : typeof self != "undefined" ? self : this)["graphviz"] = {});


//#sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jcy5ncmFwaHZpei5qcy5tYXAiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92aXouanMiLCIuLi8uLi9zcmMvZ3JhcGh2aXoudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxPQUFPLEdBQUcsT0FBTyxNQUFNLEtBQUssVUFBVSxJQUFJLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDbkcsRUFBRSxPQUFPLE9BQU8sR0FBRyxDQUFDO0FBQ3BCLENBQUMsR0FBRyxVQUFVLEdBQUcsRUFBRTtBQUNuQixFQUFFLE9BQU8sR0FBRyxJQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxHQUFHLENBQUMsV0FBVyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssTUFBTSxDQUFDLFNBQVMsR0FBRyxRQUFRLEdBQUcsT0FBTyxHQUFHLENBQUM7QUFDL0gsQ0FBQyxDQUFDO0FBQ0Y7QUFDQSxJQUFJLGNBQWMsR0FBRyxVQUFVLFFBQVEsRUFBRSxXQUFXLEVBQUU7QUFDdEQsRUFBRSxJQUFJLEVBQUUsUUFBUSxZQUFZLFdBQVcsQ0FBQyxFQUFFO0FBQzFDLElBQUksTUFBTSxJQUFJLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBQzdELEdBQUc7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UUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDNUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsYUFBYyxDQUFBO1FBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDZjtDQUNGLEdBQUcsSUFBSSxDQUFDO0FBR1Q7QUFDQSxNQUFhLE1BQU0sR0FLSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUN6RCxJQUFJLElBQVMsQ0FBQTtJQUViLFNBQVMsYUFBYTtRQUNwQixJQUFJLElBQUksRUFBRTs7WUFFUixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtTQUNoQztRQUNELElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxPQUFPLEdBQUcsa0JBQWtCLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQTs7UUFFckUsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFRLENBQUMsQ0FBQTtLQUNwRjtJQUVELGFBQWEsRUFBRSxDQUFBO0lBRWYsT0FBTyxDQUFDLE1BQWMsRUFBRSxNQUFlLEVBQUUsTUFBZSxFQUFFLE9BQWdCLEtBQ3hFLElBQUksT0FBTyxDQUFTLENBQUMsT0FBTyxFQUFFLE1BQU07UUFFbEMsSUFBSSxZQUFpQixDQUFBO1FBQ3JCLElBQUksT0FBTyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUU7WUFDMUIsWUFBWSxHQUFHLFVBQVUsQ0FBQztnQkFDeEIsYUFBYSxFQUFFLENBQUE7Z0JBQ2YsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO2FBQ3JCLEVBQUUsT0FBTyxDQUFDLENBQUE7U0FDWjtRQUVELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7WUFDL0IsTUFBTSxFQUFFLE1BQU0sSUFBSSxLQUFLO1lBQ3ZCLE1BQU0sRUFBRSxNQUFNLElBQUksS0FBSztTQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHO1lBQ3hCLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUMxQixhQUFhLEVBQUUsQ0FBQTtZQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNaLENBQUMsQ0FBQTtLQUVILENBQUMsQ0FBQTtBQUVOLENBQUMsR0FBRzs7Ozs7Ozs7OzsiLCJzb3VyY2VSb290IjoiLi4vc3JjIn0=
