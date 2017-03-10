/*****************************************************************************/
/**
 *  @file   KVS.js
 *  @author Naohisa Sakamoto
 */
/*****************************************************************************/
const KVS = {
  REVISION: '0'
};

// Line type
KVS.StripLine = 0;
KVS.SegmentLine = 1;

// Axis type
KVS.XAxis = 0;
KVS.YAxis = 1;
KVS.ZAxis = 2;

// Integration method used in the streamline calculation
KVS.Euler = 0;
KVS.RungeKutta2 = 1;
KVS.RungeKutta4 = 2;

// Trace direction used in the streamline calculation
KVS.ForwardDirection = 1;
KVS.BackwardDirection = -1;

// Marching cubes table
KVS.MarchingCubesTable = function() {
  this.edgeID = [
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1],
    [3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1],
    [3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1],
    [3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1],
    [9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1],
    [1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1],
    [9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
    [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1],
    [8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1],
    [9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
    [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1],
    [3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1],
    [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1],
    [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1],
    [4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1],
    [9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1],
    [1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
    [5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1],
    [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1],
    [9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
    [0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
    [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1],
    [10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1],
    [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1],
    [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1],
    [5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1],
    [9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1],
    [0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1],
    [1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1],
    [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1],
    [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1],
    [2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1],
    [7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1],
    [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1],
    [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1],
    [11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1],
    [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1],
    [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1],
    [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1],
    [11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
    [1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1],
    [9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1],
    [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1],
    [2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
    [0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
    [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1],
    [6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1],
    [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1],
    [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1],
    [6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1],
    [5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1],
    [1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
    [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1],
    [6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1],
    [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1],
    [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1],
    [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1],
    [3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
    [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1],
    [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1],
    [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1],
    [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1],
    [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1],
    [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1],
    [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1],
    [10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1],
    [10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1],
    [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1],
    [1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1],
    [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1],
    [0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1],
    [10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1],
    [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1],
    [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1],
    [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1],
    [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1],
    [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1],
    [3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1],
    [6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1],
    [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1],
    [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1],
    [10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1],
    [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1],
    [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1],
    [7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1],
    [7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1],
    [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1],
    [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1],
    [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1],
    [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1],
    [0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1],
    [7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
    [10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
    [2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
    [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1],
    [7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1],
    [2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1],
    [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1],
    [10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1],
    [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1],
    [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1],
    [7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1],
    [6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1],
    [8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1],
    [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1],
    [6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1],
    [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1],
    [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1],
    [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1],
    [8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1],
    [0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1],
    [1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1],
    [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1],
    [10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1],
    [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1],
    [10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
    [5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
    [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1],
    [9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
    [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1],
    [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1],
    [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1],
    [7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1],
    [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1],
    [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1],
    [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1],
    [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1],
    [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1],
    [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1],
    [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1],
    [6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1],
    [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1],
    [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1],
    [6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1],
    [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1],
    [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1],
    [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1],
    [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1],
    [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1],
    [9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1],
    [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1],
    [1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1],
    [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1],
    [0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1],
    [5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1],
    [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1],
    [11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1],
    [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1],
    [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1],
    [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1],
    [2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1],
    [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1],
    [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1],
    [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1],
    [1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1],
    [9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1],
    [9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1],
    [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1],
    [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1],
    [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1],
    [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1],
    [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1],
    [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1],
    [9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1],
    [5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1],
    [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1],
    [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1],
    [8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1],
    [0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1],
    [9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1],
    [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1],
    [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1],
    [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1],
    [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1],
    [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1],
    [11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1],
    [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1],
    [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1],
    [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1],
    [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1],
    [1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1],
    [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1],
    [4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1],
    [0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1],
    [3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1],
    [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1],
    [0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1],
    [9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1],
    [1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
  ];

  this.vertexID = [
    [
      [0, 0, 0],
      [1, 0, 0]
    ],
    [
      [1, 0, 0],
      [1, 1, 0]
    ],
    [
      [1, 1, 0],
      [0, 1, 0]
    ],
    [
      [0, 1, 0],
      [0, 0, 0]
    ],
    [
      [0, 0, 1],
      [1, 0, 1]
    ],
    [
      [1, 0, 1],
      [1, 1, 1]
    ],
    [
      [1, 1, 1],
      [0, 1, 1]
    ],
    [
      [0, 1, 1],
      [0, 0, 1]
    ],
    [
      [0, 0, 0],
      [0, 0, 1]
    ],
    [
      [1, 0, 0],
      [1, 0, 1]
    ],
    [
      [1, 1, 0],
      [1, 1, 1]
    ],
    [
      [0, 1, 0],
      [0, 1, 1]
    ]
  ];
};

// Marching tetrahedra table
KVS.MarchingTetrahedraTable = function() {
  this.edgeID = [
    [-1, -1, -1, -1, -1, -1, -1],
    [2, 1, 0, -1, -1, -1, -1],
    [0, 3, 5, -1, -1, -1, -1],
    [2, 1, 3, 3, 5, 2, -1],
    [4, 3, 1, -1, -1, -1, -1],
    [0, 2, 4, 4, 3, 0, -1],
    [1, 4, 5, 5, 0, 1, -1],
    [4, 5, 2, -1, -1, -1, -1],

    [2, 5, 4, -1, -1, -1, -1],
    [1, 0, 5, 5, 4, 1, -1],
    [0, 3, 4, 4, 2, 0, -1],
    [1, 3, 4, -1, -1, -1, -1],
    [2, 5, 3, 3, 1, 2, -1],
    [5, 3, 0, -1, -1, -1, -1],
    [0, 1, 2, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1]
  ];
  this.vertexID = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [2, 3],
    [3, 1]
  ];
};

// Vector 3D
KVS.Vec3 = function(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
};

KVS.Vec3.prototype = {
  constructor: KVS.Vec3,

  clone() {
    return new KVS.Vec3(this.x, this.y, this.z);
  },

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  },

  swap(v) {
    KVS.Swap(this.x, v.x);
    KVS.Swap(this.y, v.y);
    KVS.Swap(this.z, v.z);
    return this;
  },

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  },

  fromArray(array) {
    this.x = array[0];
    this.y = array[1];
    this.z = array[2];
    return this;
  },

  toArray() {
    return [this.x, this.y, this.z];
  },

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  },

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  },

  mul(v) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  },

  mulScalar(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  },

  div(v) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  },

  divScalar(s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    return this;
  },

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },

  normalize() {
    return this.divScalar(this.length());
  },

  min() {
    return Math.min(this.x, Math.min(this.y, this.z));
  },

  max() {
    return Math.max(this.x, Math.max(this.y, this.z));
  },

  cross(v) {
    const x = this.x;
    const y = this.y;
    const z = this.z;

    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;

    return this;
  },

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
};

// Vector 4D
KVS.Vec4 = function(x, y, z, w) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.w = w || 0;
};

KVS.Vec4.prototype = {
  constructor: KVS.Vec4,

  clone() {
    return new KVS.Vec4(this.x, this.y, this.z, this.w);
  },

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
    return this;
  },

  swap(v) {
    KVS.Swap(this.x, v.x);
    KVS.Swap(this.y, v.y);
    KVS.Swap(this.z, v.z);
    KVS.Swap(this.w, v.w);
    return this;
  },

  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  },

  fromArray(array) {
    this.x = array[0];
    this.y = array[1];
    this.z = array[2];
    this.w = array[3];
    return this;
  },

  toArray() {
    return [this.x, this.y, this.z, this.w];
  },

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
    return this;
  },

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;
    return this;
  },

  mul(v) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    this.w *= v.w;
    return this;
  },

  mulScalar(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    this.w *= s;
    return this;
  },

  div(v) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    this.w /= v.w;
    return this;
  },

  divScalar(s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    this.w /= s;
    return this;
  },

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  },

  normalize() {
    return this.divScalar(this.length());
  },

  min() {
    return Math.min(this.x, Math.min(this.y, Math.min(this.z, this.w)));
  },

  max() {
    return Math.max(this.x, Math.max(this.y, Math.max(this.z, this.w)));
  },

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  },
};

