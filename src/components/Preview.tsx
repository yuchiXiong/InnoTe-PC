import React, { useMemo } from 'react'
import { convertFileSrc } from "@tauri-apps/api/tauri";
import InnoTeEditor from "@/components/InnoTeEditor";

interface IDirectoryProps {
  filePath: string,
}

const Preview = (props: IDirectoryProps) => {
  const { filePath } = props;

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
          <img className='max-h-full shadow-2xl' src={src} alt={filePath}/>
        </div>);
      case 'md':
        return (<InnoTeEditor filePath={filePath}/>)
      default:
        return (<div>暂不支持该文件预览</div>);
    }
  }, [filePath]);
}

export default Preview;