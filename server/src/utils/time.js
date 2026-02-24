export const parseWindowToMs = (window = '30m') => {
  const match = /^(\d+)([mh])$/.exec(window);
  if (!match) return 30 * 60 * 1000;
  const val = Number(match[1]);
  return match[2] === 'h' ? val * 60 * 60 * 1000 : val * 60 * 1000;
};
