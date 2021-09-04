import { MutableRefObject } from 'react';
export declare type Target<T = HTMLElement> = (() => T | null) | T | null | MutableRefObject<T | null | undefined>;
declare type TargetElement = HTMLElement | Element | Document | Window;
export declare function getTargetElement(target?: Target<TargetElement>, defaultElement?: TargetElement): TargetElement | undefined | null;
export {};