// 3x3 Matrix
KVS.Mat3 = function(a00, a01, a02, a10, a11, a12, a20, a21, a22) {
  this.row = [];
  this.row[0] = new KVS.Vec3(a00, a01, a02);
  this.row[1] = new KVS.Vec3(a10, a11, a12);
  this.row[2] = new KVS.Vec3(a20, a21, a22);
};

KVS.Mat3.prototype = {
  constructor: KVS.Mat3,

  clone() {
    return new KVS.Mat3(
      this.row[0].x, this.row[0].y, this.row[0].z,
      this.row[1].x, this.row[1].y, this.row[1].z,
      this.row[2].x, this.row[2].y, this.row[2].z
    );
  },

  copy(m) {
    this.row[0].copy(m.row[0]);
    this.row[1].copy(m.row[1]);
    this.row[2].copy(m.row[2]);
  },

  swap(m) {
    this.row[0].swap(m.row[0]);
    this.row[1].swap(m.row[1]);
    this.row[2].swap(m.row[2]);
    return this;
  },

  set(a00, a01, a02, a10, a11, a12, a20, a21, a22) {
    this.row[0].set(a00, a01, a02);
    this.row[1].set(a10, a11, a12);
    this.row[2].set(a20, a21, a22);
    return this;
  },

  fromArray(array) {
    this.row[0].set(array[0], array[1], array[2]);
    this.row[1].set(array[3], array[4], array[5]);
    this.row[2].set(array[6], array[7], array[8]);
    return this;
  },

  fromArray2D(array2d) {
    this.row[0].fromArray(array2d[0]);
    this.row[1].fromArray(array2d[1]);
    this.row[2].fromArray(array2d[2]);
  },

  toArray() {
    return [
      this.row[0].x, this.row[0].y, this.row[0].z,
      this.row[1].x, this.row[1].y, this.row[1].z,
      this.row[2].x, this.row[2].y, this.row[2].z
    ];
  },

  toArray2D() {
    return [this.row[0].toArray(), this.row[1].toArray(), this.row[2].toArray()];
  },

  add(m) {
    this.row[0].add(m.row[0]);
    this.row[1].add(m.row[1]);
    this.row[2].add(m.row[2]);
    return this;
  },

  sub(m) {
    this.row[0].sub(m.row[0]);
    this.row[1].sub(m.row[1]);
    this.row[2].sub(m.row[2]);
    return this;
  },

  mul(m) {
    this.row[0].x = this.row[0].x * m.row[0].x + this.row[0].y * m.row[1].x + this.row[0].z * m.row[2].x;
    this.row[0].y = this.row[0].x * m.row[0].y + this.row[0].y * m.row[1].y + this.row[0].z * m.row[2].y;
    this.row[0].z = this.row[0].x * m.row[0].z + this.row[0].y * m.row[1].z + this.row[0].z * m.row[2].z;
    this.row[1].x = this.row[1].x * m.row[0].x + this.row[1].y * m.row[1].x + this.row[1].z * m.row[2].x;
    this.row[1].y = this.row[1].x * m.row[0].y + this.row[1].y * m.row[1].y + this.row[1].z * m.row[2].y;
    this.row[1].z = this.row[1].x * m.row[0].z + this.row[1].y * m.row[1].z + this.row[1].z * m.row[2].z;
    this.row[2].x = this.row[2].x * m.row[0].x + this.row[2].y * m.row[1].x + this.row[2].z * m.row[2].x;
    this.row[2].y = this.row[2].x * m.row[0].y + this.row[2].y * m.row[1].y + this.row[2].z * m.row[2].y;
    this.row[2].z = this.row[2].x * m.row[0].z + this.row[2].y * m.row[1].z + this.row[2].z * m.row[2].z;
    return this;
  },

  mulVec(v) {
    return new KVS.Vec3(this.row[0].dot(v), this.row[1].dot(v), this.row[2].dot(v));
  },

  mulScalar(s) {
    this.row[0].mulScalar(s);
    this.row[1].mulScalar(s);
    this.row[2].mulScalar(s);
    return this;
  },

  divScalar(s) {
    this.row[0].divScalar(s);
    this.row[1].divScalar(s);
    this.row[2].divScalar(s);
    return this;
  },

  zero() {
    this.row[0].set(0, 0, 0);
    this.row[1].set(0, 0, 0);
    this.row[2].set(0, 0, 0);
    return this;
  },

  identity() {
    this.row[0].set(1, 0, 0);
    this.row[1].set(0, 1, 0);
    this.row[2].set(0, 0, 1);
    return this;
  },

  transpose() {
    KVS.Swap(this.row[0].y, this.row[1].x);
    KVS.Swap(this.row[0].z, this.row[2].x);
    KVS.Swap(this.row[1].z, this.row[2].y);
    return this;
  },

  invert(determinant) {
    const det22 = [
      this.row[1].y * this.row[2].z - this.row[1].z * this.row[2].y,
      this.row[1].x * this.row[2].z - this.row[1].z * this.row[2].x,
      this.row[1].x * this.row[2].y - this.row[1].y * this.row[2].x,
      this.row[0].y * this.row[2].z - this.row[0].z * this.row[2].y,
      this.row[0].x * this.row[2].z - this.row[0].z * this.row[2].x,
      this.row[0].x * this.row[2].y - this.row[0].y * this.row[2].x,
      this.row[0].y * this.row[1].z - this.row[0].z * this.row[1].y,
      this.row[0].x * this.row[1].z - this.row[0].z * this.row[1].x,
      this.row[0].x * this.row[1].y - this.row[0].y * this.row[1].x,
    ];

    const det33 = this.row[0].x * det22[0] - this.row[0].y * det22[1] + this.row[0].z * det22[2];
    if (determinant != undefined) determinant = det33;

    this.set(det22[0], -det22[3], det22[6], -det22[1], det22[4], -det22[7], det22[2], -det22[5], det22[8]);
    this.divScalar(det33);
    return this;
  },

  trace() {
    return this.row[0].x + this.row[1].y + this.row[2].z;
  },

  determinant() {
    return this.row[0].clone().cross(this.row[1]).dot(this.row[2]);
  },

  transposed() {
    return this.clone().transpose();
  },

  inverted() {
    return this.clone().invert();
  },

  min() {
    return Math.min(this.row[0].min(), Math.min(this.row[1].min(), this.row[2].min()));
  },

  max() {
    return Math.max(this.row[0].max(), Math.max(this.row[1].max(), this.row[2].max()));
  },
};

// Utilities
KVS.Min = (vec1, vec2) => {
  const x = Math.min(vec1.x, vec2.x);
  const y = Math.min(vec1.y, vec2.y);
  const z = Math.min(vec1.z, vec2.z);
  return new KVS.Vec3(x, y, z);
};

KVS.Max = (vec1, vec2) => {
  const x = Math.max(vec1.x, vec2.x);
  const y = Math.max(vec1.y, vec2.y);
  const z = Math.max(vec1.z, vec2.z);
  return new KVS.Vec3(x, y, z);
};

KVS.Mix = (x, y, a) => x * (1.0 - a) + y * a;

KVS.Swap = (a, b) => {
  b = [a, a = b][0];
};

KVS.Clamp = (a, b, c) => Math.max(b, Math.min(c, a));

