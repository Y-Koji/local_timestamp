"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = __importDefault(require("vue"));
var isEmpty = function (x) { return /^\s*$/g.test(x); };
var removeArray = function (x) {
    var length = x.length;
    for (var i = 0; i < length; i++) {
        x.pop();
    }
};
var LOCAL_KEY_ITEMS = 'items';
var LOCAL_KEY_HISTORY = 'app';
var SelectionItem = /** @class */ (function () {
    function SelectionItem(name) {
        this.Name = "";
        this.Checked = true;
        this.Name = name;
    }
    return SelectionItem;
}());
var SelectionViewModel = /** @class */ (function () {
    function SelectionViewModel() {
        var _this = this;
        this.options = [];
        this.selected = this.options[0];
        this.search = '';
        this.itemName = '';
        this.msg = '';
        this.selectionChanged = null;
        this.methods = {
            add: function () {
                if (!isEmpty(_this.itemName)) {
                    _this.options.push(new SelectionItem(_this.itemName));
                    _this.itemName = "";
                    _this.msg = '';
                    _this.methods.save();
                    if (null != _this.selectionChanged) {
                        _this.selectionChanged();
                    }
                }
                else {
                    _this.msg = '項目名を入力してください';
                }
            },
            remove: function (item) {
                var indexOf = _this.options.indexOf(item);
                _this.options.splice(indexOf, 1);
                _this.methods.save();
                if (null != _this.selectionChanged) {
                    _this.selectionChanged();
                }
            },
            filter: function (items) {
                var filterd = [];
                var reg = new RegExp(_this.search);
                items.forEach(function (item) {
                    if (reg.test(item.Name)) {
                        filterd.push(item);
                    }
                });
                return filterd;
            },
            save: function () {
                localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(_this.options));
            },
            load: function () {
                var json = localStorage.getItem(LOCAL_KEY_ITEMS) || '';
                if (!isEmpty(json)) {
                    var items = JSON.parse(json);
                    var length_1 = _this.options.length;
                    for (var i = 0; i < length_1; i++) {
                        _this.options.pop();
                    }
                    items.forEach(function (item) {
                        _this.options.push(item);
                    });
                }
            }
        };
    }
    return SelectionViewModel;
}());
var Selection = /** @class */ (function () {
    function Selection(id) {
        this.model = new SelectionViewModel();
        this.appVue = new vue_1.default({
            el: id,
            data: this.model,
            methods: this.model.methods
        });
    }
    return Selection;
}());
var LogItem = /** @class */ (function () {
    function LogItem(time, type, memo) {
        this.Time = time;
        this.Type = type;
        this.Memo = memo;
    }
    return LogItem;
}());
var AppViewModel = /** @class */ (function () {
    function AppViewModel(selection) {
        var _this = this;
        this.Logs = new Array();
        this.type = '';
        this.input = '';
        this.msg = '';
        this.historyChanged = null;
        this.methods = {
            addItem: function () {
                if (!isEmpty(_this.type)) {
                    var time = new Date().toLocaleString();
                    _this.Logs.unshift(new LogItem(time, _this.type, _this.input));
                    _this.type = '';
                    _this.input = '';
                    _this.msg = '';
                    _this.methods.save();
                    if (null != _this.historyChanged) {
                        _this.historyChanged();
                    }
                }
                else {
                    _this.msg = '※ ドロップダウンで種別を選択してください．';
                }
            },
            removeItem: function (item) {
                var indexOf = _this.Logs.indexOf(item);
                _this.Logs.splice(indexOf, 1);
                _this.methods.save();
                if (null != _this.historyChanged) {
                    _this.historyChanged();
                }
            },
            filterSelection: function (items) {
                var filterd = [];
                items.forEach(function (item) {
                    if (item.Checked) {
                        filterd.push(item);
                    }
                });
                return filterd;
            },
            filterLogs: function (logs) {
                var filterd = [];
                logs.forEach(function (log) {
                    var time = log.Time;
                    var logDate = new Date(time);
                    var nowDate = new Date(Date.now());
                    if (logDate.getUTCFullYear() === nowDate.getUTCFullYear() &&
                        logDate.getUTCMonth() === nowDate.getUTCMonth() &&
                        logDate.getUTCDay() === nowDate.getUTCDay()) {
                        filterd.push(log);
                    }
                });
                return filterd;
            },
            load: function () {
                var json = localStorage.getItem(LOCAL_KEY_HISTORY) || '';
                if (!isEmpty(json)) {
                    var logs = JSON.parse(json);
                    var length_2 = _this.Logs.length;
                    for (var i = 0; i < length_2; i++) {
                        _this.Logs.pop();
                    }
                    logs.forEach(function (log) {
                        _this.Logs.push(log);
                    });
                }
            },
            save: function () {
                localStorage.setItem(LOCAL_KEY_HISTORY, JSON.stringify(_this.Logs));
            }
        };
        this.selection = selection;
    }
    return AppViewModel;
}());
var App = /** @class */ (function () {
    function App(el, selection) {
        this.model = new AppViewModel(selection);
        this.appVue = new vue_1.default({
            el: el,
            data: this.model,
            methods: this.model.methods,
        });
    }
    return App;
}());
var HistoryViewModel = /** @class */ (function () {
    function HistoryViewModel(appVue) {
        var _this = this;
        this.ShowCount = "100";
        this.search = '';
        this.methods = {
            removeItem: function (item) {
                var indexOf = _this.Logs.indexOf(item);
                _this.Logs.splice(indexOf, 1);
                _this.methods.save();
            },
            filter: function (logs) {
                var filterd = [];
                var _loop_1 = function (i) {
                    var log = logs[i];
                    if (!isEmpty(_this.search)) {
                        var words = _this.search.split(' ');
                        var result = words.every(function (word) {
                            var regex = new RegExp(word || '');
                            return (regex.test(log.Time) ||
                                regex.test(log.Type) ||
                                regex.test(log.Memo));
                        });
                        if (result === true) {
                            filterd.push(log);
                        }
                    }
                    else {
                        filterd.push(log);
                    }
                };
                for (var i = 0; i < logs.length && filterd.length < Number(_this.ShowCount); i++) {
                    _loop_1(i);
                }
                return filterd;
            },
            save: function () {
                _this.App.model.methods.save();
            }
        };
        this.App = appVue;
        this.Logs = appVue.model.Logs;
        var now = new Date(Date.now());
        this.search = String(now.getUTCFullYear()) + '/' + String(now.getUTCMonth() + 1);
        if (100 < this.Logs.length) {
            this.ShowCount = "100";
        }
        else {
            this.ShowCount = String(this.Logs.length);
        }
    }
    return HistoryViewModel;
}());
var History = /** @class */ (function () {
    function History(el, appVue) {
        this.model = new HistoryViewModel(appVue);
        this.appVue = new vue_1.default({
            el: el,
            data: this.model,
            methods: this.model.methods,
        });
    }
    return History;
}());
var DataViewModel = /** @class */ (function () {
    function DataViewModel(appVue, selectionVue) {
        var _this = this;
        this.ItemList = 'ccc';
        this.HistoryList = '';
        this.methods = {
            setData: function () {
                _this.ItemList = JSON.stringify(_this.selectionVue.model.options);
                _this.HistoryList = JSON.stringify(_this.appVue.model.Logs);
            },
            remove: function () {
                if (window.confirm('データを初期化しますか?')) {
                    removeArray(_this.appVue.model.Logs);
                    removeArray(_this.selectionVue.model.options);
                    localStorage.setItem(LOCAL_KEY_HISTORY, '');
                    localStorage.setItem(LOCAL_KEY_ITEMS, '');
                    _this.methods.setData();
                }
            },
            copy: function (settingId) {
                var element = document.getElementById(settingId);
                if (null != element) {
                    var input = element;
                    input.select();
                    document.execCommand('copy');
                }
            },
            updateData: function () {
                localStorage.setItem(LOCAL_KEY_ITEMS, _this.ItemList);
                localStorage.setItem(LOCAL_KEY_HISTORY, _this.HistoryList);
                removeArray(_this.appVue.model.Logs);
                removeArray(_this.selectionVue.model.options);
                _this.appVue.model.methods.load();
                _this.selectionVue.model.methods.load();
                _this.methods.setData();
            }
        };
        this.appVue = appVue;
        this.selectionVue = selectionVue;
        this.methods.setData();
        this.selectionVue.model.selectionChanged = this.methods.setData;
        this.appVue.model.historyChanged = this.methods.setData;
    }
    return DataViewModel;
}());
var DataApp = /** @class */ (function () {
    function DataApp(el, appVue, selectionVue) {
        this.model = new DataViewModel(appVue, selectionVue);
        this.appVue = new vue_1.default({
            el: el,
            data: this.model,
            methods: this.model.methods,
        });
    }
    return DataApp;
}());
var selection = new Selection('#selection');
selection.model.methods.load();
if (0 == selection.model.options.length) {
    selection.model.options.push(new SelectionItem("出勤"));
    selection.model.options.push(new SelectionItem("退勤"));
    selection.model.options.push(new SelectionItem("家->会社"));
    selection.model.options.push(new SelectionItem("会社<-家"));
    selection.model.options.push(new SelectionItem("給油"));
}
var app = new App("#app", selection);
app.model.methods.load();
var history_ = new History('#history', app);
var dataApp = new DataApp('#data', app, selection);
//# sourceMappingURL=index.js.map