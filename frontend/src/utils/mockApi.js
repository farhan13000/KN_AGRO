const delay = 250;

export const simulateNetwork = (payload, shouldFail = false) =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Unable to load information right now."));
        return;
      }
      resolve(payload);
    }, delay);
  });