KVS.HSV2RGB = hsv => {
  const h = hsv.x;
  const s = hsv.y;
  const v = hsv.z;

  if (s == 0) {
    return new KVS.Vec3(v, v, v);
  } else {
    const H = (h < 1 ? h : h - 1) * 6.0;
    const i = Math.floor(H);

    const temp1 = v * (1 - s);
    const temp2 = v * (1 - s * (H - i));
    const temp3 = v * (1 - s * (1 - H + i));

    let r;
    let g;
    let b;
    switch (i) {
      case 0:
        {
          r = v;g = temp3;b = temp1;
          break;
        }
      case 1:
        {
          r = temp2;g = v;b = temp1;
          break;
        }
      case 2:
        {
          r = temp1;g = v;b = temp3;
          break;
        }
      case 3:
        {
          r = temp1;g = temp2;b = v;
          break;
        }
      case 4:
        {
          r = temp3;g = temp1;b = v;
          break;
        }
      default:
        {
          r = v;g = temp1;b = temp2;
          break;
        }
    }

    return new KVS.Vec3(r, g, b);
  }
};

KVS.RainbowColorMap = (smin, smax, s) => {
  const h = (s - smin) / (smax - smin);
  return KVS.HSV2RGB(new KVS.Vec3((1 - h) * 0.75, 1, 1));
};

// PointObject
KVS.PointObject = function() {
  this.size = 1;
  this.coords = []; // [[x,y,z],[x,y,z],...]
  this.colors = []; // [[r,g,b],[r,g,b],...]
  this.min_coord = new KVS.Vec3();
  this.max_coord = new KVS.Vec3();
};

KVS.PointObject.prototype = {
  constructor: KVS.PointObject,

  numberOfVertices() {
    return this.coords.length;
  },

  updateMinMaxCoords() {
    let min_coord = new KVS.Vec3().fromArray(this.coords[0]);
    let max_coord = new KVS.Vec3().fromArray(this.coords[0]);

    const nvertices = this.numberOfVertices();
    for (let i = 0; i < nvertices; i++) {
      const coord = new KVS.Vec3().fromArray(this.coords[i]);
      min_coord = KVS.Min(min_coord, coord);
      max_coord = KVS.Max(max_coord, coord);
    }

    this.min_coord = min_coord;
    this.max_coord = max_coord;
  },

  objectCenter() {
    return this.min_coord.clone().add(this.max_coord).divScalar(2);
  },
};

// LineObject
KVS.LineObject = function() {
  this.line_type = KVS.StripLine; // KVS.StripLine or KVS.SegmentLine
  this.width = 1;
  this.coords = [];
  this.colors = [];
  this.min_coord = new KVS.Vec3();
  this.max_coord = new KVS.Vec3();
};

KVS.LineObject.prototype = {
  constructor: KVS.LineObject,

  numberOfVertices() {
    return this.coords.length;
  },

  updateMinMaxCoords() {
    let min_coord = new KVS.Vec3().fromArray(this.coords[0]);
    let max_coord = new KVS.Vec3().fromArray(this.coords[0]);

    const nvertices = this.numberOfVertices();
    for (let i = 0; i < nvertices; i++) {
      const coord = new KVS.Vec3().fromArray(this.coords[i]);
      min_coord = KVS.Min(min_coord, coord);
      max_coord = KVS.Max(max_coord, coord);
    }

    this.min_coord = min_coord;
    this.max_coord = max_coord;
  },

  objectCenter() {
    return this.min_coord.clone().add(this.max_coord).divScalar(2);
  },

  setMinMaxCoords(min_coord, max_coord) {
    this.min_coord = min_coord;
    this.max_coord = max_coord;
  },
};

// PolygonObject
KVS.PolygonObject = function() {
  this.coords = [];
  this.colors = [];
  this.connections = [];
  this.min_coord = new KVS.Vec3();
  this.max_coord = new KVS.Vec3();
};

KVS.PolygonObject.prototype = {
  constructor: KVS.PolygonObject,

  numberOfVertices() {
    return this.coords.length;
  },

  updateMinMaxCoords() {
    let min_coord = new KVS.Vec3().fromArray(this.coords[0]);
    let max_coord = new KVS.Vec3().fromArray(this.coords[0]);

    const nvertices = this.numberOfVertices();
    for (let i = 0; i < nvertices; i++) {
      const coord = new KVS.Vec3().fromArray(this.coords[i]);
      min_coord = KVS.Min(min_coord, coord);
      max_coord = KVS.Max(max_coord, coord);
    }

    this.min_coord = min_coord;
    this.max_coord = max_coord;
  },

  objectCenter() {
    return this.min_coord.clone().add(this.max_coord).divScalar(2);
  },

  setMinMaxCoords(min_coord, max_coord) {
    this.min_coord = min_coord;
    this.max_coord = max_coord;
  },
};

// StructuredVolumeObject
KVS.StructuredVolumeObject = function() {
  this.resolution = new KVS.Vec3();
  this.values = [];
  this.min_coord = new KVS.Vec3();
  this.max_coord = new KVS.Vec3();
  this.min_value = 0;
  this.max_value = 0;
};

KVS.StructuredVolumeObject.prototype = {
  constructor: KVS.StructuredVolumeObject,

  vectorLength() {
    return this.values[0].length;
  },

  numberOfNodes() {
    return this.resolution.x * this.resolution.y * this.resolution.z;
  },

  numberOfNodesPerLine() {
    return this.resolution.x;
  },

  numberOfNodesPerSlice() {
    return this.resolution.x * this.resolution.y;
  },

  numberOfNodesPerCell() {
    return 8;
  },

  numberOfCells() {
    return (this.resolution.x - 1) * (this.resolution.y - 1) * (this.resolution.z - 1);
  },

  updateMinMaxCoords() {
    const min_coord = new KVS.Vec3(0, 0, 0);
    const max_coord = this.resolution.clone().sub(new KVS.Vec3(1, 1, 1));

    this.min_coord = min_coord;
    this.max_coord = max_coord;
  },

  updateMinMaxValues() {
    let min_value = 0;
    let max_value = 0;

    if (this.vectorLength() == 1) {
      min_value = this.values[0][0];
      max_value = this.values[0][0];

      const nnodes = this.numberOfNodes();
      for (let i = 0; i < nnodes; i++) {
        const value = this.values[i][0];
        min_value = Math.min(min_value, value);
        max_value = Math.max(max_value, value);
      }
    } else if (this.vectorLength() == 3) {
      min_value = new KVS.Vec3().fromArray(this.values[0]).length();
      max_value = new KVS.Vec3().fromArray(this.values[0]).length();

      const nnodes = this.numberOfNodes();
      for (let i = 0; i < nnodes; i++) {
        const value = new KVS.Vec3().fromArray(this.values[i]).length();
        min_value = Math.min(min_value, value);
        max_value = Math.max(max_value, value);
      }
    }

    this.min_value = min_value;
    this.max_value = max_value;
  },

  objectCenter() {
    return this.min_coord.clone().add(this.max_coord).divScalar(2);
  },

  setMinMaxCoords(min_coord, max_coord) {
    this.min_coord = min_coord;
    this.max_coord = max_coord;
  },

  setMinMaxValues(min_value, max_value) {
    this.min_value = min_value;
    this.max_value = max_value;
  },
};

// UnstructuredVolumeObject
KVS.UnstructuredVolumeObject = function() {
  this.coords = [];
  this.connections = [];
  this.values = [];
  this.min_coord = new KVS.Vec3();
  this.max_coord = new KVS.Vec3();
  this.min_value = 0;
  this.max_value = 0;
};

