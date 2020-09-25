let platform = require('electron-platform');
import { FolderHandler } from './left-column/folder-handler';

if (!platform.isDarwin) {
    const titlebar = document.createElement('div');
    const title = document.createElement('div');
    titlebar.id = 'electron-titlebar';
    titlebar.classList.add('drag');
    title.innerHTML = 'File Sorter';
    title.setAttribute('style', 'top: 5px; left: 5px; position: absolute');
    titlebar.append(title);
    document.body.prepend(titlebar);
    require('electron-titlebar');
}

let folderHandler = new FolderHandler('div.add-folder', 'div.submit-folder');
let displayFolder = document.querySelector('.folder-path');
let folderListRef: SmartHover | null = document.querySelector('.folder-list');

folderHandler.on('submit', () => {
    if (folderHandler.path) {
        addToFolderList(folderHandler.path);
    }
});

folderHandler.on('change', () => {
    if (displayFolder && folderHandler.path) {
        displayFolder.innerHTML = folderHandler.path;
        displayFolder.setAttribute('title', folderHandler.path);
    }
});

if (folderHandler.folders && folderHandler.folders.length > 0) {
    folderHandler.folders.forEach((folder) => {
        addToFolderList(folder);
    })
}

function addToFolderList(folder: string) {
    if (folderListRef && folder) {
        let listElement = createListElement(folder);
        folderListRef.append(listElement);
    }
}

function createListElement(folder: string): Element {
    let element = document.createElement('div');
    element.innerHTML = folder;
    element.classList.add('folder-list-item');
    element.onclick = () => {
        // loadFolder(folder);
    }
    return element;
}

// Define WebComponents
import { SmartHover } from './webcomponents/smart-hover';
window.customElements.define('smart-hover', SmartHover);






