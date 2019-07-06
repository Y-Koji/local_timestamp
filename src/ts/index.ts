
import Vue from "vue"

const isEmpty = function (x: string) { return /^\s*$/g.test(x) }

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

    methods = {
        add: () => {
            if (!isEmpty(this.itemName)) {
                this.options.push(new SelectionItem(this.itemName))
                this.itemName = ""
                this.msg = ''
                this.methods.save()
            } else {
                this.msg = '項目名を入力してください'
            }
        },

        remove: (item: any) => {
            const indexOf = this.options.indexOf(item)
            this.options.splice(indexOf, 1)
            this.methods.save()
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
            localStorage.setItem('items', JSON.stringify(this.options))
        },

        load: () => {
            const json = localStorage.getItem('items') || ''
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

    constructor() {
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
            } else {
                this.msg = '※ ドロップダウンで種別を選択してください．'
            }
        },

        removeItem: (item: any) => {
            const indexOf = this.Logs.indexOf(item)
            this.Logs.splice(indexOf, 1)
            this.methods.save()
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

        load: () => {
            const json = localStorage.getItem('app') || ''
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
            localStorage.setItem('app', JSON.stringify(this.Logs))
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
                    if (-1 != log.Time.indexOf(this.search) ||
                        -1 != log.Type.indexOf(this.search) ||
                        -1 != log.Memo.indexOf(this.search)) {
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

const history = new History("#history", app)
