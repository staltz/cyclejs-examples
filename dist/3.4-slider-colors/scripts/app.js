(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/app.js":[function(require,module,exports){
"use strict";

require("./shims");

// IMPORTS =========================================================================================
var Cycle = require("cyclejs");
var Model = require("./model");
var View = require("./view");
var Intent = require("./intent");

// APP =============================================================================================
var DOM = Cycle.createDOMUser("main");

DOM.inject(View).inject(Model).inject(Intent).inject(DOM);

},{"./intent":"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/intent.js","./model":"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/model.js","./shims":"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/shims.js","./view":"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/view.js","cyclejs":"cyclejs"}],"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/intent.js":[function(require,module,exports){
"use strict";

// IMPORTS =========================================================================================
var Cycle = require("cyclejs");
var Rx = Cycle.Rx;

// EXPORTS =========================================================================================
var Intent = Cycle.createIntent(function (DOM) {
  return {
    add$: DOM.event$(".sliders .add", "click").map(function (event) {
      return 1;
    }),
    remove$: DOM.event$(".slider", "remove").map(function (event) {
      return event.data;
    }).tap(function (id) {
      console.log("Intent gets remove(" + id + ")!");
    }),
    changeValue$: DOM.event$(".slider", "changeValue").map(function (event) {
      return event.data;
    }),
    changeColor$: DOM.event$(".slider", "changeColor").map(function (event) {
      return event.data;
    }) };
});

module.exports = Intent;

},{"cyclejs":"cyclejs"}],"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/model.js":[function(require,module,exports){
"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

// IMPORTS =========================================================================================
var uuid = require("node-uuid");
var Cycle = require("cyclejs");
var Rx = Cycle.Rx;

// EXPORTS =========================================================================================
var Model = Cycle.createModel(function (Intent) {
  var add$ = Intent.get("add$").map(function () {
    return function transform(state) {
      var model = createRandom();
      var state = Object.assign({}, state);
      state[model.id] = model;
      return state;
    };
  });

  var remove$ = Intent.get("remove$").map(function (id) {
    return function transform(state) {
      var state = Object.assign({}, state);
      delete state[id];
      return state;
    };
  });

  var changeValue$ = Intent.get("changeValue$").map(function (model) {
    return function transform(state) {
      state[model.id].value = model.value;
      return state;
    };
  });

  var changeColor$ = Intent.get("changeColor$").map(function (model) {
    return function (state) {
      state[model.id].color = model.color;
      return state;
    };
  });

  var transforms = Rx.Observable.merge(add$, remove$, changeColor$, changeValue$);

  return {
    state$: transforms.startWith(seedState()).scan(function (state, transform) {
      return transform(state);
    }) };
});

function createRandom(withData) {
  return Object.assign({
    id: uuid.v4(),
    value: Math.floor(Math.random() * 100) + 1,
    color: "#" + Math.random().toString(16).substr(-6) }, withData);
}

function seedState() {
  var model = createRandom();
  var state = _defineProperty({}, model.id, model);
  return state;
}

module.exports = Model;

},{"cyclejs":"cyclejs","node-uuid":"node-uuid"}],"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/shims.js":[function(require,module,exports){
"use strict";

require("object.assign").shim();

console.error = console.log;

},{"object.assign":"object.assign"}],"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/slider.js":[function(require,module,exports){
"use strict";

// IMPORTS =========================================================================================
var Cycle = require("cyclejs");
var Rx = Cycle.Rx;
var h = Cycle.h;

// ELEMENTS ========================================================================================
Cycle.registerCustomElement("Slider", function (DOM, Props) {
  var Model = Cycle.createModel(function (Intent, Props) {
    return {
      id$: Props.get("id$").shareReplay(1),

      value$: Props.get("value$").startWith(0).merge(Intent.get("changeValue$")),

      color$: Props.get("color$").startWith("#F00").merge(Intent.get("changeColor$")) };
  });

  var View = Cycle.createView(function (Model) {
    var id$ = Model.get("id$");
    var value$ = Model.get("value$");
    var color$ = Model.get("color$");
    return {
      vtree$: value$.combineLatest(id$, color$, function (value, id, color) {
        return h("fieldset", { className: "slider" }, [h("legend", null, ["Slider ", h("small", null, [id])]), h("div", { className: "form-group" }, [h("label", null, ["Amount"]), h("div", { className: "input-group" }, [h("input", { type: "range", value: value, min: "0", max: "100" }), h("div", { className: "input-group-addon" }, [h("input", { type: "text", value: value, readonly: "1" })])])]), h("div", { className: "form-group" }, [h("div", { className: "input-group" }, [h("div", { style: { backgroundColor: color, width: "100%", height: "10px" } }), h("div", { className: "input-group-addon" }, [h("input", { type: "text", value: color, readonly: "1" })])])]), h("div", null, [h("button", { className: "btn btn-default remove" }, ["Remove"])])]);
      }) };
  });

  var Intent = Cycle.createIntent(function (DOM) {
    return {
      changeValue$: DOM.event$("[type=range]", "input").map(function (event) {
        return parseInt(event.target.value);
      }),

      changeColor$: DOM.event$("[type=text]", "input").map(function (event) {
        return event.target.value;
      }),

      remove$: DOM.event$(".btn.remove", "click").map(function (event) {
        return true;
      }) };
  });

  DOM.inject(View).inject(Model).inject(Intent, Props)[0].inject(DOM);

  return {
    changeValue$: Intent.get("changeValue$").combineLatest(Model.get("id$"), function (value, id) {
      return { id: id, value: value };
    }),

    changeColor$: Intent.get("changeColor$").combineLatest(Model.get("id$"), function (color, id) {
      return { id: id, color: color };
    }),

    remove$: Intent.get("remove$").combineLatest(Model.get("id$"), function (_, id) {
      return id;
    }).tap(function (id) {
      console.log("Component sends remove(" + id + ")");
    }) };
});

},{"cyclejs":"cyclejs"}],"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/view.js":[function(require,module,exports){
"use strict";

// IMPORTS =========================================================================================
var sortBy = require("lodash.sortby");
var values = require("lodash.values");
var Cycle = require("cyclejs");
var Rx = Cycle.Rx;
var h = Cycle.h;

var Slider = require("./slider");

// EXPORTS =========================================================================================
var View = Cycle.createView(function (Model) {
  var state$ = Model.get("state$");
  return {
    vtree$: state$.map(function (models) {
      return h("div", { className: "sliders" }, [h("div", null, [h("button", { className: "btn btn-default add" }, ["Add Random"])]), h("div", null, [sortBy(values(models), function (model) {
        return model.id;
      }).map(function (model) {
        return h("Slider", { id: model.id, value: model.value, color: model.color, key: model.id });
      })])]);
    }) };
});

module.exports = View;

},{"./slider":"/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/slider.js","cyclejs":"cyclejs","lodash.sortby":"lodash.sortby","lodash.values":"lodash.values"}]},{},["/Users/ivankleshnin/JavaScript/cyclejs-examples/build/3.4-slider-colors/scripts/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC8zLjQtc2xpZGVyLWNvbG9ycy9zY3JpcHRzL2FwcC5qcyIsImJ1aWxkLzMuNC1zbGlkZXItY29sb3JzL3NjcmlwdHMvaW50ZW50LmpzIiwiYnVpbGQvMy40LXNsaWRlci1jb2xvcnMvc2NyaXB0cy9tb2RlbC5qcyIsImJ1aWxkLzMuNC1zbGlkZXItY29sb3JzL3NjcmlwdHMvc2hpbXMuanMiLCJidWlsZC8zLjQtc2xpZGVyLWNvbG9ycy9zY3JpcHRzL3NsaWRlci5qcyIsImJ1aWxkLzMuNC1zbGlkZXItY29sb3JzL3NjcmlwdHMvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzs7QUFHbkIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0IsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzs7QUFHakMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFdEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Ozs7O0FDVjFELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQixFQUFFLEdBQUksS0FBSyxDQUFYLEVBQUU7OztB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QUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDbkMsTUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxTQUFPO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNO2FBQ3ZCLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLEVBQUUsQ0FDL0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FDYixDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixFQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUNoRSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FDYixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFVBQUEsS0FBSztlQUFJLEtBQUssQ0FBQyxFQUFFO09BQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7ZUFDakQsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFDLENBQUM7T0FBQSxDQUNuRixDQUNGLENBQUMsQ0FDSCxDQUFDO0tBQ0gsQ0FBQyxFQUNILENBQUM7Q0FDSCxDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZShcIi4vc2hpbXNcIik7XG5cbi8vIElNUE9SVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCBDeWNsZSA9IHJlcXVpcmUoXCJjeWNsZWpzXCIpO1xubGV0IE1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWxcIik7XG5sZXQgVmlldyA9IHJlcXVpcmUoXCIuL3ZpZXdcIik7XG5sZXQgSW50ZW50ID0gcmVxdWlyZShcIi4vaW50ZW50XCIpO1xuXG4vLyBBUFAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgRE9NID0gQ3ljbGUuY3JlYXRlRE9NVXNlcihcIm1haW5cIik7XG5cbkRPTS5pbmplY3QoVmlldykuaW5qZWN0KE1vZGVsKS5pbmplY3QoSW50ZW50KS5pbmplY3QoRE9NKTsiLCIvLyBJTVBPUlRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgQ3ljbGUgPSByZXF1aXJlKFwiY3ljbGVqc1wiKTtcbmxldCB7Unh9ID0gQ3ljbGU7XG5cbi8vIEVYUE9SVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCBJbnRlbnQgPSBDeWNsZS5jcmVhdGVJbnRlbnQoRE9NID0+IHtcbiAgcmV0dXJuIHtcbiAgICBhZGQkOiBET00uZXZlbnQkKFwiLnNsaWRlcnMgLmFkZFwiLCBcImNsaWNrXCIpLm1hcChldmVudCA9PiAxKSxcbiAgICByZW1vdmUkOiBET00uZXZlbnQkKFwiLnNsaWRlclwiLCBcInJlbW92ZVwiKS5tYXAoZXZlbnQgPT4gZXZlbnQuZGF0YSlcbiAgICAgIC50YXAoaWQgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgSW50ZW50IGdldHMgcmVtb3ZlKCR7aWR9KSFgKTtcbiAgICAgIH0pLFxuICAgIGNoYW5nZVZhbHVlJDogRE9NLmV2ZW50JChcIi5zbGlkZXJcIiwgXCJjaGFuZ2VWYWx1ZVwiKS5tYXAoZXZlbnQgPT4gZXZlbnQuZGF0YSksXG4gICAgY2hhbmdlQ29sb3IkOiBET00uZXZlbnQkKFwiLnNsaWRlclwiLCBcImNoYW5nZUNvbG9yXCIpLm1hcChldmVudCA9PiBldmVudC5kYXRhKSxcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVudDsiLCIvLyBJTVBPUlRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgdXVpZCA9IHJlcXVpcmUoXCJub2RlLXV1aWRcIik7XG5sZXQgQ3ljbGUgPSByZXF1aXJlKFwiY3ljbGVqc1wiKTtcbmxldCB7Unh9ID0gQ3ljbGU7XG5cbi8vIEVYUE9SVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCBNb2RlbCA9IEN5Y2xlLmNyZWF0ZU1vZGVsKEludGVudCA9PiB7XG4gIGxldCBhZGQkID0gSW50ZW50LmdldChcImFkZCRcIikubWFwKCgpID0+IHtcbiAgICByZXR1cm4gZnVuY3Rpb24gdHJhbnNmb3JtKHN0YXRlKSB7XG4gICAgICBsZXQgbW9kZWwgPSBjcmVhdGVSYW5kb20oKTtcbiAgICAgIGxldCBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcbiAgICAgIHN0YXRlW21vZGVsLmlkXSA9IG1vZGVsO1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH07XG4gIH0pO1xuXG4gIGxldCByZW1vdmUkID0gSW50ZW50LmdldChcInJlbW92ZSRcIikubWFwKGlkID0+IHtcbiAgICByZXR1cm4gZnVuY3Rpb24gdHJhbnNmb3JtKHN0YXRlKSB7XG4gICAgICBsZXQgc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSk7XG4gICAgICBkZWxldGUgc3RhdGVbaWRdO1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH07XG4gIH0pO1xuXG4gIGxldCBjaGFuZ2VWYWx1ZSQgPSBJbnRlbnQuZ2V0KFwiY2hhbmdlVmFsdWUkXCIpLm1hcChtb2RlbCA9PiB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHRyYW5zZm9ybShzdGF0ZSkge1xuICAgICAgc3RhdGVbbW9kZWwuaWRdLnZhbHVlID0gbW9kZWwudmFsdWU7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfTtcbiAgfSk7XG5cbiAgbGV0IGNoYW5nZUNvbG9yJCA9IEludGVudC5nZXQoXCJjaGFuZ2VDb2xvciRcIikubWFwKG1vZGVsID0+IHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHN0YXRlW21vZGVsLmlkXS5jb2xvciA9IG1vZGVsLmNvbG9yO1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH07XG4gIH0pO1xuXG4gIGxldCB0cmFuc2Zvcm1zID0gUnguT2JzZXJ2YWJsZS5tZXJnZShcbiAgICBhZGQkLFxuICAgIHJlbW92ZSQsXG4gICAgY2hhbmdlQ29sb3IkLFxuICAgIGNoYW5nZVZhbHVlJFxuICApO1xuXG4gIHJldHVybiB7XG4gICAgc3RhdGUkOiB0cmFuc2Zvcm1zXG4gICAgICAuc3RhcnRXaXRoKHNlZWRTdGF0ZSgpKVxuICAgICAgLnNjYW4oKHN0YXRlLCB0cmFuc2Zvcm0pID0+IChcbiAgICAgICAgdHJhbnNmb3JtKHN0YXRlKVxuICAgICAgKSksXG4gIH07XG59KTtcblxuZnVuY3Rpb24gY3JlYXRlUmFuZG9tKHdpdGhEYXRhKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICBpZDogdXVpZC52NCgpLFxuICAgIHZhbHVlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApICsgMSxcbiAgICBjb2xvcjogJyMnICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygxNikuc3Vic3RyKC02KSxcbiAgfSwgd2l0aERhdGEpO1xufVxuXG5mdW5jdGlvbiBzZWVkU3RhdGUoKSB7XG4gIGxldCBtb2RlbCA9IGNyZWF0ZVJhbmRvbSgpO1xuICBsZXQgc3RhdGUgPSB7XG4gICAgW21vZGVsLmlkXTogbW9kZWwsXG4gIH07XG4gIHJldHVybiBzdGF0ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbDsiLCJyZXF1aXJlKFwib2JqZWN0LmFzc2lnblwiKS5zaGltKCk7XG5cbmNvbnNvbGUuZXJyb3IgPSBjb25zb2xlLmxvZzsiLCIvLyBJTVBPUlRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgQ3ljbGUgPSByZXF1aXJlKFwiY3ljbGVqc1wiKTtcbmxldCB7UngsIGh9ID0gQ3ljbGU7XG5cbi8vIEVMRU1FTlRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkN5Y2xlLnJlZ2lzdGVyQ3VzdG9tRWxlbWVudChcIlNsaWRlclwiLCAoRE9NLCBQcm9wcykgPT4ge1xuICBsZXQgTW9kZWwgPSBDeWNsZS5jcmVhdGVNb2RlbCgoSW50ZW50LCBQcm9wcykgPT4gKHtcbiAgICBpZCQ6IFByb3BzLmdldChcImlkJFwiKS5zaGFyZVJlcGxheSgxKSxcblxuICAgIHZhbHVlJDogUHJvcHMuZ2V0KFwidmFsdWUkXCIpLnN0YXJ0V2l0aCgwKVxuICAgICAgLm1lcmdlKEludGVudC5nZXQoXCJjaGFuZ2VWYWx1ZSRcIikpLFxuXG4gICAgY29sb3IkOiBQcm9wcy5nZXQoXCJjb2xvciRcIikuc3RhcnRXaXRoKFwiI0YwMFwiKVxuICAgICAgLm1lcmdlKEludGVudC5nZXQoXCJjaGFuZ2VDb2xvciRcIikpLFxuICB9KSk7XG5cbiAgbGV0IFZpZXcgPSBDeWNsZS5jcmVhdGVWaWV3KE1vZGVsID0+IHtcbiAgICBsZXQgaWQkID0gTW9kZWwuZ2V0KFwiaWQkXCIpO1xuICAgIGxldCB2YWx1ZSQgPSBNb2RlbC5nZXQoXCJ2YWx1ZSRcIik7XG4gICAgbGV0IGNvbG9yJCA9IE1vZGVsLmdldChcImNvbG9yJFwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgdnRyZWUkOiB2YWx1ZSQuY29tYmluZUxhdGVzdChpZCQsIGNvbG9yJCwgKHZhbHVlLCBpZCwgY29sb3IpID0+IChcbiAgICAgICAgaCgnZmllbGRzZXQnLCB7Y2xhc3NOYW1lOiBcInNsaWRlclwifSwgW1xuICAgICAgICAgIGgoJ2xlZ2VuZCcsIG51bGwsIFtcIlNsaWRlciBcIiwgaCgnc21hbGwnLCBudWxsLCBbaWRdKV0pLFxuICAgICAgICAgIGgoJ2RpdicsIHtjbGFzc05hbWU6IFwiZm9ybS1ncm91cFwifSwgW1xuICAgICAgICAgICAgaCgnbGFiZWwnLCBudWxsLCBbXCJBbW91bnRcIl0pLFxuICAgICAgICAgICAgaCgnZGl2Jywge2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cFwifSwgW1xuICAgICAgICAgICAgICBoKCdpbnB1dCcsIHt0eXBlOiBcInJhbmdlXCIsIHZhbHVlOiB2YWx1ZSwgbWluOiBcIjBcIiwgbWF4OiBcIjEwMFwifSksXG4gICAgICAgICAgICAgIGgoJ2RpdicsIHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYWRkb25cIn0sIFtcbiAgICAgICAgICAgICAgICBoKCdpbnB1dCcsIHt0eXBlOiBcInRleHRcIiwgdmFsdWU6IHZhbHVlLCByZWFkb25seTogXCIxXCJ9KVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBoKCdkaXYnLCB7Y2xhc3NOYW1lOiBcImZvcm0tZ3JvdXBcIn0sIFtcbiAgICAgICAgICAgIGgoJ2RpdicsIHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXBcIn0sIFtcbiAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7YmFja2dyb3VuZENvbG9yOiBjb2xvciwgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTBweFwifX0pLFxuICAgICAgICAgICAgICBoKCdkaXYnLCB7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWFkZG9uXCJ9LCBbXG4gICAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7dHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBjb2xvciwgcmVhZG9ubHk6IFwiMVwifSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgaCgnZGl2JywgbnVsbCwgW1xuICAgICAgICAgICAgaCgnYnV0dG9uJywge2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHQgcmVtb3ZlXCJ9LCBbXCJSZW1vdmVcIl0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgICkpLFxuICAgIH07XG4gIH0pO1xuXG4gIGxldCBJbnRlbnQgPSBDeWNsZS5jcmVhdGVJbnRlbnQoRE9NID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hhbmdlVmFsdWUkOiBET00uZXZlbnQkKFwiW3R5cGU9cmFuZ2VdXCIsIFwiaW5wdXRcIilcbiAgICAgICAgLm1hcChldmVudCA9PiBwYXJzZUludChldmVudC50YXJnZXQudmFsdWUpKSxcblxuICAgICAgY2hhbmdlQ29sb3IkOiBET00uZXZlbnQkKFwiW3R5cGU9dGV4dF1cIiwgXCJpbnB1dFwiKVxuICAgICAgICAubWFwKGV2ZW50ID0+IGV2ZW50LnRhcmdldC52YWx1ZSksXG5cbiAgICAgIHJlbW92ZSQ6IERPTS5ldmVudCQoXCIuYnRuLnJlbW92ZVwiLCBcImNsaWNrXCIpXG4gICAgICAgIC5tYXAoZXZlbnQgPT4gdHJ1ZSksXG4gICAgfTtcbiAgfSk7XG5cbiAgRE9NLmluamVjdChWaWV3KS5pbmplY3QoTW9kZWwpLmluamVjdChJbnRlbnQsIFByb3BzKVswXS5pbmplY3QoRE9NKTtcblxuICByZXR1cm4ge1xuICAgIGNoYW5nZVZhbHVlJDogSW50ZW50LmdldChcImNoYW5nZVZhbHVlJFwiKVxuICAgICAgLmNvbWJpbmVMYXRlc3QoTW9kZWwuZ2V0KFwiaWQkXCIpLCAodmFsdWUsIGlkKSA9PiAoe2lkLCB2YWx1ZX0pKSxcblxuICAgIGNoYW5nZUNvbG9yJDogSW50ZW50LmdldChcImNoYW5nZUNvbG9yJFwiKVxuICAgICAgLmNvbWJpbmVMYXRlc3QoTW9kZWwuZ2V0KFwiaWQkXCIpLCAoY29sb3IsIGlkKSA9PiAoe2lkLCBjb2xvcn0pKSxcblxuICAgIHJlbW92ZSQ6IEludGVudC5nZXQoXCJyZW1vdmUkXCIpXG4gICAgICAuY29tYmluZUxhdGVzdChNb2RlbC5nZXQoXCJpZCRcIiksIChfLCBpZCkgPT4gaWQpXG4gICAgICAudGFwKChpZCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgQ29tcG9uZW50IHNlbmRzIHJlbW92ZSgke2lkfSlgKTtcbiAgICAgIH0pLFxuICB9O1xufSk7XG4iLCIvLyBJTVBPUlRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgc29ydEJ5ID0gcmVxdWlyZShcImxvZGFzaC5zb3J0YnlcIik7XG5sZXQgdmFsdWVzID0gcmVxdWlyZShcImxvZGFzaC52YWx1ZXNcIik7XG5sZXQgQ3ljbGUgPSByZXF1aXJlKFwiY3ljbGVqc1wiKTtcbmxldCB7UngsIGh9ID0gQ3ljbGU7XG5sZXQgU2xpZGVyID0gcmVxdWlyZShcIi4vc2xpZGVyXCIpO1xuXG4vLyBFWFBPUlRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgVmlldyA9IEN5Y2xlLmNyZWF0ZVZpZXcoTW9kZWwgPT4ge1xuICBsZXQgc3RhdGUkID0gTW9kZWwuZ2V0KFwic3RhdGUkXCIpO1xuICByZXR1cm4ge1xuICAgIHZ0cmVlJDogc3RhdGUkLm1hcChtb2RlbHMgPT4gKFxuICAgICAgaCgnZGl2Jywge2NsYXNzTmFtZTogXCJzbGlkZXJzXCJ9LCBbXG4gICAgICAgIGgoJ2RpdicsIG51bGwsIFtcbiAgICAgICAgICBoKCdidXR0b24nLCB7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdCBhZGRcIn0sIFtcIkFkZCBSYW5kb21cIl0pXG4gICAgICAgIF0pLFxuICAgICAgICBoKCdkaXYnLCBudWxsLCBbXG4gICAgICAgICAgc29ydEJ5KHZhbHVlcyhtb2RlbHMpLCBtb2RlbCA9PiBtb2RlbC5pZCkubWFwKG1vZGVsID0+XG4gICAgICAgICAgICBoKCdTbGlkZXInLCB7aWQ6IG1vZGVsLmlkLCB2YWx1ZTogbW9kZWwudmFsdWUsIGNvbG9yOiBtb2RlbC5jb2xvciwga2V5OiBtb2RlbC5pZH0pXG4gICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgXSlcbiAgICApKSxcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7Il19
