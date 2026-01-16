# launch-ide  &middot; [![NPM version](https://img.shields.io/npm/v/launch-ide.svg)](https://www.npmjs.com/package/launch-ide)  [![NPM Downloads](https://img.shields.io/npm/dm/launch-ide.svg)](https://npmcharts.netlify.app/compare/launch-ide?minimal=true) [![MIT-license](https://img.shields.io/npm/l/launch-ide.svg)](https://opensource.org/licenses/MIT) [![GITHUB-language](https://img.shields.io/github/languages/top/zh-lx/launch-ide?logoColor=purple&color=purple)](https://github.com/zh-lx/launch-ide)

Automatically recognize the editor by running processes and open the specified file in it. It is compatible in Windows, MacOS and Linux.

<hr />

## 💡 Why

There are already some tools to open the file in the editor, but `launch-ide` has the following advantages:

- Automatically recognize the editor by running processes, you don't need to configure the editor path.
- Launch the ide by the executable file of the editor, so you don't need to install the command line tools of the editor such as `code`.
- Support for more editors such as VSCode, Cursor, Windsurf, WebStorm, etc.
- Compatible with platforms such as Windows, MacOS, and Linux.
- Compatible for Chinese characters in the file path.

## 🛠️ Installation

```bash
npm i launch-ide
```

## 🚀 Usage

```ts
import { launchIDE } from 'launch-ide';

// Open the file in the current editor and position the cursor at line 10 and column 20
launchIDE({ file: '/Users/zh-lx/Desktop/test.ts', line: 10, column: 20 });

// Open the file with more options
launchIDE({ 
  file: '/Users/zh-lx/Desktop/test.ts', // required: the file path to open
  line: 10, // optional: the line number to position the cursor at
  column: 20, // optional: the column number to position the cursor at
  editor: 'code', // optional: specify the editor with IDE encoding name
});
```

## 📖 Parameters

```ts
interface LaunchIDEParams {
  /**
   * @required
   * @type: string
   * @description: the file path to open
   */
  file: string; 

  /**
   * @optional
   * @type: number
   * @description: the line number to position the cursor at
   */
  line?: number;

  /**
   * @optional
   * @type: number
   * @description: the column number to position the cursor at
   */
  column?: number; 

  /**
   * @optional
   * @type: string
   * @description: specify the editor with IDE encoding name
   */
  editor?: string; 

  /**
   * @optional
   * @type: string
   * @description: when you use the `editor` outside the supported list, you can specify the format of the file to open
   * @default '{file}:{line}:{column}'
   */
  format?: string;

  /**
   * @optional
   * @type: string
   * @description: reuse or open a new window to open the file
   * @default 'auto'
   */
  method?: 'reuse' | 'new' | 'auto';

  /**
   * @optional
   * @type: function
   * @description: callback function when an error occurs
   */
  onError?: (file: string, error: string) => void;

  /**
   * @optional
   * @type: string
   * @description: Whether to guess the editor by the process id. When you use pid, the accuracy of the editor is higher, but the performance is lower.
   * @default false
   */
  usePid?: boolean;

  /**
   * @optional
   * @type: string
   * @description: The ways to launch the editor. exec: opening editor using the executable path; open: opening editor using the open command. Only effective on MacOS and these editors: code/cursor/windsurf/qoder/comate/trae/codebuddy/antigravity/kiro/codium
   * @default exec
   */
  type?: 'exec' | 'open';
}
```


## 🎨 Supported editors


