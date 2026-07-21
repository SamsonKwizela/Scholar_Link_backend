const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Internship = require('./models/Internship');

dotenv.config();

const internships = [
  {
    title: "Software Engineering Intern",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    duration: "3 months",
    deadline: new Date("2025-08-15"),
    description: "Join our dynamic engineering team to work on cutting-edge web applications using modern technologies. You'll collaborate with senior engineers to build scalable solutions.",
    requirements: "Currently pursuing a degree in Computer Science or related field. Proficiency in JavaScript/Node.js. Understanding of REST APIs and databases.",
    benefits: "Competitive stipend, flexible work hours, mentorship program, potential full-time offer, health insurance coverage.",
    idealCandidate: "A passionate learner with strong problem-solving skills, excellent communication abilities, and a drive to write clean, maintainable code.",
    responsibilities: "Develop and maintain web application features, write unit tests, participate in code reviews, collaborate with cross-functional teams, document technical specifications.",
    expectedOutcome: "Contribute to at least 2 major features, improve code coverage by 15%, deliver a technical presentation to the team.",
    salary: 2500
  },
  {
    title: "Data Science Intern",
    company: "Analytics Pro Inc.",
    location: "New York, NY",
    duration: "4 months",
    deadline: new Date("2025-09-01"),
    description: "Work with our data science team to analyze large datasets, build predictive models, and derive actionable insights that drive business decisions.",
    requirements: "Strong foundation in statistics and mathematics. Experience with Python, pandas, and scikit-learn. Knowledge of SQL and data visualization tools.",
    benefits: "Monthly stipend of $3,000, access to premium data science courses, networking events with industry leaders, flexible remote work options.",
    idealCandidate: "Analytical thinker with curiosity for data patterns, strong mathematical background, and ability to communicate complex findings to non-technical stakeholders.",
    responsibilities: "Clean and preprocess datasets, build and evaluate machine learning models, create data visualizations and reports, assist in A/B testing analysis.",
    expectedOutcome: "Complete 3 data analysis projects, develop 1 predictive model with 85%+ accuracy, present findings to stakeholders.",
    salary: 3000
  },
  {
    title: "UX/UI Design Intern",
    company: "Creative Digital Agency",
    location: "Austin, TX",
    duration: "3 months",
    deadline: new Date("2025-08-30"),
    description: "Design intuitive and engaging user experiences for web and mobile applications. Work closely with product managers and developers to bring designs to life.",
    requirements: "Portfolio demonstrating UX/UI design skills. Proficiency in Figma, Adobe Creative Suite, or similar tools. Understanding of design principles and user-centered design.",
    benefits: "Stipend of $2,200/month, portfolio development opportunities, exposure to diverse client projects, design tool subscriptions, team building activities.",
    idealCandidate: "Creative problem-solver with keen eye for detail, strong visual design skills, empathy for users, and ability to iterate based on feedback.",
    responsibilities: "Create wireframes and prototypes, conduct user research and usability testing, design high-fidelity mockups, maintain design systems, collaborate with development team.",
    expectedOutcome: "Complete design for 2 major features, conduct and present user research findings, contribute to design system documentation.",
    salary: 2200
  }
];

const addInternships = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing internships (optional - remove if you want to keep existing data)
    // await Internship.deleteMany({});
    // console.log('Cleared existing internships');

    // Insert new internships
    const createdInternships = await Internship.insertMany(internships);
    console.log(`Successfully added ${createdInternships.length} internships:`);
    
    createdInternships.forEach((internship, index) => {
      console.log(`${index + 1}. ${internship.title} at ${internship.company}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error adding internships:', error);
    process.exit(1);
  }
};

addInternships();