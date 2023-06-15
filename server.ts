import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { courses } from "./includes/courses";
import { instructors } from "./includes/instructors";

(async function () {
  const typeDefs = `
    enum Categories {
      WEB
      GAME
      OTHER
    }

    type Course {
      id: Int,
      name: String,
      description: String,
      link: String,
      price: Int,
      category: Categories
      postedBy: Instructor
    }

    type Instructor {
      id: Int,
      firstName: String,
      lastName: String,
      website: String,
      image: String,
      title: String,
      postedCourses: [Course]
    }

    input CourseInput {
      name: String!
      description: String!
      price: Int!
      category: Categories=OTHER
    }

    input CourseUpdateInput {
      id: Int
      name: String
      description: String
      price: Int
    }

    type Query {
      hello: String!
      totalCourses: Int!
      allCourses: [Course]!
      getCourseById(id: ID!): Course
      totalInstructors: Int!
      allInstructors: [Instructor]
    }

    type Mutation {
      postCourse(input: CourseInput!): Course!
      updateCourse(input: CourseUpdateInput!): Course!
      deleteCourse(id: Int!): Course!
    }
  `;

  const resolvers = {
    Query: {
      hello: () => "Hello World !",
      totalCourses: () => courses.length,
      allCourses: () => courses,
      getCourseById: (_: any, args: any) =>
        courses.find((c) => c.id === Number(args.id)),
      totalInstructors: () => instructors.length,
      allInstructors: () => instructors,
    },
    Mutation: {
      postCourse: (_: any, args: any) => {
        // _ = parent (obligatoire)
        const newCourse = {
          id: courses.length + 1,
          ...args.input,
        };
        courses.push(newCourse);
        return newCourse;
      },
      updateCourse: (_: any, args: any) => {
        let foundedCourse = courses.find((c) => c.id === args.input["id"]);
        if (foundedCourse) foundedCourse.name = args.input["name"];
        return foundedCourse;
      },
      deleteCourse: (_: any, args: any) => {
        const deletedCourse = courses.find((c) => c.id === args.id);
        const index = courses.map((c) => c.id).indexOf(args.id);
        courses.splice(index, 1);
        return deletedCourse;
      },
    },
    Course: {
      postedBy: (_: any) => {
        return instructors.find((i) => i.firstName === _.instructor);
      },
    },
    Instructor: {
      postedCourses: (_: any) => {
        let tempArray: any = [];
        courses.forEach((c) => {
          if (c.instructor === _.firstName) {
            tempArray.push(c);
          }
        });
        return tempArray;
      },
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log(`🚀 Server ready at: ${url}`);
})();
