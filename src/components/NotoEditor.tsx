import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import '@milkdown/theme-nord/style.css';
import { showTitle } from "@/utils";
import React from "react";
import { writeFile } from "@/actions/file";
import { IDirectory } from "@/services/directory";

export type TEditorFile = Exclude<IDirectory, 'name'> & { content: string }

interface IDirectoryProps {
  file: TEditorFile
}

const MilkdownEditor = (props: IDirectoryProps) => {
  const { file } = props;
  useEditor((root) => {
    return Editor
      .make()
      .config(ctx => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, file.content);

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
