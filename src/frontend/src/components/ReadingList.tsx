interface Citation {
  authors: string;
  year: string;
  title: string;
  venue: string;
  doi: string;
}

const CITATIONS: Citation[] = [
  {
    authors: "Fukuda-Parr, S.",
    year: "2003",
    title: "The Human Development Paradigm: Operationalizing Sen's Ideas on Capabilities",
    venue: "Feminist Economics, 9(2-3), 301-317",
    doi: "10.1080/1354570022000077980",
  },
  {
    authors: "Hopkins, A. L., Gibbes, C., Clement, V., Inurreta Díaz, A. F., Reyes Can, A., & Jiménez-Osornio, J.",
    year: "2023",
    title: "Analysis of Sub-National Variation in Global Development Goals to Inform Locally Relevant Sustainable Development",
    venue: "Environment, Development and Sustainability, 27(1), 1575-1596",
    doi: "10.1007/s10668-023-03931-5",
  },
  {
    authors: "Reinholz, D. L., Ridgway, S., Sukumar, P. T., & Shah, N.",
    year: "2023",
    title: "Visualizing Inequity: How STEM Educators Interpret Data Visualizations to Make Judgments About Racial Inequity",
    venue: "SN Social Sciences, 3(5)",
    doi: "10.1007/s43545-023-00664-0",
  },
  {
    authors: "Poon, B. T., Atchison, C., Kwan, A., & Veasey, C.",
    year: "2022",
    title: "A Community-Based Systems Dynamics Approach for Understanding Determinants of Children's Social and Emotional Well-Being",
    venue: "Health & Place, 73, 102712",
    doi: "10.1016/j.healthplace.2021.102712",
  },
  {
    authors: "Rojas, I., & Ju, W.",
    year: "2009",
    title: "Visualization and Empowerment",
    venue: "Proceedings of the Seventh ACM Conference on Creativity and Cognition, 401-402",
    doi: "10.1145/1640233.1640321",
  },
  {
    authors: "Heer, J., & Hellerstein, J. M.",
    year: "2009",
    title: "Data Visualization and Social Data Analysis",
    venue: "Proceedings of the VLDB Endowment, 2(2), 1656-1657",
    doi: "10.14778/1687553.1687621",
  },
  {
    authors: "Garcia-Retamero, R., & Galesic, M.",
    year: "2010",
    title: "Who Profits from Visual Aids: Overcoming Challenges in People's Understanding of Risks",
    venue: "Social Science & Medicine, 70(7), 1019-1025",
    doi: "10.1016/j.socscimed.2009.11.031",
  },
  {
    authors: "Huang, D., Tory, M., Aseniero, B. A., Bartram, L., Bateman, S., Carpendale, S., Tang, A., & Woodbury, R.",
    year: "2015",
    title: "Personal Visualization and Personal Visual Analytics",
    venue: "IEEE Transactions on Visualization and Computer Graphics, 21(3), 420-433",
    doi: "10.1109/tvcg.2014.2359887",
  },
  {
    authors: "Miller, J. E., Windschitl, P. D., Treat, T. A., & Scherer, A. M.",
    year: "2019",
    title: "Unhealthy and Unaware? Misjudging Social Comparative Standing for Health-Relevant Behavior",
    venue: "Journal of Experimental Social Psychology, 85, 103873",
    doi: "10.1016/j.jesp.2019.103873",
  },
  {
    authors: "Fellner-Röhling, G., Hromek, K., Kleinknecht, J., & Ludwig, S.",
    year: "2023",
    title: "How to Counteract Biased Self-Assessments? An Experimental Investigation of Reactions to Social Information",
    venue: "Journal of Economic Behavior & Organization, 206, 1-25",
    doi: "10.1016/j.jebo.2022.12.002",
  },
  {
    authors: "Okan, Y., Garcia-Retamero, R., Cokely, E. T., & Maldonado, A.",
    year: "2015",
    title: "Improving Risk Understanding Across Ability Levels: Encouraging Active Processing with Dynamic Icon Arrays",
    venue: "Journal of Experimental Psychology: Applied, 21(2), 178-194",
    doi: "10.1037/xap0000045",
  },
  {
    authors: "Mosca, A., Ottley, A., & Chang, R.",
    year: "2021",
    title: "Does Interaction Improve Bayesian Reasoning with Visualization?",
    venue: "Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems, 1-14",
    doi: "10.1145/3411764.3445176",
  },
  {
    authors: "Chesney, D. L., & Obrecht, N. A.",
    year: "2011",
    title: "Statistical Judgments Are Influenced by the Implied Likelihood That Samples Represent the Same Population",
    venue: "Memory & Cognition, 40(3), 420-433",
    doi: "10.3758/s13421-011-0155-3",
  },
  {
    authors: "Resnick, I., Kastens, K. A., & Shipley, T. F.",
    year: "2018",
    title: "How Students Reason About Visualizations from Large Professionally Collected Data Sets: A Study of Students Approaching the Threshold of Data Proficiency",
    venue: "Journal of Geoscience Education, 66(1), 55-76",
    doi: "10.1080/10899995.2018.1411724",
  },
];

export function ReadingList() {
  return (
    <ul className="reading-list">
      {CITATIONS.map((c) => (
        <li key={c.doi}>
          <span className="cite-title">{c.title}</span>
          <br />
          {c.authors} ({c.year}). <em>{c.venue}</em>.{" "}
          <a href={`https://doi.org/${c.doi}`} target="_blank" rel="noreferrer">
            doi.org/{c.doi}
          </a>
        </li>
      ))}
    </ul>
  );
}
