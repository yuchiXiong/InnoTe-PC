import React from 'react'
import { IDirectory } from '@/services/directory';
import { Editor as EditorIcon, FolderClose, FolderOpen, Pic } from '@icon-park/react';
import { showTitle } from '@/utils';
import classNames from "classnames";

interface IDirectoryProps {
  dir: IDirectory,
  currentSelectedPath: string,
  currentExpandedPath?: string[],
  currentEditingFilePath: string,
  level?: number
  handleItemClick: (item: IDirectory) => void,
  openContextMenu: (position: { x: number, y: number }, cur: IDirectory) => void,
  updateFileName: (oldPath: string, newPath: string) => void,
  afterRename: () => void
}

const Directory = (props: IDirectoryProps) => {

  const {
    dir,
    currentSelectedPath,
    currentExpandedPath,
    currentEditingFilePath,
    handleItemClick,
    openContextMenu,
    updateFileName,
    afterRename,
    level = 1
  } = props;

  /** 是目录 */
  const isDir = (dir: IDirectory): boolean => 'children' in dir;

  /** 是根目录 */
  const isRoot = (dir: IDirectory): boolean => level === 1 && isDir(dir);

  /** 是否展开 */
  const isExtend = (cur: IDirectory): boolean => currentExpandedPath?.includes(cur.path) || false;

  /** 是否选中 */
  const isSelected = (cur: IDirectory): boolean => cur.path === currentSelectedPath;

  /** 渲染图标 */
  const showIcon = (item: IDirectory) => {
    if (isDir(item)) {
      return currentExpandedPath?.includes(item.path)
        ? <FolderOpen theme="multi-color" size="16" fill={['#f5a623', '#f5a623', '#FFF', '#f5a623']}/>
        : <FolderClose theme="multi-color" size="16" fill={['#f5a623', '#f5a623', '#FFF', '#f5a623']}/>
    }

    const name = item.name.toLowerCase();
    if (name.endsWith('.jpg') ||
      name.endsWith('.png') ||
      name.endsWith('.gif') ||
      name.endsWith('.webp') ||
      name.endsWith('.jpeg')
    ) {
      return <Pic theme="filled" size="17" fill="#50e3c2"/>
    }

    return currentSelectedPath === item.path
      ? <EditorIcon theme="multi-color" size="16" fill={['#48bb78', '#48bb78', '#FFF', '#48bb78']}/>
      : <EditorIcon theme="multi-color" size="16" fill={['#000', '#000', '#FFF', '#000']}/>
  };

  /** 右键菜单 */
  const handleContextMenu = (e: React.MouseEvent, child: IDirectory) => {
    e.preventDefault();
    openContextMenu({
      x: e.clientX,
      y: e.clientY,
    }, child);
  };

  /** 重命名 */
  const handleRename = (e: React.FocusEvent<HTMLInputElement>, curFile: IDirectory) => {
    const value = e.target.value.trim();

    if (!value || value === curFile.name) {
      afterRename();
      return;
    }

    const newPath = curFile.path.replaceAll('\\', '/').split('/').slice(0, -1).join('/') + '/' + value;

    updateFileName(curFile.path, newPath);
    afterRename();
  }

  const isEditing = (child: IDirectory) => child.path === currentEditingFilePath;

  return (
    <ul className='flex flex-col select-none'>
      {(dir.children || []).map((child) => (
        <React.Fragment key={child.path}>
          <li
            className={classNames(
              'flex items-center w-full px-4 py-2 from-zinc-200',
              'backdrop-blur-2xl cursor-pointer transition border',
              isRoot(child) && isExtend(child) && 'border-b border-dashed border-gray-400',
              isSelected(child) && !isEditing(child) ? 'bg-green-100 border-green-300' : 'border-transparent'
            )}
            onClick={() => handleItemClick(child)}
            onContextMenu={e => handleContextMenu(e, child)}
          >
            {showIcon(child)}
            <p
              className={classNames(
                'ml-2 font-sans text-base font-thin line-clamp-1 ',
                isExtend(child) && 'font-medium',
                isSelected(child) && 'text-green-500',
              )}
            >{isEditing(child) ? (
              <input
                className="w-full border rounded border-green-300 outline-none px-1 text-sm leading-5 text-gray-900"
                defaultValue={child.name}
                onBlur={e => handleRename(e, child)}
                onKeyUp={e => e.key === 'Enter' && e.currentTarget.blur()}
                autoFocus={true}
                onFocus={e => e.currentTarget.select()}
              />
            ) : showTitle(child.name)}</p>
          </li>
          {isExtend(child) && isDir(child) && (
            <section className='pl-4'>
              <Directory
                dir={child}
                currentSelectedPath={currentSelectedPath}
                currentExpandedPath={currentExpandedPath}
                currentEditingFilePath={currentEditingFilePath}
                level={level + 1}
                handleItemClick={handleItemClick}
                openContextMenu={openContextMenu}
                updateFileName={updateFileName}
                afterRename={afterRename}
              />
            </section>
          )}
        </React.Fragment>
      ))}
    </ul>
  )
}

export default Directory