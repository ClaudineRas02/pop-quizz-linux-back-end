const timers = new Map();

export function scheduleQuestionTimeout(gameId, duration, callback) {
  clearQuestionTimeout(gameId);

  const timer = setTimeout(() => {
    callback();
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
