export type MinifiedElement = {
  tag: string;
  topic: string;
  idx: number;
  meta: {
    querySelector: string;
  };
};

export function minifiedElementToString(element: MinifiedElement) {
  const { tag, topic, idx } = element;
  return `<${tag} topic=${topic} idx=${idx} />`;
}
