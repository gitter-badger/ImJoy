import { compareVersions } from "./utils.js";

import Ajv from "ajv";
const ajv = new Ajv();

ajv.addKeyword("instanceof", {
  compile: function(Class) {
    return function(data) {
      if (Array.isArray(Class)) {
        let match = false;
        for (let c of Class) {
          if (data instanceof c) {
            match = true;
            break;
          }
        }
        return match;
      } else {
        return data instanceof Class;
      }
    };
  },
});

export const CONFIGURABLE_FIELDS = [
  "env",
  "requirements",
  "dependencies",
  "icon",
  "ui",
  "type",
  "flags",
  "cover",
];

export function upgradePluginAPI(config) {
  if (compareVersions(config.api_version, "<=", "0.1.1")) {
    config.type = config.type || config.mode;
    delete config.mode;
    if (config.type === "pyworker") {
      config.type = "native-python";
    } else if (config.type === "webworker") {
      config.type = "web-worker";
    } else if (config.type === "webpython") {
      config.type = "web-python";
    }
  }
  return config;
}

export const PLUGIN_SCHEMA = ajv.compile({
  properties: {
    _id: { type: ["null", "string"] },
    name: { type: "string" },
    code: { type: "string" },
    lang: { type: ["null", "string"] },
    script: { type: ["null", "string"] },
  },
});

export const BACKEND_SCHEMA = ajv.compile({
  properties: {
    type: { type: "string" },
    name: { type: "string" },
    lang: { type: "string" },
    icon: { type: ["null", "string"] },
    connection: {},
  },
});

export const JOY_SCHEMA = ajv.compile({
  properties: {
    name: { type: "string" },
    type: { type: "string" },
    init: { type: ["null", "string", "array", "object"] },
  },
});

export const WINDOW_SCHEMA = ajv.compile({
  properties: {
    name: { type: "string" },
    type: { type: "string" },
    config: { type: ["null", "object"] },
    data: { type: ["null", "number", "string", "array", "object"] }, //attachments: {}
    panel: { type: ["null", "object"] },
  },
});

export const OP_SCHEMA = ajv.compile({
  properties: {
    name: { type: "string" },
    type: { type: "string" },
    ui: { type: ["null", "string", "array", "object"] },
    run: { instanceof: Function },
    inputs: { type: ["null", "object"] },
    outputs: { type: ["null", "object"] },
  },
});

export const ENGINE_FACTORY_SCHEMA = ajv.compile({
  properties: {
    name: { type: "string" },
    type: { enum: ["engine-factory"] },
    config: { type: "object" },
    addEngine: { instanceof: Function },
    removeEngine: { instanceof: Function },
  },
});

export const ENGINE_SCHEMA = ajv.compile({
  properties: {
    name: { type: "string" },
    type: { enum: ["engine"] },
    pluginType: { type: "string" },
    url: { type: "string" },
    config: { type: "object" },
    show: { instanceof: Function },
    listPlugins: { instanceof: Function },
    startPlugin: { instanceof: Function },
    getPlugin: { instanceof: [Function] },
    getInfo: { instanceof: [Function] },
    killPlugin: { instanceof: [Function, null] },
    restartPlugin: { instanceof: [Function, null] },
  },
});

export const FILE_MANAGER_SCHEMA = ajv.compile({
  properties: {
    name: { type: "string" },
    type: { type: "string" },
    list: { instanceof: Function },
  },
});
