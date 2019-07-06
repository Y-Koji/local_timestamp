"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = __importDefault(require("vue"));
var isEmpty = function (x) { return /^\s*$/g.test(x); };
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
        this.methods = {
            add: function () {
                if (!isEmpty(_this.itemName)) {
                    _this.options.push(new SelectionItem(_this.itemName));
                    _this.itemName = "";
                    _this.msg = '';
                    _this.methods.save();
                }
                else {
                    _this.msg = '項目名を入力してください';
                }
            },
            remove: function (item) {
                var indexOf = _this.options.indexOf(item);
                _this.options.splice(indexOf, 1);
                _this.methods.save();
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
                localStorage.setItem('items', JSON.stringify(_this.options));
            },
            load: function () {
                var json = localStorage.getItem('items') || '';
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
        this.methods = {
            addItem: function () {
                if (!isEmpty(_this.type)) {
                    var time = new Date().toLocaleString();
                    _this.Logs.unshift(new LogItem(time, _this.type, _this.input));
                    _this.type = '';
                    _this.input = '';
                    _this.msg = '';
                    _this.methods.save();
                }
                else {
                    _this.msg = '※ ドロップダウンで種別を選択してください．';
                }
            },
            removeItem: function (item) {
                var indexOf = _this.Logs.indexOf(item);
                _this.Logs.splice(indexOf, 1);
                _this.methods.save();
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
            load: function () {
                var json = localStorage.getItem('app') || '';
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
                localStorage.setItem('app', JSON.stringify(_this.Logs));
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
                for (var i = 0; i < logs.length && filterd.length < Number(_this.ShowCount); i++) {
                    var log = logs[i];
                    if (!isEmpty(_this.search)) {
                        if (-1 != log.Time.indexOf(_this.search) ||
                            -1 != log.Type.indexOf(_this.search) ||
                            -1 != log.Memo.indexOf(_this.search)) {
                            filterd.push(log);
                        }
                    }
                    else {
                        filterd.push(log);
                    }
                }
                return filterd;
            },
            save: function () {
                _this.App.model.methods.save();
            }
        };
        this.App = appVue;
        this.Logs = appVue.model.Logs;
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
var history = new History("#history", app);
