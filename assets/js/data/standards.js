/*
 * STEM 207 — the standards activities are tagged with (activity `standards: [codes]`).
 *
 * Only codes listed here may be used (tests/tools/test_content.js checks). Each one was verified against
 * the official source on October 28, 2026:
 *   CSTA  2017 CSTA K-12 Computer Science Standards (Levels 1A grades K-2, 1B grades 3-5, 2 grades 6-8),
 *         from CSTA's official progression chart. The wording below is CSTA's.
 *   NGSS  Next Generation Science Standards performance expectations, from nextgenscience.org. The text
 *         is the start of each official statement, shortened. Maine's science standards are NGSS-based.
 * Mappings are conservative (1–3 per activity). An activity with no strong fit gets standards: [].
 * Educators see the codes on activity and Learning Plan pages; students don't.
 */
window.STEM = window.STEM || {};
(function () {
  const CSTA = "https://csteachers.org/k12standards/";
  const NGSS = (topic) => `https://www.nextgenscience.org/topic-arrangement/${topic}`;
  const c = (text) => ({ set: "CSTA", text, url: CSTA });
  const n = (topic, text) => ({ set: "NGSS", text, url: NGSS(topic) });
  window.STEM.standards = {
    // CSTA, Algorithms & Programming
    "1A-AP-08": c("Model daily processes by creating and following algorithms (sets of step-by-step instructions) to complete tasks."),
    "1A-AP-09": c("Model the way programs store and manipulate data by using numbers or other symbols to represent information."),
    "1A-AP-10": c("Develop programs with sequences and simple loops, to express ideas or address a problem."),
    "1A-AP-14": c("Debug (identify and fix) errors in an algorithm or program that includes sequences and simple loops."),
    "1B-AP-08": c("Compare and refine multiple algorithms for the same task and determine which is the most appropriate."),
    "1B-AP-09": c("Create programs that use variables to store and modify data."),
    "1B-AP-10": c("Create programs that include sequences, events, loops, and conditionals."),
    "1B-AP-13": c("Use an iterative process to plan the development of a program by including others' perspectives and considering user preferences."),
    "1B-AP-15": c("Test and debug (identify and fix errors) a program or algorithm to ensure it runs as intended."),
    "2-AP-10": c("Use flowcharts and/or pseudocode to address complex problems as algorithms."),
    "2-AP-11": c("Create clearly named variables that represent different data types and perform operations on their values."),
    "2-AP-12": c("Design and iteratively develop programs that combine control structures, including nested loops and compound conditionals."),
    "2-AP-13": c("Decompose problems and subproblems into parts to facilitate the design, implementation, and review of programs."),
    "2-AP-14": c("Create procedures with parameters to organize code and make it easier to reuse."),
    "2-AP-15": c("Seek and incorporate feedback from team members and users to refine a solution that meets user needs."),
    "2-AP-17": c("Systematically test and refine programs using a range of test cases."),
    "2-AP-18": c("Distribute tasks and maintain a project timeline when collaboratively developing computational artifacts."),
    // CSTA, Data & Analysis
    "1A-DA-07": c("Identify and describe patterns in data visualizations, such as charts or graphs, to make predictions."),
    "1B-DA-06": c("Organize and present collected data visually to highlight relationships and support a claim."),
    "1B-DA-07": c("Use data to highlight or propose cause-and-effect relationships, predict outcomes, or communicate an idea."),
    "2-DA-07": c("Represent data using multiple encoding schemes."),
    "2-DA-09": c("Refine computational models based on the data they have generated."),
    // CSTA, Impacts of Computing
    "2-IC-20": c("Compare tradeoffs associated with computing technologies that affect people's everyday activities and career options."),
    "2-IC-21": c("Discuss issues of bias and accessibility in the design of existing technologies."),
    // NGSS, Engineering Design
    "K-2-ETS1-3": n("k-2engineering-design", "Analyze data from tests of two objects designed to solve the same problem to compare the strengths and weaknesses of how each performs."),
    "3-5-ETS1-1": n("3-5engineering-design", "Define a simple design problem reflecting a need or a want that includes specified criteria for success and constraints on materials, time, or cost."),
    "3-5-ETS1-3": n("3-5engineering-design", "Plan and carry out fair tests in which variables are controlled and failure points are considered to identify aspects of a model or prototype that can be improved."),
    "MS-ETS1-1": n("msengineering-design", "Define the criteria and constraints of a design problem with sufficient precision to ensure a successful solution…"),
    "MS-ETS1-2": n("msengineering-design", "Evaluate competing design solutions using a systematic process to determine how well they meet the criteria and constraints of the problem."),
    "MS-ETS1-3": n("msengineering-design", "Analyze data from tests to determine similarities and differences among several design solutions to identify the best characteristics of each…"),
    "MS-ETS1-4": n("msengineering-design", "Develop a model to generate data for iterative testing and modification of a proposed object, tool, or process such that an optimal design can be achieved."),
    // NGSS, physical science
    "2-PS1-1": n("2structure-and-properties-matter", "Plan and conduct an investigation to describe and classify different kinds of materials by their observable properties."),
    "3-PS2-1": n("3forces-and-interactions", "Plan and conduct an investigation to provide evidence of the effects of balanced and unbalanced forces on the motion of an object."),
    "4-PS3-2": n("4energy", "Make observations to provide evidence that energy can be transferred from place to place by sound, light, heat, and electric currents."),
    "MS-PS2-2": n("msforces-and-interactions", "Plan an investigation to provide evidence that the change in an object's motion depends on the sum of the forces on the object and the mass of the object."),
    // NGSS, life and Earth science
    "2-LS4-1": n("2interdependent-relationships-ecosystems", "Make observations of plants and animals to compare the diversity of life in different habitats."),
    "3-LS4-3": n("3interdependent-relationships-ecosystems-environmental-impacts-organisms", "Construct an argument with evidence that in a particular habitat some organisms can survive well, some survive less well, and some cannot survive at all."),
    "4-ESS2-1": n("4earths-systems-processes-shape-earth", "Make observations and/or measurements to provide evidence of the effects of weathering or the rate of erosion by water, ice, wind, or vegetation."),
    "4-ESS2-2": n("4earths-systems-processes-shape-earth", "Analyze and interpret data from maps to describe patterns of Earth's features."),
  };
})();