KVS.UnstructuredVolumeObject.prototype = {
  constructor: KVS.UnstructuredVolumeObject,

  vectorLength() {
    return this.values[0].length;
  },

  numberOfNodes() {
    return this.coords.length;
  },

  numberOfNodesPerCell() {
    return this.connections[0].length;
  },

  numberOfCells() {
    return this.connections.length;
  },

  updateMinMaxCoords() {
    let min_coord = new KVS.Vec3().fromArray(this.coords[0]);
    let max_coord = new KVS.Vec3().fromArray(this.coords[0]);

    const nvertices = this.numberOfNodes();
    for (let i = 0; i < nvertices; i++) {
      const coord = new KVS.Vec3().fromArray(this.coords[i]);
      min_coord = KVS.Min(min_coord, coord);
      max_coord = KVS.Max(max_coord, coord);
    }

    this.min_coord = min_coord;
    this.max_coord = max_coord;
  },

  updateMinMaxValues() {
    let min_value = 0;
    let max_value = 0;

    if (this.vectorLength() == 1) {
      min_value = this.values[0][0];
      max_value = this.values[0][0];

      const nnodes = this.numberOfNodes();
      for (let i = 0; i < nnodes; i++) {
        const value = this.values[i][0];
        min_value = Math.min(min_value, value);
        max_value = Math.max(max_value, value);
      }
    } else if (this.vectorLength() == 3) {
      min_value = new KVS.Vec3().fromArray(this.values[0]).length();
      max_value = new KVS.Vec3().fromArray(this.values[0]).length();

      const nnodes = this.numberOfNodes();
      for (let i = 0; i < nnodes; i++) {
        const value = new KVS.Vec3().fromArray(this.values[i]).length();
        min_value = Math.min(min_value, value);
        max_value = Math.max(max_value, value);
      }
    }

    this.min_value = min_value;
    this.max_value = max_value;
  },

  objectCenter() {
    return this.min_coord.clone().add(this.max_coord).divScalar(2);
  },

  setMinMaxCoords(min_coord, max_coord) {
    this.min_coord = min_coord;
    this.max_coord = max_coord;
  },

  setMinMaxValues(min_value, max_value) {
    this.min_value = min_value;
    this.max_value = max_value;
  },
};

KVS.TetrahedraCell = function(volume, index) {
  this.volume = volume;
  this.cell_coords = [];
  this.cell_values = [];
  this.interpolation_functions = [];
  if (index != undefined) {
    this.bind(index);
  }
};

KVS.TetrahedraCell.prototype = {
  constructor: KVS.TetrahedraCell,

  bind(index) {
    this.cell_coords = [];
    this.cell_values = [];
    this.interpolation_functions = [];

    const id = this.volume.connections[index];
    for (let i = 0; i < id.length; i++) {
      this.cell_coords.push(this.volume.coords[id[i]]);
      this.cell_values.push(this.volume.values[id[i]]);
      this.interpolation_functions.push(0);
    }
  },

  setLocalPoint(local) {
    this.updateInterpolationFunctions(local);
  },

  localToGlobal(local) {
    this.setLocalPoint(local);

    let x = 0;
    let y = 0;
    let z = 0;

    const N = this.interpolation_functions;
    for (let i = 0; i < this.cell_coords.length; i++) {
      x += this.cell_coords[i][0] * N[i];
      y += this.cell_coords[i][1] * N[i];
      z += this.cell_coords[i][2] * N[i];
    }

    return new KVS.Vec3(x, y, z);
  },

  globalToLocal(global) {
    const C3 = new KVS.Vec3().fromArray(this.cell_coords[3]);
    return this.jacobian().inverted().mulVec(global.clone().sub(C3));
  },

  volume() {
    return Math.Abs(this.jacobian().determinant()) / 6;
  },

  value() {
    const N = this.interpolation_functions;
    const nvalues = this.cell_values.length;
    const veclen = this.cell_values[0].length;

    const v = [];
    for (let i = 0; i < veclen; i++) {
      v[i] = 0;
      for (let j = 0; j < nvalues; j++) {
        v[i] += this.cell_values[j][i] * N[j];
      }
    }

    return v;
  },

  gradient() {
    const dx = this.cells_values[0][0] - this.cells_values[3][0];
    const dy = this.cells_values[1][0] - this.cells_values[3][0];
    const dz = this.cells_values[2][0] - this.cells_values[3][0];
    const g = new KVS.Vec3(dx, dy, dz);
    return this.jacobian().inverted().transposed().mulVec(g);
  },

  randomSampling() {
    const s = Math.random();
    const t = Math.random();
    const u = Math.random();

    let p;
    let q;
    let r;
    if (s + t + u <= 1) {
      p = s;
      q = t;
      r = u;
    } else if (s - t + u >= 1) {
      p = -u + 1;
      q = -s + 1;
      r = t;
    } else if (s + t - u >= 1) {
      p = -s + 1;
      q = -t + 1;
      r = u;
    } else if (-s + t + u >= 1) {
      p = -u + 1;
      q = s;
      r = -t + 1;
    } else {
      p = 0.5 * s - 0.5 * t - 0.5 * u + 0.5;
      q = -0.5 * s + 0.5 * t - 0.5 * u + 0.5;
      r = -0.5 * s - 0.5 * t + 0.5 * u + 0.5;
    }

    const local = new KVS.Vec3(p, q, r);
    return this.localToGlobal(local);
  },

  updateInterpolationFunctions(local) {
    const p = local.x;
    const q = local.y;
    const r = local.z;

    const N = this.interpolation_functions;
    N[0] = p;
    N[1] = q;
    N[2] = r;
    N[3] = 1 - p - q - r;
  },

  jacobian() {
    const C0 = new KVS.Vec3().fromArray(this.cell_coords[0]);
    const C1 = new KVS.Vec3().fromArray(this.cell_coords[1]);
    const C2 = new KVS.Vec3().fromArray(this.cell_coords[2]);
    const C3 = new KVS.Vec3().fromArray(this.cell_coords[3]);
    const J30 = C0.sub(C3).toArray();
    const J31 = C1.sub(C3).toArray();
    const J32 = C2.sub(C3).toArray();
    return new KVS.Mat3().fromArray2D([J30, J31, J32]);
  },
};

