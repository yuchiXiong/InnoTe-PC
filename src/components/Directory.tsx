import React, { useState } from 'react'
import { IDirectory } from '@/services/directory';
import { FolderClose, FolderOpen, Notes } from '@icon-park/react';
import { showTitle } from '@/utils';

interface IDirectoryProps {
  dir: IDirectory,
  handleItemClick: (item: IDirectory, isDirectory: boolean) => void,
  level?: number
}

const Directory = (props: IDirectoryProps) => {

  const { dir, level = 1 } = props;
  const [extendRecord, setExtendRecord] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState<IDirectory | null>(null);

  /** 是目录 */
  const isDir = (dir: IDirectory): boolean => 'children' in dir;

  /** 是根目录 */
  const isRoot = (dir: IDirectory): boolean => level === 1 && isDir(dir);

  /** 是否展开 */
  const isExtend = (dir: IDirectory): boolean => extendRecord[dir.path];

  /** 是否选中 */
  const isSelected = (dir: IDirectory): boolean => current?.path === dir.path;

  /** 渲染图标 */
  const showIcon = (item: IDirectory) => {
    if (!isDir(item))
      return <Notes theme="filled" size="16" fill="#999"/>;
    return extendRecord[item.path]
      ? <FolderOpen theme="filled" size="16" fill="#666"/>
      : <FolderClose theme="filled" size="16" fill="#999"/>;
  };

  const handleItemClick = (item: IDirectory) => {
    props.handleItemClick(item, isDir(item));
    if (isDir(item)) {
      setExtendRecord({
        ...extendRecord,
        [item.path]: !extendRecord[item.path]
      });
    } else {
      setCurrent(item);
    }
  };

  return (
    <ul className='flex flex-col select-none'>
      {(dir.children || []).map((child) => (
        <React.Fragment key={child.path}>
          <li
            className={`flex items-center w-full px-4 py-2 from-zinc-200 
            backdrop-blur-2xl cursor-pointer transition 
            ${isRoot(child) && isExtend(child) && 'border-b border-dashed border-gray-400'}
            `}
            onClick={() => handleItemClick(child)}
          >
            {showIcon(child)}
            <p className={`ml-2 font-sans text-base font-thin line-clamp-1 ${isExtend(child) && 'font-medium'} ${isSelected(child) && 'text-green-500'}`}>{showTitle(child.name)}</p>
          </li>
          {isExtend(child) && isDir(child) && (
            <section className='pl-4'>
              <Directory
                dir={child}
                level={level + 1}
                handleItemClick={handleItemClick}
              />
            </section>
          )}
        </React.Fragment>
      ))}
    </ul>
  )
}

export default Directory