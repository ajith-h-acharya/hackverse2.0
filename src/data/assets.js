const imageModules = import.meta.glob('../assets/*.{png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default',
});

const pages = ['panamburBeach', 'kadriTemple', 'stAloysius', 'pilikula', 'tannirbhaviBeach'];

const getAsset = (name) => {
  const candidates = [
    `../assets/${name}.png`,
    `../assets/${name}.jpg`,
    `../assets/${name}.jpeg`,
    `../assets/${name}.svg`,
  ];

  const matchedPath = candidates.find((path) => path in imageModules);
  return matchedPath ? imageModules[matchedPath] : '';
};

const getGallery = (name) => {
  const variants = Object.entries(imageModules)
    .filter(([path]) => path.startsWith(`../assets/${name}`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, module]) => module);

  return variants.length > 0 ? variants : [getAsset(name)];
};

export const assets = pages.reduce((acc, name) => {
  acc[name] = getAsset(name);
  return acc;
}, {});

export const galleries = pages.reduce((acc, name) => {
  acc[name] = getGallery(name);
  return acc;
}, {});
