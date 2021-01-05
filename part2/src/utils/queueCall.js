async function queueCall(arr) {
  function delay(t) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, t);
    });
  }

  for (let { movemap, t } of arr) {
    movemap();
    await delay(t);
  }
}

export default queueCall;
