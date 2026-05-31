const locations = [
  { name: "Panambur Beach", id: 1 },
  { name: "Mangaladevi Temple", id: 14 },
  { name: "Sasihithlu Beach", id: 8 }
];
const q = "route me to pnanburu and mngldevi";

const findLocationsInText = (text) => {
    const textLower = text.toLowerCase();
    const words = textLower.split(/\W+/).filter(w => w.length > 3);
    const matched = new Set();
    
    const distance = (a, b) => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1, 
            matrix[j - 1][i] + 1, 
            matrix[j - 1][i - 1] + indicator 
          );
        }
      }
      return matrix[b.length][a.length];
    };

    for (const loc of locations) {
      const locNameLower = loc.name.toLowerCase();
      if (textLower.includes(locNameLower)) {
        matched.add(loc);
        continue;
      }
      
      const locWords = locNameLower.split(/\W+/).filter(w => w.length > 3 && !['beach', 'temple', 'park', 'lake', 'mall', 'chapel', 'church'].includes(w));
      
      let isMatch = false;
      for (const lw of locWords) {
        for (const w of words) {
          const dist = distance(lw, w);
          if (dist <= 2 || (lw.length >= 4 && w.length >= 4 && (lw.startsWith(w.substring(0, 4)) || w.startsWith(lw.substring(0, 4))))) {
            isMatch = true;
            break;
          }
        }
        if (isMatch) break;
      }
      
      if (isMatch) matched.add(loc);
    }
    return Array.from(matched);
  };

console.log("Matched:", findLocationsInText(q).map(l => l.name));
