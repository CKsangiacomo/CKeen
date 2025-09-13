"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioShell = exports.studioBus = void 0;
exports.setTheme = setTheme;
exports.setViewport = setViewport;
const react_1 = __importDefault(require("react"));
// Minimal StudioRoot component
const StudioRoot = ({ children }) => {
    return react_1.default.createElement('div', { id: 'studio-root', className: 'studio-shell' }, children);
};
// Minimal event bus stub (no-ops for V0)
exports.studioBus = {
    emit: (_evt) => { },
    on: (_listener) => () => { }
};
// API stubs for V0
function setTheme(_theme) { }
function setViewport(_vp) { }
// Exports
exports.StudioShell = StudioRoot;
exports.default = StudioRoot;
