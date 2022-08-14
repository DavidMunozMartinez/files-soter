import { remote } from "electron";
import { FileSorter, IMovedFileData } from "../../file-sorter";
import { NotificationComponent } from "../../notification-component/notification-component";
import { CategoriesHandler } from "../../right-column/categories-handler/categories-handler";
import { SectionHandler } from "../../sections-handler";
import { Utils } from "../../utils";
import path from "path";
import { Bind } from "bindrjs";

export class FolderHandler extends SectionHandler {
  categoriesHandler: CategoriesHandler;
  fileSorter: FileSorter;
  notificationService: NotificationComponent;
  utils: Utils;
  listReady: boolean = false;
  folders: { [key: string]: HTMLElement } = {};
  foldersData: any;

  constructor(
    fileSorter: FileSorter,
    utils: Utils,
    notificationService: NotificationComponent
  ) {
    super(".column.left-column", ".folder-list", ".folder-list-item");

    let folders = this.getFolders();
    let bindFolders = Object.keys(folders).map((key: string) => {
      folders[key].name = key;
      return folders[key];
    });

    const FolderHandlerBinds: any = new Bind({
      id: "folder-handler",
      template: require("./folder-handler.html"),
      bind: {
        selected: null,
        folders: bindFolders,
        dragging: false,
        sortFolder: (folder: any) => {
          this.sortFolder(folder.name, () => {});
        },
        toggleFolderWatcher: (event: any, folder: any) => {
          if (folders[folder.name]) {
            folder.active = !folder.active;
            folders[folder.name].active = folder.active;
            localStorage.setItem("folders", JSON.stringify(folders));
            this.fileSorter.updateFoldersData();
          }
          event.stopImmediatePropagation();
        },
        selectFolder: (folder: any) => {
          FolderHandlerBinds.bind.selected = folder.name;
          this.categoriesHandler.enable(folder.name);
        },
        removeFolder: (folder: any) => {
          const value = folder.name;
          if (value) {
            this.delete(value);
          }
          let index = FolderHandlerBinds.bind.folders.indexOf(folder);
          FolderHandlerBinds.bind.folders.splice(index ,1);
          if (FolderHandlerBinds.bind.folders.length === 0) {

          } else if (value) {
            if (FolderHandlerBinds.bind.folders[index]) {
              FolderHandlerBinds.binds.selectFolder(FolderHandlerBinds.bind.folders[index]);
            } else {
              FolderHandlerBinds.binds.selectFolder(FolderHandlerBinds.bind.folders[index - 1]);
            }
          }
        },
        openFolderDialog: () => {
          this.folderDialog();
        },
        showFoldersHelp: () => {
          this.notificationService.showConsecutiveTips([
            "FOLDERS_TIP",
            "AUTO_SORT_ON_OFF",
            "MANUAL_SORT",
            "REMOVE_CONFIG",
          ]);
        },
        onDragOver: (event: DragEvent) => {
          FolderHandlerBinds.bind.dragging = true;
          event.preventDefault();
        },
        onDrop: () => {
          if (this.categoriesHandler.folder && this.categoriesHandler.dragging) {
            let folder = path.resolve(
              this.categoriesHandler.folder,
              this.categoriesHandler.dragging
            );
            if (this.save(folder)) {
              FolderHandlerBinds.bind.folders.push({
                name: folder,
                active: false,
                categories: {},
                order: []
              });
              FolderHandlerBinds.bind.selected = folder;
            }
          }
          FolderHandlerBinds.bind.dragging = false;
        },
      },
      ready: () => {
        FolderHandlerBinds.bind.selectFolder(bindFolders[0]);
      }
    });

    // Handles all logic related to the categories section
    this.categoriesHandler = new CategoriesHandler(
      fileSorter,
      utils,
      notificationService
    );

    this.fileSorter = fileSorter;
    this.notificationService = notificationService;
    this.utils = utils;

    // this.contentRef.addEventListener("drop", () => {
    //   this.contentRef.classList.remove("drag-hover");
    // });

    // this.contentRef.addEventListener("dragover", (event) => {
    //   this.contentRef.classList.add("drag-hover");
    //   event.preventDefault();
    // });

    // this.contentRef.addEventListener("dragleave", (event) => {
    //   this.contentRef.classList.remove("drag-hover");
    // });

    this.on("selected", (item: HTMLElement) => {
      // const element = item.querySelector(".value-holder");
      // const folder = element?.innerHTML;
      // if (folder) {
      //   this.categoriesHandler.enable(folder);
      // }
    });

    this.on("removed", (item: HTMLElement, items: NodeList) => {
      // const folder = item.querySelector(".value-holder");
      // const value = folder?.innerHTML;
      // let index = 0;
      // Object.values(this.folders).forEach((element, i) => {
      //   if (item === element) index = i;
      // });
      // if (value) {
      //   this.delete(value);
      // }
      // if (items.length === 0) {
      //   this.showTip();
      //   this.categoriesHandler.disable();
      //   this.categoriesHandler.clearList();
      // } else if (value) {
      //   delete this.folders[value];
      //   let items = Object.values(this.folders);
      //   if (items[index]) {
      //     this.select(items[index]);
      //   } else {
      //     this.select(items[index - 1]);
      //   }
      // }
    });

    this.on("added", (item: HTMLElement, items: NodeList) => {
      // if (items.length === 1) {
      //   this.select(item);
      //   this.hideTip();
      //   let tip = this.notificationService.showTipIfNeeded("AUTO_SORT_ON_OFF");
      //   if (tip) {
      //     tip.onClose = () => {
      //       this.notificationService.showTipIfNeeded("MANUAL_SORT");
      //     };
      //   }
      // }
    });
  }

