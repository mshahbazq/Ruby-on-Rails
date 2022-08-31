/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


;
(function() {
  this.Rails = {
    linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
    buttonClickSelector: {
      selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
      exclude: 'form button'
    },
    inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
    formSubmitSelector: 'form',
    formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
    formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
    formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
    fileInputSelector: 'input[name][type=file]:not([disabled])',
    linkDisableSelector: 'a[data-disable-with], a[data-disable]',
    buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
  };

}).call(this);
(function() {
  var nonce;

  nonce = null;

  Rails.loadCSPNonce = function() {
    var ref;
    return nonce = (ref = document.querySelector("meta[name=csp-nonce]")) != null ? ref.content : void 0;
  };

  Rails.cspNonce = function() {
    return nonce != null ? nonce : Rails.loadCSPNonce();
  };

}).call(this);
(function() {
  var expando, m;

  m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

  Rails.matches = function(element, selector) {
    if (selector.exclude != null) {
      return m.call(element, selector.selector) && !m.call(element, selector.exclude);
    } else {
      return m.call(element, selector);
    }
  };

  expando = '_ujsData';

  Rails.getData = function(element, key) {
    var ref;
    return (ref = element[expando]) != null ? ref[key] : void 0;
  };

  Rails.setData = function(element, key, value) {
    if (element[expando] == null) {
      element[expando] = {};
    }
    return element[expando][key] = value;
  };

  Rails.$ = function(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  };

}).call(this);
(function() {
  var $, csrfParam, csrfToken;

  $ = Rails.$;

  csrfToken = Rails.csrfToken = function() {
    var meta;
    meta = document.querySelector('meta[name=csrf-token]');
    return meta && meta.content;
  };

  csrfParam = Rails.csrfParam = function() {
    var meta;
    meta = document.querySelector('meta[name=csrf-param]');
    return meta && meta.content;
  };

  Rails.CSRFProtection = function(xhr) {
    var token;
    token = csrfToken();
    if (token != null) {
      return xhr.setRequestHeader('X-CSRF-Token', token);
    }
  };

  Rails.refreshCSRFTokens = function() {
    var param, token;
    token = csrfToken();
    param = csrfParam();
    if ((token != null) && (param != null)) {
      return $('form input[name="' + param + '"]').forEach(function(input) {
        return input.value = token;
      });
    }
  };

}).call(this);
(function() {
  var CustomEvent, fire, matches, preventDefault;

  matches = Rails.matches;

  CustomEvent = window.CustomEvent;

  if (typeof CustomEvent !== 'function') {
    CustomEvent = function(event, params) {
      var evt;
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    CustomEvent.prototype = window.Event.prototype;
    preventDefault = CustomEvent.prototype.preventDefault;
    CustomEvent.prototype.preventDefault = function() {
      var result;
      result = preventDefault.call(this);
      if (this.cancelable && !this.defaultPrevented) {
        Object.defineProperty(this, 'defaultPrevented', {
          get: function() {
            return true;
          }
        });
      }
      return result;
    };
  }

  fire = Rails.fire = function(obj, name, data) {
    var event;
    event = new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      detail: data
    });
    obj.dispatchEvent(event);
    return !event.defaultPrevented;
  };

  Rails.stopEverything = function(e) {
    fire(e.target, 'ujs:everythingStopped');
    e.preventDefault();
    e.stopPropagation();
    return e.stopImmediatePropagation();
  };

  Rails.delegate = function(element, selector, eventType, handler) {
    return element.addEventListener(eventType, function(e) {
      var target;
      target = e.target;
      while (!(!(target instanceof Element) || matches(target, selector))) {
        target = target.parentNode;
      }
      if (target instanceof Element && handler.call(target, e) === false) {
        e.preventDefault();
        return e.stopPropagation();
      }
    });
  };

}).call(this);
(function() {
  var AcceptHeaders, CSRFProtection, createXHR, cspNonce, fire, prepareOptions, processResponse;

  cspNonce = Rails.cspNonce, CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

  AcceptHeaders = {
    '*': '*/*',
    text: 'text/plain',
    html: 'text/html',
    xml: 'application/xml, text/xml',
    json: 'application/json, text/javascript',
    script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
  };

  Rails.ajax = function(options) {
    var xhr;
    options = prepareOptions(options);
    xhr = createXHR(options, function() {
      var ref, response;
      response = processResponse((ref = xhr.response) != null ? ref : xhr.responseText, xhr.getResponseHeader('Content-Type'));
      if (Math.floor(xhr.status / 100) === 2) {
        if (typeof options.success === "function") {
          options.success(response, xhr.statusText, xhr);
        }
      } else {
        if (typeof options.error === "function") {
          options.error(response, xhr.statusText, xhr);
        }
      }
      return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
    });
    if ((options.beforeSend != null) && !options.beforeSend(xhr, options)) {
      return false;
    }
    if (xhr.readyState === XMLHttpRequest.OPENED) {
      return xhr.send(options.data);
    }
  };

  prepareOptions = function(options) {
    options.url = options.url || location.href;
    options.type = options.type.toUpperCase();
    if (options.type === 'GET' && options.data) {
      if (options.url.indexOf('?') < 0) {
        options.url += '?' + options.data;
      } else {
        options.url += '&' + options.data;
      }
    }
    if (AcceptHeaders[options.dataType] == null) {
      options.dataType = '*';
    }
    options.accept = AcceptHeaders[options.dataType];
    if (options.dataType !== '*') {
      options.accept += ', */*; q=0.01';
    }
    return options;
  };

  createXHR = function(options, done) {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.open(options.type, options.url, true);
    xhr.setRequestHeader('Accept', options.accept);
    if (typeof options.data === 'string') {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }
    if (!options.crossDomain) {
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    CSRFProtection(xhr);
    xhr.withCredentials = !!options.withCredentials;
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        return done(xhr);
      }
    };
    return xhr;
  };

  processResponse = function(response, type) {
    var parser, script;
    if (typeof response === 'string' && typeof type === 'string') {
      if (type.match(/\bjson\b/)) {
        try {
          response = JSON.parse(response);
        } catch (error) {}
      } else if (type.match(/\b(?:java|ecma)script\b/)) {
        script = document.createElement('script');
        script.setAttribute('nonce', cspNonce());
        script.text = response;
        document.head.appendChild(script).parentNode.removeChild(script);
      } else if (type.match(/\b(xml|html|svg)\b/)) {
        parser = new DOMParser();
        type = type.replace(/;.+/, '');
        try {
          response = parser.parseFromString(response, type);
        } catch (error) {}
      }
    }
    return response;
  };

  Rails.href = function(element) {
    return element.href;
  };

  Rails.isCrossDomain = function(url) {
    var e, originAnchor, urlAnchor;
    originAnchor = document.createElement('a');
    originAnchor.href = location.href;
    urlAnchor = document.createElement('a');
    try {
      urlAnchor.href = url;
      return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
    } catch (error) {
      e = error;
      return true;
    }
  };

}).call(this);
(function() {
  var matches, toArray;

  matches = Rails.matches;

  toArray = function(e) {
    return Array.prototype.slice.call(e);
  };

  Rails.serializeElement = function(element, additionalParam) {
    var inputs, params;
    inputs = [element];
    if (matches(element, 'form')) {
      inputs = toArray(element.elements);
    }
    params = [];
    inputs.forEach(function(input) {
      if (!input.name || input.disabled) {
        return;
      }
      if (matches(input, 'select')) {
        return toArray(input.options).forEach(function(option) {
          if (option.selected) {
            return params.push({
              name: input.name,
              value: option.value
            });
          }
        });
      } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
        return params.push({
          name: input.name,
          value: input.value
        });
      }
    });
    if (additionalParam) {
      params.push(additionalParam);
    }
    return params.map(function(param) {
      if (param.name != null) {
        return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
      } else {
        return param;
      }
    }).join('&');
  };

  Rails.formElements = function(form, selector) {
    if (matches(form, 'form')) {
      return toArray(form.elements).filter(function(el) {
        return matches(el, selector);
      });
    } else {
      return toArray(form.querySelectorAll(selector));
    }
  };

}).call(this);
(function() {
  var allowAction, fire, stopEverything;

  fire = Rails.fire, stopEverything = Rails.stopEverything;

  Rails.handleConfirm = function(e) {
    if (!allowAction(this)) {
      return stopEverything(e);
    }
  };

  allowAction = function(element) {
    var answer, callback, message;
    message = element.getAttribute('data-confirm');
    if (!message) {
      return true;
    }
    answer = false;
    if (fire(element, 'confirm')) {
      try {
        answer = confirm(message);
      } catch (error) {}
      callback = fire(element, 'confirm:complete', [answer]);
    }
    return answer && callback;
  };

}).call(this);
(function() {
  var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

  matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

  Rails.handleDisabledElement = function(e) {
    var element;
    element = this;
    if (element.disabled) {
      return stopEverything(e);
    }
  };

  Rails.enableElement = function(e) {
    var element;
    element = e instanceof Event ? e.target : e;
    if (matches(element, Rails.linkDisableSelector)) {
      return enableLinkElement(element);
    } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
      return enableFormElement(element);
    } else if (matches(element, Rails.formSubmitSelector)) {
      return enableFormElements(element);
    }
  };

  Rails.disableElement = function(e) {
    var element;
    element = e instanceof Event ? e.target : e;
    if (matches(element, Rails.linkDisableSelector)) {
      return disableLinkElement(element);
    } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
      return disableFormElement(element);
    } else if (matches(element, Rails.formSubmitSelector)) {
      return disableFormElements(element);
    }
  };

  disableLinkElement = function(element) {
    var replacement;
    replacement = element.getAttribute('data-disable-with');
    if (replacement != null) {
      setData(element, 'ujs:enable-with', element.innerHTML);
      element.innerHTML = replacement;
    }
    element.addEventListener('click', stopEverything);
    return setData(element, 'ujs:disabled', true);
  };

  enableLinkElement = function(element) {
    var originalText;
    originalText = getData(element, 'ujs:enable-with');
    if (originalText != null) {
      element.innerHTML = originalText;
      setData(element, 'ujs:enable-with', null);
    }
    element.removeEventListener('click', stopEverything);
    return setData(element, 'ujs:disabled', null);
  };

  disableFormElements = function(form) {
    return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
  };

  disableFormElement = function(element) {
    var replacement;
    replacement = element.getAttribute('data-disable-with');
    if (replacement != null) {
      if (matches(element, 'button')) {
        setData(element, 'ujs:enable-with', element.innerHTML);
        element.innerHTML = replacement;
      } else {
        setData(element, 'ujs:enable-with', element.value);
        element.value = replacement;
      }
    }
    element.disabled = true;
    return setData(element, 'ujs:disabled', true);
  };

  enableFormElements = function(form) {
    return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
  };

  enableFormElement = function(element) {
    var originalText;
    originalText = getData(element, 'ujs:enable-with');
    if (originalText != null) {
      if (matches(element, 'button')) {
        element.innerHTML = originalText;
      } else {
        element.value = originalText;
      }
      setData(element, 'ujs:enable-with', null);
    }
    element.disabled = false;
    return setData(element, 'ujs:disabled', null);
  };

}).call(this);
(function() {
  var stopEverything;

  stopEverything = Rails.stopEverything;

  Rails.handleMethod = function(e) {
    var csrfParam, csrfToken, form, formContent, href, link, method;
    link = this;
    method = link.getAttribute('data-method');
    if (!method) {
      return;
    }
    href = Rails.href(link);
    csrfToken = Rails.csrfToken();
    csrfParam = Rails.csrfParam();
    form = document.createElement('form');
    formContent = "<input name='_method' value='" + method + "' type='hidden' />";
    if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
      formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
    }
    formContent += '<input type="submit" />';
    form.method = 'post';
    form.action = href;
    form.target = link.target;
    form.innerHTML = formContent;
    form.style.display = 'none';
    document.body.appendChild(form);
    form.querySelector('[type="submit"]').click();
    return stopEverything(e);
  };

}).call(this);
(function() {
  var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
    slice = [].slice;

  matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

  isRemote = function(element) {
    var value;
    value = element.getAttribute('data-remote');
    return (value != null) && value !== 'false';
  };

  Rails.handleRemote = function(e) {
    var button, data, dataType, element, method, url, withCredentials;
    element = this;
    if (!isRemote(element)) {
      return true;
    }
    if (!fire(element, 'ajax:before')) {
      fire(element, 'ajax:stopped');
      return false;
    }
    withCredentials = element.getAttribute('data-with-credentials');
    dataType = element.getAttribute('data-type') || 'script';
    if (matches(element, Rails.formSubmitSelector)) {
      button = getData(element, 'ujs:submit-button');
      method = getData(element, 'ujs:submit-button-formmethod') || element.method;
      url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
      if (method.toUpperCase() === 'GET') {
        url = url.replace(/\?.*$/, '');
      }
      if (element.enctype === 'multipart/form-data') {
        data = new FormData(element);
        if (button != null) {
          data.append(button.name, button.value);
        }
      } else {
        data = serializeElement(element, button);
      }
      setData(element, 'ujs:submit-button', null);
      setData(element, 'ujs:submit-button-formmethod', null);
      setData(element, 'ujs:submit-button-formaction', null);
    } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
      method = element.getAttribute('data-method');
      url = element.getAttribute('data-url');
      data = serializeElement(element, element.getAttribute('data-params'));
    } else {
      method = element.getAttribute('data-method');
      url = Rails.href(element);
      data = element.getAttribute('data-params');
    }
    ajax({
      type: method || 'GET',
      url: url,
      data: data,
      dataType: dataType,
      beforeSend: function(xhr, options) {
        if (fire(element, 'ajax:beforeSend', [xhr, options])) {
          return fire(element, 'ajax:send', [xhr]);
        } else {
          fire(element, 'ajax:stopped');
          return false;
        }
      },
      success: function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return fire(element, 'ajax:success', args);
      },
      error: function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return fire(element, 'ajax:error', args);
      },
      complete: function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return fire(element, 'ajax:complete', args);
      },
      crossDomain: isCrossDomain(url),
      withCredentials: (withCredentials != null) && withCredentials !== 'false'
    });
    return stopEverything(e);
  };

  Rails.formSubmitButtonClick = function(e) {
    var button, form;
    button = this;
    form = button.form;
    if (!form) {
      return;
    }
    if (button.name) {
      setData(form, 'ujs:submit-button', {
        name: button.name,
        value: button.value
      });
    }
    setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
    setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
    return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
  };

  Rails.preventInsignificantClick = function(e) {
    var data, insignificantMetaClick, link, metaClick, method, primaryMouseKey;
    link = this;
    method = (link.getAttribute('data-method') || 'GET').toUpperCase();
    data = link.getAttribute('data-params');
    metaClick = e.metaKey || e.ctrlKey;
    insignificantMetaClick = metaClick && method === 'GET' && !data;
    primaryMouseKey = e.button === 0;
    if (!primaryMouseKey || insignificantMetaClick) {
      return e.stopImmediatePropagation();
    }
  };

}).call(this);
(function() {
  var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMethod, handleRemote, loadCSPNonce, preventInsignificantClick, refreshCSRFTokens;

  fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, loadCSPNonce = Rails.loadCSPNonce, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, preventInsignificantClick = Rails.preventInsignificantClick, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMethod = Rails.handleMethod;

  if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null)) {
    if (jQuery.rails) {
      throw new Error('If you load both jquery_ujs and rails-ujs, use rails-ujs only.');
    }
    jQuery.rails = Rails;
    jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
      if (!options.crossDomain) {
        return CSRFProtection(xhr);
      }
    });
  }

  Rails.start = function() {
    if (window._rails_loaded) {
      throw new Error('rails-ujs has already been loaded!');
    }
    window.addEventListener('pageshow', function() {
      $(Rails.formEnableSelector).forEach(function(el) {
        if (getData(el, 'ujs:disabled')) {
          return enableElement(el);
        }
      });
      return $(Rails.linkDisableSelector).forEach(function(el) {
        if (getData(el, 'ujs:disabled')) {
          return enableElement(el);
        }
      });
    });
    delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
    delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
    delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
    delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
    delegate(document, Rails.linkClickSelector, 'click', preventInsignificantClick);
    delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
    delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
    delegate(document, Rails.linkClickSelector, 'click', disableElement);
    delegate(document, Rails.linkClickSelector, 'click', handleRemote);
    delegate(document, Rails.linkClickSelector, 'click', handleMethod);
    delegate(document, Rails.buttonClickSelector, 'click', preventInsignificantClick);
    delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
    delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
    delegate(document, Rails.buttonClickSelector, 'click', disableElement);
    delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
    delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
    delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
    delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
    delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
    delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
    delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
    delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
      return setTimeout((function() {
        return disableElement(e);
      }), 13);
    });
    delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
    delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
    delegate(document, Rails.formInputClickSelector, 'click', preventInsignificantClick);
    delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
    delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
    delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
    document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
    document.addEventListener('DOMContentLoaded', loadCSPNonce);
    return window._rails_loaded = true;
  };

  if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
    Rails.start();
  }

}).call(this);
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.ActiveStorage = {}));
}(this, function (exports) { 'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var sparkMd5 = createCommonjsModule(function (module, exports) {
	    (function (factory) {
	        {
	            // Node/CommonJS
	            module.exports = factory();
	        }
	    })(function (undefined) {

	        /*
	         * Fastest md5 implementation around (JKM md5).
	         * Credits: Joseph Myers
	         *
	         * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
	         * @see http://jsperf.com/md5-shootout/7
	         */

	        /* this function is much faster,
	          so if possible we use it. Some IEs
	          are the only ones I know of that
	          need the idiotic second function,
	          generated by an if clause.  */

	        var hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

	        function md5cycle(x, k) {
	            var a = x[0],
	                b = x[1],
	                c = x[2],
	                d = x[3];

	            a += (b & c | ~b & d) + k[0] - 680876936 | 0;
	            a = (a << 7 | a >>> 25) + b | 0;
	            d += (a & b | ~a & c) + k[1] - 389564586 | 0;
	            d = (d << 12 | d >>> 20) + a | 0;
	            c += (d & a | ~d & b) + k[2] + 606105819 | 0;
	            c = (c << 17 | c >>> 15) + d | 0;
	            b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
	            b = (b << 22 | b >>> 10) + c | 0;
	            a += (b & c | ~b & d) + k[4] - 176418897 | 0;
	            a = (a << 7 | a >>> 25) + b | 0;
	            d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
	            d = (d << 12 | d >>> 20) + a | 0;
	            c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
	            c = (c << 17 | c >>> 15) + d | 0;
	            b += (c & d | ~c & a) + k[7] - 45705983 | 0;
	            b = (b << 22 | b >>> 10) + c | 0;
	            a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
	            a = (a << 7 | a >>> 25) + b | 0;
	            d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
	            d = (d << 12 | d >>> 20) + a | 0;
	            c += (d & a | ~d & b) + k[10] - 42063 | 0;
	            c = (c << 17 | c >>> 15) + d | 0;
	            b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
	            b = (b << 22 | b >>> 10) + c | 0;
	            a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
	            a = (a << 7 | a >>> 25) + b | 0;
	            d += (a & b | ~a & c) + k[13] - 40341101 | 0;
	            d = (d << 12 | d >>> 20) + a | 0;
	            c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
	            c = (c << 17 | c >>> 15) + d | 0;
	            b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
	            b = (b << 22 | b >>> 10) + c | 0;

	            a += (b & d | c & ~d) + k[1] - 165796510 | 0;
	            a = (a << 5 | a >>> 27) + b | 0;
	            d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
	            d = (d << 9 | d >>> 23) + a | 0;
	            c += (d & b | a & ~b) + k[11] + 643717713 | 0;
	            c = (c << 14 | c >>> 18) + d | 0;
	            b += (c & a | d & ~a) + k[0] - 373897302 | 0;
	            b = (b << 20 | b >>> 12) + c | 0;
	            a += (b & d | c & ~d) + k[5] - 701558691 | 0;
	            a = (a << 5 | a >>> 27) + b | 0;
	            d += (a & c | b & ~c) + k[10] + 38016083 | 0;
	            d = (d << 9 | d >>> 23) + a | 0;
	            c += (d & b | a & ~b) + k[15] - 660478335 | 0;
	            c = (c << 14 | c >>> 18) + d | 0;
	            b += (c & a | d & ~a) + k[4] - 405537848 | 0;
	            b = (b << 20 | b >>> 12) + c | 0;
	            a += (b & d | c & ~d) + k[9] + 568446438 | 0;
	            a = (a << 5 | a >>> 27) + b | 0;
	            d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
	            d = (d << 9 | d >>> 23) + a | 0;
	            c += (d & b | a & ~b) + k[3] - 187363961 | 0;
	            c = (c << 14 | c >>> 18) + d | 0;
	            b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
	            b = (b << 20 | b >>> 12) + c | 0;
	            a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
	            a = (a << 5 | a >>> 27) + b | 0;
	            d += (a & c | b & ~c) + k[2] - 51403784 | 0;
	            d = (d << 9 | d >>> 23) + a | 0;
	            c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
	            c = (c << 14 | c >>> 18) + d | 0;
	            b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
	            b = (b << 20 | b >>> 12) + c | 0;

	            a += (b ^ c ^ d) + k[5] - 378558 | 0;
	            a = (a << 4 | a >>> 28) + b | 0;
	            d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
	            d = (d << 11 | d >>> 21) + a | 0;
	            c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
	            c = (c << 16 | c >>> 16) + d | 0;
	            b += (c ^ d ^ a) + k[14] - 35309556 | 0;
	            b = (b << 23 | b >>> 9) + c | 0;
	            a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
	            a = (a << 4 | a >>> 28) + b | 0;
	            d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
	            d = (d << 11 | d >>> 21) + a | 0;
	            c += (d ^ a ^ b) + k[7] - 155497632 | 0;
	            c = (c << 16 | c >>> 16) + d | 0;
	            b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
	            b = (b << 23 | b >>> 9) + c | 0;
	            a += (b ^ c ^ d) + k[13] + 681279174 | 0;
	            a = (a << 4 | a >>> 28) + b | 0;
	            d += (a ^ b ^ c) + k[0] - 358537222 | 0;
	            d = (d << 11 | d >>> 21) + a | 0;
	            c += (d ^ a ^ b) + k[3] - 722521979 | 0;
	            c = (c << 16 | c >>> 16) + d | 0;
	            b += (c ^ d ^ a) + k[6] + 76029189 | 0;
	            b = (b << 23 | b >>> 9) + c | 0;
	            a += (b ^ c ^ d) + k[9] - 640364487 | 0;
	            a = (a << 4 | a >>> 28) + b | 0;
	            d += (a ^ b ^ c) + k[12] - 421815835 | 0;
	            d = (d << 11 | d >>> 21) + a | 0;
	            c += (d ^ a ^ b) + k[15] + 530742520 | 0;
	            c = (c << 16 | c >>> 16) + d | 0;
	            b += (c ^ d ^ a) + k[2] - 995338651 | 0;
	            b = (b << 23 | b >>> 9) + c | 0;

	            a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
	            a = (a << 6 | a >>> 26) + b | 0;
	            d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
	            d = (d << 10 | d >>> 22) + a | 0;
	            c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
	            c = (c << 15 | c >>> 17) + d | 0;
	            b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
	            b = (b << 21 | b >>> 11) + c | 0;
	            a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
	            a = (a << 6 | a >>> 26) + b | 0;
	            d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
	            d = (d << 10 | d >>> 22) + a | 0;
	            c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
	            c = (c << 15 | c >>> 17) + d | 0;
	            b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
	            b = (b << 21 | b >>> 11) + c | 0;
	            a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
	            a = (a << 6 | a >>> 26) + b | 0;
	            d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
	            d = (d << 10 | d >>> 22) + a | 0;
	            c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
	            c = (c << 15 | c >>> 17) + d | 0;
	            b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
	            b = (b << 21 | b >>> 11) + c | 0;
	            a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
	            a = (a << 6 | a >>> 26) + b | 0;
	            d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
	            d = (d << 10 | d >>> 22) + a | 0;
	            c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
	            c = (c << 15 | c >>> 17) + d | 0;
	            b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
	            b = (b << 21 | b >>> 11) + c | 0;

	            x[0] = a + x[0] | 0;
	            x[1] = b + x[1] | 0;
	            x[2] = c + x[2] | 0;
	            x[3] = d + x[3] | 0;
	        }

	        function md5blk(s) {
	            var md5blks = [],
	                i; /* Andy King said do it this way. */

	            for (i = 0; i < 64; i += 4) {
	                md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
	            }
	            return md5blks;
	        }

	        function md5blk_array(a) {
	            var md5blks = [],
	                i; /* Andy King said do it this way. */

	            for (i = 0; i < 64; i += 4) {
	                md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
	            }
	            return md5blks;
	        }

	        function md51(s) {
	            var n = s.length,
	                state = [1732584193, -271733879, -1732584194, 271733878],
	                i,
	                length,
	                tail,
	                tmp,
	                lo,
	                hi;

	            for (i = 64; i <= n; i += 64) {
	                md5cycle(state, md5blk(s.substring(i - 64, i)));
	            }
	            s = s.substring(i - 64);
	            length = s.length;
	            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	            for (i = 0; i < length; i += 1) {
	                tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
	            }
	            tail[i >> 2] |= 0x80 << (i % 4 << 3);
	            if (i > 55) {
	                md5cycle(state, tail);
	                for (i = 0; i < 16; i += 1) {
	                    tail[i] = 0;
	                }
	            }

	            // Beware that the final length might not fit in 32 bits so we take care of that
	            tmp = n * 8;
	            tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	            lo = parseInt(tmp[2], 16);
	            hi = parseInt(tmp[1], 16) || 0;

	            tail[14] = lo;
	            tail[15] = hi;

	            md5cycle(state, tail);
	            return state;
	        }

	        function md51_array(a) {
	            var n = a.length,
	                state = [1732584193, -271733879, -1732584194, 271733878],
	                i,
	                length,
	                tail,
	                tmp,
	                lo,
	                hi;

	            for (i = 64; i <= n; i += 64) {
	                md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
	            }

	            // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
	            // containing the last element of the parent array if the sub array specified starts
	            // beyond the length of the parent array - weird.
	            // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
	            a = i - 64 < n ? a.subarray(i - 64) : new Uint8Array(0);

	            length = a.length;
	            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	            for (i = 0; i < length; i += 1) {
	                tail[i >> 2] |= a[i] << (i % 4 << 3);
	            }

	            tail[i >> 2] |= 0x80 << (i % 4 << 3);
	            if (i > 55) {
	                md5cycle(state, tail);
	                for (i = 0; i < 16; i += 1) {
	                    tail[i] = 0;
	                }
	            }

	            // Beware that the final length might not fit in 32 bits so we take care of that
	            tmp = n * 8;
	            tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	            lo = parseInt(tmp[2], 16);
	            hi = parseInt(tmp[1], 16) || 0;

	            tail[14] = lo;
	            tail[15] = hi;

	            md5cycle(state, tail);

	            return state;
	        }

	        function rhex(n) {
	            var s = '',
	                j;
	            for (j = 0; j < 4; j += 1) {
	                s += hex_chr[n >> j * 8 + 4 & 0x0F] + hex_chr[n >> j * 8 & 0x0F];
	            }
	            return s;
	        }

	        function hex(x) {
	            var i;
	            for (i = 0; i < x.length; i += 1) {
	                x[i] = rhex(x[i]);
	            }
	            return x.join('');
	        }

	        // In some cases the fast add32 function cannot be used..
	        if (hex(md51('hello')) !== '5d41402abc4b2a76b9719d911017c592') ;

	        // ---------------------------------------------------

	        /**
	         * ArrayBuffer slice polyfill.
	         *
	         * @see https://github.com/ttaubert/node-arraybuffer-slice
	         */

	        if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
	            (function () {
	                function clamp(val, length) {
	                    val = val | 0 || 0;

	                    if (val < 0) {
	                        return Math.max(val + length, 0);
	                    }

	                    return Math.min(val, length);
	                }

	                ArrayBuffer.prototype.slice = function (from, to) {
	                    var length = this.byteLength,
	                        begin = clamp(from, length),
	                        end = length,
	                        num,
	                        target,
	                        targetArray,
	                        sourceArray;

	                    if (to !== undefined) {
	                        end = clamp(to, length);
	                    }

	                    if (begin > end) {
	                        return new ArrayBuffer(0);
	                    }

	                    num = end - begin;
	                    target = new ArrayBuffer(num);
	                    targetArray = new Uint8Array(target);

	                    sourceArray = new Uint8Array(this, begin, num);
	                    targetArray.set(sourceArray);

	                    return target;
	                };
	            })();
	        }

	        // ---------------------------------------------------

	        /**
	         * Helpers.
	         */

	        function toUtf8(str) {
	            if (/[\u0080-\uFFFF]/.test(str)) {
	                str = unescape(encodeURIComponent(str));
	            }

	            return str;
	        }

	        function utf8Str2ArrayBuffer(str, returnUInt8Array) {
	            var length = str.length,
	                buff = new ArrayBuffer(length),
	                arr = new Uint8Array(buff),
	                i;

	            for (i = 0; i < length; i += 1) {
	                arr[i] = str.charCodeAt(i);
	            }

	            return returnUInt8Array ? arr : buff;
	        }

	        function arrayBuffer2Utf8Str(buff) {
	            return String.fromCharCode.apply(null, new Uint8Array(buff));
	        }

	        function concatenateArrayBuffers(first, second, returnUInt8Array) {
	            var result = new Uint8Array(first.byteLength + second.byteLength);

	            result.set(new Uint8Array(first));
	            result.set(new Uint8Array(second), first.byteLength);

	            return returnUInt8Array ? result : result.buffer;
	        }

	        function hexToBinaryString(hex) {
	            var bytes = [],
	                length = hex.length,
	                x;

	            for (x = 0; x < length - 1; x += 2) {
	                bytes.push(parseInt(hex.substr(x, 2), 16));
	            }

	            return String.fromCharCode.apply(String, bytes);
	        }

	        // ---------------------------------------------------

	        /**
	         * SparkMD5 OOP implementation.
	         *
	         * Use this class to perform an incremental md5, otherwise use the
	         * static methods instead.
	         */

	        function SparkMD5() {
	            // call reset to init the instance
	            this.reset();
	        }

	        /**
	         * Appends a string.
	         * A conversion will be applied if an utf8 string is detected.
	         *
	         * @param {String} str The string to be appended
	         *
	         * @return {SparkMD5} The instance itself
	         */
	        SparkMD5.prototype.append = function (str) {
	            // Converts the string to utf8 bytes if necessary
	            // Then append as binary
	            this.appendBinary(toUtf8(str));

	            return this;
	        };

	        /**
	         * Appends a binary string.
	         *
	         * @param {String} contents The binary string to be appended
	         *
	         * @return {SparkMD5} The instance itself
	         */
	        SparkMD5.prototype.appendBinary = function (contents) {
	            this._buff += contents;
	            this._length += contents.length;

	            var length = this._buff.length,
	                i;

	            for (i = 64; i <= length; i += 64) {
	                md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
	            }

	            this._buff = this._buff.substring(i - 64);

	            return this;
	        };

	        /**
	         * Finishes the incremental computation, reseting the internal state and
	         * returning the result.
	         *
	         * @param {Boolean} raw True to get the raw string, false to get the hex string
	         *
	         * @return {String} The result
	         */
	        SparkMD5.prototype.end = function (raw) {
	            var buff = this._buff,
	                length = buff.length,
	                i,
	                tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	                ret;

	            for (i = 0; i < length; i += 1) {
	                tail[i >> 2] |= buff.charCodeAt(i) << (i % 4 << 3);
	            }

	            this._finish(tail, length);
	            ret = hex(this._hash);

	            if (raw) {
	                ret = hexToBinaryString(ret);
	            }

	            this.reset();

	            return ret;
	        };

	        /**
	         * Resets the internal state of the computation.
	         *
	         * @return {SparkMD5} The instance itself
	         */
	        SparkMD5.prototype.reset = function () {
	            this._buff = '';
	            this._length = 0;
	            this._hash = [1732584193, -271733879, -1732584194, 271733878];

	            return this;
	        };

	        /**
	         * Gets the internal state of the computation.
	         *
	         * @return {Object} The state
	         */
	        SparkMD5.prototype.getState = function () {
	            return {
	                buff: this._buff,
	                length: this._length,
	                hash: this._hash
	            };
	        };

	        /**
	         * Gets the internal state of the computation.
	         *
	         * @param {Object} state The state
	         *
	         * @return {SparkMD5} The instance itself
	         */
	        SparkMD5.prototype.setState = function (state) {
	            this._buff = state.buff;
	            this._length = state.length;
	            this._hash = state.hash;

	            return this;
	        };

	        /**
	         * Releases memory used by the incremental buffer and other additional
	         * resources. If you plan to use the instance again, use reset instead.
	         */
	        SparkMD5.prototype.destroy = function () {
	            delete this._hash;
	            delete this._buff;
	            delete this._length;
	        };

	        /**
	         * Finish the final calculation based on the tail.
	         *
	         * @param {Array}  tail   The tail (will be modified)
	         * @param {Number} length The length of the remaining buffer
	         */
	        SparkMD5.prototype._finish = function (tail, length) {
	            var i = length,
	                tmp,
	                lo,
	                hi;

	            tail[i >> 2] |= 0x80 << (i % 4 << 3);
	            if (i > 55) {
	                md5cycle(this._hash, tail);
	                for (i = 0; i < 16; i += 1) {
	                    tail[i] = 0;
	                }
	            }

	            // Do the final computation based on the tail and length
	            // Beware that the final length may not fit in 32 bits so we take care of that
	            tmp = this._length * 8;
	            tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	            lo = parseInt(tmp[2], 16);
	            hi = parseInt(tmp[1], 16) || 0;

	            tail[14] = lo;
	            tail[15] = hi;
	            md5cycle(this._hash, tail);
	        };

	        /**
	         * Performs the md5 hash on a string.
	         * A conversion will be applied if utf8 string is detected.
	         *
	         * @param {String}  str The string
	         * @param {Boolean} raw True to get the raw string, false to get the hex string
	         *
	         * @return {String} The result
	         */
	        SparkMD5.hash = function (str, raw) {
	            // Converts the string to utf8 bytes if necessary
	            // Then compute it using the binary function
	            return SparkMD5.hashBinary(toUtf8(str), raw);
	        };

	        /**
	         * Performs the md5 hash on a binary string.
	         *
	         * @param {String}  content The binary string
	         * @param {Boolean} raw     True to get the raw string, false to get the hex string
	         *
	         * @return {String} The result
	         */
	        SparkMD5.hashBinary = function (content, raw) {
	            var hash = md51(content),
	                ret = hex(hash);

	            return raw ? hexToBinaryString(ret) : ret;
	        };

	        // ---------------------------------------------------

	        /**
	         * SparkMD5 OOP implementation for array buffers.
	         *
	         * Use this class to perform an incremental md5 ONLY for array buffers.
	         */
	        SparkMD5.ArrayBuffer = function () {
	            // call reset to init the instance
	            this.reset();
	        };

	        /**
	         * Appends an array buffer.
	         *
	         * @param {ArrayBuffer} arr The array to be appended
	         *
	         * @return {SparkMD5.ArrayBuffer} The instance itself
	         */
	        SparkMD5.ArrayBuffer.prototype.append = function (arr) {
	            var buff = concatenateArrayBuffers(this._buff.buffer, arr, true),
	                length = buff.length,
	                i;

	            this._length += arr.byteLength;

	            for (i = 64; i <= length; i += 64) {
	                md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
	            }

	            this._buff = i - 64 < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);

	            return this;
	        };

	        /**
	         * Finishes the incremental computation, reseting the internal state and
	         * returning the result.
	         *
	         * @param {Boolean} raw True to get the raw string, false to get the hex string
	         *
	         * @return {String} The result
	         */
	        SparkMD5.ArrayBuffer.prototype.end = function (raw) {
	            var buff = this._buff,
	                length = buff.length,
	                tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	                i,
	                ret;

	            for (i = 0; i < length; i += 1) {
	                tail[i >> 2] |= buff[i] << (i % 4 << 3);
	            }

	            this._finish(tail, length);
	            ret = hex(this._hash);

	            if (raw) {
	                ret = hexToBinaryString(ret);
	            }

	            this.reset();

	            return ret;
	        };

	        /**
	         * Resets the internal state of the computation.
	         *
	         * @return {SparkMD5.ArrayBuffer} The instance itself
	         */
	        SparkMD5.ArrayBuffer.prototype.reset = function () {
	            this._buff = new Uint8Array(0);
	            this._length = 0;
	            this._hash = [1732584193, -271733879, -1732584194, 271733878];

	            return this;
	        };

	        /**
	         * Gets the internal state of the computation.
	         *
	         * @return {Object} The state
	         */
	        SparkMD5.ArrayBuffer.prototype.getState = function () {
	            var state = SparkMD5.prototype.getState.call(this);

	            // Convert buffer to a string
	            state.buff = arrayBuffer2Utf8Str(state.buff);

	            return state;
	        };

	        /**
	         * Gets the internal state of the computation.
	         *
	         * @param {Object} state The state
	         *
	         * @return {SparkMD5.ArrayBuffer} The instance itself
	         */
	        SparkMD5.ArrayBuffer.prototype.setState = function (state) {
	            // Convert string to buffer
	            state.buff = utf8Str2ArrayBuffer(state.buff, true);

	            return SparkMD5.prototype.setState.call(this, state);
	        };

	        SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;

	        SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;

	        /**
	         * Performs the md5 hash on an array buffer.
	         *
	         * @param {ArrayBuffer} arr The array buffer
	         * @param {Boolean}     raw True to get the raw string, false to get the hex one
	         *
	         * @return {String} The result
	         */
	        SparkMD5.ArrayBuffer.hash = function (arr, raw) {
	            var hash = md51_array(new Uint8Array(arr)),
	                ret = hex(hash);

	            return raw ? hexToBinaryString(ret) : ret;
	        };

	        return SparkMD5;
	    });
	});

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

	var fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;

	var FileChecksum = function () {
	  createClass(FileChecksum, null, [{
	    key: "create",
	    value: function create(file, callback) {
	      var instance = new FileChecksum(file);
	      instance.create(callback);
	    }
	  }]);

	  function FileChecksum(file) {
	    classCallCheck(this, FileChecksum);

	    this.file = file;
	    this.chunkSize = 2097152; // 2MB
	    this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
	    this.chunkIndex = 0;
	  }

	  createClass(FileChecksum, [{
	    key: "create",
	    value: function create(callback) {
	      var _this = this;

	      this.callback = callback;
	      this.md5Buffer = new sparkMd5.ArrayBuffer();
	      this.fileReader = new FileReader();
	      this.fileReader.addEventListener("load", function (event) {
	        return _this.fileReaderDidLoad(event);
	      });
	      this.fileReader.addEventListener("error", function (event) {
	        return _this.fileReaderDidError(event);
	      });
	      this.readNextChunk();
	    }
	  }, {
	    key: "fileReaderDidLoad",
	    value: function fileReaderDidLoad(event) {
	      this.md5Buffer.append(event.target.result);

	      if (!this.readNextChunk()) {
	        var binaryDigest = this.md5Buffer.end(true);
	        var base64digest = btoa(binaryDigest);
	        this.callback(null, base64digest);
	      }
	    }
	  }, {
	    key: "fileReaderDidError",
	    value: function fileReaderDidError(event) {
	      this.callback("Error reading " + this.file.name);
	    }
	  }, {
	    key: "readNextChunk",
	    value: function readNextChunk() {
	      if (this.chunkIndex < this.chunkCount || this.chunkIndex == 0 && this.chunkCount == 0) {
	        var start = this.chunkIndex * this.chunkSize;
	        var end = Math.min(start + this.chunkSize, this.file.size);
	        var bytes = fileSlice.call(this.file, start, end);
	        this.fileReader.readAsArrayBuffer(bytes);
	        this.chunkIndex++;
	        return true;
	      } else {
	        return false;
	      }
	    }
	  }]);
	  return FileChecksum;
	}();

	function getMetaValue(name) {
	  var element = findElement(document.head, "meta[name=\"" + name + "\"]");
	  if (element) {
	    return element.getAttribute("content");
	  }
	}

	function findElements(root, selector) {
	  if (typeof root == "string") {
	    selector = root;
	    root = document;
	  }
	  var elements = root.querySelectorAll(selector);
	  return toArray$1(elements);
	}

	function findElement(root, selector) {
	  if (typeof root == "string") {
	    selector = root;
	    root = document;
	  }
	  return root.querySelector(selector);
	}

	function dispatchEvent(element, type) {
	  var eventInit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	  var disabled = element.disabled;
	  var bubbles = eventInit.bubbles,
	      cancelable = eventInit.cancelable,
	      detail = eventInit.detail;

	  var event = document.createEvent("Event");

	  event.initEvent(type, bubbles || true, cancelable || true);
	  event.detail = detail || {};

	  try {
	    element.disabled = false;
	    element.dispatchEvent(event);
	  } finally {
	    element.disabled = disabled;
	  }

	  return event;
	}

	function toArray$1(value) {
	  if (Array.isArray(value)) {
	    return value;
	  } else if (Array.from) {
	    return Array.from(value);
	  } else {
	    return [].slice.call(value);
	  }
	}

	var BlobRecord = function () {
	  function BlobRecord(file, checksum, url) {
	    var _this = this;

	    classCallCheck(this, BlobRecord);

	    this.file = file;

	    this.attributes = {
	      filename: file.name,
	      content_type: file.type,
	      byte_size: file.size,
	      checksum: checksum
	    };

	    this.xhr = new XMLHttpRequest();
	    this.xhr.open("POST", url, true);
	    this.xhr.responseType = "json";
	    this.xhr.setRequestHeader("Content-Type", "application/json");
	    this.xhr.setRequestHeader("Accept", "application/json");
	    this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	    this.xhr.setRequestHeader("X-CSRF-Token", getMetaValue("csrf-token"));
	    this.xhr.addEventListener("load", function (event) {
	      return _this.requestDidLoad(event);
	    });
	    this.xhr.addEventListener("error", function (event) {
	      return _this.requestDidError(event);
	    });
	  }

	  createClass(BlobRecord, [{
	    key: "create",
	    value: function create(callback) {
	      this.callback = callback;
	      this.xhr.send(JSON.stringify({ blob: this.attributes }));
	    }
	  }, {
	    key: "requestDidLoad",
	    value: function requestDidLoad(event) {
	      if (this.status >= 200 && this.status < 300) {
	        var response = this.response;
	        var direct_upload = response.direct_upload;

	        delete response.direct_upload;
	        this.attributes = response;
	        this.directUploadData = direct_upload;
	        this.callback(null, this.toJSON());
	      } else {
	        this.requestDidError(event);
	      }
	    }
	  }, {
	    key: "requestDidError",
	    value: function requestDidError(event) {
	      this.callback("Error creating Blob for \"" + this.file.name + "\". Status: " + this.status);
	    }
	  }, {
	    key: "toJSON",
	    value: function toJSON() {
	      var result = {};
	      for (var key in this.attributes) {
	        result[key] = this.attributes[key];
	      }
	      return result;
	    }
	  }, {
	    key: "status",
	    get: function get$$1() {
	      return this.xhr.status;
	    }
	  }, {
	    key: "response",
	    get: function get$$1() {
	      var _xhr = this.xhr,
	          responseType = _xhr.responseType,
	          response = _xhr.response;

	      if (responseType == "json") {
	        return response;
	      } else {
	        // Shim for IE 11: https://connect.microsoft.com/IE/feedback/details/794808
	        return JSON.parse(response);
	      }
	    }
	  }]);
	  return BlobRecord;
	}();

	var BlobUpload = function () {
	  function BlobUpload(blob) {
	    var _this = this;

	    classCallCheck(this, BlobUpload);

	    this.blob = blob;
	    this.file = blob.file;

	    var _blob$directUploadDat = blob.directUploadData,
	        url = _blob$directUploadDat.url,
	        headers = _blob$directUploadDat.headers;


	    this.xhr = new XMLHttpRequest();
	    this.xhr.open("PUT", url, true);
	    this.xhr.responseType = "text";
	    for (var key in headers) {
	      this.xhr.setRequestHeader(key, headers[key]);
	    }
	    this.xhr.addEventListener("load", function (event) {
	      return _this.requestDidLoad(event);
	    });
	    this.xhr.addEventListener("error", function (event) {
	      return _this.requestDidError(event);
	    });
	  }

	  createClass(BlobUpload, [{
	    key: "create",
	    value: function create(callback) {
	      this.callback = callback;
	      this.xhr.send(this.file.slice());
	    }
	  }, {
	    key: "requestDidLoad",
	    value: function requestDidLoad(event) {
	      var _xhr = this.xhr,
	          status = _xhr.status,
	          response = _xhr.response;

	      if (status >= 200 && status < 300) {
	        this.callback(null, response);
	      } else {
	        this.requestDidError(event);
	      }
	    }
	  }, {
	    key: "requestDidError",
	    value: function requestDidError(event) {
	      this.callback("Error storing \"" + this.file.name + "\". Status: " + this.xhr.status);
	    }
	  }]);
	  return BlobUpload;
	}();

	var id = 0;

	var DirectUpload = function () {
	  function DirectUpload(file, url, delegate) {
	    classCallCheck(this, DirectUpload);

	    this.id = ++id;
	    this.file = file;
	    this.url = url;
	    this.delegate = delegate;
	  }

	  createClass(DirectUpload, [{
	    key: "create",
	    value: function create(callback) {
	      var _this = this;

	      FileChecksum.create(this.file, function (error, checksum) {
	        if (error) {
	          callback(error);
	          return;
	        }

	        var blob = new BlobRecord(_this.file, checksum, _this.url);
	        notify(_this.delegate, "directUploadWillCreateBlobWithXHR", blob.xhr);

	        blob.create(function (error) {
	          if (error) {
	            callback(error);
	          } else {
	            var upload = new BlobUpload(blob);
	            notify(_this.delegate, "directUploadWillStoreFileWithXHR", upload.xhr);
	            upload.create(function (error) {
	              if (error) {
	                callback(error);
	              } else {
	                callback(null, blob.toJSON());
	              }
	            });
	          }
	        });
	      });
	    }
	  }]);
	  return DirectUpload;
	}();

	function notify(object, methodName) {
	  if (object && typeof object[methodName] == "function") {
	    for (var _len = arguments.length, messages = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	      messages[_key - 2] = arguments[_key];
	    }

	    return object[methodName].apply(object, messages);
	  }
	}

	var DirectUploadController = function () {
	  function DirectUploadController(input, file) {
	    classCallCheck(this, DirectUploadController);

	    this.input = input;
	    this.file = file;
	    this.directUpload = new DirectUpload(this.file, this.url, this);
	    this.dispatch("initialize");
	  }

	  createClass(DirectUploadController, [{
	    key: "start",
	    value: function start(callback) {
	      var _this = this;

	      var hiddenInput = document.createElement("input");
	      hiddenInput.type = "hidden";
	      hiddenInput.name = this.input.name;
	      this.input.insertAdjacentElement("beforebegin", hiddenInput);

	      this.dispatch("start");

	      this.directUpload.create(function (error, attributes) {
	        if (error) {
	          hiddenInput.parentNode.removeChild(hiddenInput);
	          _this.dispatchError(error);
	        } else {
	          hiddenInput.value = attributes.signed_id;
	        }

	        _this.dispatch("end");
	        callback(error);
	      });
	    }
	  }, {
	    key: "uploadRequestDidProgress",
	    value: function uploadRequestDidProgress(event) {
	      var progress = event.loaded / event.total * 100;
	      if (progress) {
	        this.dispatch("progress", { progress: progress });
	      }
	    }
	  }, {
	    key: "dispatch",
	    value: function dispatch(name) {
	      var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	      detail.file = this.file;
	      detail.id = this.directUpload.id;
	      return dispatchEvent(this.input, "direct-upload:" + name, { detail: detail });
	    }
	  }, {
	    key: "dispatchError",
	    value: function dispatchError(error) {
	      var event = this.dispatch("error", { error: error });
	      if (!event.defaultPrevented) {
	        alert(error);
	      }
	    }

	    // DirectUpload delegate

	  }, {
	    key: "directUploadWillCreateBlobWithXHR",
	    value: function directUploadWillCreateBlobWithXHR(xhr) {
	      this.dispatch("before-blob-request", { xhr: xhr });
	    }
	  }, {
	    key: "directUploadWillStoreFileWithXHR",
	    value: function directUploadWillStoreFileWithXHR(xhr) {
	      var _this2 = this;

	      this.dispatch("before-storage-request", { xhr: xhr });
	      xhr.upload.addEventListener("progress", function (event) {
	        return _this2.uploadRequestDidProgress(event);
	      });
	    }
	  }, {
	    key: "url",
	    get: function get$$1() {
	      return this.input.getAttribute("data-direct-upload-url");
	    }
	  }]);
	  return DirectUploadController;
	}();

	var inputSelector = "input[type=file][data-direct-upload-url]:not([disabled])";

	var DirectUploadsController = function () {
	  function DirectUploadsController(form) {
	    classCallCheck(this, DirectUploadsController);

	    this.form = form;
	    this.inputs = findElements(form, inputSelector).filter(function (input) {
	      return input.files.length;
	    });
	  }

	  createClass(DirectUploadsController, [{
	    key: "start",
	    value: function start(callback) {
	      var _this = this;

	      var controllers = this.createDirectUploadControllers();

	      var startNextController = function startNextController() {
	        var controller = controllers.shift();
	        if (controller) {
	          controller.start(function (error) {
	            if (error) {
	              callback(error);
	              _this.dispatch("end");
	            } else {
	              startNextController();
	            }
	          });
	        } else {
	          callback();
	          _this.dispatch("end");
	        }
	      };

	      this.dispatch("start");
	      startNextController();
	    }
	  }, {
	    key: "createDirectUploadControllers",
	    value: function createDirectUploadControllers() {
	      var controllers = [];
	      this.inputs.forEach(function (input) {
	        toArray$1(input.files).forEach(function (file) {
	          var controller = new DirectUploadController(input, file);
	          controllers.push(controller);
	        });
	      });
	      return controllers;
	    }
	  }, {
	    key: "dispatch",
	    value: function dispatch(name) {
	      var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	      return dispatchEvent(this.form, "direct-uploads:" + name, { detail: detail });
	    }
	  }]);
	  return DirectUploadsController;
	}();

	var processingAttribute = "data-direct-uploads-processing";
	var submitButtonsByForm = new WeakMap();
	var started = false;

	function start() {
	  if (!started) {
	    started = true;
	    document.addEventListener("click", didClick, true);
	    document.addEventListener("submit", didSubmitForm);
	    document.addEventListener("ajax:before", didSubmitRemoteElement);
	  }
	}

	function didClick(event) {
	  var target = event.target;

	  if ((target.tagName == "INPUT" || target.tagName == "BUTTON") && target.type == "submit" && target.form) {
	    submitButtonsByForm.set(target.form, target);
	  }
	}

	function didSubmitForm(event) {
	  handleFormSubmissionEvent(event);
	}

	function didSubmitRemoteElement(event) {
	  if (event.target.tagName == "FORM") {
	    handleFormSubmissionEvent(event);
	  }
	}

	function handleFormSubmissionEvent(event) {
	  var form = event.target;

	  if (form.hasAttribute(processingAttribute)) {
	    event.preventDefault();
	    return;
	  }

	  var controller = new DirectUploadsController(form);
	  var inputs = controller.inputs;


	  if (inputs.length) {
	    event.preventDefault();
	    form.setAttribute(processingAttribute, "");
	    inputs.forEach(disable);
	    controller.start(function (error) {
	      form.removeAttribute(processingAttribute);
	      if (error) {
	        inputs.forEach(enable);
	      } else {
	        submitForm(form);
	      }
	    });
	  }
	}

	function submitForm(form) {
	  var button = submitButtonsByForm.get(form) || findElement(form, "input[type=submit], button[type=submit]");

	  if (button) {
	    var _button = button,
	        disabled = _button.disabled;

	    button.disabled = false;
	    button.focus();
	    button.click();
	    button.disabled = disabled;
	  } else {
	    button = document.createElement("input");
	    button.type = "submit";
	    button.style.display = "none";
	    form.appendChild(button);
	    button.click();
	    form.removeChild(button);
	  }
	  submitButtonsByForm.delete(form);
	}

	function disable(input) {
	  input.disabled = true;
	}

	function enable(input) {
	  input.disabled = false;
	}

	function autostart() {
	  if (window.ActiveStorage) {
	    start();
	  }
	}

	setTimeout(autostart, 1);

	exports.start = start;
	exports.DirectUpload = DirectUpload;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
