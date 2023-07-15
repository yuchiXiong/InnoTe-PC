import { IDirectory } from '@/services/directory';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { showTitle } from '@/utils';
import React, { useEffect, useRef } from 'react';
import Vditor from 'vditor';
import "vditor/dist/index.css";

export type TEditorFile = Exclude<IDirectory, 'name'> & { content: string }

interface IEditorProps {
  file: TEditorFile
}

const Editor = (props: IEditorProps) => {

  const { file } = props;
  const articleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!articleRef.current) return;
    if (!containerRef) return;

    new Vditor(articleRef.current, {
      cache: {
        enable: false,
      },
      value: file.content,
      image: {
        isPreview: true,
        preview: (bom: Element): void => {
          console.log('preview')
          console.log(bom);
        }
      },
      preview: {
        actions: [],
        markdown: {
          linkPrefix: 'https://asset.localhost/' + encodeURIComponent('D:\\code\\wolai_export\\markdown\\'),
        },
      }

    });

  }, []);


  return (
    <div className='box-border flex flex-col w-full h-screen overflow-auto' ref={containerRef}>
      <h4 className='py-2 mx-4 text-3xl font-medium '>{showTitle(file.name)}</h4>
      <article className='flex-1' ref={articleRef} />
    </div>
  )
}

export default Editor;
