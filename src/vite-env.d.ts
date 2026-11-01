/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, setting: any)
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void
    loadFromImages(images: string[]): void
    turnToPage(pageNum: number): void
    turnToNextPage(): void
    turnToPrevPage(): void
    flipNext(corner?: 'top' | 'bottom'): void
    flipPrev(corner?: 'top' | 'bottom'): void
    destroy(): void
    getCurrentPageIndex(): number
    getPageCount(): number
    on(event: string, callback: (e: any) => void): void
    off(event: string): void
    update(): void
  }
}
