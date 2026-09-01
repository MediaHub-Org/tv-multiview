/**
 * Global type declarations for external libraries and vendor APIs
 */

declare global {
    /** SortableJS library */
    var Sortable: any;

    /** video.js player instance */
    function videojs(id: string | HTMLElement, options?: Record<string, unknown>): any;
    namespace videojs {
        function getPlayer(element: Element): any | null;
        interface Player {
            play(): Promise<void>;
            pause(): void;
            dispose(): void;
            on(event: string, handler: (...args: any[]) => void): void;
            off(event: string, handler?: (...args: any[]) => void): void;
            src(source: { src: string; type: string }): void;
            currentTime(): number;
            currentTime(value: number): void;
            duration(): number;
            ended(): boolean;
            error(): { code: number; message: string } | null;
        }
    }

    /** isMobile detection library (ismobilejs@1.1.1: plain object, not methods) */
    const isMobile: {
        apple: {
            phone: boolean;
            ipod: boolean;
            tablet: boolean;
            universal: boolean;
            device: boolean;
        };
        amazon: { phone: boolean; tablet: boolean; device: boolean };
        android: { phone: boolean; tablet: boolean; device: boolean };
        windows: { phone: boolean; tablet: boolean; device: boolean };
        other: {
            blackberry: boolean;
            blackberry10: boolean;
            opera: boolean;
            firefox: boolean;
            chrome: boolean;
            device: boolean;
        };
        any: boolean;
        phone: boolean;
        tablet: boolean;
    };

    /** Bootstrap components namespace */
    namespace bootstrap {
        class Tooltip {
            constructor(element: HTMLElement, options?: Record<string, unknown>);
            static getInstance(element: HTMLElement): Tooltip | null;
            dispose(): void;
            show(): void;
            hide(): void;
            update(): void;
        }
        class Toast {
            constructor(element: HTMLElement, options?: Record<string, unknown>);
            static getInstance(element: HTMLElement): Toast | null;
            show(): void;
            hide(): void;
            dispose(): void;
        }
        class Modal {
            constructor(element: HTMLElement, options?: Record<string, unknown>);
            static getInstance(element: HTMLElement): Modal | null;
            show(): void;
            hide(): void;
            dispose(): void;
        }
    }

    /** Extend Window with Bootstrap namespace */
    interface Window {
        bootstrap?: typeof bootstrap;
    }

    /** Extend Element with webkit/moz/ms prefixed fullscreen properties */
    interface HTMLElement {
        webkitRequestFullscreen?(): Promise<void>;
        mozRequestFullScreen?(): Promise<void>;
        msRequestFullscreen?(): Promise<void>;
    }

    interface Document {
        webkitExitFullscreen?(): Promise<void>;
        mozCancelFullScreen?(): Promise<void>;
        msExitFullscreen?(): Promise<void>;
        webkitFullscreenEnabled?: boolean;
        mozFullScreenEnabled?: boolean;
        msFullscreenEnabled?: boolean;
        webkitFullscreenElement?: Element | null;
        mozFullScreenElement?: Element | null;
        msFullscreenElement?: Element | null;
    }
}

export {};
