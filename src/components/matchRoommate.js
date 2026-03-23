export const calculateMatch = (user, candidate) => {
  let score = 0;

  if (user.city === candidate.city) score += 30;
  if (Math.abs(user.budget - candidate.budget) <= 2000) score += 25;
  if (user.food === candidate.food) score += 15;
  if (user.sleep === candidate.sleep) score += 15;
  if (user.workType === candidate.workType) score += 15;

  return score;
};

export const getMatchExplanation = (user, candidate) => {
  const reasons = [];

  if (user.city === candidate.city)
    reasons.push("You both are looking in the same city");

  if (Math.abs(user.budget - candidate.budget) <= 2000)
    reasons.push("Your budgets are compatible");

  if (user.food === candidate.food)
    reasons.push(`Both prefer ${user.food} food`);

  if (user.sleep === candidate.sleep)
    reasons.push("You have similar sleep schedules");

  if (user.workType === candidate.workType)
    reasons.push("You have similar work routines");

  return reasons;
};
