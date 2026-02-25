module.exports = function (options, webpack) {
  const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined;

  return {
    ...options,
    //watch: isWatchMode,
    mode: isDevelopment ? "development" : options.mode,
  }

}
