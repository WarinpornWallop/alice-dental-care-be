exports.hello = async (req, res, next) => {
  res.status(200).json({ message: "Who wants to play a game?" });
};
