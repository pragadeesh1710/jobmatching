/**
 * =============================================================================
 * Web Technology Lab Concept: AJAX (Asynchronous JavaScript and XML/JSON)
 * File: ajax.js
 * Demonstrates:
 *   - Native XMLHttpRequest (XHR) object creation
 *   - Asynchronous request dispatching (open, setRequestHeader, send)
 *   - readyState lifecycle tracking (0 to 4)
 *   - HTTP status code validation (200 OK, 401, 500)
 *   - Seamless DOM updates without full browser page reload
 * =============================================================================
 */

const AjaxClient = {
  /**
   * Dispatches an asynchronous HTTP request using native XMLHttpRequest.
   *
   * @param {Object} options Configuration object
   * @param {string} options.method 'GET' | 'POST' | 'PUT' | 'DELETE'
   * @param {string} options.url Target Java Servlet URL (e.g., '/MatchServlet')
   * @param {Object|string} [options.data] Request payload (form-urlencoded or JSON)
   * @param {string} [options.contentType] Content-Type header
   * @param {Function} [options.onSuccess] Callback on HTTP 200 success
   * @param {Function} [options.onError] Callback on HTTP error
   * @param {Function} [options.onStateChange] Callback for readyState transitions
   * @returns {XMLHttpRequest}
   */
  request: function(options) {
    const method = (options.method || 'GET').toUpperCase();
    const url = options.url;
    const data = options.data || null;
    const contentType = options.contentType || 'application/x-www-form-urlencoded; charset=UTF-8';

    // STEP 1: Create XMLHttpRequest instance
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    console.log(`[AJAX Dispatch] ${method} -> ${url}`);

    // STEP 2: Configure state change listener
    xhr.onreadystatechange = function() {
      const stateMap = {
        0: '0: UNSENT (Client created, open() not called yet)',
        1: '1: OPENED (open() called, headers can be set)',
        2: '2: HEADERS_RECEIVED (send() called, headers available)',
        3: '3: LOADING (Downloading response body)',
        4: '4: DONE (Operation complete)'
      };

      console.log(`[AJAX readyState] ${stateMap[xhr.readyState] || xhr.readyState}`);

      // Notify optional state change observer
      if (typeof options.onStateChange === 'function') {
        options.onStateChange(xhr.readyState, xhr.status);
      }

      // STEP 3: Handle completion (readyState === 4)
      if (xhr.readyState === 4) {
        const duration = Date.now() - startTime;
        let parsedResponse = null;

        // Try parsing JSON if applicable
        const contentTypeHeader = xhr.getResponseHeader('Content-Type') || '';
        if (contentTypeHeader.includes('application/json') || xhr.responseText.trim().startsWith('{') || xhr.responseText.trim().startsWith('[')) {
          try {
            parsedResponse = JSON.parse(xhr.responseText);
          } catch (e) {
            parsedResponse = xhr.responseText;
          }
        } else {
          parsedResponse = xhr.responseText;
        }

        // Broadcast to the Lab Inspector / Network Trace panel
        window.dispatchEvent(new CustomEvent('rolematch:ajax-trace', {
          detail: {
            method: method,
            url: url,
            status: xhr.status,
            duration: duration,
            requestData: data,
            response: parsedResponse,
            headers: xhr.getAllResponseHeaders()
          }
        }));

        if (xhr.status >= 200 && xhr.status < 300) {
          console.log(`[AJAX Success ${xhr.status}] in ${duration}ms from ${url}:`, parsedResponse);
          if (typeof options.onSuccess === 'function') {
            options.onSuccess(parsedResponse, xhr);
          }
        } else {
          console.warn(`[AJAX Error ${xhr.status}] from ${url}:`, parsedResponse);
          if (typeof options.onError === 'function') {
            options.onError(parsedResponse, xhr);
          }
        }
      }
    };

    // STEP 4: Open connection
    let finalUrl = url;
    let payload = null;

    if (method === 'GET' && data) {
      const queryString = typeof data === 'string' ? data : AjaxClient.serializeParams(data);
      finalUrl += (url.includes('?') ? '&' : '?') + queryString;
    }

    xhr.open(method, finalUrl, true); // true = asynchronous mode

    // STEP 5: Set Request Headers
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');

    if (method === 'POST' || method === 'PUT') {
      if (typeof data === 'object' && !(data instanceof FormData) && contentType.includes('application/x-www-form-urlencoded')) {
        payload = AjaxClient.serializeParams(data);
        xhr.setRequestHeader('Content-Type', contentType);
      } else if (typeof data === 'object' && !(data instanceof FormData) && contentType.includes('application/json')) {
        payload = JSON.stringify(data);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      } else {
        payload = data;
        if (!(data instanceof FormData)) {
          xhr.setRequestHeader('Content-Type', contentType);
        }
      }
    }

    // STEP 6: Send payload
    xhr.send(payload);
    return xhr;
  },

  /**
   * Helper utility to serialize JavaScript object into application/x-www-form-urlencoded string
   */
  serializeParams: function(obj) {
    if (!obj) return '';
    const params = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (Array.isArray(val)) {
          val.forEach(item => {
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(item));
          });
        } else if (val !== null && val !== undefined) {
          params.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
        }
      }
    }
    return params.join('&');
  },

  /**
   * Shorthand GET method
   */
  get: function(url, data, onSuccess, onError) {
    return this.request({
      method: 'GET',
      url: url,
      data: data,
      onSuccess: onSuccess,
      onError: onError
    });
  },

  /**
   * Shorthand POST method
   */
  post: function(url, data, onSuccess, onError) {
    return this.request({
      method: 'POST',
      url: url,
      data: data,
      onSuccess: onSuccess,
      onError: onError
    });
  }
};

window.AjaxClient = AjaxClient;
