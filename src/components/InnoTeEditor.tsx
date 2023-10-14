import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { commonmark } from '@milkdown/preset-commonmark';
import { prism, prismConfig } from '@milkdown/plugin-prism';
import { gfm } from '@milkdown/preset-gfm';
import { nord } from '@milkdown/theme-nord';
import '@milkdown/theme-nord/style.css';
import 'prism-themes/themes/prism-nord.css'
import React, { useEffect, useState } from "react";
import { getFileContent, writeFile } from "@/actions/file";
import { IDirectory } from "@/services/directory";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import markdown from 'refractor/lang/markdown'
import css from 'refractor/lang/css'
import javascript from 'refractor/lang/javascript'
import typescript from 'refractor/lang/typescript'
import jsx from 'refractor/lang/jsx'
import tsx from 'refractor/lang/tsx';
import python from "refractor/lang/python";
import ruby from "refractor/lang/ruby";
import java from "refractor/lang/java";
import php from "refractor/lang/php";
import go from "refractor/lang/go";
import kotlin from "refractor/lang/kotlin";
import c from "refractor/lang/c";
import rust from "refractor/lang/rust";

export type TEditorFile = Exclude<IDirectory, 'name'> & { content: string }

interface IDirectoryProps {
  filePath: string
}

const MilkdownEditor = ({ file }: { file: TEditorFile }) => {

  const content = file.content;

  useEditor((root) => {
    return Editor
      .make()
      .config(ctx => {

        root.classList.add('h-full');
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, content);

        ctx.set(prismConfig.key, {
          configureRefractor: (refractor) => {
            refractor.register(markdown)
            refractor.register(css)

            // js和ts的别名比较多
            refractor.register(javascript);
            refractor.alias({ javascript: ['js', 'JS', 'JavaScript', 'javascript'] });

            refractor.register(typescript);
            refractor.alias({ typescript: ['ts', 'TS', 'TypeScript', 'typescript'] });

            refractor.register(jsx);
            refractor.register(tsx);

            // other
            refractor.register(python);
            refractor.register(ruby);
            refractor.register(java);
            refractor.register(php);
            refractor.register(go);
            refractor.register(kotlin);
            refractor.register(c);
            refractor.register(rust);
          }
        });

        // 配置视图渲染规则，在渲染图片时添加域名前缀
        ctx.set(editorViewOptionsCtx, {
          nodeViews: {
            image: (node, view, getPos) => {
              const dom: HTMLDivElement = document.createElement('div');
              dom.className = 'max-w-full mx-auto mt-4 w-max';

              const img: HTMLImageElement = document.createElement('img');
              img.alt = node.attrs.alt;
              img.className = 'w-full rounded-md';

              const dirPath = file.path.replaceAll('\\', '/').split('/').slice(0, -1).join('/');
              const path = dirPath + '/' + node.attrs.src;

              // 如果图片路径是网络路径，则不添加域名前缀
              img.src = node.attrs.src.startsWith('http') ? node.attrs.src : convertFileSrc(path);

              dom.appendChild(img);
              // 等待图片加载完成后，把alt属性放到图片下方
              img.onload = () => {
                const id = `IMG_${getPos()}_TITLE`;
                let title = dom.querySelector(id);
                if (title) return;

                title = document.createElement('small');
                title.id = id;
                title.innerHTML = node.attrs.alt;
                title.className = 'block pt-1 mt-4 text-center text-gray-500 border-t border-gray-200 text-md';

                dom.appendChild(title);
              }


              return {
                dom,
                update: (node, decorations) => node.type.name === 'image'
              }
            }
          },
          attributes: { class: 'h-full', spellcheck: 'false' },
        });

        // 监听markdown更新事件，更新文件内容
        ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
          writeFile(file.path, markdown);
        });

      })
      .config(nord)
      .use(commonmark)
      .use(prism)
      .use(gfm)
      .use(listener)
  }, [content, file])

  return <Milkdown />
}


const InnoTeEditor = (props: IDirectoryProps) => {
  const { filePath } = props;

  const [file, setFile] = useState<TEditorFile>({
    path: '',
    name: '',
    content: ''
  });

  useEffect(() => {
    getFileContent(filePath).then(content => {
      const path = filePath.replaceAll('\\', '/').split('/');
      const name = path[path.length - 1];
      setFile({ path: filePath, name, content });
    });
  }, [filePath]);

  return (
    <div className='box-border flex flex-col w-full h-screen overflow-auto'>
      <div className='flex-1 h-full overflow-y-scroll border-t bg-slate-50'>
        <MilkdownProvider>
          <MilkdownEditor file={file} />
        </MilkdownProvider>
      </div>
    </div>

  )
}

export default InnoTeEditor;