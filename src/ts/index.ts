
import Vue from "vue"

const isEmpty = function (x: string) { return /^\s*$/g.test(x) }
const removeArray = function (x: Array<any>) {
    const length = x.length
    for (let i = 0; i < length; i++) {
        x.pop()
    }
}
const LOCAL_KEY_ITEMS = 'items'
const LOCAL_KEY_HISTORY = 'app'

class SelectionItem {
    Name: string = ""
    Checked: boolean = true

    constructor(name: string) {
        this.Name = name
    }
}

class SelectionViewModel {
    options: SelectionItem[] = []
    selected = this.options[0]
    search: string = ''
    itemName: string = ''
    msg: string = ''
    selectionChanged: any = null

    constructor() {
    }

    methods = {
        add: () => {
            if (!isEmpty(this.itemName)) {
                this.options.push(new SelectionItem(this.itemName))
                this.itemName = ""
                this.msg = ''
                this.methods.save()

                if (null != this.selectionChanged) {
                    this.selectionChanged();
                }
            } else {
                this.msg = '項目名を入力してください'
            }
        },

        remove: (item: any) => {
            const indexOf = this.options.indexOf(item)
            this.options.splice(indexOf, 1)
            this.methods.save()
            if (null != this.selectionChanged) {
                this.selectionChanged();
            }
        },

        filter: (items: SelectionItem[]) => {
            const filterd: SelectionItem[] = []
            const reg = new RegExp(this.search)
            items.forEach(item => {
                if (reg.test(item.Name)) {
                    filterd.push(item)
                }
            })

            return filterd
        },

        save: () => {
            localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(this.options))
        },

        load: () => {
            const json = localStorage.getItem(LOCAL_KEY_ITEMS) || ''
            if (!isEmpty(json)) {
                const items: SelectionItem[] = JSON.parse(json)
                const length = this.options.length;
                for (let i = 0; i < length; i++) {
                    this.options.pop()
                }

                items.forEach(item => {
                    this.options.push(item)
                })
            }
        }
    }
}

class Selection {
    appVue: Vue
    model: SelectionViewModel = new SelectionViewModel()

    constructor(id: string) {
        this.appVue = new Vue({
            el: id,
            data: this.model,
            methods: this.model.methods
        })
    }
}

class LogItem {
    Time: string
    Type: string
    Memo: string

    constructor(time: string, type: string, memo: string) {
        this.Time = time
        this.Type = type
        this.Memo = memo
    }
}

class AppViewModel {
    Logs = new Array()
    type: string = ''
    input: string = ''
    selection: Selection
    msg: string = ''
    historyChanged: any = null

    constructor(selection: Selection) {
        this.selection = selection
    }

    methods = {
        addItem: () => {
            if (!isEmpty(this.type)) {
                const time = new Date().toLocaleString()
                this.Logs.unshift(new LogItem(time, this.type, this.input))
                this.type = ''
                this.input = ''
                this.msg = ''
                this.methods.save()
                if (null != this.historyChanged) {
                    this.historyChanged()
                }
            } else {
                this.msg = '※ ドロップダウンで種別を選択してください．'
            }
        },

        removeItem: (item: any) => {
            const indexOf = this.Logs.indexOf(item)
            this.Logs.splice(indexOf, 1)
            this.methods.save()
            if (null != this.historyChanged) {
                this.historyChanged();
            }
        },

        filterSelection: (items: SelectionItem[]) => {
            const filterd: SelectionItem[] = []
            items.forEach(item => {
                if (item.Checked) {
                    filterd.push(item)
                }
            })

            return filterd
        },

        filterLogs: (logs: LogItem[]) => {
            const filterd: LogItem[] = []
            logs.forEach(log => {
                const time = log.Time
                const logDate = new Date(time)
                const nowDate = new Date(Date.now())
                if (logDate.getUTCFullYear() === nowDate.getUTCFullYear() &&
                    logDate.getUTCMonth() === nowDate.getUTCMonth() &&
                    logDate.getUTCDay() === nowDate.getUTCDay()) {
                    filterd.push(log)
                }
            });
            return filterd
        },

        load: () => {
            const json = localStorage.getItem(LOCAL_KEY_HISTORY) || ''
            if (!isEmpty(json)) {
                const logs: LogItem[] = JSON.parse(json)
                const length = this.Logs.length
                for (let i = 0; i < length; i++) {
                    this.Logs.pop()
                }
                logs.forEach(log => {
                    this.Logs.push(log)
                });
            }
        },

        save: () => {
            localStorage.setItem(LOCAL_KEY_HISTORY, JSON.stringify(this.Logs))
        }
    }
}

