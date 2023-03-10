"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PluginInstanceContainerController = void 0;
var _a = require("@gluestack/helpers"), SpawnHelper = _a.SpawnHelper, DockerodeHelper = _a.DockerodeHelper;
var PluginInstanceContainerController = (function () {
    function PluginInstanceContainerController(app, callerInstance) {
        this.status = "down";
        this.app = app;
        this.callerInstance = callerInstance;
        this.setStatus(this.callerInstance.gluePluginStore.get("status"));
        this.setPortNumber(this.callerInstance.gluePluginStore.get("port_number"));
        this.setApiPortNumber(this.callerInstance.gluePluginStore.get("api_port_number"));
        this.setContainerId(this.callerInstance.gluePluginStore.get("container_id"));
    }
    PluginInstanceContainerController.prototype.getCallerInstance = function () {
        return this.callerInstance;
    };
    PluginInstanceContainerController.prototype.getEnv = function () { };
    PluginInstanceContainerController.prototype.hasuraConsole = function () {
        return __awaiter(this, void 0, void 0, function () {
            var containerController, env, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        containerController = this.callerInstance
                            .getGraphqlInstance()
                            .getContainerController();
                        return [4, containerController.getEnv()];
                    case 1:
                        env = _c.sent();
                        _a = ["hasura",
                            "console",
                            "--endpoint"];
                        _b = "http://localhost:".concat;
                        return [4, containerController.getPortNumber()];
                    case 2:
                        _a = _a.concat([
                            _b.apply("http://localhost:", [_c.sent()]),
                            "--admin-secret",
                            env.HASURA_GRAPHQL_ADMIN_SECRET,
                            "--console-port"
                        ]);
                        return [4, this.getPortNumber()];
                    case 3:
                        _a = _a.concat([
                            (_c.sent()).toString(),
                            "--api-port"
                        ]);
                        return [4, this.getApiPortNumber()];
                    case 4: return [2, _a.concat([
                            (_c.sent()).toString()
                        ])];
                }
            });
        });
    };
    PluginInstanceContainerController.prototype.getDockerJson = function () {
        return {};
    };
    PluginInstanceContainerController.prototype.getStatus = function () {
        return this.status;
    };
    PluginInstanceContainerController.prototype.getPortNumber = function (returnDefault) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        if (_this.portNumber) {
                            return resolve(_this.portNumber);
                        }
                        var ports = _this.callerInstance.callerPlugin.gluePluginStore.get("ports") || [];
                        DockerodeHelper.getPort(11690, ports)
                            .then(function (port) {
                            _this.setPortNumber(port);
                            ports.push(port);
                            _this.callerInstance.callerPlugin.gluePluginStore.set("ports", ports);
                            return resolve(_this.portNumber);
                        })["catch"](function (e) {
                            reject(e);
                        });
                    })];
            });
        });
    };
    PluginInstanceContainerController.prototype.getApiPortNumber = function (returnDefault) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        if (_this.apiPortNumber) {
                            return resolve(_this.apiPortNumber);
                        }
                        var ports = _this.callerInstance.callerPlugin.gluePluginStore.get("api_ports") || [];
                        DockerodeHelper.getPort(10890, ports)
                            .then(function (port) {
                            _this.setApiPortNumber(port);
                            ports.push(port);
                            _this.callerInstance.callerPlugin.gluePluginStore.set("api_ports", ports);
                            return resolve(_this.apiPortNumber);
                        })["catch"](function (e) {
                            reject(e);
                        });
                    })];
            });
        });
    };
    PluginInstanceContainerController.prototype.getContainerId = function () {
        return this.containerId;
    };
    PluginInstanceContainerController.prototype.setStatus = function (status) {
        this.callerInstance.gluePluginStore.set("status", status || "down");
        return (this.status = status || "down");
    };
    PluginInstanceContainerController.prototype.setPortNumber = function (portNumber) {
        this.callerInstance.gluePluginStore.set("port_number", portNumber || null);
        return (this.portNumber = portNumber || null);
    };
    PluginInstanceContainerController.prototype.setApiPortNumber = function (apiPortNumber) {
        this.callerInstance.gluePluginStore.set("api_port_number", apiPortNumber || null);
        return (this.apiPortNumber = apiPortNumber || null);
    };
    PluginInstanceContainerController.prototype.setContainerId = function (containerId) {
        this.callerInstance.gluePluginStore.set("container_id", containerId || null);
        return (this.containerId = containerId || null);
    };
    PluginInstanceContainerController.prototype.setDockerfile = function (dockerfile) {
        this.callerInstance.gluePluginStore.set("dockerfile", dockerfile || null);
        return (this.dockerfile = dockerfile || null);
    };
    PluginInstanceContainerController.prototype.getConfig = function () { };
    PluginInstanceContainerController.prototype.up = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(this.getStatus() !== "up")) return [3, 2];
                        if (!this.callerInstance.getGraphqlInstance()) {
                            throw new Error("No graphql instance attached with ".concat(this.callerInstance.getName()));
                        }
                        if (!((_a = this.callerInstance.getGraphqlInstance()) === null || _a === void 0 ? void 0 : _a.getContainerController())) {
                            throw new Error("Not a valid graphql instance configured with ".concat(this.callerInstance.getName()));
                        }
                        if (((_c = (_b = this.callerInstance
                            .getGraphqlInstance()) === null || _b === void 0 ? void 0 : _b.getContainerController()) === null || _c === void 0 ? void 0 : _c.getStatus()) !== "up") {
                            throw new Error("Graphql is not up for instance ".concat(this.callerInstance
                                .getGraphqlInstance()
                                .getName()));
                        }
                        return [4, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _c, _d, _e, _f, _g;
                                var _this = this;
                                return __generator(this, function (_h) {
                                    switch (_h.label) {
                                        case 0:
                                            console.log("\x1b[33m");
                                            _b = (_a = console).log;
                                            _d = (_c = "".concat(this.callerInstance.getName(), ": Running \"")).concat;
                                            return [4, this.hasuraConsole()];
                                        case 1:
                                            _b.apply(_a, [_d.apply(_c, [(_h.sent()).join(" "), "\""]), "\x1b[0m"]);
                                            _f = (_e = SpawnHelper).start;
                                            _g = [this.callerInstance.getGraphqlInstance().getInstallationPath()];
                                            return [4, this.hasuraConsole()];
                                        case 2:
                                            _f.apply(_e, _g.concat([_h.sent()]))
                                                .then(function (_a) {
                                                var processId = _a.processId;
                                                return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_b) {
                                                        switch (_b.label) {
                                                            case 0:
                                                                this.setStatus("up");
                                                                this.setContainerId(processId);
                                                                return [4, this.print()];
                                                            case 1:
                                                                _b.sent();
                                                                return [2, resolve(true)];
                                                        }
                                                    });
                                                });
                                            })["catch"](function (err) {
                                                reject(err);
                                            });
                                            return [2];
                                    }
                                });
                            }); })];
                    case 1:
                        _d.sent();
                        return [3, 4];
                    case 2: return [4, this.print()];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    PluginInstanceContainerController.prototype.print = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        console.log("\x1b[32m");
                        _b = (_a = console).log;
                        _c = "Open http://localhost:".concat;
                        return [4, this.getPortNumber()];
                    case 1:
                        _b.apply(_a, [_c.apply("Open http://localhost:", [_g.sent(), "/ in browser"])]);
                        console.log("\x1b[0m");
                        console.log("\x1b[36m");
                        console.log("Connect Database");
                        console.log();
                        console.log("Database URL:");
                        _e = (_d = console).log;
                        _f = "".concat;
                        return [4, this.callerInstance
                                .getGraphqlInstance()
                                .getPostgresInstance()
                                .getConnectionString()];
                    case 2:
                        _e.apply(_d, [_f.apply("", [_g.sent()])]);
                        console.log("\x1b[0m");
                        return [2];
                }
            });
        });
    };
    PluginInstanceContainerController.prototype.down = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.getStatus() !== "down")) return [3, 2];
                        return [4, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    DockerodeHelper.down(this.getContainerId(), this.callerInstance.getName())
                                        .then(function () {
                                        _this.setStatus("down");
                                        _this.setContainerId(null);
                                        return resolve(true);
                                    })["catch"](function (e) {
                                        return reject(e);
                                    });
                                    return [2];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2];
                }
            });
        });
    };
    PluginInstanceContainerController.prototype.build = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
    };
    return PluginInstanceContainerController;
}());
exports.PluginInstanceContainerController = PluginInstanceContainerController;
//# sourceMappingURL=PluginInstanceContainerController.js.map