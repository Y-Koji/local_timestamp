"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = __importDefault(require("vue"));
let app = new vue_1.default({
    el: '#app',
    data: {
        input: '',
        messages: [],
    },
    methods: {
        addItem: function () {
            this.messages.push({ text: this.input, timestamp: new Date().toLocaleString() });
            this.input = '';
        },
    },
});
const a = 20;
const b = 30;
const c = a + b + 1;