KVS.JSONLoader = jsontext => {
  const name = 'KVS.JSONLoader';
  const data = JSON.parse(jsontext);
  switch (data.object) {
    case 'PointObject':
      {
        return read_point(data, name);
      }
    case 'LineObject':
      {
        return read_line(data, name);
      }
    case 'PolygonObject':
      {
        return read_polygon(data, name);
      }
    case 'StructuredVolumeObject':
      {
        return read_structured(data, name);
      }
    case 'UnstructuredVolumeObject':
      {
        return read_unstructured(data, name);
      }
    default:
      break;
  }

  console.error(`${name}: Unknown object type is specified in the input file.`);
  return null;

  function read_point(data, name) {
    const object = new KVS.PointObject();
    if (data.coords == undefined) {
      console.error(`${name}: Cannot find 'coords' in the input file.`);
      return object;
    }

    object.coords = data.coords;
    object.colors = colors(data);
    set_min_max_coord(object, data);

    return object;
  }

  function read_line(data, name) {
    const object = new KVS.LineObject();
    if (data.coords == undefined) {
      console.error(`${name}: Cannot find 'coords' in the input file.`);
      return object;
    }

    object.coords = data.coords;
    object.line_type = line_type(data);
    object.width = line_width(data);
    object.colors = colors(data);
    set_min_max_coord(object, data);

    return object;
  }

  function read_polygon(data, name) {
    const object = new KVS.PolygonObject();
    if (data.coords == undefined) {
      console.error(`${name}: Cannot find 'coords' in the input file.`);
      return object;
    }

    if (data.connections == undefined) {
      console.error(`${name}: Cannot find 'connections' in the input file.`);
      return object;
    }

    object.coords = data.coords;
    object.connections = data.connections;
    object.colors = colors(data);
    set_min_max_coord(object, data);

    return object;
  }

  function read_structured(data, name) {
    const object = new KVS.StructuredVolumeObject();
    if (data.resolution == undefined) {
      console.error(`${name}: Cannot find 'resolution' in the input file.`);
      return object;
    }

    if (data.values == undefined) {
      console.error(`${name}: Cannot find 'values' in the input file.`);
      return object;
    }

    object.resolution = new KVS.Vec3().fromArray(data.resolution);
    object.values = data.values;
    object.updateMinMaxCoords();
    set_min_max_values(object, data);

    return object;
  }

  function read_unstructured(data, name) {
    const object = new KVS.UnstructuredVolumeObject();
    if (data.coords == undefined) {
      console.error(`${name}: Cannot find 'coords' in the input file.`);
      return object;
    }

    if (data.connections == undefined) {
      console.error(`${name}: Cannot find 'connections' in the input file.`);
      return object;
    }

    if (data.values == undefined) {
      console.error(`${name}: Cannot find 'values' in the input file.`);
      return object;
    }

    object.coords = data.coords;
    object.connections = data.connections;
    object.values = data.values;
    set_min_max_coords(object, data);
    set_min_max_values(object, data);

    return object;
  }

  function line_width(data) {
    return (data.width == undefined) ? 1 : data.width;
  }

  function line_type(data) {
    return (data.line_type == undefined) ? KVS.StripLine : kvs_line_type();

    function kvs_line_type() {
      return data.line_type == 'SegmentLine' ? KVS.SegmentLine : KVS.StripLine;
    }
  }

  function colors(object, data) {
    return (data.colors == undefined) ? [
      [0, 0, 0]
    ] : data.colors;
  }

  function set_min_max_coords(object, data) {
    if (data.min_coord == undefined && data.max_coord != undefined) {
      const max_coord = new KVS.Vec3().fromArray(data.max_coord);
      object.updateMinMaxCoords();
      object.setMinMaxCoords(object.min_coord, max_coord);
    } else if (data.min_coord != undefined && data.max_coord == undefined) {
      const min_coord = new KVS.Vec3().fromArray(data.min_coord);
      object.updateMinMaxCoords();
      object.setMinMaxCoords(min_coord, object.max_coord);
    } else if (data.min_coord != undefined && data.max_coord != undefined) {
      const min_coord = new KVS.Vec3().fromArray(data.min_coord);
      const max_coord = new KVS.Vec3().fromArray(data.max_coord);
      object.setMinMaxCoords(min_coord, max_coord);
    } else {
      object.updateMinMaxCoords();
    }
  }

  function set_min_max_values(object, data) {
    if (data.min_value == undefined && data.max_value != undefined) {
      const max_value = data.max_value;
      object.updateMinMaxValues();
      object.setMinMaxValues(object.min_value, max_value);
    } else if (data.min_value != undefined && data.max_value == undefined) {
      const min_value = data.min_value;
      object.updateMinMaxValues();
      object.setMinMaxValues(min_value, object.max_value);
    } else if (data.min_value != undefined && data.max_value != undefined) {
      const min_value = data.min_value;
      const max_value = data.max_value;
      object.setMinMaxValues(min_value, max_value);
    } else {
      object.updateMinMaxValues();
    }
  }
};

KVS.CreateHydrogenData = (dimx, dimy, dimz) => {
  const volume = new KVS.StructuredVolumeObject();
  volume.resolution.set(dimx, dimy, dimz);

  const kr1 = 32.0 / dimx;
  const kr2 = 32.0 / dimy;
  const kr3 = 32.0 / dimz;
  const kd = 6.0;

  const index = 0;
  for (let z = 0; z < dimz; ++z) {
    const dz = kr3 * (z - (dimz / 2.0));
    for (let y = 0; y < dimy; ++y) {
      const dy = kr2 * (y - (dimy / 2.0));
      for (let x = 0; x < dimx; ++x) {
        const dx = kr1 * (x - (dimx / 2.0));
        const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const cos_theta = dz / r;
        const phi = kd * (r * r) * Math.exp(-r / 2) * (3 * cos_theta * cos_theta - 1);

        let c = phi * phi;
        if (c > 255.0) {
          c = 255.0;
        }

        volume.values.push([c]);
      }
    }
  }

  volume.updateMinMaxCoords();
  volume.setMinMaxValues(0, 255);

  return volume;
};

KVS.CreateTornadoData = (dimx, dimy, dimz) => {
  const volume = new KVS.StructuredVolumeObject();
  volume.resolution.set(dimx, dimy, dimz);

  const t = 0;
  const dx = 1.0 / (dimx - 1.0);
  const dy = 1.0 / (dimy - 1.0);
  const dz = 1.0 / (dimz - 1.0);
  for (let k = 0; k < dimz; k++) {
    const z = k * dz;
    const xc = 0.5 + 0.1 * Math.sin(0.04 * t + 10.0 * z);
    const yc = 0.5 + 0.1 * Math.cos(0.03 * t + 3.0 * z);
    const r = 0.1 + 0.4 * z * z + 0.1 * z * Math.sin(8.0 * z);
    const r2 = 0.2 + 0.1 * z;
    for (let j = 0; j < dimy; j++) {
      const y = j * dy;
      for (let i = 0; i < dimx; i++) {
        const x = i * dx;
        let temp = Math.sqrt((y - yc) * (y - yc) + (x - xc) * (x - xc));
        let scale = Math.abs(r - temp);
        scale = scale > r2 ? 0.8 - scale : 1.0;

        let z0 = 0.1 * (0.1 - temp * z);
        if (z0 < 0.0) z0 = 0.0;
        temp = Math.sqrt(temp * temp + z0 * z0);

        const epsiron = 0.00000000001;
        scale = (r + r2 - temp) * scale / (temp + epsiron);
        scale = scale / (1 + z);

        const v0 = scale * (y - yc) + 0.1 * (x - xc);
        const v1 = scale * -(x - xc) + 0.1 * (y - yc);
        const v2 = scale * z0;
        volume.values.push([v0, v1, v2]);
      }
    }
  }

  volume.updateMinMaxCoords();
  volume.updateMinMaxValues();

  return volume;
};

// Vector magnitude
KVS.VectorMagnitude = () => {};

KVS.VectorMagnitude.prototype = {
  constructor: KVS.VectorMagnitude,

  exec(volume) {
    if (volume.vectorLength() != 3) {
      return volume;
    }

    const svolume = new KVS.StructuredVolumeObject();
    svolume.resolution = volume.resolution;

    const values = [];
    const nnodes = volume.numberOfNodes();
    for (let i = 0; i < nnodes; i++) {
      const s = new KVS.Vec3().fromArray(volume.values[i]).length();
      values.push([s]);
    }

    svolume.values = values;
    svolume.min_coord = volume.min_coord;
    svolume.max_coord = volume.max_coord;
    svolume.min_value = volume.min_value;
    svolume.max_value = volume.max_value;

    return svolume;
  }
};

// Bounding box
KVS.BoundingBox = function() {
  this.color = new KVS.Vec3();
  this.width = 1;
};

KVS.BoundingBox.prototype = {
  constructor: KVS.BoundingBox,

  setColor(color) {
    this.color = color;
  },

  setWidth(width) {
    this.width = width;
  },

  exec(object) {
    const minx = object.min_coord.x;
    const miny = object.min_coord.y;
    const minz = object.min_coord.z;

    const maxx = object.max_coord.x;
    const maxy = object.max_coord.y;
    const maxz = object.max_coord.z;

    const v0 = [minx, miny, minz];
    const v1 = [maxx, miny, minz];
    const v2 = [maxx, miny, maxz];
    const v3 = [minx, miny, maxz];
    const v4 = [minx, maxy, minz];
    const v5 = [maxx, maxy, minz];
    const v6 = [maxx, maxy, maxz];
    const v7 = [minx, maxy, maxz];

    const line = new KVS.LineObject();
    line.coords.push(v0);
    line.coords.push(v1);
    line.coords.push(v1);
    line.coords.push(v2);
    line.coords.push(v2);
    line.coords.push(v3);
    line.coords.push(v3);
    line.coords.push(v0);
    line.coords.push(v4);
    line.coords.push(v5);
    line.coords.push(v5);
    line.coords.push(v6);
    line.coords.push(v6);
    line.coords.push(v7);
    line.coords.push(v7);
    line.coords.push(v4);
    line.coords.push(v0);
    line.coords.push(v4);
    line.coords.push(v1);
    line.coords.push(v5);
    line.coords.push(v2);
    line.coords.push(v6);
    line.coords.push(v3);
    line.coords.push(v7);

    line.line_type = KVS.SegmentLine;
    line.width = this.width;
    line.colors.push(this.color.toArray());
    line.setMinMaxCoords(object.min_coord, object.max_coord);

    return line;
  },
};

