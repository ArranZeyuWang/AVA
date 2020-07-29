import { groupBy, uniq } from 'underscore';
import { Normalizer, Binner } from './findScag/constructor';
import { createGraph, mst, delaunayFromPoints } from './findScag/grapher';
import { Outlying, Clumpy } from './findScag/coremeasure';
import { Convex, Skinny, Stringy, Skewed, Sparse, Striated, Monotonic } from './findScag/computator';


export function scagScorer(this: any, inputPoints: any, options: any = {}) {
  let thisInstance = this;
  
  let binType = options.binType,
    startBinGridSize = options.startBinGridSize,
    isNormalized = options.isNormalized,
    isBinned = options.isBinned,
    outlyingUpperBound = options.outlyingUpperBound,
    minBins = options.minBins,
    maxBins = options.maxBins;

  const points = inputPoints.slice(0);
  let normalizedPoints = points;

  //Normalization
  if (!isNormalized) {
    let normalizer = new Normalizer(points);
    normalizedPoints = normalizer.normalizedPoints;
  }
  outputValue('normalizedPoints', normalizedPoints);

  //Binning
  let sites = null;
  let bins = null;
  let binner = null;
  let binSize = null;
  let binRadius = 0;

  if (!isBinned) {

    if (!startBinGridSize) {
      startBinGridSize = 40;
    }
    bins = [];

    let minNumOfBins = 50;
    let maxNumOfBins = 500;
    if (minBins) {
      minNumOfBins = minBins;
    }
    if (maxBins) {
      maxNumOfBins = maxBins;
    }

    const uniqueKeys = uniq(normalizedPoints.map((p: any) => p.join(',')));
    const groups = groupBy(normalizedPoints, (p) => p.join(','));
    if (uniqueKeys.length < minNumOfBins) {
      uniqueKeys.forEach((key) => {
        let bin: any = groups[key];

        bin.x = bin[0][0];
        bin.y = bin[0][1];
        bin.binRadius = 0;
        bins.push(bin);
      });
    } else {
      do {

        if (binSize === null) {
          binSize = startBinGridSize;
        } else if (bins.length > maxNumOfBins) {
          binSize = binSize / 2;
        } else if (bins.length < minNumOfBins) {
          binSize = binSize + 5;
        }
        if (binType === 'hexagon') {

          const shortDiagonal = 1 / binSize;
          binRadius = shortDiagonal / Math.sqrt(2);

          binner = Binner()
            .radius(binRadius)
            .extent([
              [0, 0],
              [1, 1],
            ]);
            
          bins = binner.hexbin(normalizedPoints);
        }
      } while (bins.length > maxNumOfBins || bins.length < minNumOfBins);
    }
    sites = bins.map((d: any) => [d.x, d.y]); //=>sites are the set of centers of all bins

    //Binning output
    outputValue('binner', binner);
    outputValue('bins', bins);
    outputValue('binSize', binSize);
    outputValue('binRadius', binRadius);
  } else {
    sites = normalizedPoints;
  }

  outputValue('binnedSites', sites);


  // Delaunay triangulation
  const delaunay = delaunayFromPoints(sites);
  const triangles = delaunay.triangles;
  const triangleCoordinates = delaunay.triangleCoordinates();

  //Triangulation graphs
  outputValue('delaunay', delaunay);
  outputValue('triangles', triangles);
  outputValue('triangleCoordinates', triangleCoordinates);

  //MST
  const graph = createGraph(triangleCoordinates);
  const mstree = mst(graph);

  //Output graphs
  outputValue('graph', graph);
  outputValue('mst', mstree);

  //Outlying
  const outlying = new Outlying(mstree);
  const outlyingScore = outlying.score();
  outlyingUpperBound = outlying.upperBound;
  const outlyingLinks = outlying.links();
  const outlyingPoints = outlying.points();
  const noOutlyingTree: any = outlying.removeOutlying();
  outputValue('outlyingScore', outlyingScore);
  outputValue('outlyingUpperBound', outlyingUpperBound);
  outputValue('outlyingLinks', outlyingLinks);
  outputValue('outlyingPoints', outlyingPoints);
  outputValue('noOutlyingTree', noOutlyingTree);

  //Skewed
  const skewed = new Skewed(noOutlyingTree);
  outputValue('skewedScore', skewed.score());

  //Sparse
  const sparse = new Sparse(noOutlyingTree);
  outputValue('sparseScore', sparse.score());

  //Clumpy
  // let clumpy = new Clumpy(mstree);
  const clumpy = new Clumpy(noOutlyingTree);
  outputValue('clumpy', clumpy);
  outputValue('clumpyScore', clumpy.score());

  //Striated
  const striated = new Striated(noOutlyingTree);
  const v2Corners = striated.getAllV2Corners();
  const obtuseV2Corners = striated.getAllObtuseV2Corners();
  outputValue('striatedScore', striated.score());
  outputValue('v2Corners', v2Corners);
  outputValue('obtuseV2Corners', obtuseV2Corners);

  //Convex hull
  const convex = new Convex(noOutlyingTree, outlyingUpperBound);
  const convexHull = convex.convexHull();
  outputValue('convexHull', convexHull);

  //Alpha hull
  const alphaHull = convex.concaveHull();
  outputValue('alphaHull', alphaHull);

  //Convex
  const convexScore = convex.score();
  outputValue('convexScore', convexScore);

  //Skinny
  const skinny = new Skinny(alphaHull);
  const skinnyScore = skinny.score();
  outputValue('skinnyScore', skinnyScore);

  //Stringy
  const stringy = new Stringy(noOutlyingTree);
  const v1s = stringy.getAllV1s();
  const stringyScore = stringy.score();
  outputValue('v1s', v1s);
  outputValue('stringyScore', stringyScore);

  //Monotonic
  const monotonic = new Monotonic(noOutlyingTree!.nodes.map((n: any) => n.id));
  const monotonicScore = monotonic.score();
  outputValue('monotonicScore', monotonicScore);

  return this;

  function outputValue(name: string, value: {} | undefined) {
    thisInstance[name] = value;
  }
};
