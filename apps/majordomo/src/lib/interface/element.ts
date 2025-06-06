export interface DomElement {
  tagName: string;
  textContent: string;
  role: string;
  ariaLabel: string;
  ariaRole: string;
  parentInfo: {
    tagName: string;
    className: string;
    textContent: string;
  };
  boundingRect: DOMRect;
  index: number;
  querySelector: string;
}
