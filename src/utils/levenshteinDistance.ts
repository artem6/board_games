export const levenshteinDistance = (a: string | any[], b: string | any[]) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  var matrix = [];

  var i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  var j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      let same = false;
      if (typeof a === 'string' && typeof b === 'string') {
        same = b.charAt(i - 1) === a.charAt(j - 1);
      } else {
        same = b[i - 1] === a[j - 1];
      }
      if (same) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
        );
      }
    }
  }

  return matrix[b.length][a.length];
};
