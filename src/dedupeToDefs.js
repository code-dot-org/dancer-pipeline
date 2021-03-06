const XXHash = require('xxhash');
const JSAPI = require('svgo/lib/svgo/jsAPI');

exports.type = 'full';

exports.active = true;

exports.description = 'deduplicates parts of SVG into defs';

exports.params = {};

function* traverse(data) {
  if (!data.content || data.content.length === 0) {
    return;
  }

  if (data.elem === 'g') {
    yield data;
  }
  for (const child of data.content) {
    yield* traverse(child);
  }
}

function simplify(node) {
  const { elem, attrs, content } = node;
  return {
    elem,
    attrs,
    content: content && content.map(simplify),
  };
}

function hashNode(node) {
  return XXHash.hash(Buffer.from(JSON.stringify(node.content.map(simplify)), 'utf8'), 0xC0DE);
}

function replaceNode(before, after) {
  const parent = before.parentNode;
  const indexWithinParent = parent.content.indexOf(before);

  // Special case: Already detached from parent, so we're not actually the parent's child anymore
  if (indexWithinParent < 0) {
    return;
  }

  parent.spliceContent(indexWithinParent, 1, after);
}

function makeUse(hash, sourceNode) {
  const use = makeNode('use');
  use.attrs = JSON.parse(JSON.stringify(sourceNode.attrs));
  use.attrs['xlink:href'] = { name: 'xlink:href', value: `#${hash}` };
  return use;
}

function makeNode(type) {
  const defs = new JSAPI({
    elem: type,
    prefix: '',
    local: type,
    attrs: {},
  }, false);
  defs.content = [];
  return defs;
}

function histogram(counts) {
  const filteredCounts = counts.filter(n => n > 1).sort((a, b) => a - b);
  for (const n of filteredCounts) {
    console.log(`${n.toString().padStart(4)} ${'|'.repeat(n)}`);
  }
}

exports.fn = function (data/* , params */) {
  // First pass: Count potential dedupes
  const counts = {};
  const decoder = {};
  for (const node of traverse(data)) {
    const hash = hashNode(node);
    counts[hash] = (counts[hash] || 0) + 1;
    if (counts[hash] > 1) {
      decoder[hash] = node;
    }
  }

  // Second pass: Move dedupe-able content to defs
  // Add a defs element
  const defs = makeNode('defs');

  // Add dedupeable elements to defs
  for (const hash of Object.keys(decoder)) {
    const node = decoder[hash].clone();
    node.attrs = { id: { name: 'id', value: hash } };
    defs.spliceContent(0, 0, node);
  }

  // Replace contents with '<use>' references
  for (const node of traverse(data)) {
    const hash = hashNode(node);
    if (decoder[hash]) {
      const use = makeUse(hash, node);
      replaceNode(node, use);
    }
  }

  data.querySelector('svg').spliceContent(0, 0, defs);
  histogram(Object.values(counts));

  return data;
};
