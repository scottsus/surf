export type MinifiedElement = {
  tag: string;
  id: string;
  topic: string;
  idx: number;
  meta: {
    querySelector: string;
  };
};

export function minifiedElementToString(element: MinifiedElement) {
  const { tag, id, topic, idx } = element;
  return `<${tag} id="#${id}" topic="${topic}" idx=${idx} />`;
}