// Extract edges
KVS.ExtractEdge = function() {
  this.color = new KVS.Vec3();
  this.width = 1;
};

KVS.ExtractEdge.prototype = {
  constructor: KVS.ExtractEdge,

  setColor(color) {
    this.color = color;
  },

  setWidth(width) {
    this.width = width;
  },

  exec(volume) {
    const line = new KVS.LineObject();

    if (!(volume instanceof KVS.UnstructuredVolumeObject)) {
      return line;
    }

    if (volume.numberOfNodesPerCell() != 4) {
      return line;
    }

    const ncells = volume.numberOfCells();
    for (let i = 0; i < ncells; i++) {
      const id = volume.connections[i];
      const v0 = volume.coords[id[0]];
      const v1 = volume.coords[id[1]];
      const v2 = volume.coords[id[2]];
      const v3 = volume.coords[id[3]];

      line.coords.push(v0);
      line.coords.push(v1);
      line.coords.push(v0);
      line.coords.push(v2);
      line.coords.push(v0);
      line.coords.push(v3);
      line.coords.push(v1);
      line.coords.push(v2);
      line.coords.push(v2);
      line.coords.push(v3);
      line.coords.push(v3);
      line.coords.push(v1);
    }

    line.line_type = KVS.SegmentLine;
    line.width = this.width;
    line.colors.push(this.color.toArray());
    line.setMinMaxCoords(volume.min_coord, volume.max_coord);

    return line;
  },
};

// Isosurface
KVS.Isosurface = function() {
  this.isovalue = 0;
};

KVS.Isosurface.prototype = {
  constructor: KVS.Isosurface,

  setIsovalue(value) {
    this.isovalue = value;
  },

  exec(object) {
    if (object instanceof KVS.StructuredVolumeObject) {
      return marching_cubes(object, this.isovalue);
    } else if (object instanceof KVS.UnstructuredVolumeObject) {
      return marching_tetrahedra(object, this.isovalue);
    } else {
      return new KVS.PolygonObject();
    }

    function marching_cubes(object, isovalue) {
      const polygon = new KVS.PolygonObject();
      const lut = new KVS.MarchingCubesTable();

      const smin = object.min_value;
      const smax = object.max_value;
      isovalue = KVS.Clamp(isovalue, smin, smax);

      let cell_index = 0;
      for (let z = 0; z < object.resolution.z - 1; z++) {
        for (let y = 0; y < object.resolution.y - 1; y++) {
          for (let x = 0; x < object.resolution.x - 1; x++) {
            const indices = cell_node_indices(cell_index++);
            const index = table_index(indices);
            if (index == 0) continue;
            if (index == 255) continue;

            for (let j = 0; lut.edgeID[index][j] != -1; j += 3) {
              const eid0 = lut.edgeID[index][j];
              const eid1 = lut.edgeID[index][j + 2];
              const eid2 = lut.edgeID[index][j + 1];

              const vid0 = lut.vertexID[eid0][0];
              const vid1 = lut.vertexID[eid0][1];
              const vid2 = lut.vertexID[eid1][0];
              const vid3 = lut.vertexID[eid1][1];
              const vid4 = lut.vertexID[eid2][0];
              const vid5 = lut.vertexID[eid2][1];

              const v0 = new KVS.Vec3(x + vid0[0], y + vid0[1], z + vid0[2]);
              const v1 = new KVS.Vec3(x + vid1[0], y + vid1[1], z + vid1[2]);
              const v2 = new KVS.Vec3(x + vid2[0], y + vid2[1], z + vid2[2]);
              const v3 = new KVS.Vec3(x + vid3[0], y + vid3[1], z + vid3[2]);
              const v4 = new KVS.Vec3(x + vid4[0], y + vid4[1], z + vid4[2]);
              const v5 = new KVS.Vec3(x + vid5[0], y + vid5[1], z + vid5[2]);

              const v01 = interpolated_vertex(v0, v1, isovalue);
              const v23 = interpolated_vertex(v2, v3, isovalue);
              const v45 = interpolated_vertex(v4, v5, isovalue);

              polygon.coords.push(v01);
              polygon.coords.push(v23);
              polygon.coords.push(v45);
            }
          }
          cell_index++;
        }
        cell_index += object.numberOfNodesPerLine();
      }

      const color = KVS.RainbowColorMap(smin, smax, isovalue);
      polygon.colors.push(color.toArray());

      const nfaces = polygon.coords.length / 3;
      for (let i = 0; i < nfaces; i++) {
        const indices = [3 * i, 3 * i + 1, 3 * i + 2];
        polygon.connections.push(indices);
      }

      return polygon;

      function cell_node_indices(cell_index) {
        const lines = object.numberOfNodesPerLine();
        const slices = object.numberOfNodesPerSlice();

        const id0 = cell_index;
        const id1 = id0 + 1;
        const id2 = id1 + lines;
        const id3 = id0 + lines;
        const id4 = id0 + slices;
        const id5 = id1 + slices;
        const id6 = id2 + slices;
        const id7 = id3 + slices;

        return [id0, id1, id2, id3, id4, id5, id6, id7];
      }

      function table_index(indices) {
        const s0 = object.values[indices[0]][0];
        const s1 = object.values[indices[1]][0];
        const s2 = object.values[indices[2]][0];
        const s3 = object.values[indices[3]][0];
        const s4 = object.values[indices[4]][0];
        const s5 = object.values[indices[5]][0];
        const s6 = object.values[indices[6]][0];
        const s7 = object.values[indices[7]][0];

        let index = 0;
        if (s0 > isovalue) {
          index |= 1;
        }
        if (s1 > isovalue) {
          index |= 2;
        }
        if (s2 > isovalue) {
          index |= 4;
        }
        if (s3 > isovalue) {
          index |= 8;
        }
        if (s4 > isovalue) {
          index |= 16;
        }
        if (s5 > isovalue) {
          index |= 32;
        }
        if (s6 > isovalue) {
          index |= 64;
        }
        if (s7 > isovalue) {
          index |= 128;
        }

        return index;
      }

      function interpolated_vertex(v0, v1, s) {
        const id0 = index_of(v0.x, v0.y, v0.z);
        const id1 = index_of(v1.x, v1.y, v1.z);

        const s0 = object.values[id0];
        const s1 = object.values[id1];

        const a = (s - s0) / (s1 - s0);
        const x = KVS.Mix(v0.x, v1.x, a);
        const y = KVS.Mix(v0.y, v1.y, a);
        const z = KVS.Mix(v0.z, v1.z, a);

        return [x, y, z];

        function index_of(x, y, z) {
          const nlines = object.numberOfNodesPerLine();
          const nslices = object.numberOfNodesPerSlice();
          return x + y * nlines + z * nslices;
        }
      }
    }

    function marching_tetrahedra(object, isovalue) {
      const polygon = new KVS.PolygonObject();
      const lut = new KVS.MarchingTetrahedraTable();

      const smin = object.min_value;
      const smax = object.max_value;
      isovalue = KVS.Clamp(isovalue, smin, smax);

      const ncells = object.connections.length;
      for (let cell_index = 0; cell_index < ncells; cell_index++) {
        const indices = cell_node_indices(cell_index);
        const index = table_index(indices);
        if (index == 0) continue;
        if (index == 15) continue;

        for (let j = 0; lut.edgeID[index][j] != -1; j += 3) {
          const eid0 = lut.edgeID[index][j];
          const eid1 = lut.edgeID[index][j + 1];
          const eid2 = lut.edgeID[index][j + 2];

          const vid0 = indices[lut.vertexID[eid0][0]];
          const vid1 = indices[lut.vertexID[eid0][1]];
          const vid2 = indices[lut.vertexID[eid1][0]];
          const vid3 = indices[lut.vertexID[eid1][1]];
          const vid4 = indices[lut.vertexID[eid2][0]];
          const vid5 = indices[lut.vertexID[eid2][1]];

          const v0 = interpolated_vertex(vid0, vid1, isovalue);
          const v1 = interpolated_vertex(vid2, vid3, isovalue);
          const v2 = interpolated_vertex(vid4, vid5, isovalue);

          polygon.coords.push(v0);
          polygon.coords.push(v1);
          polygon.coords.push(v2);
        }
      }

      const color = KVS.RainbowColorMap(smin, smax, isovalue);
      polygon.colors.push(color.toArray());

      const nfaces = polygon.coords.length / 3;
      for (let i = 0; i < nfaces; i++) {
        const indices = [3 * i, 3 * i + 1, 3 * i + 2];
        polygon.connections.push(indices);
      }

      return polygon;

      function cell_node_indices(cell_index) {
        return object.connections[cell_index];
      }

      function table_index(indices) {
        const s0 = object.values[indices[0]][0];
        const s1 = object.values[indices[1]][0];
        const s2 = object.values[indices[2]][0];
        const s3 = object.values[indices[3]][0];

        let index = 0;
        if (s0 > isovalue) {
          index |= 1;
        }
        if (s1 > isovalue) {
          index |= 2;
        }
        if (s2 > isovalue) {
          index |= 4;
        }
        if (s3 > isovalue) {
          index |= 8;
        }

        return index;
      }

      function interpolated_vertex(vid0, vid1, s) {
        const v0 = object.coords[vid0];
        const v1 = object.coords[vid1];

        const s0 = object.values[vid0][0];
        const s1 = object.values[vid1][0];

        const a = (s - s0) / (s1 - s0);
        const x = KVS.Mix(v0[0], v1[0], a);
        const y = KVS.Mix(v0[1], v1[1], a);
        const z = KVS.Mix(v0[2], v1[2], a);

        return [x, y, z];
      }
    }
  }
};

