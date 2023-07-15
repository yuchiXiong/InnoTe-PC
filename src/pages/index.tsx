import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import { getDirectory, getFile } from '@/services/directory';
import type { IDirectory } from '@/services/directory';
import Directory from './components/Directory';
import Editor, { TEditorFile } from './components/Editor';
import { greet } from '@/actions';
import { getFileContent } from '@/actions/file';

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

  useEffect(() => {
    getDirectory().then((dir) => {
      setDirs(dir);
    });
  }, []);

  const handleItemClick = (item: IDirectory) => {
    const localPath = "D:\\code\\wolai_export\\" + item.path.substring(2).replace(/\//g, "\\");
    getFileContent(localPath).then((res) => {
      setFile({
        name: item.name,
        path: item.path,
        content: res
      });
    });
  }

  return (
    <main className='flex'>
      <nav className='w-2/12 max-h-screen overflow-auto border'>
        <Directory
          dir={dir}
          handleItemClick={handleItemClick}
        />
      </nav>
      <section
        className={`w-10/12 flex min-h-screen flex-col items-center justify-between ${inter.className}`}
      >
        {file.path ? (
          <Editor file={file} key={file.path} />
        ) : (
          <>
            <div className="flex flex-col h-screen justify-center place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
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