  /**
   * Opens OS folder selector dialog
   */
  private async folderDialog() {
    const path = await remote.dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    const value = path.filePaths[0];
    if (!value) {
      return;
    }
    const saved = this.save(value);
    if (this.listRef && saved) {
      // const listElement = this.createListElement(value);
      // this.renderItem(listElement);
      // this.select(listElement);
    }
  }

  /**
   * Deletes all stored data related to a specific folder
   * @param folder Folder string path to delete from storage
   */
  private delete(folder: string) {
    const data: any = this.getFolders();
    if (data && data[folder]) {
      delete data[folder];
      // delete this.folders[folder];
      localStorage.setItem("folders", JSON.stringify(data));
      this.fileSorter.updateFoldersData();
    }
  }

  /**
   * Stores folder path in local storage, onlu if its not already there
   * @param folder Folder path string to store
   */
  private save(folder: string): boolean {
    const data: any = this.getFolders();
    let success = false;
    if (!data[folder]) {
      data[folder] = {
        categories: {},
        active: false,
        order: [],
      };
      localStorage.setItem("folders", JSON.stringify(data));
      this.fileSorter.updateFoldersData();
      success = true;
    } else if (this.folders[folder]) {
      this.select(this.folders[folder]);
    }
    return success;
  }

  private sortFolder(folder: string, done: () => void) {
    this.fileSorter
      .sortFolder(folder)
      .then((movedFiles) => {
        this.notificationService.notifyFileMove(folder, movedFiles);
      })
      .catch((err) => {
        if (err.indexOf("timeout") > -1) {
          let message = `Timeout limit exceeded while sorting ${folder}`;
          this.notificationService.notify({
            timer: 6000,
            message: message,
            type: "error",
          });
          this.notificationService.notifyOS("Sorting time out", message);
        }
      })
      .finally(() => {
        done();
      });
  }

  /**
   * Created a DOM element that will be added to the folders list in the DOM
   * @param folder Folder path string to add to the list
   */
  // createListElement(folder: string): HTMLElement {
  //   const valueElement = this.makeElement("div", {
  //     classList: ["value-holder"],
  //     innerHTML: folder,
  //   });

  //   const sortIcon = this.makeElement("i", {
  //     classList: ["material-icons", "sort-icon"],
  //     attrs: ["title=Apply sort configuration"],
  //     innerHTML: "task_alt",
  //     click: (event: any) => {
  // const sorting = event.target.classList.contains("sorting");
  // if (!sorting) {
  //   event.target.classList.add("sorting");
  //   this.fileSorter
  //     .sortFolder(folder)
  //     .then((movedFiles: IMovedFileData[]) => {
  //       this.notificationService.notifyFileMove(folder, movedFiles);
  //       event.target.classList.remove("sorting");
  //     })
  //     .catch((err) => {
  //       if (err.indexOf("timeout") > -1) {
  //         let message = `Timeout limit exceeded while sorting ${folder}`;
  //         this.notificationService.notify({
  //           timer: 6000,
  //           message: message,
  //           type: "error",
  //         });
  //         this.notificationService.notifyOS("Sorting time out", message);
  //       }
  //       event.target.classList.remove("sorting");
  //     });
  // }
  //     },
  //   });

  //   let data = this.getFolders();
  //   let active = data[folder].active || false;

  //   const watchIcon = this.makeElement("i", {
  //     classList: [
  //       "material-icons",
  //       "watch-icon",
  //     ],
  //     innerHTML: active ? "visibility" : "visibility_off",
  //     attrs: [`title=Turn ${active ? 'off' : 'on'} the folder watcher`],
  //     click: (event: any) => {
  //       data = this.getFolders();
  //       let active = event.target.innerHTML === "visibility";
  //       if (data[folder]) {
  //         data[folder].active = !active;
  //         event.target.innerHTML = active ? "visibility_off" : "visibility";
  //         localStorage.setItem("folders", JSON.stringify(data));
  //         event.target.setAttribute('title', `Turn ${active ? 'on' : 'off'} the folder watcher`)
  //         this.fileSorter.updateFoldersData();
  //       }
  //       event.stopImmediatePropagation();
  //     },
  //   });

  //   const listItem = this.makeElement("div", {
  //     classList: ["folder-list-item"],
  //     children: [valueElement, sortIcon, watchIcon],
  //     dblclick: () => {
  //       this.utils.revealInExplorer(folder);
  //     },
  //   });

  //   this.folders[folder] = listItem;

  //   return listItem;
  // }
}
