# API

## `api.alert(...)`
shows an alert dialog with a message, example: `api.alert('hello world')`

## `api.register(...)`
Register a new operation (**op**) to perform a specific task. An op can have its own `ui`.

```javascript
    api.register({name: "LUT", ui: [ {"apply LUT": {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}}
                                   ]
    })
```

```python
    api.register(name="LUT", ui=[ {"apply LUT": {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'} } ])
```

The following version works for both Javascript and Python:
```javascript
api.register({"name":"LUT", "ui":"apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}"})
```

By default, all ops of a plugin will call its `run` function defined in the plugin.
You can use `my._op` in the `run` function to differentiate which op was called.

Alternatively, you can define another `Plugin API` function which will be used
when the op is called with the `run` tag when calling `api.register`. For example, you can add  `"run": this.hello` in a Javascript plugin or `"run": self.hello` in a Python plugin if `hello` is a member function of the plugin class.  **Note:** the function must be a member of the plugin class or being exported (with `api.export`) as a `Plugin API` function. This is because a arbitrary function transfered by ImJoy will be treated as `callback` function, thus only allowed to run once.

If you want to run a function whenever any option is changed, you can pass a `update` function. Similar to `run`, you need to pass a function from the member of the plugin class. Here is an example defining `run` and `update` in Python:

```python
class PythonPlugin():
  def apply_lut(self, my):
    ...
  def lut_updated(self, my):
    ...
  def setup(self):
    ...
    api.register(name="LUT",
                 ui="apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}",
                 run=self.apply_lut,
                 update=self.lut_updated)
    ...
```

If you want to change your interface dynamically, you can run `api.register`
multiple times to overwrite the previous version.

`api.register` can also be used to overwrite the default ui string of the plugin
defined in `<config>`, just set the plugin name as the op name.

## `api.createWindow(...)`
create a new window and add it to the workspace.

```javascript
const window_callback = (windowId)=>{
  //use `windowId` here to access the window
  console.log(windowId)
}
api.createWindow({name: 'new window', type: 'Image Window', w:7, h:7, data: {image: ...}, config: {}}).then(window_callback)
```

```python
def window_callback(windowId):
  # use `windowId` here to access the window
  print(windowId)
api.createWindow({name: 'new window', type: 'Image Window', w:7, h:7, data: {image: ...}, config: {}}).then(window_callback)
```

If you do not want the window to load immediately, you can add `click2load: true` and the window will ask for an extra click to load the content.

Once an window is created, it will return a window ID, which can be used for updating the window with `api.updateWindow`.

## `api.updateWindow(...)`
update an existing window, an window ID should be passed in order to perform the update, example:

```javascript
api.updateWindow({id: windowId, data: {image: ...}})
```

```python
api.updateWindow({'id': windowId, 'data': {'image': ...}})
```

The second parameter is an object contains fields which the plugin wants to update.

## `api.showDialog(...)`
show a dialog with customized GUI, example:

```javascript
   api.showDialog({
      "name": "This is a dialog",
      "ui": "Hey, please select a value for sigma: {id:'sigma', type:'choose', options:['1', '3'], placeholder: '1'}.",
   }).then((result)=>{

   })
```
## `api.showProgress(...)`
update the progress bar on the Imjoy GUI, example: `api.showProgress(85)`

## `api.showStatus(...)`
update the status text on the Imjoy GUI, example: `api.showStatus('processing...')`

## `api.showSnackbar(...)`
show a quick message with a snackbar and disappear in a few seconds, example: `api.showSnackbar('processing...', 5)`

## `api.showPluginProgress(...)`
update the progress bar of the current plugin (in the plugin menu), example: `api.showPluginProgress(85)`

## `api.showPluginStatus(...)`
update the status text of the current plugin (in the plugin menu), example: `api.showPluginStatus('processing...')`

## `api.showFileDialog(...)`
show a file dialog to select files or directories. It accept the following options:
 * `type` the mode of file dialog: `file` (default) to select one or multiple files; `directory` to select one or multiple directories. For Python plugins, if you don't specify the type, both file or directory can be selected.
 * `title` the title of the dialog.
 * `root` the initial path for the dialog to show. Note: for Python plugins on Windows, you may want to define the path string as raw string using `r"xxxxxx"` syntax, we have encountered unrecognized path issue with normal strings.
 * `mode` two modes are supported. By default, the user can select a single or multiple file (with the `shift` key pressed). If you want to force the dialog to return multiple files or directories in an array or list, set `mode` to `"multiple"`, or you can force it to return only a single file or directory by setting `mode` to `"single"`, if you want to support both, you can explicitly set `mode` to `"single|multiple"` or keep the default setting.
 * `uri_type` choose the type for return between `"url"` or `"path"`. The default value for JavaScript plugins is `"url"` and for Python plugins is `"path"`.

