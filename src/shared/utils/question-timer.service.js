const timers = new Map();

export function scheduleQuestionTimeout(gameId, duration, callback) {
  clearQuestionTimeout(gameId);

  const timer = setTimeout(() => {
    timers.delete(gameId);

    Promise.resolve(callback()).catch((error) => {
      console.error("Question timeout callback failed:", error);
    });
  }, duration * 1000);

  timers.set(gameId, timer);
}

export function clearQuestionTimeout(gameId) {
  const timer = timers.get(gameId);

  if (timer) {
    clearTimeout(timer);
    timers.delete(gameId);
  }
}
