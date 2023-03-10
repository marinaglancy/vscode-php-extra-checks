const engine = require("php-parser");

export interface NodeLayout {
  children?: Array<NodeLayout>;
  [key: string]: any;
};

const parser = new engine({
  // some options :
  parser: {
    extractDoc: false,
    php7: true
  },
  ast: {
    withPositions: true,
    withSource: true
  },
});

export function parseCode(phpFile:string|Buffer): NodeLayout {
  return parser.parseCode(phpFile);
}

export function walkAll(nl:NodeLayout, callback:(node:NodeLayout) => void) {
  callback(nl);
  let keys = Object.keys(nl);
  keys.forEach((key) => {
    if (key === 'kind' || key === 'loc') { return; }
    if (nl[key] === null || nl[key] === undefined) {
    } else if ((typeof nl[key]) === 'object') {
      walkAll(nl[key], callback);
    }
  });
}

export function walk(nl:NodeLayout, validationCallback:(node:NodeLayout) => boolean): Array<NodeLayout> {
  if (validationCallback(nl)) { return [nl]; }
  let res:Array<NodeLayout> = [];
  let keys = Object.keys(nl);
  keys.forEach((key) => {
    if (key === 'kind' || key === 'loc') { return; }
    if (nl[key] === null || nl[key] === undefined) {
    } else if ((typeof nl[key]) === 'object') {
      res = [...res, ...walk(nl[key], validationCallback)];
    }
  });
  return res;
}

export function findAllFunctions(nl:NodeLayout): Array<NodeLayout> {
  let res:Array<NodeLayout> = [];
  walk(nl, (node) => {
    return node.kind === 'function' || node.kind === 'class';
  }).forEach((node) => {
    if (node.kind === 'function') {
      res.push(node);
    } else {
      res = res.concat(node.body.filter((n:NodeLayout) => n.kind === 'method'));
    }
  });
  return res;
}