Since the file handling is different in the browser environment and Python, this api have different behavior when called from different types of plugin. In Javascrpt and Python, an Imjoy file dialog will be displayed, it will only return a promise from which  you can get the file path string.

```javascript
api.showFileDialog().then((file)=>{
  console.log(file)
})
```

```python
def print_path(path):
  print(path)
api.showFileDialog().then(print_path)
```

## `api.run(...)`
run another plugin by specifying its name, e.g. `api.run("Python Demo Plugin")` or `api.run("Python Demo Plugin", my)`

## `api.utils`
For Javascript plugins, currently supported functions are:
`api.utils.$forceUpdate` for force refreshing the GUI.

For Python Plugins, currently supported functions are:
`api.utils.kill` for kill a `subprocess` in python.

`api.utils.ndarray` for wrapping ndarray according to ImJoy ndarray format.


## `api.getFileUrl`
Used to generate an url to access a local file or directory path. For example: `api.getFileUrl('~/data/output.png')`, will return something like `http://127.0.0.1:8080/file/1ba89354-ae98-457c-a53b-39a4bdd14941?name=output.png`.

When this function is called, a confirmation dialog will be displayed to obtain the user's permission. This means a JavaScript plugin cannot access the user's file system without notifying the user.

There are two optional parameters `password` and `headers`:
 * `password`: You can specify a password to access the file or folder. For example: `api.getFileUrl('~/data/output.png', password='SECRET_PASSWORD')`.

 * `headers`: By default, the generated url will be served with the header `Content-disposition: inline; filename="XXXXXXXXX.XXX"` for rendering in the browser. If you want to generate a directly downloadable link, you can pass customized `headers`. For example: `headers={'Content-disposition': 'attachment; filename="XXXXXXXXX.XXX"'}` will give you a direct download link. In order to correctly render the file, you may need to pass a `Content-Type` like this:  `headers={'Content-disposition': 'inline; filename="XXXXXXXXX.XXX"', 'Content-Type': 'image/png'}`. If no header is specified, it will use the standard Python library [mimetypes](https://docs.python.org/3/library/mimetypes.html) to guess a MIME type from the file name, if `mimetypes` failed to guess one, the fallback mime type will be `application/octet-stream`.

## `api.getFilePath`
This api function convert an url generated by `api.getFileUrl` into an absolute file path on the file system, which can be further accessed by a Python Plugin.

## `api.setConfig(...)`
Each plugin can store its configurations with `api.setConfig`. With this settings can be stored
and reloaded automatically. For example store a simple number `api.setConfig('sigma', 928)`. You can store numbers ands strings but neither objects/arrays (JS) nor dict/list (Python).

**Note** this is designed for storing small amounts of data, not large object.
Current implementation uses `localStorage` to store settings. Depends on different browsers, most of them can only allow 5M data storage shared by all the plugins and ImJoy app itself.

## `api.getConfig(...)`
Retrieve configurations set by `api.setConfig(...)`. For example in JavaScript you can use `const sigma = await api.getConfig('sigma')` to access previously stored settings named `sigma`.
Notice that `await` is needed because the api function is asynchronous. Alternatively, you can use `Promise` to access it: ` api.getConfig('sigma').then((sigma)=>{ console.log(sigma) })`.

Similarly, for Python, you will need to use callback function to access the result:
```python
def print_sigma(result):
    print(result)

api.getConfig('sigma').then(print_sigma)
```

## `api.getAttachment(...)`
You can store any text data such as base64 encoded images, code and json in the `<attachment>` tag, for example if you have the following tag in the plugin file:
```
<attachment name="att_name">
</attachment>
```

To get the content in JavaScript or Python, you can use `api.getAttachment("att_name")`.

```JavaScript
// JavaScript
api.getAttachment("att_name").then((content)=>{
  console.log(content)
})
```

```python
def callback(content):
    print(content)

api.getAttachment("att_name").then(callback)
```
## `api.TAG` constant
The current tag choosen by the user during installation.

## `api.WORKSPACE` constant
Name of the current workspace.