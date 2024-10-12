import { log } from '../../../logger.js';
import { labelHelper, updateNodeBounds, getNodeClasses } from './util.js';
import intersect from '../intersect/index.js';
import type { Node } from '../../types.js';
import { styles2String, userNodeOverrides } from './handDrawnShapeStyles.js';
import rough from 'roughjs';

const historyBase = async (parent: SVGAElement, node: Node): Promise<SVGAElement> => {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg } = await labelHelper(parent, node, getNodeClasses(node));

  const radius = 16;
  let circleElem;
  const { cssStyles } = node;

  if (node.look === 'handDrawn') {
    // @ts-ignore - rough is not typed
    const rc = rough.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const roughNode = rc.circle(0, 0, radius * 2, options);

    circleElem = shapeSvg.insert(() => roughNode, ':first-child');
    circleElem.attr('class', 'basic label-container history').attr('style', cssStyles);
  } else {
    circleElem = shapeSvg
      .insert('circle', ':first-child')
      .attr('class', 'basic label-container history')
      .attr('style', nodeStyles)
      .attr('r', radius)
      .attr('cx', 0)
      .attr('cy', 0);
  }

  updateNodeBounds(node, circleElem);

  node.intersect = function (point) {
    log.info('History intersect', node, radius, point);
    return intersect.circle(node, radius, point);
  };

  return shapeSvg;
};

export const history = async (parent: SVGAElement, node: Node): Promise<SVGAElement> => {
  node.label = 'H';
  node.labelStyle = 'font-weight: bold;';
  return await historyBase(parent, node);
};

export const deephistory = async (parent: SVGAElement, node: Node): Promise<SVGAElement> => {
  node.label = 'H*';
  node.labelStyle = 'font-weight: bold;';
  return await historyBase(parent, node);
};