// SlicePlane
KVS.SlicePlane = function() {
  this.coef = new KVS.Vec4();
};

KVS.SlicePlane.prototype = {
  constructor: KVS.SlicePlane,

  setPlane() {
    if (arguments.length == 4) {
      const a = arguments[0];
      const b = arguments[1];
      const c = arguments[2];
      const d = arguments[3];
      this.setPlaneWithCoefficients(a, b, c, d);
    } else if (arguments.length == 2) {
      const point = arguments[0];
      const normal = arguments[1];
      this.setPlaneWithPointAndNormal(point, normal);
    }
  },

  setPlaneWithCoefficients(a, b, c, d) {
    this.coef = new KVS.Vec4(a, b, c, d);
  },

  setPlaneWithPointAndNormal(point, normal) {
    const w = point.clone().mulScalar(-1).dot(normal);
    this.coef = new KVS.Vec4(normal.x, normal.y, normal.z, w);
  },

  exec(object) {
    if (object instanceof KVS.StructuredVolumeObject) {
      return marching_cubes(object, this.coef);
    } else {
      return new KVS.PolygonObject();
    }

    function marching_cubes(object, coef) {
      const polygon = new KVS.PolygonObject();
      const lut = new KVS.MarchingCubesTable();

      const smin = object.min_value;
      const smax = object.max_value;

      for (let z = 0; z < object.resolution.z - 1; z++) {
        for (let y = 0; y < object.resolution.y - 1; y++) {
          for (let x = 0; x < object.resolution.x - 1; x++) {
            const index = table_index(x, y, z);
            if (index == 0) {
              continue;
            }
            if (index == 255) {
              continue;
            }

            for (let j = 0; lut.edgeID[index][j] != -1; j += 3) {
              const eid0 = lut.edgeID[index][j];
              const eid1 = lut.edgeID[index][j + 2];
              const eid2 = lut.edgeID[index][j + 1];

              const vid0 = lut.vertexID[eid0][0];
              const vid1 = lut.vertexID[eid0][1];
              const vid2 = lut.vertexID[eid1][0];
              const vid3 = lut.vertexID[eid1][1];
              const vid4 = lut.vertexID[eid2][0];
              const vid5 = lut.vertexID[eid2][1];

              const v0 = new KVS.Vec3(x + vid0[0], y + vid0[1], z + vid0[2]);
              const v1 = new KVS.Vec3(x + vid1[0], y + vid1[1], z + vid1[2]);
              const v2 = new KVS.Vec3(x + vid2[0], y + vid2[1], z + vid2[2]);
              const v3 = new KVS.Vec3(x + vid3[0], y + vid3[1], z + vid3[2]);
              const v4 = new KVS.Vec3(x + vid4[0], y + vid4[1], z + vid4[2]);
              const v5 = new KVS.Vec3(x + vid5[0], y + vid5[1], z + vid5[2]);

              const v01 = interpolated_vertex(v0, v1);
              const v23 = interpolated_vertex(v2, v3);
              const v45 = interpolated_vertex(v4, v5);

              polygon.coords.push(v01);
              polygon.coords.push(v23);
              polygon.coords.push(v45);

              const s0 = interpolated_value(v0, v1);
              const s1 = interpolated_value(v2, v3);
              const s2 = interpolated_value(v4, v5);
              const c0 = KVS.RainbowColorMap(smin, smax, s0);
              const c1 = KVS.RainbowColorMap(smin, smax, s1);
              const c2 = KVS.RainbowColorMap(smin, smax, s2);

              polygon.colors.push(c0.toArray());
              polygon.colors.push(c1.toArray());
              polygon.colors.push(c2.toArray());
            }
          }
        }
      }

      const nfaces = polygon.coords.length / 3;
      for (let i = 0; i < nfaces; i++) {
        const indices = [3 * i, 3 * i + 1, 3 * i + 2];
        polygon.connections.push(indices);
      }

      return polygon;

      function table_index(x, y, z) {
        const s0 = plane_function(x, y, z);
        const s1 = plane_function(x + 1, y, z);
        const s2 = plane_function(x + 1, y + 1, z);
        const s3 = plane_function(x, y + 1, z);
        const s4 = plane_function(x, y, z + 1);
        const s5 = plane_function(x + 1, y, z + 1);
        const s6 = plane_function(x + 1, y + 1, z + 1);
        const s7 = plane_function(x, y + 1, z + 1);

        let index = 0;
        if (s0 > 0) {
          index |= 1;
        }
        if (s1 > 0) {
          index |= 2;
        }
        if (s2 > 0) {
          index |= 4;
        }
        if (s3 > 0) {
          index |= 8;
        }
        if (s4 > 0) {
          index |= 16;
        }
        if (s5 > 0) {
          index |= 32;
        }
        if (s6 > 0) {
          index |= 64;
        }
        if (s7 > 0) {
          index |= 128;
        }

        return index;
      }

      function interpolated_vertex(v0, v1) {
        const s0 = plane_function(v0.x, v0.y, v0.z);
        const s1 = plane_function(v1.x, v1.y, v1.z);
        const a = Math.abs(s0 / (s1 - s0));

        const x = KVS.Mix(v0.x, v1.x, a);
        const y = KVS.Mix(v0.y, v1.y, a);
        const z = KVS.Mix(v0.z, v1.z, a);

        return [x, y, z];
      }

      function interpolated_value(v0, v1) {
        const s0 = plane_function(v0.x, v0.y, v0.z);
        const s1 = plane_function(v1.x, v1.y, v1.z);
        const a = Math.abs(s0 / (s1 - s0));

        const line_size = object.numberOfNodesPerLine();
        const slice_size = object.numberOfNodesPerSlice();
        const id0 = Math.floor(v0.x + v0.y * line_size + v0.z * slice_size);
        const id1 = Math.floor(v1.x + v1.y * line_size + v1.z * slice_size);

        return KVS.Mix(object.values[id0][0], object.values[id1][0], a);
      }

      function plane_function(x, y, z) {
        return coef.x * x + coef.y * y + coef.z * z + coef.w;
      }
    }
  },
};

