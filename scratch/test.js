const locations = [
  { name: "Panambur Beach", id: 1 },
  { name: "Mangaladevi Temple", id: 14 },
  { name: "City Centre Mall", id: 7 },
  { name: "St. Aloysius Chapel", id: 3 },
  { name: "The Ocean Pearl", id: 21 },
  { name: "Sasihithlu Beach", id: 8 }
];

const levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    let prevRow = Array(b.length + 1).fill(0).map((_, i) => i);
    for (let i = 0; i < a.length; i++) {
      const currRow = [i + 1];
      for (let j = 0; j < b.length; j++) {
        const indicator = a[i] === b[j] ? 0 : 1;
        currRow.push(Math.min(currRow[j] + 1, prevRow[j + 1] + 1, prevRow[j] + indicator));
      }
      prevRow = currRow;
    }
    return prevRow[b.length];
};

const findLocationsInText = (text) => {
    const textLower = text.toLowerCase();
    const matched = new Set();
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const loc of locations) {
      const name = loc.name.toLowerCase();
      if (textLower.includes(name)) {
        matched.add(loc);
        continue;
      }

      if (normalize(textLower).includes(normalize(name))) {
        matched.add(loc);
        continue;
      }
      
      const significantWords = name.split(/\W+/).filter(w => 
        w.length >= 4 && 
        !['beach', 'temple', 'park', 'lake', 'mall', 'chapel', 'church', 'centre', 'hotel', 'restaurant'].includes(w)
      );

      for (const sw of significantWords) {
        const textWords = textLower.split(/\W+/).filter(w => w.length >= 3);
        let found = false;
        for (const tw of textWords) {
          const dist = levenshtein(sw, tw);
          const maxDist = sw.length > 5 ? 2 : 1;
          if (dist <= maxDist || (sw.length >= 5 && tw.length >= 5 && (sw.startsWith(tw.substring(0, 4)) || tw.startsWith(sw.substring(0, 4))))) {
             found = true;
             break;
          }
        }
        if (found) {
          matched.add(loc);
          break;
        }
      }
    }
    return Array.from(matched);
};

console.log("Query 1:", findLocationsInText("pananburu").map(l=>l.name));
console.log("Query 2:", findLocationsInText("take me to mngldevi").map(l=>l.name));
console.log("Query 3:", findLocationsInText("which city is this").map(l=>l.name));
console.log("Query 4:", findLocationsInText("ocean pearl").map(l=>l.name));
console.log("Query 5:", findLocationsInText("aloysius").map(l=>l.name));
console.log("Query 6:", findLocationsInText("sultan btry").map(l=>l.name));
