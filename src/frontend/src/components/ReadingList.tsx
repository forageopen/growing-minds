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
