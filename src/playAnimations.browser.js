/* global document */
module.exports = async function playAnimations(speed) {
  function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  await wait(1000);
  const frames = document.querySelectorAll('svg > g, svg > use');
  for (const frame of frames) {
    for (const node of frames) {
      node.style.display = 'none';
    }
    frame.style.display = '';
    await wait(33 / speed);
  }
};
