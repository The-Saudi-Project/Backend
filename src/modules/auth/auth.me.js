export const me = async (req, res) => {
  res.json({
    id: req.user.id,
    role: req.user.role,
  });
};
