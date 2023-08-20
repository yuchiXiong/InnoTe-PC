import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import type { IDirectory } from '@/services/directory';
import Directory from '../components/Directory';
import { TEditorFile } from '@/components/NotoEditor';
import { createFile, getDirectoryContent, renameFile } from '@/actions/file';
import { open } from "@tauri-apps/api/dialog"
import { FileAddition, FolderOpen } from '@icon-park/react';
import { LAST_FOLDER_PATH } from "@/constants";
import Preview from "@/components/Preview";

const inter = Inter({ subsets: ['latin'] });

export default function Home() {

  const [dir, setDirs] = useState<IDirectory>({
    name: '',
    path: '',
    children: []
  });
  const [file, setFile] = useState<TEditorFile>({
    name: '',
    path: '',
    content: ''
  });

  // 当前选中的文件夹路径
  const [currentSelectedPath, setCurrentSelectedPath] = useState<string>('');

  useEffect(() => {
    const lastFolderPath = localStorage.getItem(LAST_FOLDER_PATH);

    if (lastFolderPath) fetchRootDirectory(lastFolderPath);
  }, []);

  /** 点击文件夹或文件 */
  const handleItemClick = (item: IDirectory, isDirectory: boolean) => {
    setCurrentSelectedPath(item.path);
    if (isDirectory) {
      getDirectoryContent(item.path).then((files) => {
        item.children = files.map(file => {
          const obj = {
            name: file.name,
            path: file.path,
            children: file.isDirectory ? [] : undefined
          }

          if (!file.isDirectory) {
            delete obj.children;
          }
          return obj;
        }
        );
        setDirs({ ...dir });
      });
    } else {
      setFile({
        name: item.name,
        path: item.path,
        content: ''
      });
    }
  }

  /** 打开文件夹 */
  const handleOpenDirectory = () => {
    open({
      directory: true,
      recursive: true
    }).then(async (path) => {
      if (!path) return;

      localStorage.setItem(LAST_FOLDER_PATH, path as string);

      const APP_NAME = 'Noto';
      if (typeof window !== "undefined") {
        (await import('@tauri-apps/api/window'))
          .appWindow
          .setTitle(`${path} - ${APP_NAME}`);
      }

      fetchRootDirectory(path as string);
    });
  }

  const handleCreateFile = () => {
    let dirPath = '';
    if (file.path === currentSelectedPath) {
      const lastSlashIndex = file.path.lastIndexOf('\\');
      dirPath = file.path.substring(0, lastSlashIndex);
    } else {
      dirPath = currentSelectedPath;
    }
    createFile(dirPath).then(() => {
      const pathArr = dirPath.replace(dir.path, '').split('\\');
      pathArr.shift();

      let currentDir = dir;
      while ((pathArr.length > 0)) {
        const left = pathArr.shift();
        currentDir = (currentDir.children as IDirectory[]).find(item => item.name === left) as IDirectory
      };

      getDirectoryContent(dirPath).then((files) => {
        currentDir.children = files.map(file => {
          const obj = {
            name: file.name,
            path: file.path,
            children: file.isDirectory ? [] : undefined
          }

          if (!file.isDirectory) {
            delete obj.children;
          }
          return obj;
        }
        );
        setDirs({ ...dir });
      });
    });
  }

  /** 重命名文件 */
  const updateFileName = (oldPath: string, newPath: string) => {
    renameFile(oldPath, newPath).then(res => {
      // 获取修改的文件所在的文件夹绝对路径
      const dirPath = newPath.split('\\').slice(0, -1).join('\\');

      // 获取这个路径相对于 app 根目录的相对路径
      const relativePath = dirPath.replace(dir.path, '');
      // 根据相对路径，找到对应的文件夹对象
      const pathArr = relativePath.split('\\');
      pathArr.shift();
      let currentDir = dir;
      while (pathArr.length > 0) {
        const left = pathArr.shift();
        currentDir = (currentDir.children as IDirectory[]).find(item => item.name === left) as IDirectory
      }

      getDirectoryContent(dirPath).then((files) => {
        currentDir.children = files.map(file => {
          const obj = {
            name: file.name,
            path: file.path,
            children: file.isDirectory ? [] : undefined
          }

          if (!file.isDirectory) {
            delete obj.children;
          }
          return obj;
        }
        );
        setDirs({ ...dir });
        // 更新所选文件
        setFile({
          name: res.split('\\').pop() || '',
          path: res,
          content: ''
        });
        setCurrentSelectedPath(res);
      });
    }
    )
  };

  /** 获取根目录下的文件列表 */
  const fetchRootDirectory = (path: string) => {
    getDirectoryContent(path as string).then((files) => {
      const rootPathName = (path as string).split('\\').pop() || '';
      setDirs({
        name: rootPathName,
        path: path as string,
        children: files.map(file => {
          const obj = {
            name: file.name,
            path: file.path,
            children: file.isDirectory ? [] : undefined
          }

          if (!file.isDirectory) {
            delete obj.children;
          }
          return obj;
        })
      });
      setCurrentSelectedPath(path as string);
    });
  }

  return (
    <main className='flex'>
      <nav className='w-2/12 max-h-screen overflow-auto border'>
        <div className='flex items-center h-8 p-2 border-b'>
          <button
            title='创建文件'
            className='h-8 ml-auto text-gray-500'
            onClick={handleCreateFile}
          >
            <FileAddition theme="filled" size="18" fill="#666" />
          </button>
          <button
            title='打开文件夹'
            className='h-8 ml-2 text-gray-500'
            onClick={handleOpenDirectory}
          >
            <FolderOpen className='' theme="filled" size="18" fill="#666" />
          </button>
        </div>
        {(dir.children?.length || 0) > 0 ? (
          <Directory
            dir={dir}
            currentSelectedPath={currentSelectedPath}
            handleItemClick={handleItemClick}
          />
        ) : (
          <div>
            {/* empty placeholder */}
          </div>
        )}
      </nav>
      <section
        className={`w-10/12 flex h-screen flex-col items-center justify-between ${inter.className}`}
      >
        {file.path ? (
          <Preview
            file={file}
            updateFileName={updateFileName}
          />
        ) : (
          <>
            <div
              className="flex flex-col h-screen justify-center place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
              <Image
                className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
                src="/next.svg"
                alt="Next.js Logo"
                width={180}
                height={37}
                priority
              />
              <p className='mt-2 font-sans text-gray-800'>下面再放一句话显得逼格比较高</p>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
