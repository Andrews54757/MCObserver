/*
 Aquery: The world's best DOM wrapper

 Author: Andrews54757
 License: MIT (https://github.com/ThreeLetters/AQuery/blob/master/LICENSE)
 Source: https://github.com/ThreeLetters/AQuery
 Build: v0.0.1
 Built on: 21/09/2018
*/

"use strict";

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}

function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}

(function (window) {
    // init.js
    var config = {
        objectEdit: true
    };
    var elementMethods = {},
        queryMethods = {},
        AQueryMethods = {},
        elementCache = config.objectEdit ? {} : new Map(),
        refrenceListeners = [],
        nodeId = 0,
        AQuery,
        Head = {
            nodes: [],
            appendChild: function appendChild(node) {
                this.nodes.push(node);
            },
            removeChild: function removeChild(node) {
                var ind = this.nodes.indexOf(node);
                if (ind !== -1) this.node.splice(ind, 1);
            }
        },
        cssRefrences = {};
    var customEvents = ['blur', 'focus', 'keydown', 'keyup', 'keypress', 'resize', 'scroll', 'select', 'submit', 'click', 'dblclick', 'change', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'contextmenu'];
    window.addEventListener('load', function () {
        var head = document.head || document.getElementsByTagName("head")[0];
        Head.nodes.forEach(function (node) {
            head.appendChild(node);
        });
        Head = head;
    });

    function createId() {
        return 'aquery_id_' + nodeId++;
    }

    function isElement(o) {
        return (typeof HTMLElement === "undefined" ? "undefined" : _typeof(HTMLElement)) === "object" ? o instanceof HTMLElement : //DOM2
            o && _typeof(o) === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
    }

    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;

            while (--i >= 0 && matches.item(i) !== this) {}

            return i > -1;
        };
    } // only implement if no native implementation is available


    if (typeof Array.isArray === 'undefined') {
        Array.isArray = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };
    }

    ; // css/index.js

    function css(element, property, value) {
        if (element.elementData) element = element.elementData.current;

        if (_typeof(property) === 'object') {
            if (Array.isArray(property)) {
                return property.map(function (name) {
                    return getProperty(element, name);
                });
            } else {
                var out = {};

                for (var name in property) {
                    out[name] = setProperty(element, name, property[name]);
                }

                return out;
            }
        } else if (typeof property === 'string') {
            return value !== undefined ? setProperty(element, property, value) : getProperty(element, property);
        }
    }

    function getCssString(name) {
        return name.split('-').map(function (n, i) {
            if (i !== 0) return capitalizeFirstLetter(n);
            return n;
        }).join('');
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function updateCSSRefrence(styleElement) {
        var out = [styleElement.selector, ' {'];

        for (var name in styleElement.style) {
            out.push(name, ':', styleElement.style[name], ';');
        }

        out.push('}');
        styleElement.element.innerHTML = '<br><style>' + out.join('') + '</style>';
    }

    elementMethods.css = function (elementData, refrence, type) {
        if (type === 'delete') {
            return elementData.current.removeAttribute('style');
        } else if (type === 'get') {
            return new Proxy(function (property, value) {
                return css(elementData.current, property, value);
            }, {
                deleteProperty: function deleteProperty(target, name) {
                    css(elementData.current, name, '');
                    return true;
                }
            });
        }
    };

    queryMethods.css = function (queryData, refrence, type) {
        if (refrence && !queryData.selector) throw 'You cannot use refrence methods on a querylist with no selector.';

        if (type === 'delete') {
            if (refrence) {
                if (cssRefrences[queryData.selector]) {
                    Head.removeChild(cssRefrences[queryData.selector].element);
                    cssRefrences[queryData.selector] = null;
                    return true;
                }

                return false;
            } else {
                queryData.nodes.map(function (wrap) {
                    return wrap.current.removeAttribute('style');
                });
                return true;
            }
        } else if (type === 'get') {
            if (refrence) {
                return new Proxy(function (property, value) {
                    if (_typeof(property) === 'object') {
                        if (Array.isArray(property)) {
                            if (!cssRefrences[queryData.selector]) return false;
                            return property.map(function (name) {
                                return cssRefrences[queryData.selector][getCssString(name)];
                            });
                        } else {
                            var out = {};

                            for (var name in property) {
                                out[name] = setPropertyRefrence(queryData, name, property[name]);
                            }

                            return out;
                        }
                    } else if (typeof property === 'string') {
                        return value !== undefined ? setPropertyRefrence(element, property, value) : cssRefrences[queryData.selector][getCssString(name)];
                    }
                }, {
                    deleteProperty: function deleteProperty(target, name) {
                        if (!cssRefrences[queryData.selector]) return false;
                        delete cssRefrences[queryData.selector].style[name];
                        updateCSSRefrence(cssRefrences[queryData.selector]);
                        return true;
                    }
                });
            } else {
                return new Proxy(function (property, value) {
                    return queryData.nodes.map(function (wrap) {
                        return css(wrap, property, value);
                    });
                }, {
                    deleteProperty: function deleteProperty(target, name) {
                        queryData.nodes.map(function (wrap) {
                            return css(wrap, name, '');
                        });
                        return true;
                    }
                });
            }
        }
    };

    AQueryMethods.css = function () {
        return function (property, value, element) {
            if (element && _typeof(element) === 'object') {
                return element.map(function (wrap) {
                    return css(wrap, property, value);
                });
            }

            return css(element || document.body, property, value);
        };
    }; // css/convertUnits.js


    var convertUnits;
    window.addEventListener('load', function () {
        convertUnits = function () {
            var Map = {};
            var test = document.createElement("div");
            test.style.visibility = test.style.overflow = "hidden";
            var baseline = 150;

            function populateMap() {
                var Units = ['px', 'in', 'cm', 'mm', 'pt', 'pc'];
                document.body.appendChild(test);
                Units.forEach(function (unit) {
                    test.style.width = baseline + unit;
                    Map[unit] = baseline / test.offsetWidth;
                });
                document.body.removeChild(test);
            }

            populateMap();

            function converter(element, value, from, to) {
                var fromRatio = Map[from]; // [unit]/px

                var toRatio = Map[to]; // [unit]/px

                if (!fromRatio || !toRatio) {
                    element.appendChild(test);

                    if (!fromRatio) {
                        test.style.width = baseline + from;
                        fromRatio = baseline / test.offsetWidth;
                    }

                    if (!toRatio) {
                        test.style.width = baseline + to;
                        toRatio = baseline / test.offsetWidth;
                    }

                    element.removeChild(test);
                }

                return value / fromRatio * toRatio; // [u1] * 1/([u1]/px) * [u2]/px;
            }

            return converter;
        }();
    }); // css/getProperty.js

    function getProperty(element, property) {
        property = getCssString(property);
        if (element.style[property]) return element.style[property];
        var styles = window.getComputedStyle(element);
        return styles.getPropertyValue(getPropertyString(property));
    }

    function getPropertyString(property) {
        return property.replace(/[A-Z]/g, function (a) {
            return '-' + a.toLowerCase();
        });
    } // css/setProperty.js


    function setProperty(element, property, value) {
        property = getCssString(property);

        if (typeof value === 'string' && value.length > 2 && value.charAt(1) === '=') {
            var value2 = parseFloat(value);
            var newValue = value2;
            var originalValueRaw = getProperty(element, property);
            var originalValue = parseFloat(originalValueRaw);
            var operator = value.charAt(0);
            var isFound = true;
            value2 = parseFloat(value.substr(2));

            switch (operator) {
                case '+':
                    newValue = originalValue + value2;
                    break;

                case '-':
                    newValue = originalValue - value2;
                    break;

                case '*':
                    newValue = originalValue * value2;
                    break;

                case '/':
                    newValue = originalValue / value2;
                    break;

                case '^':
                    newValue = Math.pow(originalValue, value2);
                    break;

                default:
                    isFound = false;
                    break;
            }

            if (isFound) {
                var ending = value.substr(value2.toString().length + 2);

                if (!ending) {
                    ending = originalValueRaw.substr(originalValue.toString().length);
                }

                value = newValue + ending;
            }
        }

        return element.style[property] = value.toString();
    }

    function setPropertyRefrence(queryData, property, value) {
        if (!cssRefrences[queryData.selector]) {
            var newStyleElement = document.createElement('div');
            newStyleElement.innerHTML = '<br><style>' + queryData.selector + ' {}</style>';
            Head.appendChild(newStyleElement);
            cssRefrences[queryData.selector] = {
                element: newStyleElement,
                style: {},
                selector: queryData.selector
            };
        }

        var styleElement = cssRefrences[queryData.selector];
        property = getCssString(property);
        var value2 = parseFloat(value);
        var newValue = value2;
        var originalValueRaw = styleElement.style[property];
        var originalValue = parseFloat(originalValueRaw);

        if (typeof value === 'string' && value.length > 2 && value.charAt(1) === '=') {
            var operator = value.charAt(0);
            var isFound = true;
            value2 = parseFloat(value.substr(2));

            switch (operator) {
                case '+':
                    newValue = originalValue + value2;
                    break;

                case '-':
                    newValue = originalValue - value2;
                    break;

                case '*':
                    newValue = originalValue * value2;
                    break;

                case '/':
                    newValue = originalValue / value2;
                    break;

                case '^':
                    newValue = Math.pow(originalValue, value2);
                    break;

                default:
                    isFound = false;
                    break;
            }

            if (isFound) {
                value = value.substr(2);
            }
        }

        var ending = value.substr(value2.toString().length);

        if (!ending) {
            ending = originalValueRaw.substr(originalValue.toString().length);
        }

        styleElement.style[property] = newValue + ending;
        updateCSSRefrence(styleElement);
        return styleElement.style[property];
    } // methods/ajax.js


    var minirequest = function minirequest()
    /**/
    {
        var url = arguments[0],
            post = undefined,
            callback,
            bust = false;

        if (arguments[2]) {
            // post
            post = arguments[1];
            callback = arguments[2];
            bust = arguments[3];
        } else {
            callback = arguments[1];
            bust = arguments[2];
        }

        try {
            var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"); // IE support

            xhr.open(post ? 'POST' : 'GET', url + (bust ? "?" + Date.now() : ""));

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status === 200) {
                        callback(undefined, xhr, xhr.responseText);
                    } else {
                        callback(true, xhr, false);
                    }

                    var body = xhr.responseText;
                    var res = xhr;
                }
            };

            if (post) {
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                var toPost = [];

                for (var i in post) {
                    toPost.push(encodeURIComponent(i) + '=' + encodeURIComponent(post[i]));
                }

                post = toPost.join("&");
            }

            xhr.send(post);
        } catch (e) {
            callback(e);
        }
    };
    /*
    Modified derivative of Ajax (https://github.com/ForbesLindesay/ajax)
  
    Copyright (c) 2013 Forbes Lindesay
  
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
  
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
  
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
    */


    var jsonpID = 0,
        document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/;

    var ajax = function ajax(options, useMini) {
        if (useMini) {
            return minirequest.apply(null, arguments);
        }

        var settings = extend({}, options || {});

        for (key in ajax.settings) {
            if (settings[key] === undefined) settings[key] = ajax.settings[key];
        }

        ajaxStart(settings);
        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) && RegExp.$2 != window.location.host;
        var dataType = settings.dataType,
            hasPlaceholder = /=\?/.test(settings.url);

        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?');
            return ajax.JSONP(settings);
        }

        if (!settings.url) settings.url = window.location.toString();
        serializeData(settings);
        var mime = settings.accepts[dataType],
            baseHeaders = {},
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = ajax.settings.xhr(),
            abortTimeout;
        if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';

        if (mime) {
            baseHeaders['Accept'] = mime;
            if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }

        if (settings.contentType || settings.data && settings.type.toUpperCase() != 'GET') baseHeaders['Content-Type'] = settings.contentType || 'application/x-www-form-urlencoded';
        settings.headers = extend(baseHeaders, settings.headers || {});

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                clearTimeout(abortTimeout);
                var result,
                    error = false;

                if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304 || xhr.status == 0 && protocol == 'file:') {
                    dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;

                    try {
                        if (dataType == 'script')(1, eval)(result);
                        else if (dataType == 'xml') result = xhr.responseXML;
                        else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result);
                    } catch (e) {
                        error = e;
                    }

                    if (error) ajaxError(error, 'parsererror', xhr, settings);
                    else ajaxSuccess(result, xhr, settings);
                } else {
                    ajaxError(null, 'error', xhr, settings);
                }
            }
        };

        var async = 'async' in settings ? settings.async : true;
        xhr.open(settings.type, settings.url, async);

        for (name in settings.headers) {
            xhr.setRequestHeader(name, settings.headers[name]);
        }

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort();
            return false;
        }

        if (settings.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.onreadystatechange = empty;
            xhr.abort();
            ajaxError(null, 'timeout', xhr, settings);
        }, settings.timeout); // avoid sending empty string (#319)

        xhr.send(settings.data ? settings.data : null);
        return xhr;
    }; // trigger a custom event and return false if it was cancelled


    function triggerAndReturn(context, eventName, data) {
        //todo: Fire off some events
        //var event = $.Event(eventName)
        //$(context).trigger(event, data)
        return true; //!event.defaultPrevented
    } // trigger an Ajax "global" event


    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) return triggerAndReturn(context || document, eventName, data);
    } // Number of active Ajax requests


    ajax.active = 0;

    function ajaxStart(settings) {
        if (settings.global && ajax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart');
    }

    function ajaxStop(settings) {
        if (settings.global && !--ajax.active) triggerGlobal(settings, null, 'ajaxStop');
    } // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable


    function ajaxBeforeSend(xhr, settings) {
        var context = settings.context;
        if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) return false;
        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings]);
    }

    function ajaxSuccess(data, xhr, settings) {
        var context = settings.context,
            status = 'success';
        settings.success.call(context, data, status, xhr);
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data]);
        ajaxComplete(status, xhr, settings);
    } // type: "timeout", "error", "abort", "parsererror"


    function ajaxError(error, type, xhr, settings) {
        var context = settings.context;
        settings.error.call(context, xhr, type, error);
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error]);
        ajaxComplete(type, xhr, settings);
    } // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"


    function ajaxComplete(status, xhr, settings) {
        var context = settings.context;
        settings.complete.call(context, xhr, status);
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
        ajaxStop(settings);
    } // Empty function, used as default callback


    function empty() {}

    ajax.JSONP = function (options) {
        if (!('type' in options)) return ajax(options);

        var callbackName = 'jsonp' + ++jsonpID,
            script = document.createElement('script'),
            abort = function abort() {
                //todo: remove script
                //$(script).remove()
                if (callbackName in window) window[callbackName] = empty;
                ajaxComplete('abort', xhr, options);
            },
            xhr = {
                abort: abort
            },
            abortTimeout,
            head = document.getElementsByTagName("head")[0] || document.documentElement;

        if (options.error) script.onerror = function () {
            xhr.abort();
            options.error();
        };

        window[callbackName] = function (data) {
            clearTimeout(abortTimeout); //todo: remove script
            //$(script).remove()

            delete window[callbackName];
            ajaxSuccess(data, xhr, options);
        };

        serializeData(options);
        script.src = options.url.replace(/=\?/, '=' + callbackName); // Use insertBefore instead of appendChild to circumvent an IE6 bug.
        // This arises when a base node is used (see jQuery bugs #2709 and #4378).

        head.insertBefore(script, head.firstChild);
        if (options.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.abort();
            ajaxComplete('timeout', xhr, options);
        }, options.timeout);
        return xhr;
    };

    ajax.settings = {
        // Default type of request
        type: 'GET',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function xhr() {
            return new window.XMLHttpRequest();
        },
        // MIME types mapping
        accepts: {
            script: 'text/javascript, application/javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0
    };

    function mimeToDataType(mime) {
        return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text';
    }

    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    } // serialize payload and append it to the URL for GET requests


    function serializeData(options) {
        if (type(options.data) === 'object') options.data = param(options.data);
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) options.url = appendQuery(options.url, options.data);
    }

    ajax.get = function (url, success) {
        return ajax({
            url: url,
            success: success
        });
    };

    ajax.post = function (url, data, success, dataType) {
        if (type(data) === 'function') dataType = dataType || success, success = data, data = null;
        return ajax({
            type: 'POST',
            url: url,
            data: data,
            success: success,
            dataType: dataType
        });
    };

    ajax.getJSON = function (url, success) {
        return ajax({
            url: url,
            success: success,
            dataType: 'json'
        });
    };

    var escape = encodeURIComponent;

    function serialize(params, obj, traditional, scope) {
        var array = type(obj) === 'array';

        for (var key in obj) {
            var value = obj[key];
            if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'; // handle data in serializeArray() format

            if (!scope && array) params.add(value.name, value.value); // recurse into nested objects
            else if (traditional ? type(value) === 'array' : type(value) === 'object') serialize(params, value, traditional, key);
            else params.add(key, value);
        }
    }

    function param(obj, traditional) {
        var params = [];

        params.add = function (k, v) {
            this.push(escape(k) + '=' + escape(v));
        };

        serialize(params, obj, traditional);
        return params.join('&').replace('%20', '+');
    }

    function extend(target) {
        var slice = Array.prototype.slice;
        slice.call(arguments, 1).forEach(function (source) {
            for (key in source) {
                if (source[key] !== undefined) target[key] = source[key];
            }
        });
        return target;
    }

    AQueryMethods.ajax = function () {
        return ajax;
    }; // methods/append.js


    elementMethods.append = elementMethods.appendChild = function (elementData, refrence) {
        return function (child) {
            if (!child.elementData) {
                child = wrapElement(child);
            }

            var data = child.elementData;
            refrenceListeners.forEach(function (listener) {
                if (data.current.matches(listener.selector) && data.listeners.indexOf(listener) === -1) {
                    data.current.addEventListener(listener.type, listener.listener, listener.options);
                    data.listeners.push(listener);
                }
            });
            elementData.current.appendChild(data.current);
        };
    };

    AQueryMethods.append = AQueryMethods.appendChild = function () {
        return function (child) {
            if (!child.elementData) {
                child = wrapElement(child);
            }

            var data = child.elementData;
            refrenceListeners.forEach(function (listener) {
                if (data.current.matches(listener.selector) && data.listeners.indexOf(listener) === -1) {
                    data.current.addEventListener(listener.type, listener.listener, listener.options);
                    data.listeners.push(listener);
                }
            });
            document.body.appendChild(data.current);
        };
    }; // methods/attr.js


    elementMethods.attr = function (elementData, refrence, type, value) {
        return new Proxy(function (name, value) {
            if (value !== undefined) {
                elementData.current.setAttribute(name, value);
                return value;
            } else {
                return elementData.current.getAttribute(name);
            }
        }, {
            deleteProperty: function deleteProperty(target, name) {
                elementData.current.removeAttribute(name);
                return true;
            }
        });
    }; // methods/clone.js


    elementMethods.clone = function (elementData, refrence) {
        return function (cloneEvents) {
            var clone = elementData.current.cloneNode(true);
            var wrap = AQuery(clone);
            if (cloneEvents !== false) elementData.listeners.forEach(function (listener) {
                wrap.elementData.listeners.push(listener);
                wrap.elementData.current.addEventListener(listener.type, listener.listener, listener.options);
            });
            return wrap;
        };
    }; // methods/dimensions.js


    var types = ['', 'inner', 'outer', 'whole'];
    var dimensions = ['width', 'height'];
    dimensions.forEach(function (dimension, dim) {
        types.forEach(function (extra, type) {
            var dimensionStr = dimension;
            if (extra) dimensionStr = dimension.charAt(0).toUpperCase() + dimension.substr(1);
            var str = extra + dimensionStr;

            elementMethods[str] = function (elementData, refrence, actiontype, setvalue) {
                var offset = 0;

                if (type) {
                    offset += parseFloat(css(elementData.current, dim ? 'padding-top' : 'padding-left'));
                    offset += parseFloat(css(elementData.current, dim ? 'padding-bottom' : 'padding-right'));

                    if (type >= 2) {
                        offset += parseFloat(css(elementData.current, dim ? 'border-top-width' : 'border-left-width'));
                        offset += parseFloat(css(elementData.current, dim ? 'border-bottom-width' : 'border-right-width'));

                        if (type === 3) {
                            offset += parseFloat(css(elementData.current, dim ? 'margin-top' : 'margin-left'));
                            offset += parseFloat(css(elementData.current, dim ? 'margin-bottom' : 'margin-right'));
                        }
                    }
                }

                if (setvalue && type) {
                    setvalue = parseFloat(setvalue) - offset;
                }

                var value = parseFloat(css(elementData.current, dimension, setvalue));
                return value + offset;
            };
        });
    });

    AQueryMethods.width = function (refrence, type) {
        if (type === 'get') {
            return Math.max(document.scrollHeight, document.offsetHeight, document.clientHeight);
        }
    };

    AQueryMethods.height = function (refrence, type) {
        if (type === 'get') {
            return Math.max(document.scrollWidth, document.offsetWidth, document.clientWidth);
        }
    }; // methods/eventShortcuts.js


    function generateElementEvent(eventType) {
        return function (elementData, refrence, type) {
            if (type === 'delete') {
                elementData.listeners = elementData.listeners.filter(function (l) {
                    if (l.type === eventType) {
                        elementData.current.removeEventListener(l.type, l.listener);
                        return false;
                    }

                    return true;
                });
            } else {
                return new Proxy(function (listener, options) {
                    if (!listener) {
                        elementData.current[eventType]();
                        return;
                    }

                    listener._listenerData = listener._listenerData || {
                        type: eventType,
                        listener: listener,
                        options: options
                    };

                    if (elementData.listeners.indexOf(listener._listenerData) === -1) {
                        elementData.current.addEventListener(eventType, listener, options);
                        elementData.listeners.push(listener._listenerData);
                    }
                }, {
                    get: function get(target, name) {
                        var list = elementData.listeners.filter(function (l) {
                            return l.type === eventType;
                        });

                        if (name === 'length') {
                            return list.length;
                        } else if (!isNaN(name)) {
                            return list[name].listener;
                        }
                    },
                    deleteProperty: function deleteProperty(target, name) {
                        var list = elementData.listeners.filter(function (l) {
                            return l.type === eventType;
                        });

                        if (!isNaN(name)) {
                            var l = list[name];
                            if (!l) return;
                            var ind = elementData.listeners.indexOf(l);
                            elementData.listeners.splice(ind, 1);
                            elementData.current.removeEventListener(eventType, l.listener);
                        }
                    }
                });
            }
        };
    }

    function generateQueryEvent(eventType) {
        return function (queryData, refrence, type) {
            if (refrence && !queryData.selector) throw 'You cannot use refrence methods on a querylist with no selector.';

            if (type === 'delete') {
                queryData.listeners = queryData.listeners.filter(function (l) {
                    if (l.type === eventType) {
                        queryData.nodes.forEach(function (wrap) {
                            var data = wrap.elementData;
                            var index = data.listeners.indexOf(listener);

                            if (index !== -1) {
                                data.listeners.splice(index, 1);
                                data.current.removeEventListener(listener.type, listener.listener);
                            }
                        });
                        return false;
                    }

                    return true;
                });
                return true;
            } else {
                return new Proxy(function (listener, options) {
                    if (!listener) {
                        queryData.nodes.forEach(function (wrapper) {
                            wrapper.elementData.current[eventType]();
                        });
                        return;
                    }

                    var listenerData = listener._listenerData = listener._listenerData || {
                        selector: queryData.selector,
                        type: eventType,
                        listener: listener,
                        options: options
                    };
                    if (queryData.listeners.indexOf(listenerData) === -1) queryData.listeners.push(listenerData);
                    queryData.nodes.forEach(function (node, i) {
                        var data = node.elementData;
                        if (data.listeners.indexOf(listenerData) !== -1) return;
                        data.current.addEventListener(eventType, listener, options);
                        data.listeners.push(listenerData);
                    });
                    if (refrence && !listenerData.isRefrenceEvent) refrenceListeners.push(listenerData), listenerData.isRefrenceEvent = true;
                }, {
                    get: function get(target, name) {
                        var list = queryData.listeners.filter(function (l) {
                            return l.type === eventType;
                        });

                        if (name === 'length') {
                            return list.listeners.length;
                        } else if (!isNaN(name)) {
                            return list.listeners[name].listener;
                        }
                    },
                    deleteProperty: function deleteProperty(target, name) {
                        var list = queryData.listeners.filter(function (l) {
                            return l.type === eventType;
                        });

                        if (!isNaN(name)) {
                            var l = list[name];
                            if (!l) return;
                            var ind = queryData.listeners.indexOf(l);
                            queryData.listeners.splice(ind, 1);

                            if (l.isRefrenceEvent) {
                                var ind = refrenceListeners.indexOf(l);
                                refrenceListeners.splice(ind, 1);
                                l.isRefrenceEvent = false;
                            }

                            queryData.nodes.forEach(function (wrap) {
                                var data = wrap.elementData;
                                var index = data.listeners.indexOf(l);

                                if (index !== -1) {
                                    data.current.removeEventListener(l.type, l.listener);
                                    data.listeners.splice(index, 1);
                                }
                            });
                        }
                    }
                });
            }
        };
    }

    customEvents.forEach(function (event) {
        elementMethods[event] = generateElementEvent(event);
        queryMethods[event] = generateQueryEvent(event);
    }); // methods/events.js

    elementMethods.on = elementMethods.addEventListener = function (elementData, refrence, type) {
        if (type === 'delete') {
            elementData.listeners.forEach(function (listener) {
                elementData.current.removeEventListener(listener.type, listener.listener);
            });
            elementData.listeners = [];
        } else {
            return new Proxy(function (type, listener, options) {
                if (!listener) {
                    if (customEvents.indexOf(type) !== -1) {
                        elementData.current[type]();
                    } else {
                        elementData.listeners.forEach(function (listener) {
                            if (listener.type === type) {
                                listener.listener.apply(elementData.current, []);
                            }
                        });
                    }

                    return;
                }

                listener._listenerData = listener._listenerData || {
                    type: type,
                    listener: listener,
                    options: options
                };

                if (elementData.listeners.indexOf(listener._listenerData) === -1) {
                    elementData.current.addEventListener(type, listener, options);
                    elementData.listeners.push(listener._listenerData);
                }
            }, {
                get: function get(target, name) {
                    if (name === 'length') {
                        return elementData.listeners.length;
                    } else if (!isNaN(name)) {
                        return elementData.listeners[name].listener;
                    } else {
                        var newList = [];
                        elementData.listeners.forEach(function (l) {
                            if (l.type === name) {
                                newList.push(l.listener);
                            }
                        });
                        return new Proxy(newList, {
                            deleteProperty: function deleteProperty(target, name) {
                                if (!isNaN(name)) {
                                    var l = newList[name];
                                    if (!l) return;
                                    l = l._listenerData;
                                    newList.splice(name, 1);
                                    var ind = elementData.listeners.indexOf(l);
                                    if (l !== -1) elementData.listeners.splice(ind, 1);
                                    elementData.current.removeEventListener(l.type, l.listener);
                                }
                            }
                        });
                    }
                },
                deleteProperty: function deleteProperty(target, name) {
                    if (!isNaN(name)) {
                        var l = elementData.listeners[name];
                        if (!l) return;
                        elementData.listeners.splice(name, 1);
                        elementData.current.removeEventListener(l.type, l.listener);
                    } else {
                        elementData.listeners = elementData.listeners.filter(function (l) {
                            if (l.type === name) {
                                elementData.current.removeEventListener(l.type, l.listener);
                                return false;
                            }

                            return true;
                        });
                    }
                }
            });
        }
    };

    queryMethods.on = queryMethods.addEventListener = function (queryData, refrence, type) {
        if (refrence && !queryData.selector) throw 'You cannot use refrence methods on a querylist with no selector.';

        if (type === 'delete') {
            queryData.listeners.forEach(function (listener) {
                queryData.nodes.forEach(function (wrap) {
                    var data = wrap.elementData;
                    var index = data.listeners.indexOf(listener);

                    if (index !== -1) {
                        data.listeners.splice(index, 1);
                        data.current.removeEventListener(listener.type, listener.listener);
                    }
                });
            });
            queryData.listeners = [];
        } else {
            return new Proxy(function (type, listener, options) {
                if (!listener) {
                    if (customEvents.indexOf(type) !== -1) {
                        queryData.nodes.forEach(function (wrapper) {
                            wrapper.elementData.current[type]();
                        });
                    } else {
                        queryData.listeners.forEach(function (listener) {
                            if (listener.type === type) {
                                queryData.nodes.forEach(function (wrapper) {
                                    if (wrapper.elementData.listeners.indexOf(listener) !== -1) listener.listener.apply(wrapper.elementData.current, []);
                                });
                            }
                        });
                    }

                    return;
                }

                var listenerData = listener._listenerData = listener._listenerData || {
                    selector: queryData.selector,
                    type: type,
                    listener: listener,
                    options: options
                };
                if (queryData.listeners.indexOf(listenerData) === -1) queryData.listeners.push(listenerData);
                queryData.nodes.forEach(function (node, i) {
                    var data = node.elementData;
                    if (data.listeners.indexOf(listenerData) !== -1) return;
                    data.current.addEventListener(type, listener, options);
                    data.listeners.push(listenerData);
                });
                if (refrence && !listenerData.isRefrenceEvent) refrenceListeners.push(listenerData), listenerData.isRefrenceEvent = true;
            }, {
                get: function get(target, name) {
                    if (name === 'length') {
                        return queryData.listeners.length;
                    } else if (!isNaN(name)) {
                        return queryData.listeners[name].listener;
                    } else {
                        var newList = [];
                        queryData.listeners.forEach(function (l) {
                            if (l.type === name) {
                                newList.push(l.listener);
                            }
                        });
                        return new Proxy(newList, {
                            deleteProperty: function deleteProperty(target, name) {
                                if (typeof name === 'number') {
                                    var l = newList[name];
                                    if (!l) return;
                                    l = l._listenerData;
                                    newList.splice(name, 1);
                                    var ind = queryData.listeners.indexOf(l);
                                    if (l !== -1) queryData.listeners.splice(ind, 1);

                                    if (l.isRefrenceEvent) {
                                        var ind = refrenceListeners.indexOf(l);
                                        refrenceListeners.splice(ind, 1);
                                        l.isRefrenceEvent = false;
                                    }

                                    queryData.nodes.forEach(function (wrap) {
                                        var data = wrap.elementData;
                                        var index = data.listeners.indexOf(l);

                                        if (index !== -1) {
                                            data.current.removeEventListener(l.type, l.listener);
                                            data.listeners.splice(index, 1);
                                        }
                                    });
                                }
                            }
                        });
                    }
                },
                deleteProperty: function deleteProperty(target, name) {
                    if (!isNaN(name)) {
                        var l = queryData.listeners[name];
                        if (!l) return;
                        queryData.listeners.splice(name, 1);

                        if (l.isRefrenceEvent) {
                            var ind = refrenceListeners.indexOf(l);
                            refrenceListeners.splice(ind, 1);
                            l.isRefrenceEvent = false;
                        }

                        queryData.nodes.forEach(function (wrap) {
                            var data = wrap.elementData;
                            var index = data.listeners.indexOf(l);

                            if (index !== -1) {
                                data.current.removeEventListener(l.type, l.listener);
                                data.listeners.splice(index, 1);
                            }
                        });
                    } else {
                        queryData.listeners = queryData.listeners.filter(function (l) {
                            if (l.type === name) {
                                if (l.isRefrenceEvent) {
                                    var ind = refrenceListeners.indexOf(l);
                                    refrenceListeners.splice(ind, 1);
                                    l.isRefrenceEvent = false;
                                }

                                elementData.current.removeEventListener(l.type, l.listener);
                                queryData.nodes.forEach(function (wrap) {
                                    var data = wrap.elementData;
                                    var index = data.listeners.indexOf(l);

                                    if (index !== -1) {
                                        data.current.removeEventListener(l.type, l.listener);
                                        data.listeners.splice(index, 1);
                                    }
                                });
                                return false;
                            }

                            return true;
                        });
                    }
                }
            });
        }
    }; // methods/insert.js


    function insertAfter(referenceNode, newNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    function insertBefore(referenceNode, newNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }

    elementMethods.before = function (elementData) {
        return function (element) {
            return insertBefore(elementData.proxy, element);
        };
    };

    elementMethods.after = function (elementData) {
        return function (element) {
            return insertAfter(elementData.proxy, element);
        };
    }; // methods/loop.js


    queryMethods.forEach = queryMethods.each = function (queryData, refrence, type) {
        return function (call) {
            queryData.nodes.forEach(call);
        };
    };

    queryMethods.every = queryMethods.each = function (queryData, refrence, type) {
        return function (call) {
            return queryData.nodes.every(call);
        };
    };

    queryMethods.map = function (queryData, refrence, type) {
        return function (call) {
            var newArray = [];
            queryData.nodes.forEach(function (node, index) {
                var results = call(node, index);
                if (results === false || results === undefined) return;
                newArray.push(isElement(results) ? results : node);
            });
            return Query(newArray, refrence ? queryData.selector : null);
        };
    }; // methods/scroll.js
    // methods/serialize.js
    // methods/shortcuts.js


    var shortcuts = {
        text: 'textContent',
        html: 'innerHTML',
        val: 'value'
    };

    for (var to in shortcuts) {
        (function (to, from) {
            elementMethods[to] = function (elementData, refrence, type, value) {
                if (type === 'get') {
                    return elementData.current[from];
                } else if (type === 'set') {
                    return elementData.current[from] = value;
                } else if (type === 'delete') {
                    return delete elementData.current[from];
                }
            };
        })(to, shortcuts[to]);
    } // effects/differential.js

    /*
     Differential.js: JS HTML Animation/movement engine
  
     Author: Andrews54757
     License: MIT (https://github.com/ThreeLetters/differential.js/blob/master/LICENSE)
     Source: https://github.com/ThreeLetters/differential.js
     Build: v0.0.2
     Built on: 05/07/2018
    */


    var D = function (window) {
        // init.js
        var Easings = {},
            Queues = {
                main: {
                    list: [],
                    active: false,
                    parrallel: false
                },
                parrallel: {
                    list: [],
                    active: false,
                    parrallel: true
                }
            },
            Stop = true,
            Running = false,
            frameDur = 15;
        var CSSSetHooks = {},
            CSSGetHooks = {};

        function convertOptions(options) {
            return {
                easing: options.easing || 'swing',
                done: options.done || function () {},
                queue: options.queue !== undefined ? options.queue : true,
                specialEasing: options.specialEasing,
                step: options.step,
                progress: options.progress,
                start: options.start || function () {},
                duration: options.duration || 400
            };
        }

        var Colors = {
            "aliceblue": "240,248,255",
            "antiquewhite": "250,235,215",
            "aquamarine": "127,255,212",
            "aqua": "0,255,255",
            "azure": "240,255,255",
            "beige": "245,245,220",
            "bisque": "255,228,196",
            "black": "0,0,0",
            "blanchedalmond": "255,235,205",
            "blueviolet": "138,43,226",
            "blue": "0,0,255",
            "brown": "165,42,42",
            "burlywood": "222,184,135",
            "cadetblue": "95,158,160",
            "chartreuse": "127,255,0",
            "chocolate": "210,105,30",
            "coral": "255,127,80",
            "cornflowerblue": "100,149,237",
            "cornsilk": "255,248,220",
            "crimson": "220,20,60",
            "cyan": "0,255,255",
            "darkblue": "0,0,139",
            "darkcyan": "0,139,139",
            "darkgoldenrod": "184,134,11",
            "darkgray": "169,169,169",
            "darkgrey": "169,169,169",
            "darkgreen": "0,100,0",
            "darkkhaki": "189,183,107",
            "darkmagenta": "139,0,139",
            "darkolivegreen": "85,107,47",
            "darkorange": "255,140,0",
            "darkorchid": "153,50,204",
            "darkred": "139,0,0",
            "darksalmon": "233,150,122",
            "darkseagreen": "143,188,143",
            "darkslateblue": "72,61,139",
            "darkslategray": "47,79,79",
            "darkturquoise": "0,206,209",
            "darkviolet": "148,0,211",
            "deeppink": "255,20,147",
            "deepskyblue": "0,191,255",
            "dimgray": "105,105,105",
            "dimgrey": "105,105,105",
            "dodgerblue": "30,144,255",
            "firebrick": "178,34,34",
            "floralwhite": "255,250,240",
            "forestgreen": "34,139,34",
            "fuchsia": "255,0,255",
            "gainsboro": "220,220,220",
            "ghostwhite": "248,248,255",
            "gold": "255,215,0",
            "goldenrod": "218,165,32",
            "gray": "128,128,128",
            "grey": "128,128,128",
            "greenyellow": "173,255,47",
            "green": "0,128,0",
            "honeydew": "240,255,240",
            "hotpink": "255,105,180",
            "indianred": "205,92,92",
            "indigo": "75,0,130",
            "ivory": "255,255,240",
            "khaki": "240,230,140",
            "lavenderblush": "255,240,245",
            "lavender": "230,230,250",
            "lawngreen": "124,252,0",
            "lemonchiffon": "255,250,205",
            "lightblue": "173,216,230",
            "lightcoral": "240,128,128",
            "lightcyan": "224,255,255",
            "lightgoldenrodyellow": "250,250,210",
            "lightgray": "211,211,211",
            "lightgrey": "211,211,211",
            "lightgreen": "144,238,144",
            "lightpink": "255,182,193",
            "lightsalmon": "255,160,122",
            "lightseagreen": "32,178,170",
            "lightskyblue": "135,206,250",
            "lightslategray": "119,136,153",
            "lightsteelblue": "176,196,222",
            "lightyellow": "255,255,224",
            "limegreen": "50,205,50",
            "lime": "0,255,0",
            "linen": "250,240,230",
            "magenta": "255,0,255",
            "maroon": "128,0,0",
            "mediumaquamarine": "102,205,170",
            "mediumblue": "0,0,205",
            "mediumorchid": "186,85,211",
            "mediumpurple": "147,112,219",
            "mediumseagreen": "60,179,113",
            "mediumslateblue": "123,104,238",
            "mediumspringgreen": "0,250,154",
            "mediumturquoise": "72,209,204",
            "mediumvioletred": "199,21,133",
            "midnightblue": "25,25,112",
            "mintcream": "245,255,250",
            "mistyrose": "255,228,225",
            "moccasin": "255,228,181",
            "navajowhite": "255,222,173",
            "navy": "0,0,128",
            "oldlace": "253,245,230",
            "olivedrab": "107,142,35",
            "olive": "128,128,0",
            "orangered": "255,69,0",
            "orange": "255,165,0",
            "orchid": "218,112,214",
            "palegoldenrod": "238,232,170",
            "palegreen": "152,251,152",
            "paleturquoise": "175,238,238",
            "palevioletred": "219,112,147",
            "papayawhip": "255,239,213",
            "peachpuff": "255,218,185",
            "peru": "205,133,63",
            "pink": "255,192,203",
            "plum": "221,160,221",
            "powderblue": "176,224,230",
            "purple": "128,0,128",
            "red": "255,0,0",
            "rosybrown": "188,143,143",
            "royalblue": "65,105,225",
            "saddlebrown": "139,69,19",
            "salmon": "250,128,114",
            "sandybrown": "244,164,96",
            "seagreen": "46,139,87",
            "seashell": "255,245,238",
            "sienna": "160,82,45",
            "silver": "192,192,192",
            "skyblue": "135,206,235",
            "slateblue": "106,90,205",
            "slategray": "112,128,144",
            "snow": "255,250,250",
            "springgreen": "0,255,127",
            "steelblue": "70,130,180",
            "tan": "210,180,140",
            "teal": "0,128,128",
            "thistle": "216,191,216",
            "tomato": "255,99,71",
            "turquoise": "64,224,208",
            "violet": "238,130,238",
            "wheat": "245,222,179",
            "whitesmoke": "245,245,245",
            "white": "255,255,255",
            "yellowgreen": "154,205,50",
            "yellow": "255,255,0"
        };

        for (var name in Colors) {
            Colors[name] = Colors[name].split(',').map(function (num) {
                return parseInt(num);
            });
        }

        function hexToRgb(hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
        }

        if (!window.requestAnimationFrame) window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

        var Timer = function () {
            if (window.performance && window.performance.now) {
                return window.performance;
            } else {
                return Date;
            }
        }();

        var Now = Timer.now(); // easings/custom.js

        /*
        Easing bezier curves. Velocity.js
         The MIT License
         Copyright (c) 2014 Julian Shapiro
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
        */

        var curves = {
            "ease": [0.25, 0.1, 0.25, 1],
            "ease-in": [0.42, 0, 1, 1],
            "ease-out": [0, 0, 0.58, 1],
            "ease-in-out": [0.42, 0, 0.58, 1],
            "easeInSine": [0.47, 0, 0.745, 0.715],
            "easeOutSine": [0.39, 0.575, 0.565, 1],
            "easeInOutSine": [0.445, 0.05, 0.55, 0.95],
            "easeInQuad": [0.55, 0.085, 0.68, 0.53],
            "easeOutQuad": [0.25, 0.46, 0.45, 0.94],
            "easeInOutQuad": [0.455, 0.03, 0.515, 0.955],
            "easeInCubic": [0.55, 0.055, 0.675, 0.19],
            "easeOutCubic": [0.215, 0.61, 0.355, 1],
            "easeInOutCubic": [0.645, 0.045, 0.355, 1],
            "easeInQuart": [0.895, 0.03, 0.685, 0.22],
            "easeOutQuart": [0.165, 0.84, 0.44, 1],
            "easeInOutQuart": [0.77, 0, 0.175, 1],
            "easeInQuint": [0.755, 0.05, 0.855, 0.06],
            "easeOutQuint": [0.23, 1, 0.32, 1],
            "easeInOutQuint": [0.86, 0, 0.07, 1],
            "easeInExpo": [0.95, 0.05, 0.795, 0.035],
            "easeOutExpo": [0.19, 1, 0.22, 1],
            "easeInOutExpo": [1, 0, 0, 1],
            "easeInCirc": [0.6, 0.04, 0.98, 0.335],
            "easeOutCirc": [0.075, 0.82, 0.165, 1],
            "easeInOutCirc": [0.785, 0.135, 0.15, 0.86]
        };

        for (var name in curves) {
            var curve = curves[name];
            Easings[name] = generateBezier(curve[0], curve[1], curve[2], curve[3]);
        } // easings/easings.js


        Easings.linear = function (x) {
            return x;
        };

        Easings.swing = function (x) {
            return 0.5 - Math.cos(x * Math.PI) / 2;
        }; // easings/generators.js

        /*
        Velocity.js Generators
         The MIT License
         Copyright (c) 2014 Julian Shapiro
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
         */

        /* Bezier curve function generator. Copyright Gaetan Renaudeau. MIT License: http://en.wikipedia.org/wiki/MIT_License */


        function generateBezier(mX1, mY1, mX2, mY2) {
            var NEWTON_ITERATIONS = 4,
                NEWTON_MIN_SLOPE = 0.001,
                SUBDIVISION_PRECISION = 0.0000001,
                SUBDIVISION_MAX_ITERATIONS = 10,
                kSplineTableSize = 11,
                kSampleStepSize = 1.0 / (kSplineTableSize - 1.0),
                float32ArraySupported = "Float32Array" in window;
            /* Must contain four arguments. */

            if (arguments.length !== 4) {
                return false;
            }
            /* Arguments must be numbers. */


            for (var i = 0; i < 4; ++i) {
                if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
                    return false;
                }
            }
            /* X values must be in the [0, 1] range. */


            mX1 = Math.min(mX1, 1);
            mX2 = Math.min(mX2, 1);
            mX1 = Math.max(mX1, 0);
            mX2 = Math.max(mX2, 0);
            var mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);

            function A(aA1, aA2) {
                return 1.0 - 3.0 * aA2 + 3.0 * aA1;
            }

            function B(aA1, aA2) {
                return 3.0 * aA2 - 6.0 * aA1;
            }

            function C(aA1) {
                return 3.0 * aA1;
            }

            function calcBezier(aT, aA1, aA2) {
                return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
            }

            function getSlope(aT, aA1, aA2) {
                return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
            }

            function newtonRaphsonIterate(aX, aGuessT) {
                for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
                    var currentSlope = getSlope(aGuessT, mX1, mX2);

                    if (currentSlope === 0.0) {
                        return aGuessT;
                    }

                    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                    aGuessT -= currentX / currentSlope;
                }

                return aGuessT;
            }

            function calcSampleValues() {
                for (var i = 0; i < kSplineTableSize; ++i) {
                    mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
                }
            }

            function binarySubdivide(aX, aA, aB) {
                var currentX,
                    currentT,
                    i = 0;

                do {
                    currentT = aA + (aB - aA) / 2.0;
                    currentX = calcBezier(currentT, mX1, mX2) - aX;

                    if (currentX > 0.0) {
                        aB = currentT;
                    } else {
                        aA = currentT;
                    }
                } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);

                return currentT;
            }

            function getTForX(aX) {
                var intervalStart = 0.0,
                    currentSample = 1,
                    lastSample = kSplineTableSize - 1;

                for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
                    intervalStart += kSampleStepSize;
                }

                --currentSample;
                var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]),
                    guessForT = intervalStart + dist * kSampleStepSize,
                    initialSlope = getSlope(guessForT, mX1, mX2);

                if (initialSlope >= NEWTON_MIN_SLOPE) {
                    return newtonRaphsonIterate(aX, guessForT);
                } else if (initialSlope === 0.0) {
                    return guessForT;
                } else {
                    return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
                }
            }

            var _precomputed = false;

            function precompute() {
                _precomputed = true;

                if (mX1 !== mY1 || mX2 !== mY2) {
                    calcSampleValues();
                }
            }

            var f = function f(aX) {
                if (!_precomputed) {
                    precompute();
                }

                if (mX1 === mY1 && mX2 === mY2) {
                    return aX;
                }

                if (aX === 0) {
                    return 0;
                }

                if (aX === 1) {
                    return 1;
                }

                return calcBezier(getTForX(aX), mY1, mY2);
            };

            f.getControlPoints = function () {
                return [{
                    x: mX1,
                    y: mY1
        }, {
                    x: mX2,
                    y: mY2
        }];
            };

            var str = "generateBezier(" + [mX1, mY1, mX2, mY2] + ")";

            f.toString = function () {
                return str;
            };

            return f;
        }
        /* Runge-Kutta spring physics function generator. Adapted from Framer.js, copyright Koen Bok. MIT License: http://en.wikipedia.org/wiki/MIT_License */

        /* Given a tension, friction, and duration, a simulation at 60FPS will first run without a defined duration in order to calculate the full path. A second pass
         then adjusts the time delta -- using the relation between actual time and duration -- to calculate the path for the duration-constrained animation. */


        var generateSpringRK4 = function () {
            function springAccelerationForState(state) {
                return -state.tension * state.x - state.friction * state.v;
            }

            function springEvaluateStateWithDerivative(initialState, dt, derivative) {
                var state = {
                    x: initialState.x + derivative.dx * dt,
                    v: initialState.v + derivative.dv * dt,
                    tension: initialState.tension,
                    friction: initialState.friction
                };
                return {
                    dx: state.v,
                    dv: springAccelerationForState(state)
                };
            }

            function springIntegrateState(state, dt) {
                var a = {
                        dx: state.v,
                        dv: springAccelerationForState(state)
                    },
                    b = springEvaluateStateWithDerivative(state, dt * 0.5, a),
                    c = springEvaluateStateWithDerivative(state, dt * 0.5, b),
                    d = springEvaluateStateWithDerivative(state, dt, c),
                    dxdt = 1.0 / 6.0 * (a.dx + 2.0 * (b.dx + c.dx) + d.dx),
                    dvdt = 1.0 / 6.0 * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);
                state.x = state.x + dxdt * dt;
                state.v = state.v + dvdt * dt;
                return state;
            }

            return function springRK4Factory(tension, friction, duration) {
                var initState = {
                        x: -1,
                        v: 0,
                        tension: null,
                        friction: null
                    },
                    path = [0],
                    time_lapsed = 0,
                    tolerance = 1 / 10000,
                    DT = 16 / 1000,
                    have_duration,
                    dt,
                    last_state;
                tension = parseFloat(tension) || 500;
                friction = parseFloat(friction) || 20;
                duration = duration || null;
                initState.tension = tension;
                initState.friction = friction;
                have_duration = duration !== null;
                /* Calculate the actual time it takes for this animation to complete with the provided conditions. */

                if (have_duration) {
                    /* Run the simulation without a duration. */
                    time_lapsed = springRK4Factory(tension, friction);
                    /* Compute the adjusted time delta. */

                    dt = time_lapsed / duration * DT;
                } else {
                    dt = DT;
                }

                while (true) {
                    /* Next/step function .*/
                    last_state = springIntegrateState(last_state || initState, dt);
                    /* Store the position. */

                    path.push(1 + last_state.x);
                    time_lapsed += 16;
                    /* If the change threshold is reached, break. */

                    if (!(Math.abs(last_state.x) > tolerance && Math.abs(last_state.v) > tolerance)) {
                        break;
                    }
                }
                /* If duration is not defined, return the actual time required for completing this animation. Otherwise, return a closure that holds the
                 computed path and returns a snapshot of the position according to a given percentComplete. */


                return !have_duration ? time_lapsed : function (percentComplete) {
                    return path[percentComplete * (path.length - 1) | 0];
                };
            };
        }();
        /* Step easing generator. */


        function generateStep(steps) {
            return function (p) {
                return Math.round(p * steps) * (1 / steps);
            };
        } // css/builder.js


        function buildCSS(obj) {
            var out = [];

            function recurse(arr) {
                arr.forEach(function (property) {
                    switch (property[0]) {
                        case 0:
                            out.push(property[1], property[2], ' ');
                            break;

                        case 1:
                            out.push(property[1], '(');
                            property[2].forEach(function (prop, i) {
                                if (i !== 0) out.push(',');
                                recurse(prop);
                            });
                            out.push(')', ' ');
                            break;

                        case 2:
                            out.push('rgb(');
                            property[1].forEach(function (prop, i) {
                                if (i !== 0) out.push(',');
                                out.push(prop);
                            });
                            out.push(')', ' ');
                            break;

                        case 3:
                            out.push(property[1], ' ');
                            break;
                    }
                });
            }

            recurse(obj);
            out.pop();
            return out.join('');
        } // css/converter.js


        var convertUnits = function () {
            var Map = {};
            var test = document.createElement("div");
            test.style.visibility = test.style.overflow = "hidden";
            var baseline = 150;

            function populateMap() {
                var Units = ['px', 'in', 'cm', 'mm', 'pt', 'pc'];
                document.body.appendChild(test);
                Units.forEach(function (unit) {
                    test.style.width = baseline + unit;
                    Map[unit] = baseline / test.offsetWidth;
                });
                document.body.removeChild(test);
            }

            window.addEventListener('load', function () {
                populateMap();
            });

            function converter(element, value, from, to) {
                var fromRatio = Map[from]; // [unit]/px

                var toRatio = Map[to]; // [unit]/px

                if (!fromRatio || !toRatio) {
                    element.appendChild(test);

                    if (!fromRatio) {
                        test.style.width = baseline + from;
                        fromRatio = baseline / test.offsetWidth;
                    }

                    if (!toRatio) {
                        test.style.width = baseline + to;
                        toRatio = baseline / test.offsetWidth;
                    }

                    element.removeChild(test);
                }

                return value / fromRatio * toRatio; // [u1] * 1/([u1]/px) * [u2]/px;
            }

            return converter;
        }(); // css/css.js


        function getProperty(element, propData) {
            if (CSSGetHooks[propData.nameJS]) return CSSGetHooks[propData.nameJS](element, propData);
            if (element.style[propData.nameJS]) return element.style[propData.nameJS];
            var styles = window.getComputedStyle(element.element);
            return styles.getPropertyValue(propData.nameCSS);
        }

        function setProperty(element, propData, value) {
            if (CSSSetHooks[propData.nameJS]) {
                var dt = CSSSetHooks[propData.nameJS](element, propData, value);
                if (dt) element.style[dt[0]] = dt[1];
            } else {
                element.style[propData.nameJS] = value;
            }

            return;
        }

        function getCssString(property) {
            return property.replace(/[A-Z]/g, function (a) {
                return '-' + a.toLowerCase();
            });
        }

        function getJsString(name) {
            return name.split('-').map(function (n, i) {
                if (i !== 0) return capitalizeFirstLetter(n);
                return n;
            }).join('');
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        } // css/manipulator.js


        function operate(value, value2, operator) {
            switch (operator) {
                case '+':
                    return value + value2;
                    break;

                case '-':
                    return value - value2;
                    break;

                case '*':
                    return value * value2;
                    break;

                case '/':
                    return value / value2;
                    break;

                case '^':
                    return Math.pow(value, value2);
                    break;

                default:
                    return value;
                    break;
            }
        }

        function operateCSS(css1, css2, operator) {
            for (var i = 0; i < css2.length; ++i) {
                if (!css1[i]) throw 'Fail';

                switch (css2[i][0]) {
                    case 0:
                        // number
                        if (css2[i][3] === false) css2[i][1] = 0;
                        css2[i][1] = operate(css1[i][1], css2[i][1], operator);
                        break;

                    case 1:
                        // function
                        css2[i][2].forEach(function (prop, ind) {
                            operateCSS(css1[i][2][ind], css2[i][2][ind], operator);
                        });
                        break;

                    case 2:
                        // color
                        if (css2[i][2] === false) {
                            css2[i][1].forEach(function (prop, ind) {
                                css2[i][1][ind] = parseInt(operate(0, prop, operator));
                            });
                        } else {
                            css2[i][1].forEach(function (prop, ind) {
                                css2[i][1][ind] = parseInt(operate(css1[i][1][ind], prop, operator));
                            });
                        }

                        break;

                    case 3:
                        // string
                        break;
                }
            }
        }

        function setUnitsCSS(element, css1, css2) {
            for (var i = 0; i < css2.length; ++i) {
                if (!css1[i] || css1[i][0] !== css2[i][0]) {
                    css1[i] = css2[i].slice(0);
                    css1[i].push(false);
                    continue;
                }

                switch (css2[i][0]) {
                    case 0:
                        // number
                        if (css2[i][2]) {
                            if (!css1[i][2]) css1[i][2] = css2[i][2];
                            else if (css1[i][2] !== css2[i][2]) {
                                if (css2[i][2] === '%') {
                                    css2[i][2] = css1[i][2];
                                    css2[i][1] = css1[i][1] * (css2[i][1] / 100);
                                } else {
                                    css1[i][1] = convertUnits(element, css1[i][1], css1[i][2], css2[i][2]);
                                    css1[i][2] = css2[i][2];
                                }
                            }
                        }

                        css1[i][2] = css2[i][2];
                        break;

                    case 1:
                        // function
                        css2[i][2].forEach(function (prop, ind) {
                            if (!css1[i][2][ind]) css1[i][2][ind] = [];
                            setUnitsCSS(element, css1[i][2][ind], css2[i][2][ind]);
                        });
                        break;
                }
            }
        }

        function setDiffCSS(css1, css2) {
            for (var i = 0; i < css2.length; ++i) {
                if (!css1[i]) throw "Fail";

                switch (css2[i][0]) {
                    case 0:
                        // number
                        css1[i][3] = css2[i][1] - css1[i][1];
                        break;

                    case 2:
                        // color
                        css1[i][2] = [];
                        css2[i][1].forEach(function (prop, ind) {
                            css1[i][2][ind] = prop - css1[i][1][ind];
                        });
                        break;

                    case 1:
                        // function
                        css2[i][2].forEach(function (prop, ind) {
                            setDiffCSS(css1[i][2][ind], css2[i][2][ind]);
                        });
                        break;

                    case 3:
                        // string
                        css1[i][1] = css2[i][1];
                        break;
                }
            }
        }

        function setCSSFrac(item, property, fraction) {
            var out = [];

            function recurse(arr) {
                arr.forEach(function (property) {
                    switch (property[0]) {
                        case 0:
                            out.push(property[1] + property[3] * fraction, property[2], ' ');
                            break;

                        case 1:
                            out.push(property[1], '(');
                            property[2].forEach(function (prop, i) {
                                if (i !== 0) out.push(',');
                                recurse(prop);
                            });
                            out.push(')', ' ');
                            break;

                        case 2:
                            out.push('rgb(');
                            property[1].forEach(function (prop, i) {
                                if (i !== 0) out.push(',');
                                out.push(Math.floor(prop + property[2][i] * fraction));
                            });
                            out.push(')', ' ');
                            break;

                        case 3:
                            out.push(property[1], ' ');
                            break;
                    }
                });
            }

            recurse(property.originalValue);
            out.pop();
            setProperty(item.element, property, out.join(''));
        } // css/parser.js


        function splitSafe(str) {
            str = str.split('');
            var current = [];
            var out = [];
            var i = 0;
            var len = str.length;
            var char;
            var level = 0;

            function skip(match) {
                var backslash = false;

                for (++i; i < len; i++) {
                    char = str[i];
                    current.push(char);
                    if (char === "\\") backslash = true;
                    else if (char === match && !backslash) {
                        break;
                    } else if (backslash) {
                        backslash = false;
                    }
                }
            }

            for (i = 0; i < len; ++i) {
                char = str[i];
                current.push(char);
                if (char === '"' || char === "'") skip(char);
                else if (char === '(') {
                    level++;
                } else if (char === ')') {
                    level--;
                    if (level < 0) throw 'Fail';
                } else if (level === 0 && char === ',') {
                    current.pop();
                    out.push(current.join(''));
                    current = [];
                }
            }

            if (current.length) out.push(current.join(''));
            return out;
        }

        function parseCSS(string, obj) {
            if (!obj) obj = [];
            if (!string) return obj;

            if (string.charAt(0) === '"') {
                var match = string.match(/("(?:[^"\\]|\\.)*")(?: (.*))?/);
                obj.push([3, match[1]]);
                parseCSS(match[2], obj);
            } else if (string.charAt(0) === "'") {
                var match = string.match(/('(?:[^'\\]|\\.)*')(?: (.*))?/);
                obj.push([3, match[1]]);
                parseCSS(match[2], obj);
            } else {
                var number = string.match(/^(\-?[0-9\.]*)(em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax|s|ms|deg|grad|rad|turn|Q)?(?: (.*))?/);

                if (number[1]) {
                    // number
                    obj.push([0, parseFloat(number[1]), number[2] || '']);
                    parseCSS(number[3], obj);
                } else {
                    var func = string.match(/^([a-z\-]*?)\(([^\)]*)\)(?: (.*))?/);

                    if (func && func[1]) {
                        if (func[1] === 'rgb') {
                            obj.push([2, splitSafe(func[2]).map(function (arg) {
                                return parseInt(arg);
                            })]);
                        } else {
                            var args = splitSafe(func[2]).map(function (arg) {
                                return parseCSS(arg.trim());
                            });
                            obj.push([1, func[1], args]);
                        }

                        parseCSS(func[3], obj);
                    } else {
                        if (string.charAt(0) === '#') {
                            var results = string.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})(?: (.*))?/);
                            obj.push([2, hexToRgb(results[1])]);
                            parseCSS(results[2], obj);
                        } else {
                            var res = string.match(/^([a-z\-]*?)(?: (.*))/);

                            if (res && res[1]) {
                                if (Colors[res[1]]) {
                                    obj.push([2, Colors[res[1]].slice(0)]);
                                } else {
                                    obj.push([3, res[1]]);
                                }

                                parseCSS(res[2], obj);
                            } else {
                                if (Colors[string]) {
                                    obj.push([2, Colors[string].slice(0)]);
                                } else {
                                    obj.push([3, string]);
                                }
                            }
                        }
                    }
                }
            }

            return obj;
        } // animate.js


        function animate(element, properties, options) {
            var animateProperties = {};

            for (var name in properties) {
                (function (properties, name) {
                    var property = properties[name];
                    var easing = options.easing;

                    if (_typeof(property) === 'object') {
                        easing = property.easing || options.easing;
                        property = property.value;
                    }

                    property = property.toString();
                    var operator = false;

                    if (property.charAt(1) === '=') {
                        operator = property.charAt(0);
                        property = property.substr(2);
                    }

                    var obj = {
                        nameJS: getJsString(name),
                        nameCSS: getCssString(name),
                        toValue: null,
                        toValueRaw: null,
                        originalValue: null,
                        originalValueRaw: null,
                        init: function init() {
                            this.originalValueRaw = getProperty(element, this);

                            if (!this.originalValueRaw || this.originalValueRaw === this.toValueRaw) {
                                setProperty(element, this, this.toValueRaw);
                                return false;
                            } //   console.log(this.originalValueRaw)


                            this.originalValue = parseCSS(this.originalValueRaw);
                            setUnitsCSS(element, this.originalValue, this.toValue);

                            if (operator) {
                                operateCSS(this.originalValue, this.toValue, operator);
                            }

                            setDiffCSS(this.originalValue, this.toValue); //console.log(this.originalValue, this.toValue)

                            return true;
                        }
                    };
                    obj.toValueRaw = property;
                    obj.toValue = parseCSS(obj.toValueRaw);
                    if (!animateProperties[easing]) animateProperties[easing] = [];

                    if (!options.queue) {
                        if (obj.init()) animateProperties[easing].push(obj);
                    } else {
                        animateProperties[easing].push(obj);
                    }
                })(properties, name);
            }

            var Data = {
                element: element,
                options: options,
                properties: animateProperties,
                duration: options.duration,
                init: function init() {
                    var run = false;

                    for (var name in animateProperties) {
                        animateProperties[name] = animateProperties[name].filter(function (property) {
                            if (property.init()) {
                                run = true;
                                return true;
                            } else return false;
                        });
                    }

                    return run;
                }
            };
            if (!options.queue) options.start();
            Queues[options.queue ? 'main' : 'parrallel'].list.splice(0, 0, Data);
            startLoop();
        }

        function step(item, diff) {
            var fraction = diff / item.duration;

            for (var easing in item.properties) {
                var frac = Easings[easing](fraction);
                item.properties[easing].forEach(function (property) {
                    setCSSFrac(item, property, fraction);
                });
            }
        }

        function end(item, queueName) {
            for (var easing in item.properties) {
                item.properties[easing].forEach(function (property) {
                    setProperty(item.element, property, buildCSS(property.toValue));
                });
            }

            var queue = Queues[queueName];

            if (queue.parrallel) {
                var ind = queue.list.indexOf(item);
                queue.list.splice(ind, 1);
            } else {
                queue.active = false;
            }

            item.options.done();
        }

        function startLoop() {
            if (!Running) {
                Stop = false;
                timerLoop(false);
            }
        }

        function timerLoop(animationFrame) {
            if (Stop) return Running = false;
            else Running = true;
            window.requestAnimationFrame(function () {
                timerLoop(false);
            });
            var currentTime = Timer.now(),
                diffTime = currentTime - Now;
            Now = currentTime;
            process();
        }

        function process() {
            var stop = true;

            for (var name in Queues) {
                if (Queues[name].parrallel) {
                    Queues[name].list.forEach(function (item) {
                        if (item.startTime === undefined) {
                            item.startTime = Now;
                        } else {
                            var diff = Now - item.startTime;

                            if (diff >= item.duration) {
                                end(item, name);
                            } else {
                                step(item, diff, name);
                            }
                        }

                        stop = false;
                    });
                } else {
                    if (!Queues[name].active && Queues[name].list.length) {
                        Queues[name].active = Queues[name].list.pop();
                        Queues[name].active.options.start();

                        if (!Queues[name].active.init()) {
                            Queues[name].active.done();
                            Queues[name].active = false;
                        }

                        ;
                        stop = false;
                    }

                    var item = Queues[name].active;

                    if (item) {
                        if (item.startTime === undefined) {
                            item.startTime = Now;
                        } else {
                            var diff = Now - item.startTime;

                            if (diff >= item.duration) {
                                end(item, name);
                            } else {
                                step(item, diff, name);
                            }
                        }

                        stop = false;
                    }
                }
            }

            if (stop) Stop = stop;
        } // index.js


        function D(element, properties, options, options2, callback) {
            if (typeof element === 'string') {
                return D[element].apply(Array.from(arguments).slice(1));
            } else {
                if (options && _typeof(options) !== 'object') {
                    if (typeof options === 'function') {
                        options = {
                            done: options
                        };
                        if (options2) options.duration = options2;
                        if (callback) options.easing = callback;
                    } else if (typeof options === 'number') {
                        options = {
                            duration: options
                        };
                        if (options2) options.easing = options2;
                        if (callback) options.done = callback;
                    }
                }

                options = convertOptions(options || {});

                if (Array.isArray(properties)) {
                    var loop = function loop() {
                        var p = properties[i];
                        if (!p) return;
                        var newoptions = convertOptions(options);

                        if (start && i === 0) {
                            newoptions.start = start;
                        }

                        newoptions.done = function () {
                            i++;

                            if (i === properties.length) {
                                done();
                                return;
                            }

                            loop();
                        };

                        animate(element, p, newoptions);
                    };

                    var start = false,
                        done = false;

                    if (options.start) {
                        start = options.start;

                        options.start = function () {};
                    }

                    if (options.done) {
                        done = options.done;

                        options.done = function () {};
                    }

                    var i = 0;
                    loop();
                } else {
                    return animate(element, properties, options);
                }
            }
        }

        D.addEase = function (name, easing) {
            if (typeof easing === 'function') {
                Easings[name] = easing;
            } else if (_typeof(easing) === 'object') {
                Easings[name] = easing.length === 4 ? generateBezier(easing[0], easing[1], easing[2], easing[3]) : generateSpringRK4(easing[0], easing[1]);
            } else {
                Easings[name] = generateStep(easing);
            }
        };

        D.stop = function () {
            Stop = true;
        };

        D.start = function () {
            startLoop();
        };

        D.clear = function () {
            Queues = {
                main: {
                    list: [],
                    active: false,
                    parrallel: false
                },
                parrallel: {
                    list: [],
                    active: false,
                    parrallel: true
                }
            };
        };

        HTMLElement.prototype.D = function (properties, options, options2, callback) {
            return D(this, properties, options, options2, callback);
        };

        return D;
    }(window); // effects/index.js


    elementMethods.fadeIn = function (elementData) {
        return function (duration, complete, ending) {
            var options = {
                duration: duration,
                done: complete,
                queue: false
            };
            D(elementData.proxy, {
                opacity: 1,
                display: ending || 'block'
            }, options);
        };
    };

    elementMethods.fadeOut = function (elementData) {
        return function (duration, complete) {
            var options = {
                duration: duration,
                done: complete,
                queue: false
            };
            D(elementData.proxy, [{
                opacity: 0
      }, {
                display: 'none'
      }], options);
        };
    };

    elementMethods.D = elementMethods.animate = function (elementData) {
        return function (properties, options, options2, callback) {
            return D(elementData.proxy, properties, options, options2, callback);
        };
    }; // effects/visibility.js


    function show(elementData) {
        if (elementData.current.style.display === 'none') elementData.current.style.display = elementData.defaultDisplay || '';
    }

    function hide(elementData) {
        if (elementData.current.style.display !== 'none') {
            elementData.defaultDisplay = elementData.current.style.display;
            elementData.current.style.display = 'none';
        }
    }

    function toggle(elementData, override) {
        if ((elementData.current.style.display === 'none' || override === true) && override !== false) {
            show(elementData);
        } else {
            hide(elementData);
        }
    }

    elementMethods.show = function (elementData) {
        return function () {
            show(elementData);
        };
    };

    elementMethods.hide = function (elementData) {
        return function () {
            hide(elementData);
        };
    };

    elementMethods.toggle = function (elementData) {
        return function (override) {
            show(elementData, override);
        };
    };

    queryMethods.show = function (queryData) {
        return function () {
            queryData.hideState = false;
            queryData.nodes.forEach(function (wrapper) {
                show(wrapper.elementData);
            });
        };
    };

    queryMethods.hide = function (queryData) {
        return function () {
            queryData.hideState = true;
            queryData.nodes.forEach(function (wrapper) {
                hide(wrapper.elementData);
            });
        };
    };

    queryMethods.toggle = function (queryData) {
        return function (override) {
            if ((queryData.hideState || override === true) && override !== false) {
                queryData.hideState = false;
            } else {
                queryData.hideState = true;
            }

            queryData.nodes.forEach(function (wrapper) {
                if (queryData.hideState) {
                    hide(wrapper.elementData);
                } else {
                    show(wrapper.elementData);
                }
            });
        };
    }; // interface/magicNumbers.js


    var MagicNumbers =
        /*#__PURE__*/
        function () {
            function MagicNumbers() {
                _classCallCheck(this, MagicNumbers);

                this.table = {};
                this.numberPool = [252e4, 252e8, 252e12];
                this.assigned = [];
                this.currentNumber = 0;
                this.buildTable();
            }

            _createClass(MagicNumbers, [{
                key: "buildTable",
                value: function buildTable() {
                    var used = [];

                    for (var i = 1; i <= 10; i++) {
                        for (var j = 1; j <= 10; j++) {
                            if (j !== i || i == 1) {
                                var val = 2520 * i / j;

                                if (!used[val]) {
                                    used[val] = true;
                                    var num = parseInt(val.toString().slice(-4, -1));
                                    this.table[num] = this.table[num - 1] = i / j;
                                    var num = parseInt((100000 - val).toString().slice(-4, -1));
                                    this.table[num] = this.table[num - 1] = -i / j;
                                }
                            }
                        }
                    }
                }
    }, {
                key: "getCoefficients",
                value: function getCoefficients(num) {
                    var str = num.toString();
                    var first = this.table[parseInt(str.slice(-4 - 3, -1 - 3))] || 0;
                    var sec = this.table[parseInt(str.slice(-8 - 3, -5 - 3))] || 0;
                    var third = this.table[parseInt(str.slice(-12 - 3, -9 - 3))] || 0;

                    if (num < 0) {
                        first = -first;
                        sec = -sec;
                        third = -third;
                    }

                    var recon = this.numberPool[0] * first + this.numberPool[1] * sec + this.numberPool[2] * third;
                    var dif = num - recon;
                    return {
                        // Value = ax + by + cz + d
                        offset: dif,
                        first: first,
                        second: sec,
                        third: third
                    };
                }
    }, {
                key: "getMagicNumber",
                value: function getMagicNumber(obj) {
                    var index = this.assigned.indexOf(obj);

                    if (index !== -1) {
                        return this.numberPool[index];
                    }

                    this.assigned[this.currentNumber] = obj;
                    return this.numberPool[this.currentNumber++];
                }
    }, {
                key: "numberToObjects",
                value: function numberToObjects(num) {
                    var coefficients = this.getCoefficients(num);
                    var objs = [];

                    if (coefficients.first) {
                        objs.push([this.assigned[0], coefficients.first]);
                    }

                    if (coefficients.second) {
                        objs.push([this.assigned[1], coefficients.second]);
                    }

                    if (coefficients.third) {
                        objs.push([this.assigned[2], coefficients.third]);
                    }

                    return {
                        objects: objs,
                        offset: coefficients.offset
                    };
                }
    }]);

            return MagicNumbers;
        }();

    var magicNumbers = new MagicNumbers(); // interface/proxyObject.js

    function proxy(parent, current, name) {
        var bindings = {};
        var cache = {};
        var data = {
            bindings: bindings,
            parent: parent,
            current: current,
            name: name,
            listeners: []
        };

        var type = _typeof(current);

        var iselement = type === 'object' && isElement(current);
        var chain = false,
            chainResults = [];

        function createBinding(reversable, name, unit) {
            return {
                isRefrence: true,
                isReversable: true,
                object: current,
                name: name,
                unit: unit,
                depends: [],
                influences: [],
                value: 0,
                offset: 0,
                calculate: function calculate() {
                    var _this = this;

                    this.value = this.offset;
                    this.depends.forEach(function (d) {
                        var value = d[0].value;

                        if (convertUnits && _this.unit && d[0].unit && _this.unit !== d[0].unit) {
                            value = convertUnits(document.body, value, d[0].unit, _this.unit);
                        }

                        _this.value += value * d[1];
                    });
                    this.changed(true);
                },
                changed: function changed(dontReverse, caller) {
                    var _this2 = this;

                    this.object[this.name] = this.value + this.unit;
                    this.influences.forEach(function (o) {
                        if (o !== caller) o.calculate();
                    });

                    if (!dontReverse && this.depends.length) {
                        if (this.isReversable) {
                            var val = (this.value - this.offset) / this.depends[0][1];
                            this.depends.forEach(function (d) {
                                if (convertUnits && _this2.unit && d[0].unit && _this2.unit !== d[0].unit) {
                                    val = convertUnits(document.body, val, _this2.unit, d[0].unit);
                                }

                                d[0].value = val;
                                d[0].changed(false, _this2);
                            });
                        } else {
                            throw "ERROR: Cannot set bound property which is not reversable! At property " + this.name;
                        }
                    }
                },
                removeBinding: function removeBinding() {
                    var _this3 = this;

                    this.depends.forEach(function (d) {
                        d[0].influences.splice(d[0].influences.indexOf(_this3), 1);
                    });
                    this.depends = [];
                    this.offset = 0;
                }
            };
        }

        var proxyOut = new Proxy(current, {
            get: function get(target, name) {
                var toReturn = undefined;

                if (name === "element") {
                    return data.current;
                } else if (name === 'elementData') {
                    return data;
                } else if (name === 'chain') {
                    chainResults = [];
                    chain = true;
                    return proxyout;
                } else if (name === 'end') {
                    chain = false;
                    var result = chainResults[chainResults.length - 1];
                    return new Proxy(result, {
                        get: function get(target, name) {
                            if (name === 'results') return chainResults;
                            else return result[name];
                        }
                    });
                } else if (name.charAt(0) === '$') {
                    name = name.substr(1);

                    if (iselement && elementMethods[name]) {
                        toReturn = elementMethods[name](data, true, 'get', undefined, name);
                    } else {
                        if (!bindings[name]) {
                            var unit = "";
                            var number = 0;

                            if (typeof current[name] === "string") {
                                var match = current[name].match(/^(\-?[0-9\.]*)(em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax|s|ms|deg|grad|rad|turn|Q)?$/);

                                if (match[1]) {
                                    number = parseFloat(match[1]);
                                    unit = match[2];
                                }
                            } else number = parseFloat(current[name]);

                            bindings[name] = createBinding(true, name, unit);
                            bindings[name].value = number;
                        }

                        toReturn = magicNumbers.getMagicNumber(bindings[name]);
                    }
                } else if (iselement && elementMethods[name]) {
                    toReturn = elementMethods[name](data, false, 'get', undefined, name);
                } else if (current[name]) {
                    if (_typeof(current[name]) === 'object') {
                        if (!cache[name] || cache[name].elementData.current !== current[name]) {
                            cache[name] = isElement(current[name]) ? wrapElement(current[name]) : proxy(current, current[name], name);
                        }

                        toReturn = cache[name];
                    } else toReturn = current[name];
                }

                return chain ? proxyOut : toReturn;
            },
            set: function set(target, name, value) {
                var refrence = false;
                var toReturn = undefined;
                if (name.charAt(0) === '$') name = name.substr(1), refrence = true;

                if (iselement && elementMethods[name]) {
                    toReturn = elementMethods[name](data, true, 'set', value, name);
                } else {
                    if (refrence && value) {
                        var number, unit;

                        if (typeof value == "string") {
                            var match = value.toString().match(/^(\-?[0-9\.]*)(em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax|s|ms|deg|grad|rad|turn|Q)?$/);
                            number = parseInt(match[1]);
                            unit = match[2];
                        } else if (typeof value == "number") {
                            number = value;
                        } else {
                            throw "ERROR: Refrences must point to another one";
                        }

                        var objects = magicNumbers.numberToObjects(number);

                        if (!unit) {
                            unit = objects.objects[0][0].unit;
                            console.log("WARNING: Unit was not defined for property " + name + ". Unit was assumed to be " + unit);
                        }

                        if (!bindings[name]) {
                            bindings[name] = createBinding(false, name, unit);
                        }

                        bindings[name].removeBinding();
                        bindings[name].unit = unit;
                        bindings[name].isReversable = objects.objects.length <= 1;
                        bindings[name].depends = objects.objects;
                        objects.objects.forEach(function (o) {
                            o[0].influences.push(bindings[name]);
                        });
                        bindings[name].offset = objects.offset;
                        bindings[name].calculate();
                    } else {
                        if (bindings[name]) {
                            var match = value.toString().match(/^(\-?[0-9\.]*)(em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax|s|ms|deg|grad|rad|turn|Q)?$/);
                            var number = parseFloat(match[1]);
                            var unit = match[2];
                            if (unit) bindings[name].unit = unit;
                            bindings[name].value = number;
                            bindings[name].changed();
                        } else {
                            current[name] = value;
                        }
                    }

                    toReturn = current[name];
                }

                return chain ? proxyOut : toReturn;
            },
            deleteProperty: function deleteProperty(target, name) {
                var toReturn = undefined;

                if (name.charAt(0) === '$') {
                    name = name.substr(1);

                    if (iselement && elementMethods[name]) {
                        toReturn = elementMethods[name](data, true, 'delete', undefined, name);
                    } else {
                        if (bindings[name] && bindings[name].depends.length) {
                            bindings[name].removeBinding();
                        } else if (data.name === 'style') current[name] = '', toReturn = true;
                        else toReturn = delete current[name];
                    }
                } else if (iselement && elementMethods[name]) {
                    toReturn = elementMethods[name](data, false, 'delete', undefined, name);
                } else {
                    if (data.name === 'style') current[name] = '', toReturn = true;
                    else toReturn = delete current[name];
                }

                return chain ? proxyOut : toReturn;
            }
        });
        data.proxy = proxyOut;
        return proxyOut;
    } // interface/elementWrapper.js


    function wrapElement(element) {
        if (element.elementData) return element;

        if (config.objectEdit) {
            if (!element.id) {
                element.id = createId();
            }

            if (!elementCache[element.id]) {
                elementCache[element.id] = proxy(null, element, null);
            }

            return elementCache[element.id];
        } else {
            var get = elementCache.get(element);

            if (!get) {
                get = proxy(null, element, null);
                elementCache.set(element, get);
            }

            return get;
        }
    } // interface/queryWrapper.js


    function Query(nodes, selector) {
        var object = {
            nodes: nodes.map(function (node) {
                return wrapElement(node);
            }),
            selector: selector,
            selectorSplit: selector.split(/[> ]/),
            listeners: []
        };
        var chain = false;
        var chainResults = [];
        var proxyout = new Proxy(object.nodes, {
            get: function get(target, name) {
                if (name === 'length') return object.nodes.length;
                else if (name === 'chain') {
                    chainResults = [];
                    chain = true;
                    return proxyout;
                } else if (name === 'end') {
                    chain = false;
                    var result = chainResults[chainResults.length - 1];
                    return new Proxy(result, {
                        get: function get(target, name) {
                            if (name === 'results') return chainResults;
                            else return result[name];
                        }
                    });
                }
                var toReturn = undefined;
                var refrence = false;

                if (name.charAt(0) === '$') {
                    name = name.substr(1);
                    refrence = true;
                }

                if (!isNaN(name) && object.nodes[name]) {
                    toReturn = refrence ? object.nodes[name].elementData.current : object.nodes[name];
                } else if (queryMethods[name]) {
                    toReturn = queryMethods[name](object, refrence, 'get', undefined, name);
                } else if (object.nodes.length === 1) toReturn = object.nodes[0][(refrence ? '$' : '') + name];
                else {
                    var proxyList = function proxyList(array, parent, parname, func) {
                        return new Proxy(func || array, {
                            get: function get(target, name) {
                                if (!isNaN(name)) {
                                    return array[name];
                                } else if (name === 'length') {
                                    return array.length;
                                } else if (name === 'listData') {
                                    return array;
                                } else if (name === 'link') {
                                    return function () {
                                        var initial = false;
                                        parname = parname.charAt(0) === '$' ? parname.substr(1) : parname;
                                        parent.forEach(function (node) {
                                            if (!initial) initial = node['$' + parname];
                                            else node[parname] = initial;
                                        });
                                        return initial;
                                    };
                                } else {
                                    return proxyList(array.map(function (node) {
                                        return node[name];
                                    }), array, name, function () {
                                        var _arguments = arguments;
                                        return array.map(function (node) {
                                            return node[name].apply(node, _arguments);
                                        });
                                    });
                                }
                            },
                            set: function set(target, name, value) {
                                if (value.listData) {
                                    var data = value.listData;

                                    if (data.length === array.length) {
                                        return proxyList(array.map(function (node, i) {
                                            return node[name] = data[i];
                                        }), array, name);
                                    } else {
                                        return proxyList(array.map(function (node, i) {
                                            return node[name] = data[0];
                                        }), array, name);
                                    }
                                }

                                return proxyList(array.map(function (node) {
                                    return node[name] = value;
                                }), array, name);
                            },
                            deleteProperty: function deleteProperty(target, name, value) {
                                return proxyList(array.map(function (node) {
                                    return delete node[name];
                                }), array, name);
                            }
                        });
                    };

                    toReturn = proxyList(object.nodes.map(function (node) {
                        return node[(refrence ? '$' : '') + name];
                    }), object.nodes, (refrence ? '$' : '') + name, function () {
                        var _arguments2 = arguments;
                        return object.nodes.map(function (node) {
                            return node[(refrence ? '$' : '') + name].apply(node, _arguments2);
                        });
                    });
                }

                return chain ? proxyout : toReturn;
            },
            set: function set(target, name, value) {
                var refrence = false;

                if (name.charAt(0) === '$') {
                    name = name.substr(1);
                    refrence = true;
                }

                var toReturn = undefined;
                if (queryMethods[name]) toReturn = queryMethods[name](object, refrence, 'set', value, name);
                else if (object.nodes.length === 1) {
                    toReturn = object.nodes[0][(refrence ? '$' : '') + name] = value;
                } else {
                    toReturn = object.nodes.map(function (node) {
                        return node[(refrence ? '$' : '') + name] = value;
                    });
                }
                return chain ? proxyout : toReturn;
            },
            deleteProperty: function deleteProperty(target, name) {
                var refrence = false;

                if (name.charAt(0) === '$') {
                    name = name.substr(1);
                    refrence = true;
                }

                var toReturn = undefined;
                if (queryMethods[name]) toReturn = queryMethods[name](object, refrence, 'delete', undefined, name);
                else if (object.nodes.length === 1) {
                    toReturn = delete object.nodes[0][(refrence ? '$' : '') + name];
                } else {
                    toReturn = object.nodes.map(function (node) {
                        return delete node[(refrence ? '$' : '') + name];
                    });
                }
                return chain ? proxyout : toReturn;
            }
        });
        return proxyout;
    } // interface/mainInterface.js


    function createMain() {
        var proxyout = new Proxy(function (selector) {
            if (!selector) return;
            else if (typeof selector === 'string') {
                var elements = select(selector);
                return Query(elements, selector);
            } else if (_typeof(selector) === 'object') {
                if (Array.isArray(selector)) {
                    return Query(selector, null);
                } else {
                    if (selector.nodeType === 9) {
                        return proxyout;
                    } else if (selector.nodeType === 1) {
                        return wrapElement(selector);
                    }
                }
            }
        }, {
            get: function get(target, name) {
                var refrence = false;

                if (name.charAt(0) === '$') {
                    refrence = true;
                    name = name.substr(1);
                }

                if (AQueryMethods[name]) {
                    return AQueryMethods[name](refrence, 'get', undefined, name);
                } else {
                    return document[name];
                }
            },
            set: function set(target, name, value) {
                var refrence = false;

                if (name.charAt(0) === '$') {
                    refrence = true;
                    name = name.substr(1);
                }

                if (AQueryMethods[name]) {
                    return AQueryMethods[name](refrence, 'set', value, name);
                } else {
                    return document[name] = value;
                }
            },
            deleteProperty: function deleteProperty(target, name) {
                var refrence = false;

                if (name.charAt(0) === '$') {
                    refrence = true;
                    name = name.substr(1);
                }

                if (AQueryMethods[name]) {
                    return AQueryMethods[name](refrence, 'delete', undefined, name);
                } else {
                    return delete document[name];
                }
            }
        });
        return proxyout;
    }

    function select(selector) {
        return Array.from(document.querySelectorAll(selector));
    } // index.js


    AQuery = createMain();
    window.AQuery = AQuery;

    if (!window.$) {
        window.$ = window.AQuery;
    }
})(window);
