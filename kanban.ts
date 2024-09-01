import {parseQuery} from "../silverbullet/plug-api/lib/parse_query.ts";
import { YAML, system, markdown } from '../silverbullet/plug-api/syscalls.ts'
import { CodeWidgetContent } from "../silverbullet/plug-api/types.ts";
import { loadPageObject } from "../silverbullet/plugs/template/page.ts";

export async function widget(
  bodyText: string,
  pageName: string
): Promise<CodeWidgetContent>  {
  const config = await system.getSpaceConfig();
  const pageObject = await loadPageObject(pageName);
  try {
    const kanbanConfig:any = await YAML.parse(bodyText);
    const query = await parseQuery(kanbanConfig.query);
    const results = await system.invokeFunction(
      "query.renderQuery",
      query,
      {
        page: pageObject,
        config,
      },
    );
    let templates = {};
    if(kanbanConfig.template){
      for (const item of results) {
        const query = await parseQuery(`task where ref = '${item.ref}' render [[${kanbanConfig.template}]]`)
        const results = await system.invokeFunction(
          "query.renderQuery",
          query,
          {
            page: pageObject,
            config,
          },
        );
        const tree = await markdown.parseMarkdown(results);
        const data = await markdown.renderParseTree(tree);
        templates[item.ref]=data;
      }
    }
    return {
      html: `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jkanban@1.3.1/dist/jkanban.min.css">
      <style>
        html[data-theme=dark] {
          color-scheme: dark;
          --root-background-color: #111;
          --root-color: #fff;
          --top-background-color: #262626;
        }
        html {
          --root-background-color: #fff;
          --root-color: inherit;
          --top-background-color: #e1e1e1;
          --ui-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
        }
        body{
          margin:0;
          background-color:var(--root-background-color);
          color:var(--root-color);
          font-family: var(--ui-font);
        }
        .kanban-board{
          background: var(--top-background-color);
        }
        .kanban-item{
          background: var(--root-background-color);
        }
      </style>
      <div id="kanban"></div>`,
      script: `
      loadJsByUrl("https://cdn.jsdelivr.net/npm/jkanban@1.3.1/dist/jkanban.min.js").then(() => {
        const data = ${JSON.stringify(mapResultsToBoards(results, kanbanConfig.columns, templates))};
        const kanban = new jKanban({
          element: '#kanban',
          boards:data,
          ...${JSON.stringify(kanbanConfig.options||{})}
        });

        updateHeight();
      });
      `
    };
  } catch (e: any) {
    return { markdown: `**Error:** ${e.message}` };
  }
}

export function mapResultsToBoards(results: any, columns: any, templates: any) {
  let finalColums = columns;
  if(!columns){
    finalColums = results.reduce((arr, val)=>{
      if(val.state && !arr.find(a=>a.title === val.state)){
        arr.push({title:val.state});
      }
      return arr;
    }, [])
  }
  return finalColums.map(column=>({
    id:column.id ?? column.title,
    title: column.title,
    class: column.class,
    item: results.filter(i=>i.state === (column.id ?? column.title)).map((item)=>({
      id:item.ref,
      title: templates[item.ref] ?? item.text
    }))
}));
}