// OrthoSlice
KVS.OrthoSlice = function() {
  this.module = new KVS.SlicePlane();
};

KVS.OrthoSlice.prototype = {
  constructor: KVS.OrthoSlice,

  setPlane(position, axis) {
    const normal = new KVS.Mat3().identity().row[axis];
    this.module.setPlaneWithPointAndNormal(normal.clone().mul(position), normal);
  },

  exec(object) {
    return this.module.exec(object);
  },
};

// Streamline
KVS.Streamline = function() {
  this.line_width = 1;
  this.seed_point = new KVS.Vec3();
  this.integration_step_length = 0.5;
  this.integration_time = 300;
  this.integration_method = KVS.RungeKutta4; // KVS.Euler, KVS.RungeKutta2, or KVS.RungeKutta4
  this.integration_direction = KVS.ForwardDirection; // KVS.ForwardDirection, KVS.BackwardDirection
};

KVS.Streamline.prototype = {
  constructor: KVS.Streamline,

  setLineWidth(width) {
    this.line_width = width;
  },

  setSeedPoint(p) {
    this.seed_point.set(p.x, p.y, p.z);
  },

  setIntegrationStepLength(length) {
    this.integration_step_length = length;
  },

  setIntegrationTime(time) {
    this.integration_time = time;
  },

  setIntegrationMethod(method) {
    this.integration_method = method;
  },

  setIntegrationDirection(direction) {
    this.integration_direction = direction;
  },

  exec(volume) {
    const line = new KVS.LineObject();

    if (!(volume instanceof KVS.StructuredVolumeObject)) {
      return line;
    }

    if (volume.vectorLength() != 3) {
      return line;
    }

    if (!inside_volume(this.seed_point)) {
      return line;
    }

    let vertex = this.seed_point;
    const coords = [];
    const colors = [];

    let value = interpolated_value(vertex);
    let color = interpolated_color(value);
    coords.push(vertex.toArray());
    colors.push(color.toArray());

    const method = this.integration_method;
    const integrator = [euler, runge_kutta_2, runge_kutta_4];
    const step_length = this.integration_step_length * this.integration_direction;
    for (let i = 0; i < this.integration_time; i++) {
      vertex = next_vertex(vertex, step_length, integrator[method]);
      if (!inside_volume(vertex)) {
        break;
      }

      value = interpolated_value(vertex);
      color = interpolated_color(value);

      coords.push(vertex.toArray());
      colors.push(color.toArray());
    }

    line.line_type = KVS.StripLine;
    line.width = this.line_width;
    line.coords = coords;
    line.colors = colors;
    line.min_coord = volume.min_coord;
    line.max_coord = volume.max_coord;

    return line;

    function next_vertex(p, step_length, integrator) {
      return integrator(p, step_length);
    }

    function euler(p, step_length) {
      const k0 = step_length;
      const v1 = p;

      // p + k1;
      const k1 = direction(v1).mulScalar(k0);
      return p.clone().add(k1);
    }

    function runge_kutta_2(p, step_length) {
      const k0 = step_length;
      const v1 = p;

      // v2 = p + k1 / 2;
      const k1 = direction(v1).mulScalar(k0);
      const v2 = p.clone().add(k1.clone().divScalar(2));
      if (!inside_volume(v2)) {
        return p;
      }

      // p + k2;
      const k2 = direction(v2).mulScalar(k0);
      return p.clone().add(k2);
    }

    function runge_kutta_4(p, step_length) {
      const k0 = step_length;
      const v1 = p;

      // v2 = p + k1 / 2;
      const k1 = direction(v1).mulScalar(k0);
      const v2 = p.clone().add(k1.clone().divScalar(2));
      if (!inside_volume(v2)) {
        return p;
      }

      // v3 = p + k2 / 2;
      const k2 = direction(v2).mulScalar(k0);
      const v3 = p.clone().add(k2.clone().divScalar(2));
      if (!inside_volume(v3)) {
        return p;
      }

      // v4 = p + k3;
      const k3 = direction(v3).mulScalar(k0);
      const v4 = p.clone().add(k3);
      if (!inside_volume(v4)) {
        return p;
      }

      // p + ( k1 + 2.0 * ( k2 + k3 ) + k4 ) / 6.0
      const k4 = direction(v4).mulScalar(k0);
      const tmp1 = k2.clone().add(k3).mulScalar(2);
      const tmp2 = k1.clone().add(tmp1).add(k4).divScalar(6);
      return p.clone().add(tmp2);
    }

    function direction(p) {
      return interpolated_value(p).normalize();
    }

    function interpolated_value(p) {
      const cell = new KVS.Vec3(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z));
      const indices = cell_node_indices(index_of(cell));

      const local = p.clone().sub(cell);
      const N = interpolation_function(local);

      const ret = new KVS.Vec3();
      for (let i = 0; i < 8; i++) {
        const v = new KVS.Vec3().fromArray(volume.values[indices[i]]);
        ret.add(v.mulScalar(N[i]));
      }

      return ret;

      function index_of(cell) {
        const dim = volume.resolution;
        return cell.x + dim.x * cell.y + dim.x * dim.y * cell.z;
      }

      function cell_node_indices(cell_index) {
        const lines = volume.numberOfNodesPerLine();
        const slices = volume.numberOfNodesPerSlice();

        const id0 = cell_index;
        const id1 = id0 + 1;
        const id2 = id1 + lines;
        const id3 = id0 + lines;
        const id4 = id0 + slices;
        const id5 = id1 + slices;
        const id6 = id2 + slices;
        const id7 = id3 + slices;

        return [id0, id1, id2, id3, id4, id5, id6, id7];
      }

      function interpolation_function(p) {
        const x = p.x;
        const y = p.y;
        const z = p.z;

        const N0 = (1 - x) * (1 - y) * z;
        const N1 = x * (1 - y) * z;
        const N2 = x * y * z;
        const N3 = (1 - x) * y * z;
        const N4 = (1 - x) * (1 - y) * (1 - z);
        const N5 = x * (1 - y) * (1 - z);
        const N6 = x * y * (1 - z);
        const N7 = (1 - x) * y * (1 - z);

        return [N0, N1, N2, N3, N4, N5, N6, N7];
      }
    }

    function interpolated_color(v) {
      const smin = volume.min_value;
      const smax = volume.max_value;
      return KVS.RainbowColorMap(smin, smax, v.length());
    }

    function inside_volume(p) {
      const dimx = volume.resolution.x;
      const dimy = volume.resolution.y;
      const dimz = volume.resolution.z;

      if (p.x < 0 || dimx - 1 < p.x) return false;
      if (p.y < 0 || dimy - 1 < p.y) return false;
      if (p.z < 0 || dimz - 1 < p.z) return false;

      return true;
    }
  },
};
