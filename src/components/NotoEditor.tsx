import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import '@milkdown/theme-nord/style.css';
import { showTitle } from "@/utils";
import React from "react";
import { writeFile } from "@/actions/file";
import { IDirectory } from "@/services/directory";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export type TEditorFile = Exclude<IDirectory, 'name'> & { content: string }

interface IDirectoryProps {
  file: TEditorFile
}

const MilkdownEditor = (props: IDirectoryProps) => {
  const { file } = props;

  const content = file.content;

  useEditor((root) => {
    return Editor
      .make()
      .config(ctx => {

        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, content);

        // 配置视图渲染规则，在渲染图片时添加域名前缀
        ctx.set(editorViewOptionsCtx, {
          nodeViews: {
            image: (node, view, getPos) => {
              const dom: HTMLDivElement = document.createElement('div');
              dom.className = 'w-max mx-auto max-w-full mt-4';

              const img: HTMLImageElement = document.createElement('img');
              img.alt = node.attrs.alt;
              img.className = 'w-full rounded-md';

              const dirPath = file.path.split('\\').slice(0, -1).join('\\');
              const path = dirPath + '\\' + node.attrs.src;

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
                title.className = 'block text-center text-md text-gray-500 border-t border-gray-200 pt-1 mt-4';

                dom.appendChild(title);
              }


              return {
                dom,
                update: (node, decorations) => node.type.name === 'image'
              }
            }
          }
        });

        ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
          writeFile(file.path, markdown);
        });


      })
      .config(nord)
      .use(commonmark)
      .use(listener)
  }, [])

  return <Milkdown/>
}


const NotoEditor = (props: IDirectoryProps) => {
  const { file } = props;
  return (
    <div className='box-border flex flex-col w-full h-screen overflow-auto'>
      <h4 className='py-2 mx-4 text-3xl font-medium '>{showTitle(file.name)}</h4>
      <div className='flex-1 bg-slate-50 border-t overflow-y-scroll'>
        <MilkdownProvider>
          <MilkdownEditor {...props} />
        </MilkdownProvider>
      </div>
    </div>

  )
}

export default NotoEditor;