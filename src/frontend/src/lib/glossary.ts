export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  r: {
    term: "Pearson r (correlation)",
    definition:
      "A number from -1 to 1 measuring how tightly two things move together in a straight-line pattern. Closer to 1 or -1 means a stronger relationship; closer to 0 means barely any straight-line relationship. It says nothing about which one causes the other.",
  },
  percentile: {
    term: "Percentile",
    definition:
      "Where a value ranks compared to everyone else, out of 100. The 70th percentile means roughly 70% of the group scored at or below that value.",
  },
  sd: {
    term: "Standard deviation (SD)",
    definition:
      "A measure of how spread out values are around the average. In a roughly bell-shaped distribution, about two-thirds of the group falls within one SD of the mean.",
  },
  density: {
    term: "Density curve",
    definition:
      "A smoothed version of a histogram — instead of counting how many people fall into discrete buckets, it draws a continuous curve showing roughly how common each value is.",
  },
  matrix: {
    term: "Correlation matrix",
    definition:
      "A grid showing the Pearson r between every pair of variables at once. The diagonal is always 1.00, since a variable perfectly correlates with itself.",
  },
  regression: {
    term: "Regression coefficient (β)",
    definition:
      "When several related variables are considered together, each one's raw correlation can overstate its own effect because it overlaps with the others. A regression coefficient corrects for that overlap by asking: holding everything else equal, what does this one variable contribute on its own?",
  },
  effectSize: {
    term: "Effect size",
    definition:
      "The actual size of a difference between two groups, in the outcome's own units — here, IQ points — rather than just whether a difference exists at all.",
  },
  n: {
    term: "Sample size (n)",
    definition: "How many children a statistic was calculated from. A bigger n generally means a more stable, trustworthy estimate.",
  },
  causation: {
    term: "Correlation ≠ causation",
    definition:
      "Two variables moving together doesn't tell you one causes the other. Both could be driven by a third factor, the direction could run backwards, or it could be coincidence in this particular sample.",
  },
};
