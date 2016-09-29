"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cluster = require("cluster");

var _cluster2 = _interopRequireDefault(_cluster);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {
  script: "server.js",
  args: []
};

var ReloadServerPlugin = function () {
  function ReloadServerPlugin() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultOptions;

    var script = _ref.script;
    var args = _ref.args;

    _classCallCheck(this, ReloadServerPlugin);

    this.done = null;
    this.workers = [];

    _cluster2.default.setupMaster({
      exec: _path2.default.resolve(process.cwd(), script),
      args: args
    });

    _cluster2.default.on("online", function (worker) {
      _this.workers.push(worker);

      if (_this.done) {
        _this.done();
      }
    });
  }

  _createClass(ReloadServerPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this2 = this;

      compiler.plugin("after-emit", function (compilation, callback) {
        _this2.done = callback;
        _this2.workers.forEach(function (worker) {
          try {
            process.kill(worker.process.pid, "SIGTERM");
          } catch (e) {
            console.warn("Unable to kill process #" + worker.process.pid);
          }
        });

        _this2.workers = [];

        _cluster2.default.fork();
      });
    }
  }]);

  return ReloadServerPlugin;
}();

exports.default = ReloadServerPlugin;
module.exports = exports['default'];