<table>
    <tr>
        <th>IDE</th>
        <th>IDE Encoding Name</th>
        <th>MacOS</th>
        <th>Windows</th>
        <th>Linux</th>     
    </tr>
    <tr>
        <td><a href="https://code.visualstudio.com/" target="_blank">Visual Studio Code</a></td>
        <td>code</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.cursor.com/" target="_blank">Cursor</a></td>
        <td>cursor</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://codeium.com/windsurf" target="_blank">Windsurf</a></td>
        <td>windsurf</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.trae.ai/" target="_blank">Trae</a></td>
        <td>trae</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://qoder.com/" target="_blank">Qoder</a></td>
        <td>qoder</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.codebuddy.ai/" target="_blank">CodeBuddy</a></td>
        <td>codebuddy</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://antigravity.google/" target="_blank">Antigravity</a></td>
        <td>antigravity</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://comate.baidu.com/" target="_blank">comate</a></td>
        <td>comate</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://insiders.vscode.dev/" target="_blank">VSCode Insiders</a></td>
        <td>code-insiders</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://vscodium.com/" target="_blank">VSCodium</a></td>
        <td>codium</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.jetbrains.com/webstorm/" target="_blank">WebStorm</a></td>
        <td>webstorm</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://atom-editor.cc/" target="_blank">Atom</a></td>
        <td>atom</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.dcloud.io/hbuilderx.html" target="_blank">HBuilderX</a></td>
        <td>hbuilder</td>
        <td>✅</td>
        <td>✅</td>
        <td></td>
    </tr>
    <tr>
        <td><a href="https://www.jetbrains.com/phpstorm/" target="_blank">PhpStorm</a></td>
        <td>phpstorm</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.jetbrains.com/pycharm/" target="_blank">Pycharm</a></td>
        <td>pycharm</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.jetbrains.com/idea/" target="_blank">IntelliJ IDEA</a></td>
        <td>idea</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://brackets.io/" target="_blank">Brackets</a></td>
        <td>brackets</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.jetbrains.com/objc/" target="_blank">Appcode</a></td>
        <td>appcode</td>
        <td>✅</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td><a href="https://atom-editor.cc/beta/" target="_blank">Atom Beta</a></td>
        <td>atom-beta</td>
        <td>✅</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td><a href="https://www.jetbrains.com/clion/" target="_blank">Clion</a></td>
        <td>clion</td>
        <td>✅</td>
        <td>✅</td>
        <td></td>
    </tr>
    <tr>
        <td><a href="https://www.jetbrains.com/rider/" target="_blank">Rider</a></td>
        <td>rider</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.jetbrains.com/ruby/" target="_blank">Rubymine</a></td>
        <td>rubymine</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.gnu.org/software/emacs/" target="_blank">Emacs</a></td>
        <td>emacs</td>
        <td></td>
        <td></td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://www.sublimetext.com/" target="_blank">Sublime Text</a></td>
        <td>sublime</td>
        <td>✅</td>
        <td>✅</td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://notepad-plus-plus.org/download/v7.5.4.html" target="_blank">Notepad++</a></td>
        <td>notepad</td>
        <td></td>
        <td>✅</td>
        <td></td>
    </tr>
    <tr>
        <td><a href="http://www.vim.org/" target="_blank">Vim</a></td>
        <td>vim</td>
        <td></td>
        <td></td>
        <td>✅</td>
    </tr>
    <tr>
        <td><a href="https://zed.dev/" target="_blank">Zed</a></td>
        <td>zed</td>
        <td>✅</td>
        <td>✅</td>
        <td></td>
    </tr>
</table>

## Which editor supports to be launched by `open`?

On macOS, some editors support opening with `open`. Taking VSCode as an example: `open "vscode://file/xxx/yy/main.jsx:10:20"`. This method opens the editor quickly and provides a good experience, so it is strongly recommended that users set `type: 'open'` when using following editors:
- vscode
- cursor
- windsurf
- antigravity
- qoder (Not CN version)
- comate (Not CN version)
- trae (Not CN version)
- codebuddy (Not CN version)


## ✍️ Custom editor

There are two ways to specify the editor:

1. Specify the editor with IDE encoding name in `launchIDE`.

  ```ts
  launchIDE({ 
    file: '/Users/zh-lx/Desktop/test.ts', 
    line: 10,
    column: 20,
    editor: 'cursor' 
  });
  ```

2. Specify the editor with IDE encoding name in `.env.local` file by `CODE_EDITOR`.

  ```bash
  CODE_EDITOR=cursor
  ```


If you use the editor outside the supported list, you can specify the editor by its executable file path, please refer to [Other Editor](https://inspector.fe-dev.cn/en/guide/ide.html#other-ides).
