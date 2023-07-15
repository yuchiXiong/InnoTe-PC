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

    console.log('init editor')
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
        transform: (html: string): string => {

          // 找到所有的图片标签，使用convertFileSrc转换为可访问的本地路径
          const imgReg = /<img.*?(?:>|\/>)/gi;
          const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
          const arr = html.match(imgReg);
          if (arr) {
            for (let i = 0; i < arr.length; i++) {
              const src = arr[i].match(srcReg);
              if (src && src[1]) {
                const fileStartIndex = file.path.lastIndexOf('\\');
                const rootPath = file.path.replace(/[^\/]*$/, '').substring(fileStartIndex + 1);
                const localPath = "D:\\code\\wolai_export\\" + rootPath + src[1].replace(/\//g, "\\");
                html = html.replace(src[1], convertFileSrc(localPath));
              }
            }
          }

          return html;
        }
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
