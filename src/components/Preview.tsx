import React, { useMemo } from 'react'
import { convertFileSrc } from "@tauri-apps/api/tauri";
import NotoEditor, { TEditorFile } from "@/components/NotoEditor";

interface IDirectoryProps {
  file: TEditorFile,
  updateFileName: (oldPath: string, newPath: string, cb?: () => void) => void
}

const Preview = (props: IDirectoryProps) => {
  const { file, updateFileName } = props;


  const suffix = file.path.split('.').pop();

  const src = convertFileSrc(file.path);

  return useMemo(() => {
    switch (suffix) {
      case 'jpg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'jpeg':
        return (<div className='h-full w-full flex justify-center items-center p-8 box-border overflow-auto'>
          <img className='max-h-full shadow-2xl' src={src} alt={file.name}/>
        </div>);
      case 'md':
        return (<NotoEditor filePath={file.path} updateFileName={updateFileName}/>)
      default:
        return (<div>暂不支持该文件预览</div>);
    }
  }, [file]);
}

export default Preview;