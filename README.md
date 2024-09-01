
# Silver Bullet kanban plug

## Installation
Run the {[Plugs: Add]} command and paste in: `github:dandimrod/silverbullet-kanban/kanban.plug.js`

That's all!

## Use
Create some tasks:
```md
 * [TODO]  help with things 📅 2022-11-26 #test [user:test] 
 * [ON GOING] help
```
Create a kanban:

    ```kanban
    query:
        task where page = @page.name
    ```

And move your cursor outside of the block to live preview it!

## API

### query
You can access different tasks through queries. These queries are the same as other live queries in silverbullet


    ```kanban
    query:
        task where page = @page.name
    ```
### template
You can change how the text gets displayed on the kanban by using a template. For example create a page called template with the contents:

```
{{name}}
{{user}}
```

And with the kanban:

```kanban
template:
  template
query:
  task where page = @page.name
```

### columns
You can change the default columns like this (The columns will be displayed in that order and with the different text):
```kanban
query:
  task where page = @page.name
columns:
  - id: TODO
    title: ToDo
  - id: ON GOING
    title: On Going
  - id: DONE
    title: Done
```
### options:

You can change any of the options as shown in the [jkanban documentation](https://github.com/riktar/jkanban?tab=readme-ov-file#usage) by using the option parameter:

```kanban
query:
  task where page = @page.name
options:
  dragItems: false
  dragTables: false
```

**Note:** [jkanban](https://github.com/riktar/jkanban) itself is not bundled with this plug, it pulls the JavaScript, CSS and fonts from the JSDelivr CDN.

## Build
Assuming you have Deno and Silver Bullet installed, and you have silverbullet on a sibling folder to this plugin simply build using:

```shell
deno task build
```

Or to watch for changes and rebuild automatically

```shell
deno task watch
```

Then, load the locally built plug, add it to your `PLUGS` note with an absolute path, for instance:

```
- file:/Users/you/path/to/kanban.plug.json
```

And run the `Plugs: Update` command in SilverBullet.

## TODO

Update, edit and add tasks directly from the kanban.
Improve types