var Turbolinks=function(modules){var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId]){return installedModules[moduleId].exports}var module=installedModules[moduleId]={i:moduleId,l:false,exports:{}};modules[moduleId].call(module.exports,module,module.exports,__webpack_require__);module.l=true;return module.exports}__webpack_require__.m=modules;__webpack_require__.c=installedModules;__webpack_require__.d=function(exports,name,getter){if(!__webpack_require__.o(exports,name)){Object.defineProperty(exports,name,{configurable:false,enumerable:true,get:getter})}};__webpack_require__.r=function(exports){Object.defineProperty(exports,"__esModule",{value:true})};__webpack_require__.n=function(module){var getter=module&&module.__esModule?function getDefault(){return module["default"]}:function getModuleExports(){return module};__webpack_require__.d(getter,"a",getter);return getter};__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)};__webpack_require__.p="";return __webpack_require__(__webpack_require__.s="./src/turbolinks/index.js")}({"./src/turbolinks/browser_adapter.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };\n\n  __webpack_require__(/*! ./http_request */ "./src/turbolinks/http_request.js");\n\n  __webpack_require__(/*! ./progress_bar */ "./src/turbolinks/progress_bar.js");\n\n  Turbolinks.BrowserAdapter = (function() {\n    var NETWORK_FAILURE, TIMEOUT_FAILURE, ref;\n\n    ref = Turbolinks.HttpRequest, NETWORK_FAILURE = ref.NETWORK_FAILURE, TIMEOUT_FAILURE = ref.TIMEOUT_FAILURE;\n\n    function BrowserAdapter(controller) {\n      this.controller = controller;\n      this.showProgressBar = bind(this.showProgressBar, this);\n      this.progressBar = new Turbolinks.ProgressBar;\n    }\n\n    BrowserAdapter.prototype.visitProposedToLocationWithAction = function(location, action) {\n      return this.controller.startVisitToLocationWithAction(location, action);\n    };\n\n    BrowserAdapter.prototype.visitStarted = function(visit) {\n      visit.issueRequest();\n      visit.changeHistory();\n      return visit.loadCachedSnapshot();\n    };\n\n    BrowserAdapter.prototype.visitRequestStarted = function(visit) {\n      this.progressBar.setValue(0);\n      if (visit.hasCachedSnapshot() || visit.action !== "restore") {\n        return this.showProgressBarAfterDelay();\n      } else {\n        return this.showProgressBar();\n      }\n    };\n\n    BrowserAdapter.prototype.visitRequestProgressed = function(visit) {\n      return this.progressBar.setValue(visit.progress);\n    };\n\n    BrowserAdapter.prototype.visitRequestCompleted = function(visit) {\n      return visit.loadResponse();\n    };\n\n    BrowserAdapter.prototype.visitRequestFailedWithStatusCode = function(visit, statusCode) {\n      switch (statusCode) {\n        case NETWORK_FAILURE:\n        case TIMEOUT_FAILURE:\n          return this.reload();\n        default:\n          return visit.loadResponse();\n      }\n    };\n\n    BrowserAdapter.prototype.visitRequestFinished = function(visit) {\n      return this.hideProgressBar();\n    };\n\n    BrowserAdapter.prototype.visitCompleted = function(visit) {\n      return visit.followRedirect();\n    };\n\n    BrowserAdapter.prototype.pageInvalidated = function() {\n      return this.reload();\n    };\n\n    BrowserAdapter.prototype.showProgressBarAfterDelay = function() {\n      return this.progressBarTimeout = setTimeout(this.showProgressBar, this.controller.progressBarDelay);\n    };\n\n    BrowserAdapter.prototype.showProgressBar = function() {\n      return this.progressBar.show();\n    };\n\n    BrowserAdapter.prototype.hideProgressBar = function() {\n      this.progressBar.hide();\n      return clearTimeout(this.progressBarTimeout);\n    };\n\n    BrowserAdapter.prototype.reload = function() {\n      return window.location.reload();\n    };\n\n    return BrowserAdapter;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/browser_adapter.js?')},"./src/turbolinks/controller.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };\n\n  __webpack_require__(/*! ./location */ "./src/turbolinks/location.js");\n\n  __webpack_require__(/*! ./browser_adapter */ "./src/turbolinks/browser_adapter.js");\n\n  __webpack_require__(/*! ./history */ "./src/turbolinks/history.js");\n\n  __webpack_require__(/*! ./view */ "./src/turbolinks/view.js");\n\n  __webpack_require__(/*! ./scroll_manager */ "./src/turbolinks/scroll_manager.js");\n\n  __webpack_require__(/*! ./snapshot_cache */ "./src/turbolinks/snapshot_cache.js");\n\n  __webpack_require__(/*! ./visit */ "./src/turbolinks/visit.js");\n\n  Turbolinks.Controller = (function() {\n    function Controller() {\n      this.clickBubbled = bind(this.clickBubbled, this);\n      this.clickCaptured = bind(this.clickCaptured, this);\n      this.pageLoaded = bind(this.pageLoaded, this);\n      this.history = new Turbolinks.History(this);\n      this.view = new Turbolinks.View(this);\n      this.scrollManager = new Turbolinks.ScrollManager(this);\n      this.restorationData = {};\n      this.clearCache();\n      this.setProgressBarDelay(500);\n    }\n\n    Controller.prototype.start = function() {\n      if (Turbolinks.supported && !this.started) {\n        addEventListener("click", this.clickCaptured, true);\n        addEventListener("DOMContentLoaded", this.pageLoaded, false);\n        this.scrollManager.start();\n        this.startHistory();\n        this.started = true;\n        return this.enabled = true;\n      }\n    };\n\n    Controller.prototype.disable = function() {\n      return this.enabled = false;\n    };\n\n    Controller.prototype.stop = function() {\n      if (this.started) {\n        removeEventListener("click", this.clickCaptured, true);\n        removeEventListener("DOMContentLoaded", this.pageLoaded, false);\n        this.scrollManager.stop();\n        this.stopHistory();\n        return this.started = false;\n      }\n    };\n\n    Controller.prototype.clearCache = function() {\n      return this.cache = new Turbolinks.SnapshotCache(10);\n    };\n\n    Controller.prototype.visit = function(location, options) {\n      var action, ref;\n      if (options == null) {\n        options = {};\n      }\n      location = Turbolinks.Location.wrap(location);\n      if (this.applicationAllowsVisitingLocation(location)) {\n        if (this.locationIsVisitable(location)) {\n          action = (ref = options.action) != null ? ref : "advance";\n          return this.adapter.visitProposedToLocationWithAction(location, action);\n        } else {\n          return window.location = location;\n        }\n      }\n    };\n\n    Controller.prototype.startVisitToLocationWithAction = function(location, action, restorationIdentifier) {\n      var restorationData;\n      if (Turbolinks.supported) {\n        restorationData = this.getRestorationDataForIdentifier(restorationIdentifier);\n        return this.startVisit(location, action, {\n          restorationData: restorationData\n        });\n      } else {\n        return window.location = location;\n      }\n    };\n\n    Controller.prototype.setProgressBarDelay = function(delay) {\n      return this.progressBarDelay = delay;\n    };\n\n    Controller.prototype.startHistory = function() {\n      this.location = Turbolinks.Location.wrap(window.location);\n      this.restorationIdentifier = Turbolinks.uuid();\n      this.history.start();\n      return this.history.replace(this.location, this.restorationIdentifier);\n    };\n\n    Controller.prototype.stopHistory = function() {\n      return this.history.stop();\n    };\n\n    Controller.prototype.pushHistoryWithLocationAndRestorationIdentifier = function(location, restorationIdentifier1) {\n      this.restorationIdentifier = restorationIdentifier1;\n      this.location = Turbolinks.Location.wrap(location);\n      return this.history.push(this.location, this.restorationIdentifier);\n    };\n\n    Controller.prototype.replaceHistoryWithLocationAndRestorationIdentifier = function(location, restorationIdentifier1) {\n      this.restorationIdentifier = restorationIdentifier1;\n      this.location = Turbolinks.Location.wrap(location);\n      return this.history.replace(this.location, this.restorationIdentifier);\n    };\n\n    Controller.prototype.historyPoppedToLocationWithRestorationIdentifier = function(location, restorationIdentifier1) {\n      var restorationData;\n      this.restorationIdentifier = restorationIdentifier1;\n      if (this.enabled) {\n        restorationData = this.getRestorationDataForIdentifier(this.restorationIdentifier);\n        this.startVisit(location, "restore", {\n          restorationIdentifier: this.restorationIdentifier,\n          restorationData: restorationData,\n          historyChanged: true\n        });\n        return this.location = Turbolinks.Location.wrap(location);\n      } else {\n        return this.adapter.pageInvalidated();\n      }\n    };\n\n    Controller.prototype.getCachedSnapshotForLocation = function(location) {\n      var ref;\n      return (ref = this.cache.get(location)) != null ? ref.clone() : void 0;\n    };\n\n    Controller.prototype.shouldCacheSnapshot = function() {\n      return this.view.getSnapshot().isCacheable();\n    };\n\n    Controller.prototype.cacheSnapshot = function() {\n      var location, snapshot;\n      if (this.shouldCacheSnapshot()) {\n        this.notifyApplicationBeforeCachingSnapshot();\n        snapshot = this.view.getSnapshot();\n        location = this.lastRenderedLocation;\n        return Turbolinks.defer((function(_this) {\n          return function() {\n            return _this.cache.put(location, snapshot.clone());\n          };\n        })(this));\n      }\n    };\n\n    Controller.prototype.scrollToAnchor = function(anchor) {\n      var element;\n      if (element = this.view.getElementForAnchor(anchor)) {\n        return this.scrollToElement(element);\n      } else {\n        return this.scrollToPosition({\n          x: 0,\n          y: 0\n        });\n      }\n    };\n\n    Controller.prototype.scrollToElement = function(element) {\n      return this.scrollManager.scrollToElement(element);\n    };\n\n    Controller.prototype.scrollToPosition = function(position) {\n      return this.scrollManager.scrollToPosition(position);\n    };\n\n    Controller.prototype.scrollPositionChanged = function(scrollPosition) {\n      var restorationData;\n      restorationData = this.getCurrentRestorationData();\n      return restorationData.scrollPosition = scrollPosition;\n    };\n\n    Controller.prototype.render = function(options, callback) {\n      return this.view.render(options, callback);\n    };\n\n    Controller.prototype.viewInvalidated = function() {\n      return this.adapter.pageInvalidated();\n    };\n\n    Controller.prototype.viewWillRender = function(newBody) {\n      return this.notifyApplicationBeforeRender(newBody);\n    };\n\n    Controller.prototype.viewRendered = function() {\n      this.lastRenderedLocation = this.currentVisit.location;\n      return this.notifyApplicationAfterRender();\n    };\n\n    Controller.prototype.pageLoaded = function() {\n      this.lastRenderedLocation = this.location;\n      return this.notifyApplicationAfterPageLoad();\n    };\n\n    Controller.prototype.clickCaptured = function() {\n      removeEventListener("click", this.clickBubbled, false);\n      return addEventListener("click", this.clickBubbled, false);\n    };\n\n    Controller.prototype.clickBubbled = function(event) {\n      var action, link, location;\n      if (this.enabled && this.clickEventIsSignificant(event)) {\n        if (link = this.getVisitableLinkForNode(event.target)) {\n          if (location = this.getVisitableLocationForLink(link)) {\n            if (this.applicationAllowsFollowingLinkToLocation(link, location)) {\n              event.preventDefault();\n              action = this.getActionForLink(link);\n              return this.visit(location, {\n                action: action\n              });\n            }\n          }\n        }\n      }\n    };\n\n    Controller.prototype.applicationAllowsFollowingLinkToLocation = function(link, location) {\n      var event;\n      event = this.notifyApplicationAfterClickingLinkToLocation(link, location);\n      return !event.defaultPrevented;\n    };\n\n    Controller.prototype.applicationAllowsVisitingLocation = function(location) {\n      var event;\n      event = this.notifyApplicationBeforeVisitingLocation(location);\n      return !event.defaultPrevented;\n    };\n\n    Controller.prototype.notifyApplicationAfterClickingLinkToLocation = function(link, location) {\n      return Turbolinks.dispatch("turbolinks:click", {\n        target: link,\n        data: {\n          url: location.absoluteURL\n        },\n        cancelable: true\n      });\n    };\n\n    Controller.prototype.notifyApplicationBeforeVisitingLocation = function(location) {\n      return Turbolinks.dispatch("turbolinks:before-visit", {\n        data: {\n          url: location.absoluteURL\n        },\n        cancelable: true\n      });\n    };\n\n    Controller.prototype.notifyApplicationAfterVisitingLocation = function(location) {\n      return Turbolinks.dispatch("turbolinks:visit", {\n        data: {\n          url: location.absoluteURL\n        }\n      });\n    };\n\n    Controller.prototype.notifyApplicationBeforeCachingSnapshot = function() {\n      return Turbolinks.dispatch("turbolinks:before-cache");\n    };\n\n    Controller.prototype.notifyApplicationBeforeRender = function(newBody) {\n      return Turbolinks.dispatch("turbolinks:before-render", {\n        data: {\n          newBody: newBody\n        }\n      });\n    };\n\n    Controller.prototype.notifyApplicationAfterRender = function() {\n      return Turbolinks.dispatch("turbolinks:render");\n    };\n\n    Controller.prototype.notifyApplicationAfterPageLoad = function(timing) {\n      if (timing == null) {\n        timing = {};\n      }\n      return Turbolinks.dispatch("turbolinks:load", {\n        data: {\n          url: this.location.absoluteURL,\n          timing: timing\n        }\n      });\n    };\n\n    Controller.prototype.startVisit = function(location, action, properties) {\n      var ref;\n      if ((ref = this.currentVisit) != null) {\n        ref.cancel();\n      }\n      this.currentVisit = this.createVisit(location, action, properties);\n      this.currentVisit.start();\n      return this.notifyApplicationAfterVisitingLocation(location);\n    };\n\n    Controller.prototype.createVisit = function(location, action, arg) {\n      var historyChanged, ref, restorationData, restorationIdentifier, visit;\n      ref = arg != null ? arg : {}, restorationIdentifier = ref.restorationIdentifier, restorationData = ref.restorationData, historyChanged = ref.historyChanged;\n      visit = new Turbolinks.Visit(this, location, action);\n      visit.restorationIdentifier = restorationIdentifier != null ? restorationIdentifier : Turbolinks.uuid();\n      visit.restorationData = Turbolinks.copyObject(restorationData);\n      visit.historyChanged = historyChanged;\n      visit.referrer = this.location;\n      return visit;\n    };\n\n    Controller.prototype.visitCompleted = function(visit) {\n      return this.notifyApplicationAfterPageLoad(visit.getTimingMetrics());\n    };\n\n    Controller.prototype.clickEventIsSignificant = function(event) {\n      return !(event.defaultPrevented || event.target.isContentEditable || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);\n    };\n\n    Controller.prototype.getVisitableLinkForNode = function(node) {\n      if (this.nodeIsVisitable(node)) {\n        return Turbolinks.closest(node, "a[href]:not([target]):not([download])");\n      }\n    };\n\n    Controller.prototype.getVisitableLocationForLink = function(link) {\n      var location;\n      location = new Turbolinks.Location(link.getAttribute("href"));\n      if (this.locationIsVisitable(location)) {\n        return location;\n      }\n    };\n\n    Controller.prototype.getActionForLink = function(link) {\n      var ref;\n      return (ref = link.getAttribute("data-turbolinks-action")) != null ? ref : "advance";\n    };\n\n    Controller.prototype.nodeIsVisitable = function(node) {\n      var container;\n      if (container = Turbolinks.closest(node, "[data-turbolinks]")) {\n        return container.getAttribute("data-turbolinks") !== "false";\n      } else {\n        return true;\n      }\n    };\n\n    Controller.prototype.locationIsVisitable = function(location) {\n      return location.isPrefixedBy(this.view.getRootLocation()) && location.isHTML();\n    };\n\n    Controller.prototype.getCurrentRestorationData = function() {\n      return this.getRestorationDataForIdentifier(this.restorationIdentifier);\n    };\n\n    Controller.prototype.getRestorationDataForIdentifier = function(identifier) {\n      var base;\n      return (base = this.restorationData)[identifier] != null ? base[identifier] : base[identifier] = {};\n    };\n\n    return Controller;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/controller.js?')},"./src/turbolinks/error_renderer.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },\n    hasProp = {}.hasOwnProperty;\n\n  __webpack_require__(/*! ./renderer */ "./src/turbolinks/renderer.js");\n\n  Turbolinks.ErrorRenderer = (function(superClass) {\n    extend(ErrorRenderer, superClass);\n\n    function ErrorRenderer(html) {\n      var htmlElement;\n      htmlElement = document.createElement("html");\n      htmlElement.innerHTML = html;\n      this.newHead = htmlElement.querySelector("head");\n      this.newBody = htmlElement.querySelector("body");\n    }\n\n    ErrorRenderer.prototype.render = function(callback) {\n      return this.renderView((function(_this) {\n        return function() {\n          _this.replaceHeadAndBody();\n          _this.activateBodyScriptElements();\n          return callback();\n        };\n      })(this));\n    };\n\n    ErrorRenderer.prototype.replaceHeadAndBody = function() {\n      var body, head;\n      head = document.head, body = document.body;\n      head.parentNode.replaceChild(this.newHead, head);\n      return body.parentNode.replaceChild(this.newBody, body);\n    };\n\n    ErrorRenderer.prototype.activateBodyScriptElements = function() {\n      var element, i, len, ref, replaceableElement, results;\n      ref = this.getScriptElements();\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        replaceableElement = ref[i];\n        element = this.createScriptElement(replaceableElement);\n        results.push(replaceableElement.parentNode.replaceChild(element, replaceableElement));\n      }\n      return results;\n    };\n\n    ErrorRenderer.prototype.getScriptElements = function() {\n      return document.documentElement.querySelectorAll("script");\n    };\n\n    return ErrorRenderer;\n\n  })(Turbolinks.Renderer);\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/error_renderer.js?')},"./src/turbolinks/helpers.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var closest, match, preventDefaultSupported,\n    slice = [].slice;\n\n  Turbolinks.copyObject = function(object) {\n    var key, result, value;\n    result = {};\n    for (key in object) {\n      value = object[key];\n      result[key] = value;\n    }\n    return result;\n  };\n\n  Turbolinks.closest = function(element, selector) {\n    return closest.call(element, selector);\n  };\n\n  closest = (function() {\n    var html, ref;\n    html = document.documentElement;\n    return (ref = html.closest) != null ? ref : function(selector) {\n      var node;\n      node = this;\n      while (node) {\n        if (node.nodeType === Node.ELEMENT_NODE && match.call(node, selector)) {\n          return node;\n        }\n        node = node.parentNode;\n      }\n    };\n  })();\n\n  Turbolinks.defer = function(callback) {\n    return setTimeout(callback, 1);\n  };\n\n  Turbolinks.throttle = function(fn) {\n    var request;\n    request = null;\n    return function() {\n      var args;\n      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];\n      return request != null ? request : request = requestAnimationFrame((function(_this) {\n        return function() {\n          request = null;\n          return fn.apply(_this, args);\n        };\n      })(this));\n    };\n  };\n\n  Turbolinks.dispatch = function(eventName, arg) {\n    var cancelable, data, event, preventDefault, ref, target;\n    ref = arg != null ? arg : {}, target = ref.target, cancelable = ref.cancelable, data = ref.data;\n    event = document.createEvent("Events");\n    event.initEvent(eventName, true, cancelable === true);\n    event.data = data != null ? data : {};\n    if (event.cancelable && !preventDefaultSupported) {\n      preventDefault = event.preventDefault;\n      event.preventDefault = function() {\n        if (!this.defaultPrevented) {\n          Object.defineProperty(this, "defaultPrevented", {\n            get: function() {\n              return true;\n            }\n          });\n        }\n        return preventDefault.call(this);\n      };\n    }\n    (target != null ? target : document).dispatchEvent(event);\n    return event;\n  };\n\n  preventDefaultSupported = (function() {\n    var event;\n    event = document.createEvent("Events");\n    event.initEvent("test", true, true);\n    event.preventDefault();\n    return event.defaultPrevented;\n  })();\n\n  Turbolinks.match = function(element, selector) {\n    return match.call(element, selector);\n  };\n\n  match = (function() {\n    var html, ref, ref1, ref2;\n    html = document.documentElement;\n    return (ref = (ref1 = (ref2 = html.matchesSelector) != null ? ref2 : html.webkitMatchesSelector) != null ? ref1 : html.msMatchesSelector) != null ? ref : html.mozMatchesSelector;\n  })();\n\n  Turbolinks.uuid = function() {\n    var i, j, result;\n    result = "";\n    for (i = j = 1; j <= 36; i = ++j) {\n      if (i === 9 || i === 14 || i === 19 || i === 24) {\n        result += "-";\n      } else if (i === 15) {\n        result += "4";\n      } else if (i === 20) {\n        result += (Math.floor(Math.random() * 4) + 8).toString(16);\n      } else {\n        result += Math.floor(Math.random() * 15).toString(16);\n      }\n    }\n    return result;\n  };\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/helpers.js?')},"./src/turbolinks/history.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };\n\n  Turbolinks.History = (function() {\n    function History(delegate) {\n      this.delegate = delegate;\n      this.onPageLoad = bind(this.onPageLoad, this);\n      this.onPopState = bind(this.onPopState, this);\n    }\n\n    History.prototype.start = function() {\n      if (!this.started) {\n        addEventListener("popstate", this.onPopState, false);\n        addEventListener("load", this.onPageLoad, false);\n        return this.started = true;\n      }\n    };\n\n    History.prototype.stop = function() {\n      if (this.started) {\n        removeEventListener("popstate", this.onPopState, false);\n        removeEventListener("load", this.onPageLoad, false);\n        return this.started = false;\n      }\n    };\n\n    History.prototype.push = function(location, restorationIdentifier) {\n      location = Turbolinks.Location.wrap(location);\n      return this.update("push", location, restorationIdentifier);\n    };\n\n    History.prototype.replace = function(location, restorationIdentifier) {\n      location = Turbolinks.Location.wrap(location);\n      return this.update("replace", location, restorationIdentifier);\n    };\n\n    History.prototype.onPopState = function(event) {\n      var location, ref, restorationIdentifier, turbolinks;\n      if (this.shouldHandlePopState()) {\n        if (turbolinks = (ref = event.state) != null ? ref.turbolinks : void 0) {\n          location = Turbolinks.Location.wrap(window.location);\n          restorationIdentifier = turbolinks.restorationIdentifier;\n          return this.delegate.historyPoppedToLocationWithRestorationIdentifier(location, restorationIdentifier);\n        }\n      }\n    };\n\n    History.prototype.onPageLoad = function(event) {\n      return Turbolinks.defer((function(_this) {\n        return function() {\n          return _this.pageLoaded = true;\n        };\n      })(this));\n    };\n\n    History.prototype.shouldHandlePopState = function() {\n      return this.pageIsLoaded();\n    };\n\n    History.prototype.pageIsLoaded = function() {\n      return this.pageLoaded || document.readyState === "complete";\n    };\n\n    History.prototype.update = function(method, location, restorationIdentifier) {\n      var state;\n      state = {\n        turbolinks: {\n          restorationIdentifier: restorationIdentifier\n        }\n      };\n      return history[method + "State"](state, null, location);\n    };\n\n    return History;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/history.js?')},"./src/turbolinks/http_request.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };\n\n  Turbolinks.HttpRequest = (function() {\n    HttpRequest.NETWORK_FAILURE = 0;\n\n    HttpRequest.TIMEOUT_FAILURE = -1;\n\n    HttpRequest.timeout = 60;\n\n    function HttpRequest(delegate, location, referrer) {\n      this.delegate = delegate;\n      this.requestCanceled = bind(this.requestCanceled, this);\n      this.requestTimedOut = bind(this.requestTimedOut, this);\n      this.requestFailed = bind(this.requestFailed, this);\n      this.requestLoaded = bind(this.requestLoaded, this);\n      this.requestProgressed = bind(this.requestProgressed, this);\n      this.url = Turbolinks.Location.wrap(location).requestURL;\n      this.referrer = Turbolinks.Location.wrap(referrer).absoluteURL;\n      this.createXHR();\n    }\n\n    HttpRequest.prototype.send = function() {\n      var base;\n      if (this.xhr && !this.sent) {\n        this.notifyApplicationBeforeRequestStart();\n        this.setProgress(0);\n        this.xhr.send();\n        this.sent = true;\n        return typeof (base = this.delegate).requestStarted === "function" ? base.requestStarted() : void 0;\n      }\n    };\n\n    HttpRequest.prototype.cancel = function() {\n      if (this.xhr && this.sent) {\n        return this.xhr.abort();\n      }\n    };\n\n    HttpRequest.prototype.requestProgressed = function(event) {\n      if (event.lengthComputable) {\n        return this.setProgress(event.loaded / event.total);\n      }\n    };\n\n    HttpRequest.prototype.requestLoaded = function() {\n      return this.endRequest((function(_this) {\n        return function() {\n          var ref;\n          if ((200 <= (ref = _this.xhr.status) && ref < 300)) {\n            return _this.delegate.requestCompletedWithResponse(_this.xhr.responseText, _this.xhr.getResponseHeader("Turbolinks-Location"));\n          } else {\n            _this.failed = true;\n            return _this.delegate.requestFailedWithStatusCode(_this.xhr.status, _this.xhr.responseText);\n          }\n        };\n      })(this));\n    };\n\n    HttpRequest.prototype.requestFailed = function() {\n      return this.endRequest((function(_this) {\n        return function() {\n          _this.failed = true;\n          return _this.delegate.requestFailedWithStatusCode(_this.constructor.NETWORK_FAILURE);\n        };\n      })(this));\n    };\n\n    HttpRequest.prototype.requestTimedOut = function() {\n      return this.endRequest((function(_this) {\n        return function() {\n          _this.failed = true;\n          return _this.delegate.requestFailedWithStatusCode(_this.constructor.TIMEOUT_FAILURE);\n        };\n      })(this));\n    };\n\n    HttpRequest.prototype.requestCanceled = function() {\n      return this.endRequest();\n    };\n\n    HttpRequest.prototype.notifyApplicationBeforeRequestStart = function() {\n      return Turbolinks.dispatch("turbolinks:request-start", {\n        data: {\n          url: this.url,\n          xhr: this.xhr\n        }\n      });\n    };\n\n    HttpRequest.prototype.notifyApplicationAfterRequestEnd = function() {\n      return Turbolinks.dispatch("turbolinks:request-end", {\n        data: {\n          url: this.url,\n          xhr: this.xhr\n        }\n      });\n    };\n\n    HttpRequest.prototype.createXHR = function() {\n      this.xhr = new XMLHttpRequest;\n      this.xhr.open("GET", this.url, true);\n      this.xhr.timeout = this.constructor.timeout * 1000;\n      this.xhr.setRequestHeader("Accept", "text/html, application/xhtml+xml");\n      this.xhr.setRequestHeader("Turbolinks-Referrer", this.referrer);\n      this.xhr.onprogress = this.requestProgressed;\n      this.xhr.onload = this.requestLoaded;\n      this.xhr.onerror = this.requestFailed;\n      this.xhr.ontimeout = this.requestTimedOut;\n      return this.xhr.onabort = this.requestCanceled;\n    };\n\n    HttpRequest.prototype.endRequest = function(callback) {\n      if (this.xhr) {\n        this.notifyApplicationAfterRequestEnd();\n        if (callback != null) {\n          callback.call(this);\n        }\n        return this.destroy();\n      }\n    };\n\n    HttpRequest.prototype.setProgress = function(progress) {\n      var base;\n      this.progress = progress;\n      return typeof (base = this.delegate).requestProgressed === "function" ? base.requestProgressed(this.progress) : void 0;\n    };\n\n    HttpRequest.prototype.destroy = function() {\n      var base;\n      this.setProgress(1);\n      if (typeof (base = this.delegate).requestFinished === "function") {\n        base.requestFinished();\n      }\n      this.delegate = null;\n      return this.xhr = null;\n    };\n\n    return HttpRequest;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/http_request.js?')},"./src/turbolinks/index.js":function(module,exports,__webpack_require__){
eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  this.Turbolinks = {\n    supported: (function() {\n      return (window.history.pushState != null) && (window.requestAnimationFrame != null) && (window.addEventListener != null);\n    })(),\n    visit: function(location, options) {\n      return Turbolinks.controller.visit(location, options);\n    },\n    clearCache: function() {\n      return Turbolinks.controller.clearCache();\n    },\n    setProgressBarDelay: function(delay) {\n      return Turbolinks.controller.setProgressBarDelay(delay);\n    }\n  };\n\n  module.exports = this.Turbolinks;\n\n  window.Turbolinks = this.Turbolinks;\n\n  __webpack_require__(/*! ./helpers */ "./src/turbolinks/helpers.js");\n\n  __webpack_require__(/*! ./controller */ "./src/turbolinks/controller.js");\n\n  __webpack_require__(/*! ./script_warning */ "./src/turbolinks/script_warning.js");\n\n  __webpack_require__(/*! ./start */ "./src/turbolinks/start.js");\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/index.js?')},"./src/turbolinks/location.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  Turbolinks.Location = (function() {\n    var addTrailingSlash, getPrefixURL, stringEndsWith, stringStartsWith;\n\n    Location.wrap = function(value) {\n      if (value instanceof this) {\n        return value;\n      } else {\n        return new this(value);\n      }\n    };\n\n    function Location(url) {\n      var anchorLength, linkWithAnchor;\n      if (url == null) {\n        url = "";\n      }\n      linkWithAnchor = document.createElement("a");\n      linkWithAnchor.href = url.toString();\n      this.absoluteURL = linkWithAnchor.href;\n      anchorLength = linkWithAnchor.hash.length;\n      if (anchorLength < 2) {\n        this.requestURL = this.absoluteURL;\n      } else {\n        this.requestURL = this.absoluteURL.slice(0, -anchorLength);\n        this.anchor = linkWithAnchor.hash.slice(1);\n      }\n    }\n\n    Location.prototype.getOrigin = function() {\n      return this.absoluteURL.split("/", 3).join("/");\n    };\n\n    Location.prototype.getPath = function() {\n      var ref, ref1;\n      return (ref = (ref1 = this.requestURL.match(/\\/\\/[^\\/]*(\\/[^?;]*)/)) != null ? ref1[1] : void 0) != null ? ref : "/";\n    };\n\n    Location.prototype.getPathComponents = function() {\n      return this.getPath().split("/").slice(1);\n    };\n\n    Location.prototype.getLastPathComponent = function() {\n      return this.getPathComponents().slice(-1)[0];\n    };\n\n    Location.prototype.getExtension = function() {\n      var ref, ref1;\n      return (ref = (ref1 = this.getLastPathComponent().match(/\\.[^.]*$/)) != null ? ref1[0] : void 0) != null ? ref : "";\n    };\n\n    Location.prototype.isHTML = function() {\n      return this.getExtension().match(/^(?:|\\.(?:htm|html|xhtml))$/);\n    };\n\n    Location.prototype.isPrefixedBy = function(location) {\n      var prefixURL;\n      prefixURL = getPrefixURL(location);\n      return this.isEqualTo(location) || stringStartsWith(this.absoluteURL, prefixURL);\n    };\n\n    Location.prototype.isEqualTo = function(location) {\n      return this.absoluteURL === (location != null ? location.absoluteURL : void 0);\n    };\n\n    Location.prototype.toCacheKey = function() {\n      return this.requestURL;\n    };\n\n    Location.prototype.toJSON = function() {\n      return this.absoluteURL;\n    };\n\n    Location.prototype.toString = function() {\n      return this.absoluteURL;\n    };\n\n    Location.prototype.valueOf = function() {\n      return this.absoluteURL;\n    };\n\n    getPrefixURL = function(location) {\n      return addTrailingSlash(location.getOrigin() + location.getPath());\n    };\n\n    addTrailingSlash = function(url) {\n      if (stringEndsWith(url, "/")) {\n        return url;\n      } else {\n        return url + "/";\n      }\n    };\n\n    stringStartsWith = function(string, prefix) {\n      return string.slice(0, prefix.length) === prefix;\n    };\n\n    stringEndsWith = function(string, suffix) {\n      return string.slice(-suffix.length) === suffix;\n    };\n\n    return Location;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/location.js?')},"./src/turbolinks/progress_bar.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };\n\n  Turbolinks.ProgressBar = (function() {\n    var ANIMATION_DURATION;\n\n    ANIMATION_DURATION = 300;\n\n    ProgressBar.defaultCSS = ".turbolinks-progress-bar {\\n  position: fixed;\\n  display: block;\\n  top: 0;\\n  left: 0;\\n  height: 3px;\\n  background: #0076ff;\\n  z-index: 9999;\\n  transition: width " + ANIMATION_DURATION + "ms ease-out, opacity " + (ANIMATION_DURATION / 2) + "ms " + (ANIMATION_DURATION / 2) + "ms ease-in;\\n  transform: translate3d(0, 0, 0);\\n}";\n\n    function ProgressBar() {\n      this.trickle = bind(this.trickle, this);\n      this.stylesheetElement = this.createStylesheetElement();\n      this.progressElement = this.createProgressElement();\n    }\n\n    ProgressBar.prototype.show = function() {\n      if (!this.visible) {\n        this.visible = true;\n        this.installStylesheetElement();\n        this.installProgressElement();\n        return this.startTrickling();\n      }\n    };\n\n    ProgressBar.prototype.hide = function() {\n      if (this.visible && !this.hiding) {\n        this.hiding = true;\n        return this.fadeProgressElement((function(_this) {\n          return function() {\n            _this.uninstallProgressElement();\n            _this.stopTrickling();\n            _this.visible = false;\n            return _this.hiding = false;\n          };\n        })(this));\n      }\n    };\n\n    ProgressBar.prototype.setValue = function(value) {\n      this.value = value;\n      return this.refresh();\n    };\n\n    ProgressBar.prototype.installStylesheetElement = function() {\n      return document.head.insertBefore(this.stylesheetElement, document.head.firstChild);\n    };\n\n    ProgressBar.prototype.installProgressElement = function() {\n      this.progressElement.style.width = 0;\n      this.progressElement.style.opacity = 1;\n      document.documentElement.insertBefore(this.progressElement, document.body);\n      return this.refresh();\n    };\n\n    ProgressBar.prototype.fadeProgressElement = function(callback) {\n      this.progressElement.style.opacity = 0;\n      return setTimeout(callback, ANIMATION_DURATION * 1.5);\n    };\n\n    ProgressBar.prototype.uninstallProgressElement = function() {\n      if (this.progressElement.parentNode) {\n        return document.documentElement.removeChild(this.progressElement);\n      }\n    };\n\n    ProgressBar.prototype.startTrickling = function() {\n      return this.trickleInterval != null ? this.trickleInterval : this.trickleInterval = setInterval(this.trickle, ANIMATION_DURATION);\n    };\n\n    ProgressBar.prototype.stopTrickling = function() {\n      clearInterval(this.trickleInterval);\n      return this.trickleInterval = null;\n    };\n\n    ProgressBar.prototype.trickle = function() {\n      return this.setValue(this.value + Math.random() / 100);\n    };\n\n    ProgressBar.prototype.refresh = function() {\n      return requestAnimationFrame((function(_this) {\n        return function() {\n          return _this.progressElement.style.width = (10 + (_this.value * 90)) + "%";\n        };\n      })(this));\n    };\n\n    ProgressBar.prototype.createStylesheetElement = function() {\n      var element;\n      element = document.createElement("style");\n      element.type = "text/css";\n      element.textContent = this.constructor.defaultCSS;\n      return element;\n    };\n\n    ProgressBar.prototype.createProgressElement = function() {\n      var element;\n      element = document.createElement("div");\n      element.className = "turbolinks-progress-bar";\n      return element;\n    };\n\n    return ProgressBar;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/progress_bar.js?')},"./src/turbolinks/renderer.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var slice = [].slice;\n\n  Turbolinks.Renderer = (function() {\n    var copyElementAttributes;\n\n    function Renderer() {}\n\n    Renderer.render = function() {\n      var args, callback, delegate, renderer;\n      delegate = arguments[0], callback = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];\n      renderer = (function(func, args, ctor) {\n        ctor.prototype = func.prototype;\n        var child = new ctor, result = func.apply(child, args);\n        return Object(result) === result ? result : child;\n      })(this, args, function(){});\n      renderer.delegate = delegate;\n      renderer.render(callback);\n      return renderer;\n    };\n\n    Renderer.prototype.renderView = function(callback) {\n      this.delegate.viewWillRender(this.newBody);\n      callback();\n      return this.delegate.viewRendered(this.newBody);\n    };\n\n    Renderer.prototype.invalidateView = function() {\n      return this.delegate.viewInvalidated();\n    };\n\n    Renderer.prototype.createScriptElement = function(element) {\n      var createdScriptElement;\n      if (element.getAttribute("data-turbolinks-eval") === "false") {\n        return element;\n      } else {\n        createdScriptElement = document.createElement("script");\n        createdScriptElement.textContent = element.textContent;\n        createdScriptElement.async = false;\n        copyElementAttributes(createdScriptElement, element);\n        return createdScriptElement;\n      }\n    };\n\n    copyElementAttributes = function(destinationElement, sourceElement) {\n      var i, len, name, ref, ref1, results, value;\n      ref = sourceElement.attributes;\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        ref1 = ref[i], name = ref1.name, value = ref1.value;\n        results.push(destinationElement.setAttribute(name, value));\n      }\n      return results;\n    };\n\n    return Renderer;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/renderer.js?')},"./src/turbolinks/script_warning.js":function(module,exports){eval('// Generated by CoffeeScript 1.12.8\n(function() {\n  (function() {\n    var element, script;\n    if (!(element = script = document.currentScript)) {\n      return;\n    }\n    if (script.hasAttribute("data-turbolinks-suppress-warning")) {\n      return;\n    }\n    while (element = element.parentNode) {\n      if (element === document.body) {\n        return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\\n\\nLoad your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\\n\\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\\n\\n——\\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s", script.outerHTML);\n      }\n    }\n  })();\n\n}).call(this);\n\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/script_warning.js?')},"./src/turbolinks/scroll_manager.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };\n\n  Turbolinks.ScrollManager = (function() {\n    function ScrollManager(delegate) {\n      this.delegate = delegate;\n      this.onScroll = bind(this.onScroll, this);\n      this.onScroll = Turbolinks.throttle(this.onScroll);\n    }\n\n    ScrollManager.prototype.start = function() {\n      if (!this.started) {\n        addEventListener("scroll", this.onScroll, false);\n        this.onScroll();\n        return this.started = true;\n      }\n    };\n\n    ScrollManager.prototype.stop = function() {\n      if (this.started) {\n        removeEventListener("scroll", this.onScroll, false);\n        return this.started = false;\n      }\n    };\n\n    ScrollManager.prototype.scrollToElement = function(element) {\n      return element.scrollIntoView();\n    };\n\n    ScrollManager.prototype.scrollToPosition = function(arg) {\n      var x, y;\n      x = arg.x, y = arg.y;\n      return window.scrollTo(x, y);\n    };\n\n    ScrollManager.prototype.onScroll = function(event) {\n      return this.updatePosition({\n        x: window.pageXOffset,\n        y: window.pageYOffset\n      });\n    };\n\n    ScrollManager.prototype.updatePosition = function(position) {\n      var ref;\n      this.position = position;\n      return (ref = this.delegate) != null ? ref.scrollPositionChanged(this.position) : void 0;\n    };\n\n    return ScrollManager;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/scroll_manager.js?')},"./src/turbolinks/snapshot.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  Turbolinks.Snapshot = (function() {\n    Snapshot.wrap = function(value) {\n      if (value instanceof this) {\n        return value;\n      } else if (typeof value === "string") {\n        return this.fromHTMLString(value);\n      } else {\n        return this.fromHTMLElement(value);\n      }\n    };\n\n    Snapshot.fromHTMLString = function(html) {\n      var htmlElement;\n      htmlElement = document.createElement("html");\n      htmlElement.innerHTML = html;\n      return this.fromHTMLElement(htmlElement);\n    };\n\n    Snapshot.fromHTMLElement = function(htmlElement) {\n      var bodyElement, headDetails, headElement, ref;\n      headElement = htmlElement.querySelector("head");\n      bodyElement = (ref = htmlElement.querySelector("body")) != null ? ref : document.createElement("body");\n      headDetails = Turbolinks.HeadDetails.fromHeadElement(headElement);\n      return new this(headDetails, bodyElement);\n    };\n\n    function Snapshot(headDetails1, bodyElement1) {\n      this.headDetails = headDetails1;\n      this.bodyElement = bodyElement1;\n    }\n\n    Snapshot.prototype.clone = function() {\n      return new this.constructor(this.headDetails, this.bodyElement.cloneNode(true));\n    };\n\n    Snapshot.prototype.getRootLocation = function() {\n      var ref, root;\n      root = (ref = this.getSetting("root")) != null ? ref : "/";\n      return new Turbolinks.Location(root);\n    };\n\n    Snapshot.prototype.getCacheControlValue = function() {\n      return this.getSetting("cache-control");\n    };\n\n    Snapshot.prototype.getElementForAnchor = function(anchor) {\n      try {\n        return this.bodyElement.querySelector("[id=\'" + anchor + "\'], a[name=\'" + anchor + "\']");\n      } catch (error) {}\n    };\n\n    Snapshot.prototype.getPermanentElements = function() {\n      return this.bodyElement.querySelectorAll("[id][data-turbolinks-permanent]");\n    };\n\n    Snapshot.prototype.getPermanentElementById = function(id) {\n      return this.bodyElement.querySelector("#" + id + "[data-turbolinks-permanent]");\n    };\n\n    Snapshot.prototype.getPermanentElementsPresentInSnapshot = function(snapshot) {\n      var element, i, len, ref, results;\n      ref = this.getPermanentElements();\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        element = ref[i];\n        if (snapshot.getPermanentElementById(element.id)) {\n          results.push(element);\n        }\n      }\n      return results;\n    };\n\n    Snapshot.prototype.findFirstAutofocusableElement = function() {\n      return this.bodyElement.querySelector("[autofocus]");\n    };\n\n    Snapshot.prototype.hasAnchor = function(anchor) {\n      return this.getElementForAnchor(anchor) != null;\n    };\n\n    Snapshot.prototype.isPreviewable = function() {\n      return this.getCacheControlValue() !== "no-preview";\n    };\n\n    Snapshot.prototype.isCacheable = function() {\n      return this.getCacheControlValue() !== "no-cache";\n    };\n\n    Snapshot.prototype.isVisitable = function() {\n      return this.getSetting("visit-control") !== "reload";\n    };\n\n    Snapshot.prototype.getSetting = function(name) {\n      return this.headDetails.getMetaValue("turbolinks-" + name);\n    };\n\n    return Snapshot;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/snapshot.js?')},"./src/turbolinks/snapshot_cache.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  Turbolinks.SnapshotCache = (function() {\n    var keyForLocation;\n\n    function SnapshotCache(size) {\n      this.size = size;\n      this.keys = [];\n      this.snapshots = {};\n    }\n\n    SnapshotCache.prototype.has = function(location) {\n      var key;\n      key = keyForLocation(location);\n      return key in this.snapshots;\n    };\n\n    SnapshotCache.prototype.get = function(location) {\n      var snapshot;\n      if (!this.has(location)) {\n        return;\n      }\n      snapshot = this.read(location);\n      this.touch(location);\n      return snapshot;\n    };\n\n    SnapshotCache.prototype.put = function(location, snapshot) {\n      this.write(location, snapshot);\n      this.touch(location);\n      return snapshot;\n    };\n\n    SnapshotCache.prototype.read = function(location) {\n      var key;\n      key = keyForLocation(location);\n      return this.snapshots[key];\n    };\n\n    SnapshotCache.prototype.write = function(location, snapshot) {\n      var key;\n      key = keyForLocation(location);\n      return this.snapshots[key] = snapshot;\n    };\n\n    SnapshotCache.prototype.touch = function(location) {\n      var index, key;\n      key = keyForLocation(location);\n      index = this.keys.indexOf(key);\n      if (index > -1) {\n        this.keys.splice(index, 1);\n      }\n      this.keys.unshift(key);\n      return this.trim();\n    };\n\n    SnapshotCache.prototype.trim = function() {\n      var i, key, len, ref, results;\n      ref = this.keys.splice(this.size);\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        key = ref[i];\n        results.push(delete this.snapshots[key]);\n      }\n      return results;\n    };\n\n    keyForLocation = function(location) {\n      return Turbolinks.Location.wrap(location).toCacheKey();\n    };\n\n    return SnapshotCache;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/snapshot_cache.js?')},"./src/turbolinks/snapshot_renderer.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var createPlaceholderForPermanentElement, replaceElementWithElement,\n    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },\n    hasProp = {}.hasOwnProperty;\n\n  __webpack_require__(/*! ./renderer */ "./src/turbolinks/renderer.js");\n\n  Turbolinks.SnapshotRenderer = (function(superClass) {\n    extend(SnapshotRenderer, superClass);\n\n    function SnapshotRenderer(currentSnapshot, newSnapshot, isPreview) {\n      this.currentSnapshot = currentSnapshot;\n      this.newSnapshot = newSnapshot;\n      this.isPreview = isPreview;\n      this.currentHeadDetails = this.currentSnapshot.headDetails;\n      this.newHeadDetails = this.newSnapshot.headDetails;\n      this.currentBody = this.currentSnapshot.bodyElement;\n      this.newBody = this.newSnapshot.bodyElement;\n    }\n\n    SnapshotRenderer.prototype.render = function(callback) {\n      if (this.shouldRender()) {\n        this.mergeHead();\n        return this.renderView((function(_this) {\n          return function() {\n            _this.replaceBody();\n            if (!_this.isPreview) {\n              _this.focusFirstAutofocusableElement();\n            }\n            return callback();\n          };\n        })(this));\n      } else {\n        return this.invalidateView();\n      }\n    };\n\n    SnapshotRenderer.prototype.mergeHead = function() {\n      this.copyNewHeadStylesheetElements();\n      this.copyNewHeadScriptElements();\n      this.removeCurrentHeadProvisionalElements();\n      return this.copyNewHeadProvisionalElements();\n    };\n\n    SnapshotRenderer.prototype.replaceBody = function() {\n      var placeholders;\n      placeholders = this.relocateCurrentBodyPermanentElements();\n      this.activateNewBodyScriptElements();\n      this.assignNewBody();\n      return this.replacePlaceholderElementsWithClonedPermanentElements(placeholders);\n    };\n\n    SnapshotRenderer.prototype.shouldRender = function() {\n      return this.newSnapshot.isVisitable() && this.trackedElementsAreIdentical();\n    };\n\n    SnapshotRenderer.prototype.trackedElementsAreIdentical = function() {\n      return this.currentHeadDetails.getTrackedElementSignature() === this.newHeadDetails.getTrackedElementSignature();\n    };\n\n    SnapshotRenderer.prototype.copyNewHeadStylesheetElements = function() {\n      var element, i, len, ref, results;\n      ref = this.getNewHeadStylesheetElements();\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        element = ref[i];\n        results.push(document.head.appendChild(element));\n      }\n      return results;\n    };\n\n    SnapshotRenderer.prototype.copyNewHeadScriptElements = function() {\n      var element, i, len, ref, results;\n      ref = this.getNewHeadScriptElements();\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        element = ref[i];\n        results.push(document.head.appendChild(this.createScriptElement(element)));\n      }\n      return results;\n    };\n\n    SnapshotRenderer.prototype.removeCurrentHeadProvisionalElements = function() {\n      var element, i, len, ref, results;\n      ref = this.getCurrentHeadProvisionalElements();\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        element = ref[i];\n        results.push(document.head.removeChild(element));\n      }\n      return results;\n    };\n\n    SnapshotRenderer.prototype.copyNewHeadProvisionalElements = function() {\n      var element, i, len, ref, results;\n      ref = this.getNewHeadProvisionalElements();\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        element = ref[i];\n        results.push(document.head.appendChild(element));\n      }\n      return results;\n    };\n\n    SnapshotRenderer.prototype.relocateCurrentBodyPermanentElements = function() {\n      var i, len, newElement, permanentElement, placeholder, ref, results;\n      ref = this.getCurrentBodyPermanentElements();\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        permanentElement = ref[i];\n        placeholder = createPlaceholderForPermanentElement(permanentElement);\n        newElement = this.newSnapshot.getPermanentElementById(permanentElement.id);\n        replaceElementWithElement(permanentElement, placeholder.element);\n        replaceElementWithElement(newElement, permanentElement);\n        results.push(placeholder);\n      }\n      return results;\n    };\n\n    SnapshotRenderer.prototype.replacePlaceholderElementsWithClonedPermanentElements = function(placeholders) {\n      var clonedElement, element, i, len, permanentElement, ref, results;\n      results = [];\n      for (i = 0, len = placeholders.length; i < len; i++) {\n        ref = placeholders[i], element = ref.element, permanentElement = ref.permanentElement;\n        clonedElement = permanentElement.cloneNode(true);\n        results.push(replaceElementWithElement(element, clonedElement));\n      }\n      return results;\n    };\n\n    SnapshotRenderer.prototype.activateNewBodyScriptElements = function() {\n      var activatedScriptElement, i, inertScriptElement, len, ref, results;\n      ref = this.getNewBodyScriptElements();\n      results = [];\n      for (i = 0, len = ref.length; i < len; i++) {\n        inertScriptElement = ref[i];\n        activatedScriptElement = this.createScriptElement(inertScriptElement);\n        results.push(replaceElementWithElement(inertScriptElement, activatedScriptElement));\n      }\n      return results;\n    };\n\n    SnapshotRenderer.prototype.assignNewBody = function() {\n      return document.body = this.newBody;\n    };\n\n    SnapshotRenderer.prototype.focusFirstAutofocusableElement = function() {\n      var ref;\n      return (ref = this.newSnapshot.findFirstAutofocusableElement()) != null ? ref.focus() : void 0;\n    };\n\n    SnapshotRenderer.prototype.getNewHeadStylesheetElements = function() {\n      return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails);\n    };\n\n    SnapshotRenderer.prototype.getNewHeadScriptElements = function() {\n      return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails);\n    };\n\n    SnapshotRenderer.prototype.getCurrentHeadProvisionalElements = function() {\n      return this.currentHeadDetails.getProvisionalElements();\n    };\n\n    SnapshotRenderer.prototype.getNewHeadProvisionalElements = function() {\n      return this.newHeadDetails.getProvisionalElements();\n    };\n\n    SnapshotRenderer.prototype.getCurrentBodyPermanentElements = function() {\n      return this.currentSnapshot.getPermanentElementsPresentInSnapshot(this.newSnapshot);\n    };\n\n    SnapshotRenderer.prototype.getNewBodyScriptElements = function() {\n      return this.newBody.querySelectorAll("script");\n    };\n\n    return SnapshotRenderer;\n\n  })(Turbolinks.Renderer);\n\n  createPlaceholderForPermanentElement = function(permanentElement) {\n    var element;\n    element = document.createElement("meta");\n    element.setAttribute("name", "turbolinks-permanent-placeholder");\n    element.setAttribute("content", permanentElement.id);\n    return {\n      element: element,\n      permanentElement: permanentElement\n    };\n  };\n\n  replaceElementWithElement = function(fromElement, toElement) {\n    var parentElement;\n    if (parentElement = fromElement.parentNode) {\n      return parentElement.replaceChild(toElement, fromElement);\n    }\n  };\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/snapshot_renderer.js?')},"./src/turbolinks/start.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var createController, installTurbolinks, moduleIsInstalled;\n\n  Turbolinks.start = function() {\n    if (installTurbolinks()) {\n      if (Turbolinks.controller == null) {\n        Turbolinks.controller = createController();\n      }\n      return Turbolinks.controller.start();\n    }\n  };\n\n  installTurbolinks = function() {\n    if (window.Turbolinks == null) {\n      window.Turbolinks = Turbolinks;\n    }\n    return moduleIsInstalled();\n  };\n\n  createController = function() {\n    var controller;\n    controller = new Turbolinks.Controller;\n    controller.adapter = new Turbolinks.BrowserAdapter(controller);\n    return controller;\n  };\n\n  moduleIsInstalled = function() {\n    return window.Turbolinks === Turbolinks;\n  };\n\n  if (moduleIsInstalled()) {\n    Turbolinks.start();\n  }\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/start.js?')},"./src/turbolinks/view.js":function(module,exports,__webpack_require__){eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  __webpack_require__(/*! ./snapshot */ "./src/turbolinks/snapshot.js");\n\n  __webpack_require__(/*! ./snapshot_renderer */ "./src/turbolinks/snapshot_renderer.js");\n\n  __webpack_require__(/*! ./error_renderer */ "./src/turbolinks/error_renderer.js");\n\n  Turbolinks.View = (function() {\n    function View(delegate) {\n      this.delegate = delegate;\n      this.htmlElement = document.documentElement;\n    }\n\n    View.prototype.getRootLocation = function() {\n      return this.getSnapshot().getRootLocation();\n    };\n\n    View.prototype.getElementForAnchor = function(anchor) {\n      return this.getSnapshot().getElementForAnchor(anchor);\n    };\n\n    View.prototype.getSnapshot = function() {\n      return Turbolinks.Snapshot.fromHTMLElement(this.htmlElement);\n    };\n\n    View.prototype.render = function(arg, callback) {\n      var error, isPreview, snapshot;\n      snapshot = arg.snapshot, error = arg.error, isPreview = arg.isPreview;\n      this.markAsPreview(isPreview);\n      if (snapshot != null) {\n        return this.renderSnapshot(snapshot, isPreview, callback);\n      } else {\n        return this.renderError(error, callback);\n      }\n    };\n\n    View.prototype.markAsPreview = function(isPreview) {\n      if (isPreview) {\n        return this.htmlElement.setAttribute("data-turbolinks-preview", "");\n      } else {\n        return this.htmlElement.removeAttribute("data-turbolinks-preview");\n      }\n    };\n\n    View.prototype.renderSnapshot = function(snapshot, isPreview, callback) {\n      return Turbolinks.SnapshotRenderer.render(this.delegate, callback, this.getSnapshot(), Turbolinks.Snapshot.wrap(snapshot), isPreview);\n    };\n\n    View.prototype.renderError = function(error, callback) {\n      return Turbolinks.ErrorRenderer.render(this.delegate, callback, error);\n    };\n\n    return View;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/view.js?')},"./src/turbolinks/visit.js":function(module,exports,__webpack_require__){
eval('/* WEBPACK VAR INJECTION */(function(Turbolinks) {// Generated by CoffeeScript 1.12.8\n(function() {\n  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };\n\n  __webpack_require__(/*! ./http_request */ "./src/turbolinks/http_request.js");\n\n  Turbolinks.Visit = (function() {\n    var getHistoryMethodForAction;\n\n    function Visit(controller, location, action1) {\n      this.controller = controller;\n      this.action = action1;\n      this.performScroll = bind(this.performScroll, this);\n      this.identifier = Turbolinks.uuid();\n      this.location = Turbolinks.Location.wrap(location);\n      this.adapter = this.controller.adapter;\n      this.state = "initialized";\n      this.timingMetrics = {};\n    }\n\n    Visit.prototype.start = function() {\n      if (this.state === "initialized") {\n        this.recordTimingMetric("visitStart");\n        this.state = "started";\n        return this.adapter.visitStarted(this);\n      }\n    };\n\n    Visit.prototype.cancel = function() {\n      var ref;\n      if (this.state === "started") {\n        if ((ref = this.request) != null) {\n          ref.cancel();\n        }\n        this.cancelRender();\n        return this.state = "canceled";\n      }\n    };\n\n    Visit.prototype.complete = function() {\n      var base;\n      if (this.state === "started") {\n        this.recordTimingMetric("visitEnd");\n        this.state = "completed";\n        if (typeof (base = this.adapter).visitCompleted === "function") {\n          base.visitCompleted(this);\n        }\n        return this.controller.visitCompleted(this);\n      }\n    };\n\n    Visit.prototype.fail = function() {\n      var base;\n      if (this.state === "started") {\n        this.state = "failed";\n        return typeof (base = this.adapter).visitFailed === "function" ? base.visitFailed(this) : void 0;\n      }\n    };\n\n    Visit.prototype.changeHistory = function() {\n      var actionForHistory, method;\n      if (!this.historyChanged) {\n        actionForHistory = this.location.isEqualTo(this.referrer) ? "replace" : this.action;\n        method = getHistoryMethodForAction(actionForHistory);\n        this.controller[method](this.location, this.restorationIdentifier);\n        return this.historyChanged = true;\n      }\n    };\n\n    Visit.prototype.issueRequest = function() {\n      if (this.shouldIssueRequest() && (this.request == null)) {\n        this.progress = 0;\n        this.request = new Turbolinks.HttpRequest(this, this.location, this.referrer);\n        return this.request.send();\n      }\n    };\n\n    Visit.prototype.getCachedSnapshot = function() {\n      var snapshot;\n      if (snapshot = this.controller.getCachedSnapshotForLocation(this.location)) {\n        if ((this.location.anchor == null) || snapshot.hasAnchor(this.location.anchor)) {\n          if (this.action === "restore" || snapshot.isPreviewable()) {\n            return snapshot;\n          }\n        }\n      }\n    };\n\n    Visit.prototype.hasCachedSnapshot = function() {\n      return this.getCachedSnapshot() != null;\n    };\n\n    Visit.prototype.loadCachedSnapshot = function() {\n      var isPreview, snapshot;\n      if (snapshot = this.getCachedSnapshot()) {\n        isPreview = this.shouldIssueRequest();\n        return this.render(function() {\n          var base;\n          this.cacheSnapshot();\n          this.controller.render({\n            snapshot: snapshot,\n            isPreview: isPreview\n          }, this.performScroll);\n          if (typeof (base = this.adapter).visitRendered === "function") {\n            base.visitRendered(this);\n          }\n          if (!isPreview) {\n            return this.complete();\n          }\n        });\n      }\n    };\n\n    Visit.prototype.loadResponse = function() {\n      if (this.response != null) {\n        return this.render(function() {\n          var base, base1;\n          this.cacheSnapshot();\n          if (this.request.failed) {\n            this.controller.render({\n              error: this.response\n            }, this.performScroll);\n            if (typeof (base = this.adapter).visitRendered === "function") {\n              base.visitRendered(this);\n            }\n            return this.fail();\n          } else {\n            this.controller.render({\n              snapshot: this.response\n            }, this.performScroll);\n            if (typeof (base1 = this.adapter).visitRendered === "function") {\n              base1.visitRendered(this);\n            }\n            return this.complete();\n          }\n        });\n      }\n    };\n\n    Visit.prototype.followRedirect = function() {\n      if (this.redirectedToLocation && !this.followedRedirect) {\n        this.location = this.redirectedToLocation;\n        this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation, this.restorationIdentifier);\n        return this.followedRedirect = true;\n      }\n    };\n\n    Visit.prototype.requestStarted = function() {\n      var base;\n      this.recordTimingMetric("requestStart");\n      return typeof (base = this.adapter).visitRequestStarted === "function" ? base.visitRequestStarted(this) : void 0;\n    };\n\n    Visit.prototype.requestProgressed = function(progress) {\n      var base;\n      this.progress = progress;\n      return typeof (base = this.adapter).visitRequestProgressed === "function" ? base.visitRequestProgressed(this) : void 0;\n    };\n\n    Visit.prototype.requestCompletedWithResponse = function(response, redirectedToLocation) {\n      this.response = response;\n      if (redirectedToLocation != null) {\n        this.redirectedToLocation = Turbolinks.Location.wrap(redirectedToLocation);\n      }\n      return this.adapter.visitRequestCompleted(this);\n    };\n\n    Visit.prototype.requestFailedWithStatusCode = function(statusCode, response) {\n      this.response = response;\n      return this.adapter.visitRequestFailedWithStatusCode(this, statusCode);\n    };\n\n    Visit.prototype.requestFinished = function() {\n      var base;\n      this.recordTimingMetric("requestEnd");\n      return typeof (base = this.adapter).visitRequestFinished === "function" ? base.visitRequestFinished(this) : void 0;\n    };\n\n    Visit.prototype.performScroll = function() {\n      if (!this.scrolled) {\n        if (this.action === "restore") {\n          this.scrollToRestoredPosition() || this.scrollToTop();\n        } else {\n          this.scrollToAnchor() || this.scrollToTop();\n        }\n        return this.scrolled = true;\n      }\n    };\n\n    Visit.prototype.scrollToRestoredPosition = function() {\n      var position, ref;\n      position = (ref = this.restorationData) != null ? ref.scrollPosition : void 0;\n      if (position != null) {\n        this.controller.scrollToPosition(position);\n        return true;\n      }\n    };\n\n    Visit.prototype.scrollToAnchor = function() {\n      if (this.location.anchor != null) {\n        this.controller.scrollToAnchor(this.location.anchor);\n        return true;\n      }\n    };\n\n    Visit.prototype.scrollToTop = function() {\n      return this.controller.scrollToPosition({\n        x: 0,\n        y: 0\n      });\n    };\n\n    Visit.prototype.recordTimingMetric = function(name) {\n      var base;\n      return (base = this.timingMetrics)[name] != null ? base[name] : base[name] = new Date().getTime();\n    };\n\n    Visit.prototype.getTimingMetrics = function() {\n      return Turbolinks.copyObject(this.timingMetrics);\n    };\n\n    getHistoryMethodForAction = function(action) {\n      switch (action) {\n        case "replace":\n          return "replaceHistoryWithLocationAndRestorationIdentifier";\n        case "advance":\n        case "restore":\n          return "pushHistoryWithLocationAndRestorationIdentifier";\n      }\n    };\n\n    Visit.prototype.shouldIssueRequest = function() {\n      if (this.action === "restore") {\n        return !this.hasCachedSnapshot();\n      } else {\n        return true;\n      }\n    };\n\n    Visit.prototype.cacheSnapshot = function() {\n      if (!this.snapshotCached) {\n        this.controller.cacheSnapshot();\n        return this.snapshotCached = true;\n      }\n    };\n\n    Visit.prototype.render = function(callback) {\n      this.cancelRender();\n      return this.frame = requestAnimationFrame((function(_this) {\n        return function() {\n          _this.frame = null;\n          return callback.call(_this);\n        };\n      })(this));\n    };\n\n    Visit.prototype.cancelRender = function() {\n      if (this.frame) {\n        return cancelAnimationFrame(this.frame);\n      }\n    };\n\n    return Visit;\n\n  })();\n\n}).call(this);\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./ */ "./src/turbolinks/index.js")))\n\n//# sourceURL=webpack://Turbolinks/./src/turbolinks/visit.js?')}});
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//




;
