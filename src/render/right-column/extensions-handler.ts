export class ExtensionsHandler {
    elementRef: HTMLElement | null;
    inputRef: HTMLElement | null | undefined;
    listRef: HTMLElement | null | undefined;
    overlayRef: HTMLElement | null | undefined;

    activeFolder: string | null = null;
    activeCategory: string | null = null;
    subscriptions: any = {
        stored: []
    }

    constructor() {
        this.elementRef = document.querySelector('div.extensions');
        this.inputRef = this.elementRef?.querySelector('div.extensions-input');
        this.listRef = this.elementRef?.querySelector('div.extension-list');
        this.overlayRef = this.elementRef?.querySelector('div.inactive-overlay');
        this.inputRef?.addEventListener('keydown', (event) => { this.inputKeydown(event) })
    }


    setActiveFolder(folder: string) {
        this.activeFolder = folder;
    }

    setActiveCategory(category: string) {
        if (this.activeCategory != category && this.activeFolder) {
            this.activeCategory = category;
            let extensions = this.getExtensionsForCategory(this.activeFolder, this.activeCategory);
            this.renderExtensionList(extensions);
            this.hideOverlay();
            if (extensions.length == 0) {
                this.showTip();
            }
            else {
                this.removeTip();
            }
        }
    }

    clearExtensionList() {
        if (!this.listRef) {
            return;
        }

        let items = this.listRef.querySelectorAll('.extension-list-item');

        for (let i = 0; i < items.length; i++) {
            let child = items[i];
            this.listRef.removeChild(child);
        }
    }

    on(event: string, callback: any) {
        if (!this.subscriptions[event]) {
            return;
        }

        this.subscriptions[event].push(callback);
    }

    private renderExtensionList(extensions: Array<string>) {
        if (!this.activeFolder || !this.activeCategory) {
            return;
        }
        if (this.listRef) {
            this.clearExtensionList()
        }

        extensions.map((extension) => {
            this.appendToList(extension);
        });
    }

    private getExtensionsForCategory(folder: string, category: string): Array<string> {
        let extensions: Array<string> = []
        let raw = localStorage.getItem('folders');
        if (!raw) {
            return extensions;
        }

        let data = JSON.parse(raw);
        let folderData = data[folder];
        if (folderData && folderData.categories && folderData.categories[category]) {
            extensions = folderData.categories[category];
        }

        return extensions;
    }

    private appendToList(extension: string) {
        if (!this.listRef) {
            return;
        }

        let item = document.createElement('div');
        item.classList.add('extension-list-item');
        item.innerText = extension;
        this.listRef.append(item);
    }

    private storeExtension(value: string) {
        let raw = localStorage.getItem('folders');
        if (!this.activeFolder || !this.activeCategory || !raw) {
            return;
        }

        let data = JSON.parse(raw);
        let folderData = data[this.activeFolder];
        if (folderData && folderData.categories && folderData.categories[this.activeCategory]) {
            folderData.categories[this.activeCategory].push(value);
            localStorage.setItem('folders', JSON.stringify(data));
            this.subscriptions['stored'].forEach((fn: any) => {
                fn();
            });
        }

    }

    private inputKeydown(event: any) {
        if (event.which == 13) {
            let target = event.target;
            let value = event.target.innerText;
            this.appendToList(value);
            this.storeExtension(value);
            event.preventDefault();
            target.blur();
            target.focus();
            this.removeTip();
            if (this.inputRef) {
                this.inputRef.innerText = '';
            }
        }
    }

    private hideOverlay() {
        if (this.overlayRef && !this.overlayRef.classList.contains('hiden')) {
            this.overlayRef.classList.add('hiden');
        }
    }

    private showTip() {
        let tip = this.listRef?.querySelector('.section-tip');
        if (tip && !tip.classList.contains('active')) {
            tip.classList.add('active');
        }
    }

    private removeTip() {
        let tip = this.listRef?.querySelector('.section-tip');
        if (tip && tip.classList.contains('active')) {
            tip.classList.remove('active');
        }
    }
}