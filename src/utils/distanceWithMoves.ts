import { levenshteinDistance } from "./levenshteinDistance";

export const distanceWithMoves = (arr1:any[], arr2:any[], moves = 0):number => {
  let dist = levenshteinDistance(arr1, arr2);
  if (moves > arr1.length) return dist;
  if (dist === 0) return dist;
 
  let minDist = dist;
  let minArr = arr1;

  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j <= arr1.length; j++) {
      if (j === i) continue;
      if (j === i + 1) continue;
      const tempArr = [...arr1];
      let jj = j;
      if (i < j) jj--;
      tempArr.splice(jj, 0, ...tempArr.splice(i, 1));

      const dist = levenshteinDistance(tempArr, arr2) + 1;
      if (dist < minDist) {
        minDist = dist;
        minArr = tempArr;
      }
    }
  }

  return Math.min(
    minDist,
    distanceWithMoves(minArr, arr2, moves + 1) + 1
  );
}

// const tests = [
//   [1,2,3,4,5,6],
//   [6,5,4,3,2,1],
//   [1,4,2,3,5,6],
//   [4,5,6,1,2,3],
//   [2,1,3,4,6,5],
//   [3,2,1,4,5,6],
// ]

// tests.forEach(arr => {
//   console.log(
//     arr,
//     6 - distanceWithMoves(arr,[1,2,3,4,5,6])
//   )
// })