class App {
    appVue: Vue
    model: AppViewModel

    constructor(el: string, selection: Selection) {
        this.model = new AppViewModel(selection)
        this.appVue = new Vue({
            el: el,
            data: this.model,
            methods: this.model.methods,
        })
    }
}

class HistoryViewModel {
    Logs: LogItem[]
    App: App
    ShowCount: string = "100"
    search: string = ''

    constructor(appVue: App) {
        this.App = appVue
        this.Logs = appVue.model.Logs

        const now = new Date(Date.now())
        this.search = String(now.getUTCFullYear()) + '/' + String(now.getUTCMonth() + 1)

        if (100 < this.Logs.length) {
            this.ShowCount = "100"
        } else {
            this.ShowCount = String(this.Logs.length)
        }
    }

    methods = {
        removeItem: (item: any) => {
            const indexOf = this.Logs.indexOf(item)
            this.Logs.splice(indexOf, 1)
            this.methods.save()
        },

        filter: (logs: LogItem[]) => {
            const filterd: LogItem[] = []
            for (let i = 0; i < logs.length && filterd.length < Number(this.ShowCount); i++) {
                const log = logs[i];

                if (!isEmpty(this.search)) {
                    const words = this.search.split(' ')
                    const result = words.every(word => {
                        const regex = new RegExp(word || '')
                        return (regex.test(log.Time) ||
                                regex.test(log.Type) ||
                                regex.test(log.Memo))
                    })

                    if (result === true) {
                        filterd.push(log)
                    }
                } else {
                    filterd.push(log)
                }
            }
            return filterd
        },

        save: () => {
            this.App.model.methods.save()
        }
    }
}

class History {
    appVue: Vue
    model: HistoryViewModel

    constructor(el: string, appVue: App) {
        this.model = new HistoryViewModel(appVue);
        this.appVue = new Vue({
            el: el,
            data: this.model,
            methods: this.model.methods,
        })
    }
}

class DataViewModel {
    ItemList: string = 'ccc'
    HistoryList: string = ''
    selectionVue: Selection
    appVue: App

    constructor(appVue: App, selectionVue: Selection) {
        this.appVue = appVue
        this.selectionVue = selectionVue
        this.methods.setData()
        this.selectionVue.model.selectionChanged = this.methods.setData
        this.appVue.model.historyChanged = this.methods.setData
    }

    methods = {
        setData: () => {
            this.ItemList = JSON.stringify(this.selectionVue.model.options)
            this.HistoryList = JSON.stringify(this.appVue.model.Logs)
        },

        remove: () => {
            if(window.confirm('データを初期化しますか?')) {
                removeArray(this.appVue.model.Logs)
                removeArray(this.selectionVue.model.options)
                localStorage.setItem(LOCAL_KEY_HISTORY, '')
                localStorage.setItem(LOCAL_KEY_ITEMS, '')
                this.methods.setData()
            }
        },

        copy: (settingId: string) => {
            const element = document.getElementById(settingId)
            if (null != element) {
                const input: HTMLInputElement = <HTMLInputElement>element;
                input.select()
                document.execCommand('copy')
            }
        },

        updateData: () => {
            localStorage.setItem(LOCAL_KEY_ITEMS, this.ItemList)
            localStorage.setItem(LOCAL_KEY_HISTORY, this.HistoryList)

            removeArray(this.appVue.model.Logs)
            removeArray(this.selectionVue.model.options)
            this.appVue.model.methods.load()
            this.selectionVue.model.methods.load()
            this.methods.setData()
        }
    }
}

class DataApp {
    appVue: Vue
    model: DataViewModel
    constructor(el: string, appVue: App, selectionVue: Selection) {
        this.model = new DataViewModel(appVue, selectionVue)
        this.appVue = new Vue({
            el: el,
            data: this.model,
            methods: this.model.methods,
        })
    }
}

const selection = new Selection('#selection')
selection.model.methods.load()
if (0 == selection.model.options.length) {
    selection.model.options.push(new SelectionItem("出勤"))
    selection.model.options.push(new SelectionItem("退勤"))
    selection.model.options.push(new SelectionItem("家->会社"))
    selection.model.options.push(new SelectionItem("会社<-家"))
    selection.model.options.push(new SelectionItem("給油"))
}

const app = new App("#app", selection)
app.model.methods.load()

const history_ = new History('#history', app)
const dataApp = new DataApp('#data', app, selection)
