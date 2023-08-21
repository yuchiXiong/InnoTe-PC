import React, { useMemo } from 'react'
import { convertFileSrc } from "@tauri-apps/api/tauri";
import NotoEditor from "@/components/NotoEditor";

interface IDirectoryProps {
  filePath: string,
  updateFileName: (oldPath: string, newPath: string, cb?: () => void) => void
}

const Preview = (props: IDirectoryProps) => {
  const { filePath, updateFileName } = props;

  const suffix = filePath.split('.').pop()?.toLowerCase() || '';

  const src = convertFileSrc(filePath);

  return useMemo(() => {
    switch (suffix) {
      case 'jpg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'jpeg':
        return (<div className='box-border flex items-center justify-center w-full h-full p-8 overflow-auto'>
          <img className='max-h-full shadow-2xl' src={src} alt={file.name}/>
        </div>);
      case 'md':
        return (<NotoEditor filePath={filePath} updateFileName={updateFileName}/>)
      default:
        return (<div>暂不支持该文件预览</div>);
    }
  }, [filePath]);
}

export default Preview;